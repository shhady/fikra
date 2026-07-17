'use strict';

const { EventEmitter } = require('node:events');
const { autoUpdater } = require('electron-updater');

const { createLogger } = require('../services/logger');
const { isInRollout, compareVersions, rolloutBucket } = require('../utils/rollout');

const logger = createLogger('updater');

/** How often we ask the server whether we are allowed to update. */
const POLICY_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

/** Grace period before restarting to apply an update. */
const RESTART_DELAY_MS = 5000;

/**
 * Staged, server-governed auto-update.
 *
 * The rule this enforces: the agent NEVER blind-updates.
 *
 * electron-updater on its own will happily pull whatever is newest the moment it
 * appears on the update host. With 3,000 restaurants that is a loaded gun — one
 * bad build and every till in the country stops printing at dinner service, with
 * no way to intervene because the agents have already replaced themselves.
 *
 * So before we download anything we ask the server for an update policy, and we
 * obey it:
 *
 *   rolloutPercentage  We hash our own deviceId into a bucket 0..99 and only
 *                      update if it falls under the percentage. The server can
 *                      hold a release at 5% overnight, watch the error rate, and
 *                      only then widen it. Same device + same version always
 *                      lands in the same bucket, so an agent cannot "re-roll"
 *                      itself into the cohort by restarting.
 *
 *   minimumVersion     A floor. If we are below it we update immediately, no
 *                      matter the percentage. This is the rollback lever: ship
 *                      1.4.1 as a re-release of the good 1.4.0 code and set the
 *                      minimum, and the bad cohort heals itself.
 *
 *   mandatory          Bypasses the rollout gate entirely. For the case where a
 *                      server-side breaking change means old agents simply cannot
 *                      work any more.
 *
 *   pinnedVersion      Local override, set by support on a single machine, so one
 *                      problem site can be frozen while the fleet moves on.
 */
class UpdateService extends EventEmitter {
  /**
   * @param {object} deps
   * @param {import('../services/config').ConfigService} deps.config
   * @param {import('../services/api').ApiClient} deps.api
   * @param {string} deps.version
   */
  constructor({ config, api, version }) {
    super();

    this.config = config;
    this.api = api;
    this.version = version;

    /** @type {NodeJS.Timeout | null} */
    this.timer = null;
    this.checking = false;
    this.updateReady = false;

    this.configureAutoUpdater();
  }

  /** @private */
  configureAutoUpdater() {
    autoUpdater.logger = logger;

    // We decide when to download, after the policy check. Never before.
    autoUpdater.autoDownload = false;

    // Restaurants run this machine all day; forcing a restart mid-service would
    // be worse than the update being late. We install on quit instead, and only
    // force a restart when the queue is empty (see applyUpdate).
    autoUpdater.autoInstallOnAppQuit = true;

    // Refuse to downgrade silently. If the server genuinely wants a rollback it
    // does it by publishing a HIGHER version containing the older code, which is
    // auditable; a silent downgrade is not.
    autoUpdater.allowDowngrade = false;

    autoUpdater.on('update-available', (info) => {
      logger.info(`Update ${info.version} is available; downloading.`);
      this.emit('downloading', info);
    });

    autoUpdater.on('update-not-available', () => {
      logger.info('No update available from the update host.');
    });

    autoUpdater.on('download-progress', (progress) => {
      logger.debug(`Update download: ${Math.round(progress.percent)}%`);
    });

    autoUpdater.on('update-downloaded', (info) => {
      logger.info(`Update ${info.version} downloaded and staged.`);
      this.updateReady = true;
      this.emit('ready', info);
    });

    autoUpdater.on('error', (error) => {
      // An update failure must never take the agent down — it still has to print.
      logger.error(`Update error: ${error?.message || error}`);
      this.emit('error', error);
    });
  }

  /** Starts periodic policy checks. */
  start() {
    if (this.timer) return;

    // Stagger the first check. Without this, every agent that came up after a
    // regional power cut would hit /update-policy in the same second.
    const initialDelay = 30000 + Math.floor(Math.random() * 60000);

    setTimeout(() => {
      this.check().catch(() => {});

      this.timer = setInterval(() => {
        this.check().catch(() => {});
      }, POLICY_INTERVAL_MS);
    }, initialDelay);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Asks the server whether this device may update, and acts on the answer.
   *
   * @param {{ force?: boolean }} [options] force skips the rollout gate (manual check)
   * @returns {Promise<{ decision: string, targetVersion?: string }>}
   */
  async check(options = {}) {
    if (this.checking) return { decision: 'already-checking' };

    this.checking = true;

    try {
      const pinned = String(this.config.get('pinnedVersion') || '').trim();

      if (pinned && !options.force) {
        logger.info(`Update skipped: this device is pinned to v${pinned}.`);
        return { decision: 'pinned' };
      }

      const policy = await this.api.fetchUpdatePolicy();
      const deviceId = String(this.config.get('deviceId') || '');

      logger.info(
        `Update policy: latest=${policy.latestVersion} minimum=${policy.minimumVersion} ` +
          `rollout=${policy.rolloutPercentage}% mandatory=${policy.mandatory} (we are v${this.version})`
      );

      if (!policy.latestVersion) {
        return { decision: 'no-policy' };
      }

      // Already current (or ahead, e.g. a support engineer side-loaded a build).
      if (compareVersions(this.version, policy.latestVersion) >= 0) {
        return { decision: 'up-to-date' };
      }

      // Below the floor: update regardless of the rollout percentage. This is
      // what makes rollback work.
      const belowMinimum = compareVersions(this.version, policy.minimumVersion) < 0;

      const allowed =
        options.force ||
        belowMinimum ||
        isInRollout({
          deviceId,
          version: policy.latestVersion,
          rolloutPercentage: policy.rolloutPercentage,
          mandatory: policy.mandatory,
        });

      if (!allowed) {
        const bucket = rolloutBucket(deviceId, policy.latestVersion);

        logger.info(
          `Holding at v${this.version}: this device is in rollout bucket ${bucket}, ` +
            `and the rollout is only at ${policy.rolloutPercentage}%.`
        );

        return { decision: 'not-in-rollout', targetVersion: policy.latestVersion };
      }

      logger.info(
        belowMinimum
          ? `Updating to v${policy.latestVersion}: we are below the minimum supported version.`
          : `Updating to v${policy.latestVersion}: this device is inside the rollout.`
      );

      await autoUpdater.checkForUpdates();

      return { decision: 'updating', targetVersion: policy.latestVersion };
    } catch (error) {
      // The update host or the API being unreachable is not an outage for the
      // restaurant — they can still print. Log and move on.
      logger.warn(`Update check failed: ${error.message}`);
      return { decision: 'check-failed' };
    } finally {
      this.checking = false;
    }
  }

  /**
   * Installs a staged update and restarts.
   *
   * @param {{ queueSize: number }} state
   * @returns {boolean} whether the restart was actually initiated
   */
  applyUpdate(state) {
    if (!this.updateReady) return false;

    // Never restart while there is work in the queue. A restaurant losing its
    // printer for 20 seconds mid-service because we chose that moment to update
    // is exactly the kind of thing that gets a product uninstalled.
    if (state.queueSize > 0) {
      logger.info(`Update is staged but ${state.queueSize} job(s) are queued; deferring restart.`);
      return false;
    }

    logger.info(`Applying update and restarting in ${RESTART_DELAY_MS / 1000}s.`);

    setTimeout(() => {
      // isSilent = true (no installer UI on a till), isForceRunAfter = true.
      autoUpdater.quitAndInstall(true, true);
    }, RESTART_DELAY_MS);

    return true;
  }
}

module.exports = { UpdateService };
