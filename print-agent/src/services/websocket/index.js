'use strict';

const { EventEmitter } = require('node:events');
const WebSocket = require('ws');

const { createLogger } = require('../logger');
const { Backoff } = require('../../utils/backoff');

const logger = createLogger('socket');

/** Server must answer our ping within this long or we assume the link is dead. */
const HEARTBEAT_INTERVAL_MS = 30000;
const HEARTBEAT_TIMEOUT_MS = 10000;

/**
 * Job delivery over WSS.
 *
 * Why a ping/pong watchdog on top of TCP
 * --------------------------------------
 * A cashier PC's network drops in ways TCP does not notice: the router reboots,
 * the ISP silently blackholes the connection, the laptop lid closes and the NIC
 * sleeps. In all of these the socket stays "open" from our side while packets go
 * nowhere — a half-open connection. Without an application-level heartbeat the
 * agent would sit there, connected and deaf, while orders pile up unprinted.
 * So we ping every 30s and force a reconnect if no pong arrives.
 *
 * Emits:
 *   'connected'    — link is up (job pump should stop polling)
 *   'disconnected' — link is down (job pump should start polling)
 *   'job'          — a job payload arrived
 *   'command'      — a remote control command (pause / unpair / test-print)
 *   'unauthorized' — server closed us with a policy code; token is dead
 */
class JobSocket extends EventEmitter {
  /**
   * @param {object} deps
   * @param {import('../config').ConfigService} deps.config
   * @param {string} deps.version
   */
  constructor({ config, version }) {
    super();

    this.config = config;
    this.version = version;

    /** @type {WebSocket | null} */
    this.ws = null;
    this.backoff = new Backoff({ initialDelayMs: 1000, maxDelayMs: 60000 });

    this.connected = false;
    this.shouldRun = false;

    /** @type {NodeJS.Timeout | null} */
    this.reconnectTimer = null;
    /** @type {NodeJS.Timeout | null} */
    this.heartbeatTimer = null;
    /** @type {NodeJS.Timeout | null} */
    this.pongTimer = null;
  }

  /**
   * Starts connecting and keeps reconnecting until stop() is called.
   *
   * An empty `wsUrl` means "there is no socket server" — which is the supported
   * v1 configuration, because the backend runs on serverless functions that
   * cannot hold a persistent connection. In that case we do not connect, do not
   * retry, and do not log an error every minute; the agent simply runs on its
   * polling loop, which is already started by the time we get here.
   */
  start() {
    if (this.shouldRun) return;

    const url = String(this.config.get('wsUrl') || '').trim();

    if (!url) {
      logger.info('No socket URL configured — running on the polling channel only.');
      return;
    }

    this.shouldRun = true;
    this.connect();
  }

  /** Stops for good; no further reconnects. */
  stop() {
    this.shouldRun = false;
    this.clearTimers();

    if (this.ws) {
      // 1000 = normal closure. Tell the server this was intentional so it does
      // not log us as a crash.
      try {
        this.ws.close(1000, 'agent shutting down');
      } catch {
        // Socket was already dead; nothing to do.
      }
      this.ws = null;
    }

    this.setConnected(false);
  }

  /** Forces an immediate reconnect (used by the tray's "Reconnect" item). */
  reconnectNow() {
    logger.info('Manual reconnect requested.');
    this.backoff.reset();
    this.clearTimers();

    if (this.ws) {
      try {
        this.ws.terminate();
      } catch {
        // Already gone.
      }
      this.ws = null;
    }

    if (this.shouldRun) this.connect();
  }

  /** @private */
  connect() {
    if (!this.shouldRun) return;

    const token = this.config.getDeviceToken();

    if (!token) {
      logger.warn('Not connecting: device is not paired.');
      return;
    }

    const url = String(this.config.get('wsUrl') || '');

    // Enforce WSS. A downgrade to plain ws:// would put the device token on the
    // wire in cleartext across the restaurant's network.
    if (!url.startsWith('wss://')) {
      logger.error(`Refusing to connect over an insecure socket URL: ${url}`);
      return;
    }

    logger.info(`Connecting to ${url}`);

    // The token goes in a header, not the query string: query strings end up in
    // proxy logs and server access logs. The server picks the subscription room
    // from this token — the agent never names a room, so it cannot subscribe to
    // another restaurant's jobs.
    this.ws = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': `FikraNovaPrintAgent/${this.version}`,
      },
      handshakeTimeout: 15000,
      // Certificate validation stays ON. Never set rejectUnauthorized:false.
      rejectUnauthorized: true,
    });

    this.ws.on('open', () => this.onOpen());
    this.ws.on('message', (data) => this.onMessage(data));
    this.ws.on('pong', () => this.onPong());
    this.ws.on('close', (code, reason) => this.onClose(code, reason));
    this.ws.on('error', (error) => this.onError(error));
  }

  /** @private */
  onOpen() {
    logger.info('Socket connected.');

    this.backoff.reset();
    this.setConnected(true);
    this.startHeartbeat();
  }

  /**
   * @private
   * @param {WebSocket.RawData} data
   */
  onMessage(data) {
    /** @type {any} */
    let message;

    try {
      message = JSON.parse(data.toString());
    } catch {
      logger.warn('Ignoring malformed socket frame.');
      return;
    }

    const type = String(message?.type || '');

    switch (type) {
      case 'job':
        // The payload may be under .job or be the message itself, depending on
        // how the backend frames it. Accept both rather than dropping work.
        this.emit('job', message.job ?? message.payload ?? message.data);
        break;

      case 'command':
        this.emit('command', message.command ?? message.payload ?? message);
        break;

      case 'ping':
        this.send({ type: 'pong', at: Date.now() });
        break;

      case 'pong':
        this.onPong();
        break;

      default:
        // Forward compatibility: a newer server may send frame types this build
        // has never heard of. Log at debug and carry on — never crash, never
        // disconnect over an unknown message.
        logger.debug(`Ignoring unknown socket frame type: "${type}"`);
    }
  }

  /**
   * @private
   * @param {number} code
   * @param {Buffer} reason
   */
  onClose(code, reason) {
    this.clearTimers();
    this.setConnected(false);
    this.ws = null;

    const detail = reason?.toString() || '';
    logger.warn(`Socket closed (code ${code}) ${detail}`.trim());

    // 4401/4403 are our convention for "your token is dead". Reconnecting would
    // just hammer the server with a credential it has already rejected.
    if (code === 4401 || code === 4403) {
      logger.error('Server rejected our token on the socket. Not reconnecting.');
      this.shouldRun = false;
      this.emit('unauthorized', code);
      return;
    }

    this.scheduleReconnect();
  }

  /**
   * @private
   * @param {Error} error
   */
  onError(error) {
    // 'error' is always followed by 'close', so we only log here; reconnect is
    // scheduled in onClose to avoid scheduling it twice.
    logger.warn(`Socket error: ${error.message}`);
  }

  /** @private */
  scheduleReconnect() {
    if (!this.shouldRun || this.reconnectTimer) return;

    const delay = this.backoff.nextDelay();
    logger.info(`Reconnecting in ${Math.round(delay / 1000)}s.`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /** @private Detects half-open connections (see class comment). */
  startHeartbeat() {
    this.clearHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      try {
        this.ws.ping();
      } catch {
        return;
      }

      this.pongTimer = setTimeout(() => {
        logger.warn('No pong received — connection is half-open. Forcing reconnect.');
        // terminate(), not close(): close() waits for a handshake that will
        // never arrive on a dead link.
        try {
          this.ws?.terminate();
        } catch {
          // Already gone.
        }
      }, HEARTBEAT_TIMEOUT_MS);
    }, HEARTBEAT_INTERVAL_MS);
  }

  /** @private */
  onPong() {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  /** @private */
  clearHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.pongTimer) clearTimeout(this.pongTimer);

    this.heartbeatTimer = null;
    this.pongTimer = null;
  }

  /** @private */
  clearTimers() {
    this.clearHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * @private
   * @param {boolean} value
   */
  setConnected(value) {
    if (this.connected === value) return;

    this.connected = value;
    this.emit(value ? 'connected' : 'disconnected');
  }

  /**
   * @param {object} message
   * @returns {boolean} whether the frame was actually written
   */
  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.warn(`Failed to send socket frame: ${error.message}`);
      return false;
    }
  }
}

module.exports = { JobSocket };
