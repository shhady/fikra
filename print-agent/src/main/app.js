'use strict';

const { app, shell } = require('electron');
const AutoLaunch = require('auto-launch');

const { createLogger } = require('../services/logger');
const { ConfigService } = require('../services/config');
const { ApiClient } = require('../services/api');
const { JobSocket } = require('../services/websocket');
const { JobQueue } = require('../services/queue');
const { PrintService } = require('../services/printer');
const { UpdateService } = require('./updater');
const { WindowManager } = require('./windows');
const { TrayController } = require('./tray');
const { Watchdog } = require('./watchdog');
const { takeLatestCrashReport } = require('./crashReporter');

const { queueDbPath, logsDir, crashDir } = require('../utils/paths');
const { parseJob, JobState } = require('../models/Job');
const { PrinterState } = require('../models/PrinterStatus');
const { ErrorCodes, toAgentError } = require('../utils/errors');
const { sleep } = require('../utils/backoff');

const logger = createLogger('agent');

/** Polling fallback cadence, used only while the socket is down. */
const POLL_INTERVAL_MS = 3000;

/** Heartbeat cadence. */
const HEARTBEAT_INTERVAL_MS = 60000;

/** Pause between retry attempts on a job that failed for a transient reason. */
const RETRY_DELAY_MS = 5000;

/**
 * The agent.
 *
 * Owns every service and the single job pump that moves work from the queue to
 * the printer. Everything else — sockets, polling, heartbeats, the tray — either
 * feeds that pump or reports on it.
 */
class Agent {
  constructor() {
    this.version = app.getVersion();

    this.config = new ConfigService();
    this.queue = new JobQueue({ dbPath: queueDbPath() });
    this.api = new ApiClient({ config: this.config, version: this.version });
    this.socket = new JobSocket({ config: this.config, version: this.version });
    this.printer = new PrintService({ config: this.config, version: this.version });
    this.updater = new UpdateService({ config: this.config, api: this.api, version: this.version });
    this.windows = new WindowManager();

    this.tray = new TrayController({
      getState: () => this.trayState(),
      actions: {
        showSettings: () => this.showMainWindow(),
        testPrint: () => this.testPrint().catch((error) => logger.error(error.message)),
        reconnect: () => this.reconnect(),
        restart: () => this.restart(),
        quit: () => this.quit(),
      },
    });

    this.watchdog = new Watchdog({
      getState: () => ({ queueSize: this.safeQueueSize(), lastPumpAt: this.lastPumpAt }),
      onStall: () => this.queue.close(),
    });

    this.autoLauncher = new AutoLaunch({
      name: 'FikraNova Print Agent',
      path: app.getPath('exe'),
      isHidden: true, // start minimised to the tray, not with a window
    });

    /** @type {NodeJS.Timeout | null} */
    this.pollTimer = null;
    /** @type {NodeJS.Timeout | null} */
    this.heartbeatTimer = null;

    /** Guards the pump so only one job prints at a time. */
    this.pumping = false;

    /** Fed to the watchdog so it can tell "idle" from "wedged". */
    this.lastPumpAt = Date.now();

    /** @type {object | null} */
    this.lastPrinterStatus = null;

    this.stopping = false;
  }

  // ------------------------------------------------------------------ boot

  /**
   * Starts the agent.
   * @returns {Promise<void>}
   */
  async start() {
    this.queue.open();
    this.tray.create();

    this.wireEvents();
    await this.syncAutoLaunch();

    if (!this.config.isPaired()) {
      // First run. The ONLY thing the operator ever sees is the pairing screen.
      logger.info('Not paired — showing the pairing window.');
      this.windows.showPairing();
      return;
    }

    logger.info(`Paired to "${this.config.get('restaurantName')}".`);

    // A printer may have been added, renamed, or unplugged since last run.
    if (!this.config.get('printerName') && !this.config.get('networkHost')) {
      await this.printer.autoConfigure().catch((error) => {
        logger.warn(`Auto-configure failed: ${error.message}`);
      });
    }

    this.startServices();
  }

  /** @private Starts everything that requires a paired device. */
  startServices() {
    // Polling starts IMMEDIATELY and unconditionally. It is the baseline, and
    // the socket's only job is to switch it off while it is connected.
    //
    // It must not be the other way round. Polling used to be started from the
    // socket's 'disconnected' event — but that event only fires on a TRANSITION
    // from connected to disconnected. An agent whose socket never connects at
    // all (no WS server deployed, wrong URL, blocked port) never transitions,
    // so 'disconnected' never fired, so it never polled: it paired, sat there
    // looking healthy, and silently never fetched a single job.
    //
    // Delivery is the product. It defaults to on.
    this.startPolling();

    this.socket.start();
    this.startHeartbeat();
    this.updater.start();
    this.watchdog.start();

    // Anything left in the queue from last run (or from an offline spell) prints
    // as soon as we are up — before any new work arrives.
    this.pump();
  }

  /** @private */
  wireEvents() {
    this.socket.on('connected', () => {
      logger.info('Job socket is up.');
      this.stopPolling();
      this.tray.refresh();

      // Reconcile BEFORE accepting new work (see reconcile()).
      this.reconcile()
        .catch((error) => logger.warn(`Reconcile failed: ${error.message}`))
        .finally(() => this.pump());
    });

    this.socket.on('disconnected', () => {
      logger.warn('Job socket is down — falling back to polling.');
      this.startPolling();
      this.tray.refresh();
    });

    this.socket.on('job', (payload) => this.acceptJob(payload));
    this.socket.on('command', (command) => this.handleCommand(command));

    // The server revoked us. Stop pretending to be paired.
    this.socket.on('unauthorized', () => this.handleRevoked());
    this.api.on('unauthorized', () => this.handleRevoked());

    this.updater.on('ready', () => {
      // Only restart when the queue is empty; applyUpdate enforces that.
      this.updater.applyUpdate({ queueSize: this.safeQueueSize() });
    });
  }

  // --------------------------------------------------------------- pairing

  /**
   * Exchanges a pairing code for a device token and brings the agent online.
   *
   * @param {string} code
   * @returns {Promise<{ restaurantName: string }>}
   * @throws {AgentError}
   */
  async pair(code) {
    const identity = await this.api.pair(code);

    this.config.savePairing(identity);

    // Pick a printer for them, so the very first job can print without anyone
    // opening Settings.
    await this.printer.autoConfigure().catch((error) => {
      logger.warn(`Auto-configure after pairing failed: ${error.message}`);
    });

    this.windows.closePairing();
    this.startServices();
    this.tray.refresh();

    return { restaurantName: identity.restaurantName };
  }

  /**
   * The server no longer accepts our token (unpaired remotely, or revoked).
   * @private
   */
  handleRevoked() {
    if (!this.config.isPaired()) return;

    logger.error('This device has been unpaired or revoked by the server.');

    this.socket.stop();
    this.stopPolling();
    this.stopHeartbeat();

    this.config.clearPairing();
    this.tray.refresh();

    this.windows.closeAll();
    this.windows.showPairing();
  }

  // ------------------------------------------------------------------ jobs

  /**
   * Takes a job payload from any source (socket or poll) and queues it.
   *
   * @private
   * @param {unknown} payload
   */
  acceptJob(payload) {
    /** @type {import('../models/Job').Job} */
    let job;

    try {
      job = parseJob(payload);
    } catch (error) {
      const agentError = toAgentError(error, ErrorCodes.JOB_INVALID);
      const id = payload && typeof payload === 'object' ? payload.id : undefined;

      logger.error(`Rejected a malformed job: ${agentError.message}`);

      // Tell the server, so the job does not sit "pending" on the dashboard for
      // ever with no explanation.
      if (id) {
        this.api
          .reportJobFailed(String(id), agentError.toCallback())
          .catch((reportError) => logger.warn(`Could not report bad job: ${reportError.message}`));
      }

      return;
    }

    // A job addressed to a different device on the same site is not ours.
    const deviceId = String(this.config.get('deviceId'));

    if (job.targetDeviceId && job.targetDeviceId !== deviceId) {
      logger.info(`Ignoring job ${job.id}: addressed to device ${job.targetDeviceId}, not us.`);
      return;
    }

    const isNew = this.queue.enqueue(job);

    this.tray.refresh();
    this.broadcastState();

    if (isNew) this.pump();
  }

  /**
   * The job pump. Drains the queue one job at a time.
   *
   * Single-threaded on purpose: a thermal printer can only print one thing at a
   * time anyway, and serialising here means we never interleave two receipts'
   * bytes into the same ESC/POS stream.
   *
   * @private
   */
  async pump() {
    if (this.pumping || this.stopping) return;

    this.pumping = true;

    try {
      for (;;) {
        this.lastPumpAt = Date.now();

        if (this.config.get('paused')) {
          logger.info('Printing is paused; leaving jobs in the queue.');
          break;
        }

        const claimed = this.queue.claimNext();
        if (!claimed) break;

        await this.printClaimed(claimed);

        this.tray.refresh();
        this.broadcastState();
      }
    } catch (error) {
      logger.error(`Job pump crashed: ${error.message}`, error);
    } finally {
      this.pumping = false;
      this.lastPumpAt = Date.now();
    }
  }

  /**
   * Prints one claimed job and reports the outcome.
   *
   * Ordering matters here and is deliberate:
   *   1. tell the server we started  (best effort — a failure here is not fatal)
   *   2. print
   *   3. record the outcome LOCALLY, durably, first
   *   4. only then tell the server
   *
   * Step 3 before step 4 is what makes an outage between printing and
   * acknowledging survivable: the outcome is already on disk, flagged unreported,
   * and gets flushed on the next reconnect. Doing it the other way round would
   * lose the outcome if the network died at exactly the wrong moment — and a lost
   * "completed" means the server re-sends the job, and the customer gets a second
   * receipt.
   *
   * @private
   * @param {{ id: string, payload: object, attempts: number }} claimed
   */
  async printClaimed(claimed) {
    /** @type {import('../models/Job').Job} */
    let job;

    try {
      job = parseJob(claimed.payload);
    } catch (error) {
      const agentError = toAgentError(error, ErrorCodes.JOB_INVALID);

      this.queue.markFailed(claimed.id, { ...agentError.toCallback(), permanent: true });
      await this.reportOutcome(claimed.id);
      return;
    }

    await this.api
      .reportJobStarted(job.id)
      .catch((error) => logger.debug(`Could not report job start: ${error.message}`));

    try {
      const result = await this.printer.print(job);

      this.lastPrinterStatus = result.printerStatus;
      this.queue.markPrinted(job.id);

      await this.reportOutcome(job.id);
    } catch (error) {
      const agentError = toAgentError(error, ErrorCodes.PRINTER_ERROR);

      this.lastPrinterStatus = await this.printer.status().catch(() => null);

      const outcome = this.queue.markFailed(job.id, {
        errorCode: agentError.code,
        errorMessage: agentError.message,
        permanent: agentError.retryable === false,
      });

      // Tell the operator about the things only they can fix.
      if (agentError.code === ErrorCodes.PRINTER_OUT_OF_PAPER) {
        this.tray.notify('Printer out of paper', 'Load a new roll — queued orders will print automatically.');
      } else if (agentError.code === ErrorCodes.PRINTER_COVER_OPEN) {
        this.tray.notify('Printer cover is open', 'Close the cover — queued orders will print automatically.');
      } else if (agentError.code === ErrorCodes.PRINTER_OFFLINE) {
        this.tray.notify('Printer is offline', 'Check that the printer is on and connected.');
      }

      if (outcome.state === JobState.FAILED) {
        await this.reportOutcome(job.id);
        return;
      }

      // Transient failure, still has attempts left. Back off before the pump
      // picks it up again, so a printer with no paper is not hammered in a tight
      // loop for the ten minutes it takes someone to walk over with a new roll.
      await sleep(RETRY_DELAY_MS);
    }
  }

  /**
   * Reports a job's final state to the server, and marks it reported locally
   * only if the server actually acknowledged.
   *
   * @private
   * @param {string} jobId
   */
  async reportOutcome(jobId) {
    const outcomes = this.queue.unreportedOutcomes().filter((row) => row.id === jobId);
    const outcome = outcomes[0];

    if (!outcome) return;

    try {
      if (outcome.state === JobState.PRINTED) {
        await this.api.reportJobCompleted(jobId, { printerStatus: this.lastPrinterStatus });
      } else {
        await this.api.reportJobFailed(jobId, {
          errorCode: outcome.error_code || ErrorCodes.UNKNOWN,
          errorMessage: outcome.last_error || 'Unknown error',
          printerStatus: this.lastPrinterStatus,
          attempts: outcome.attempts,
        });
      }

      this.queue.markReported(jobId);
    } catch (error) {
      // The internet is down. The outcome is already durable and flagged
      // unreported; it will be flushed by reconcile() on the next reconnect.
      logger.warn(`Could not report outcome for job ${jobId} (will retry on reconnect): ${error.message}`);
    }
  }

  /**
   * Reconciles with the server after a reconnect, BEFORE accepting new work.
   *
   * Two things can have drifted while we were offline:
   *
   *   1. We printed jobs (or gave up on them) but never managed to say so. If we
   *      stayed quiet, the server would eventually re-dispatch them and the
   *      customer would get a duplicate receipt. So we flush those outcomes first.
   *
   *   2. The server may have cancelled jobs we are still holding — the restaurant
   *      voided the order while we were offline. Printing a voided order is worse
   *      than not printing it, so we drop them.
   *
   * Only once both sides agree do we start the pump again.
   *
   * @private
   */
  async reconcile() {
    const unreported = this.queue.unreportedOutcomes();

    if (unreported.length > 0) {
      logger.info(`Flushing ${unreported.length} unreported job outcome(s) after reconnect.`);

      for (const outcome of unreported) {
        await this.reportOutcome(String(outcome.id));
      }
    }

    const outstanding = this.queue.outstandingIds();

    if (outstanding.length === 0) return;

    logger.info(`Reconciling ${outstanding.length} outstanding job(s) with the server.`);

    const result = await this.api.reconcile(outstanding);

    if (result.cancelled.length > 0) {
      this.queue.cancel(result.cancelled);
    }

    this.tray.refresh();
    this.broadcastState();
  }

  // -------------------------------------------------------------- polling

  /**
   * Polling fallback. Runs ONLY while the socket is down — the socket is the
   * primary channel, and polling every 3s from thousands of agents is load we do
   * not want to carry when we do not have to.
   * @private
   */
  startPolling() {
    if (this.pollTimer || !this.config.isPaired()) return;

    logger.info(`Polling for jobs every ${POLL_INTERVAL_MS / 1000}s while the socket is down.`);

    this.pollTimer = setInterval(async () => {
      try {
        const jobs = await this.api.fetchJobs();

        for (const payload of jobs) {
          // enqueue() dedupes by id, so a job delivered by BOTH the socket and a
          // poll in flight at the same moment still prints exactly once.
          this.acceptJob(payload);
        }
      } catch (error) {
        // Expected while the internet is down. Do not spam the log at error level.
        logger.debug(`Poll failed: ${error.message}`);
      }
    }, POLL_INTERVAL_MS);
  }

  /** @private */
  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
      logger.info('Stopped polling — the socket is handling delivery.');
    }
  }

  // ------------------------------------------------------------ heartbeat

  /** @private */
  startHeartbeat() {
    if (this.heartbeatTimer) return;

    const beat = async () => {
      try {
        const status = await this.printer.status();
        this.lastPrinterStatus = status;

        const crash = takeLatestCrashReport(crashDir());

        const response = await this.api.heartbeat({
          queueSize: this.safeQueueSize(),
          printerStatus: status,
          lastPrintAt: this.queue.lastPrintAt(),
          socketConnected: this.socket.connected,
          ...(crash ? { lastCrash: crash } : {}),
        });

        for (const command of response.commands) {
          this.handleCommand(command);
        }

        this.tray.refresh();
        this.broadcastState();
      } catch (error) {
        logger.debug(`Heartbeat failed: ${error.message}`);
      }
    };

    beat();
    this.heartbeatTimer = setInterval(beat, HEARTBEAT_INTERVAL_MS);
  }

  /** @private */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ------------------------------------------------------ remote commands

  /**
   * Handles a per-device command pushed by the server, over the socket or
   * piggybacked on a heartbeat response.
   *
   * Note there is no inbound port and no listening socket anywhere in this agent:
   * remote control works purely because the agent keeps an outbound connection
   * open and asks. That is what makes it safe to install behind a restaurant's
   * router with no firewall changes.
   *
   * @private
   * @param {object} command
   */
  handleCommand(command) {
    const type = String(command?.type || command?.command || '').toLowerCase();

    logger.info(`Remote command received: ${type}`);

    switch (type) {
      case 'pause':
        this.config.set('paused', true);
        this.tray.refresh();
        this.broadcastState();
        logger.warn('Printing paused by the server. Jobs will queue but not print.');
        break;

      case 'resume':
        this.config.set('paused', false);
        this.tray.refresh();
        this.broadcastState();
        logger.info('Printing resumed by the server.');
        this.pump();
        break;

      case 'unpair':
        logger.warn('Unpair command received from the server.');
        this.handleRevoked();
        break;

      case 'test_print':
      case 'test-print':
        this.testPrint().catch((error) => logger.error(`Remote test print failed: ${error.message}`));
        break;

      case 'update':
        this.updater.check({ force: true }).catch(() => {});
        break;

      default:
        // Forward compatibility: a newer server may send commands this build does
        // not know. Ignoring them is correct; crashing on them is not.
        logger.warn(`Ignoring unknown remote command: "${type}"`);
    }
  }

  // --------------------------------------------------------------- actions

  /** @returns {Promise<{ printerStatus: object }>} */
  async testPrint() {
    logger.info('Running test print.');
    const result = await this.printer.printTestPage();

    this.lastPrinterStatus = result.printerStatus;
    this.tray.refresh();
    this.broadcastState();

    return result;
  }

  reconnect() {
    logger.info('Reconnect requested.');
    this.socket.reconnectNow();
    this.tray.refresh();
  }

  restart() {
    logger.warn('Restart requested.');

    this.shutdown();

    app.relaunch();
    app.exit(0);
  }

  quit() {
    logger.info('Exit requested from the tray.');

    globalThis.__fikranovaQuitting = true;
    this.shutdown();

    app.quit();
  }

  showMainWindow() {
    // Which window is "the" window depends entirely on whether we are paired.
    if (this.config.isPaired()) {
      this.windows.showSettings();
    } else {
      this.windows.showPairing();
    }
  }

  openLogs() {
    shell.openPath(logsDir());
  }

  /**
   * @param {boolean} enabled
   * @returns {Promise<void>}
   */
  async setAutoLaunch(enabled) {
    this.config.set('autoLaunch', Boolean(enabled));
    await this.syncAutoLaunch();
  }

  /**
   * Makes Windows' run-at-login state match our setting.
   * @private
   */
  async syncAutoLaunch() {
    try {
      const wanted = Boolean(this.config.get('autoLaunch'));
      const current = await this.autoLauncher.isEnabled();

      if (wanted && !current) {
        await this.autoLauncher.enable();
        logger.info('Enabled start-with-Windows.');
      } else if (!wanted && current) {
        await this.autoLauncher.disable();
        logger.info('Disabled start-with-Windows.');
      }
    } catch (error) {
      // Group policy or an aggressive AV can block writing the Run key. The agent
      // still works; it just will not start itself at boot.
      logger.warn(`Could not update the start-with-Windows setting: ${error.message}`);
    }
  }

  // ----------------------------------------------------------------- state

  /** @private @returns {number} queue size, or 0 if the DB is closed */
  safeQueueSize() {
    try {
      return this.queue.size();
    } catch {
      return 0;
    }
  }

  /** @returns {object} everything the tray and the settings window render from */
  trayState() {
    const printerName =
      String(this.config.get('printerName') || '') || String(this.config.get('networkHost') || '');

    return {
      version: this.version,
      paired: this.config.isPaired(),
      restaurantName: String(this.config.get('restaurantName') || ''),
      deviceId: String(this.config.get('deviceId') || ''),
      connected: this.socket.connected,
      paused: Boolean(this.config.get('paused')),
      queueSize: this.safeQueueSize(),
      printerName,
      printerConfigured: Boolean(printerName),
      printerStatus: this.lastPrinterStatus || { state: PrinterState.UNKNOWN },
      paperWidth: this.config.get('paperWidth'),
      transport: this.config.get('transport'),
      networkHost: String(this.config.get('networkHost') || ''),
      networkPort: this.config.get('networkPort'),
      openCashDrawer: Boolean(this.config.get('openCashDrawer')),
      autoLaunch: Boolean(this.config.get('autoLaunch')),
      apiBaseUrl: String(this.config.get('apiBaseUrl') || ''),
      lastPrintAt: this.queue.lastPrintAt(),
      stats: (() => {
        try {
          return this.queue.stats();
        } catch {
          return { queued: 0, printing: 0, printed: 0, failed: 0 };
        }
      })(),
    };
  }

  /** Pushes fresh state to any open window. */
  broadcastState() {
    this.windows.broadcast('agent:state', this.trayState());
  }

  // -------------------------------------------------------------- shutdown

  /** Releases everything. Safe to call twice. */
  shutdown() {
    if (this.stopping) return;
    this.stopping = true;

    logger.info('Shutting down.');

    this.stopPolling();
    this.stopHeartbeat();
    this.updater.stop();
    this.watchdog.stop();
    this.socket.stop();
    this.tray.destroy();

    try {
      this.queue.close();
    } catch (error) {
      logger.warn(`Error closing the queue: ${error.message}`);
    }
  }
}

module.exports = { Agent };
