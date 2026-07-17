'use strict';

const { EventEmitter } = require('node:events');

const { createLogger } = require('../logger');
const { AgentError, ErrorCodes } = require('../../utils/errors');
const { describeHost, parsePairingResponse, normalisePairingCode } = require('../../models/Device');

const logger = createLogger('api');

/** All agent endpoints are versioned, so a v2 server can serve v1 agents. */
const API_PREFIX = '/api/printer/v1';

/** Requests are aborted after this long; a hung socket must not wedge the agent. */
const REQUEST_TIMEOUT_MS = 15000;

/**
 * HTTP client for the FikraNova agent API.
 *
 * Trust model
 * -----------
 * After pairing, the ONLY credential we ever send is the device token, as a
 * bearer token. We never send restaurantId as an authorization input — the
 * server derives the restaurant from the token. This is deliberate: if the
 * agent could name its own restaurant, a tampered install could print into a
 * competitor's kitchen. Restaurant identity flows one way, server -> agent, and
 * is treated as display data only.
 *
 * Emits:
 *   'unauthorized' — the server rejected our token (revoked / unpaired remotely)
 */
class ApiClient extends EventEmitter {
  /**
   * @param {object} deps
   * @param {import('../config').ConfigService} deps.config
   * @param {string} deps.version agent version
   */
  constructor({ config, version }) {
    super();
    this.config = config;
    this.version = version;
  }

  /** @returns {string} */
  get baseUrl() {
    return String(this.config.get('apiBaseUrl') || '').replace(/\/+$/, '');
  }

  /**
   * Performs a request against the agent API.
   *
   * @param {string} path e.g. '/devices/pair'
   * @param {object} [options]
   * @param {'GET'|'POST'} [options.method]
   * @param {object} [options.body]
   * @param {boolean} [options.authenticated] attach the device token
   * @returns {Promise<object>} parsed JSON body ({} for an empty response)
   * @throws {AgentError}
   */
  async request(path, options = {}) {
    const { method = 'GET', body, authenticated = true } = options;

    const url = `${this.baseUrl}${API_PREFIX}${path}`;

    /** @type {Record<string, string>} */
    const headers = {
      Accept: 'application/json',
      'User-Agent': `FikraNovaPrintAgent/${this.version}`,
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (authenticated) {
      const token = this.config.getDeviceToken();

      if (!token) {
        throw new AgentError(ErrorCodes.NOT_PAIRED, 'This device is not paired.', {
          retryable: false,
        });
      }

      headers.Authorization = `Bearer ${token}`;
    }

    // Node's fetch does not time out by default — a half-open socket would hang
    // this promise forever and stall the job pump.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;

    try {
      response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
        redirect: 'error',
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new AgentError(ErrorCodes.REQUEST_TIMEOUT, `${method} ${path} timed out.`, {
          cause: error,
        });
      }

      // DNS failure, TLS failure, no route. All retryable — the restaurant's
      // internet is simply down, which is the normal case we are built for.
      throw new AgentError(
        ErrorCodes.NETWORK_UNREACHABLE,
        `${method} ${path} failed: ${error.message}`,
        { cause: error }
      );
    } finally {
      clearTimeout(timer);
    }

    // A revoked or unpaired device gets 401/403. Surface it once, loudly, so the
    // agent can stop pretending to be paired.
    if (response.status === 401 || response.status === 403) {
      logger.error(`Server rejected our device token (HTTP ${response.status}).`);
      this.emit('unauthorized', response.status);

      throw new AgentError(
        ErrorCodes.DEVICE_UNAUTHORIZED,
        'Device token was rejected. The device may have been unpaired or revoked.',
        { retryable: false }
      );
    }

    const text = await response.text();

    /** @type {any} */
    let payload = {};

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        // A proxy or captive portal returned HTML. Not fatal, but not JSON.
        throw new AgentError(
          ErrorCodes.SERVER_ERROR,
          `${method} ${path} returned a non-JSON response (HTTP ${response.status}).`
        );
      }
    }

    if (!response.ok) {
      const message = payload?.error || payload?.message || `HTTP ${response.status}`;

      throw new AgentError(ErrorCodes.SERVER_ERROR, `${method} ${path} failed: ${message}`, {
        // 5xx is worth retrying; a 4xx means we sent something the server will
        // never accept, so retrying just burns battery.
        retryable: response.status >= 500,
      });
    }

    return payload;
  }

  // ----------------------------------------------------------------- pairing

  /**
   * Exchanges a one-time pairing code for a device token.
   *
   * This is the ONLY unauthenticated call the agent ever makes.
   *
   * @param {string} pairingCode e.g. 'FKN-5F8D-2A9B-C7XK'
   * @returns {Promise<import('../../models/Device').DeviceIdentity>}
   */
  async pair(pairingCode) {
    const code = normalisePairingCode(pairingCode);

    logger.info(`Pairing with code ${code.slice(0, 8)}…`);

    const payload = await this.request('/devices/pair', {
      method: 'POST',
      authenticated: false,
      body: {
        pairingCode: code,
        ...describeHost(this.version),
      },
    });

    const identity = parsePairingResponse(payload);
    logger.info(`Paired successfully with "${identity.restaurantName}".`);

    return identity;
  }

  // -------------------------------------------------------------------- jobs

  /**
   * Polling fallback, used only while the WebSocket is down.
   *
   * The server returns jobs addressed to THIS device (it knows which, from the
   * token). Jobs stay pending server-side until we acknowledge them with a
   * completed/failed callback, so a crash between fetch and print loses nothing.
   *
   * @returns {Promise<object[]>} raw job payloads
   */
  async fetchJobs() {
    const payload = await this.request('/jobs');

    // Tolerate both {jobs: [...]} and a bare array — servers drift.
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.jobs)) return payload.jobs;

    return [];
  }

  /**
   * Asks the server which of these job ids it still considers outstanding.
   *
   * Used on reconnect to reconcile before we accept new work: after an outage we
   * may hold jobs the server has already given up on, and the server may hold
   * jobs we printed but could not acknowledge.
   *
   * @param {string[]} jobIds
   * @returns {Promise<{ pending: string[], cancelled: string[], acknowledged: string[] }>}
   */
  async reconcile(jobIds) {
    const payload = await this.request('/jobs/reconcile', {
      method: 'POST',
      body: { jobIds },
    });

    return {
      pending: Array.isArray(payload?.pending) ? payload.pending.map(String) : [],
      cancelled: Array.isArray(payload?.cancelled) ? payload.cancelled.map(String) : [],
      acknowledged: Array.isArray(payload?.acknowledged) ? payload.acknowledged.map(String) : [],
    };
  }

  /**
   * @param {string} jobId
   * @returns {Promise<object>}
   */
  async reportJobStarted(jobId) {
    return this.request(`/jobs/${encodeURIComponent(jobId)}/started`, {
      method: 'POST',
      body: { startedAt: new Date().toISOString() },
    });
  }

  /**
   * @param {string} jobId
   * @param {{ printerStatus?: object, copies?: number }} [details]
   * @returns {Promise<object>}
   */
  async reportJobCompleted(jobId, details = {}) {
    return this.request(`/jobs/${encodeURIComponent(jobId)}/completed`, {
      method: 'POST',
      body: {
        completedAt: new Date().toISOString(),
        printerStatus: details.printerStatus,
        copies: details.copies,
      },
    });
  }

  /**
   * @param {string} jobId
   * @param {{ errorCode: string, errorMessage: string, printerStatus?: object, attempts?: number }} failure
   * @returns {Promise<object>}
   */
  async reportJobFailed(jobId, failure) {
    return this.request(`/jobs/${encodeURIComponent(jobId)}/failed`, {
      method: 'POST',
      body: {
        failedAt: new Date().toISOString(),
        errorCode: failure.errorCode,
        errorMessage: failure.errorMessage,
        printerStatus: failure.printerStatus,
        attempts: failure.attempts,
      },
    });
  }

  // --------------------------------------------------------------- telemetry

  /**
   * Heartbeat. Also the channel the server uses to push per-device commands
   * back to us (pause / unpair / test print) without needing an inbound port.
   *
   * @param {object} state
   * @param {number} state.queueSize
   * @param {object} state.printerStatus
   * @param {number|null} state.lastPrintAt epoch ms
   * @param {boolean} state.socketConnected
   * @returns {Promise<{ commands: object[] }>}
   */
  async heartbeat(state) {
    const payload = await this.request('/heartbeat', {
      method: 'POST',
      body: {
        agentVersion: this.version,
        queueSize: state.queueSize,
        printerStatus: state.printerStatus,
        lastPrintAt: state.lastPrintAt ? new Date(state.lastPrintAt).toISOString() : null,
        socketConnected: state.socketConnected,
        paused: Boolean(this.config.get('paused')),
        sentAt: new Date().toISOString(),
      },
    });

    return {
      commands: Array.isArray(payload?.commands) ? payload.commands : [],
    };
  }

  /**
   * Fetches the fleet update policy.
   *
   * The agent asks BEFORE downloading anything. This is what stops a bad build
   * reaching 3,000 restaurants at once: the server can hold rolloutPercentage at
   * 5% until it is confident, or pin minimumVersion to force a rollback.
   *
   * @returns {Promise<{ latestVersion: string, minimumVersion: string, rolloutPercentage: number, mandatory: boolean }>}
   */
  async fetchUpdatePolicy() {
    const payload = await this.request('/update-policy');

    return {
      latestVersion: String(payload?.latestVersion || ''),
      minimumVersion: String(payload?.minimumVersion || '0.0.0'),
      rolloutPercentage: Number(payload?.rolloutPercentage ?? 0),
      mandatory: Boolean(payload?.mandatory),
    };
  }
}

module.exports = { ApiClient, API_PREFIX };
