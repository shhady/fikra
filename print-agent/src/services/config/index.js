'use strict';

const Store = require('electron-store');
const { safeStorage } = require('electron');

const { createLogger } = require('../logger');

const logger = createLogger('config');

/**
 * Persistent agent configuration.
 *
 * On encryption — read this before "improving" it
 * ----------------------------------------------
 * electron-store's `encryptionKey` is obfuscation, NOT security: the key is
 * compiled into the binary, so anyone holding FikraNovaPrinterSetup.exe can
 * extract it. It stops a curious cashier from reading config.json in Notepad.
 * That is all it is for, and that is all we claim for it.
 *
 * The device token is different — it is a live credential that can print to a
 * restaurant, and it is revocable per device. So we protect it with Electron's
 * safeStorage, which on Windows is backed by DPAPI: the ciphertext is bound to
 * the Windows user account, and copying config.json to another machine yields
 * nothing. That is real protection, and it is why the token is handled
 * separately from every other setting.
 *
 * If DPAPI is somehow unavailable we fall back to storing the token under the
 * store's own encryption and log loudly, because refusing to run would leave
 * the restaurant unable to print at all.
 */

/** Not a secret (see above) — it only obfuscates the config file at rest. */
const STORE_OBFUSCATION_KEY = 'fikranova-print-agent-v1';

const DEFAULTS = {
  /** Cloud endpoints. Overridable per-install for staging/self-hosted. */
  apiBaseUrl: 'https://www.fikranova.com',

  /**
   * Empty on purpose: there is no WebSocket server in v1.
   *
   * The backend runs on serverless functions, which cannot hold a persistent
   * socket, so jobs are delivered by the 3-second poll instead. Leaving this
   * blank tells JobSocket not to connect (and not to retry forever against a
   * URL that will never answer).
   *
   * When a socket service is deployed, set this to its wss:// URL — on ONE
   * device to try it, or fleet-wide. No agent code changes; it simply starts
   * preferring the socket and polling stops.
   */
  wsUrl: '',

  /** Device identity, written once at pairing. */
  deviceId: '',
  deviceTokenEncrypted: '', // base64 DPAPI ciphertext
  deviceTokenPlain: '', // fallback only; used when DPAPI is unavailable
  restaurantId: '',
  restaurantName: '',
  pairedAt: 0,

  /** Printer selection. */
  printerName: '',
  paperWidth: 80,
  /** 'auto' | 'spooler' | 'network' */
  transport: 'auto',
  networkHost: '',
  networkPort: 9100,
  /** Kick the cash drawer after printing a receipt. */
  openCashDrawer: false,

  /** Behaviour. */
  autoLaunch: true,
  /** Set remotely by the server; when true the agent queues but does not print. */
  paused: false,

  /** Update pinning. Empty = follow the server's update policy. */
  pinnedVersion: '',
};

class ConfigService {
  constructor() {
    this.store = new Store({
      name: 'config',
      defaults: DEFAULTS,
      encryptionKey: STORE_OBFUSCATION_KEY,
      clearInvalidConfig: true,
    });
  }

  /**
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    return this.store.get(key);
  }

  /**
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    this.store.set(key, value);
  }

  /**
   * @param {Record<string, unknown>} values
   */
  setMany(values) {
    this.store.set(values);
  }

  /** @returns {Record<string, unknown>} every setting except the token */
  snapshot() {
    const data = { ...this.store.store };
    delete data.deviceTokenEncrypted;
    delete data.deviceTokenPlain;
    return data;
  }

  // ---------------------------------------------------------------- identity

  /**
   * Stores the device token, encrypted with DPAPI where available.
   * @param {string} token
   */
  setDeviceToken(token) {
    if (safeStorage.isEncryptionAvailable()) {
      const ciphertext = safeStorage.encryptString(token).toString('base64');
      this.store.set('deviceTokenEncrypted', ciphertext);
      this.store.set('deviceTokenPlain', '');
      return;
    }

    logger.warn(
      'OS-level encryption (DPAPI) is unavailable. Falling back to store-level ' +
        'obfuscation for the device token. The token is still revocable server-side.'
    );
    this.store.set('deviceTokenPlain', token);
    this.store.set('deviceTokenEncrypted', '');
  }

  /**
   * @returns {string} the device token, or '' when not paired
   */
  getDeviceToken() {
    const ciphertext = this.store.get('deviceTokenEncrypted');

    if (ciphertext) {
      try {
        return safeStorage.decryptString(Buffer.from(ciphertext, 'base64'));
      } catch (error) {
        // Happens if config.json was copied from another machine or another
        // Windows user — DPAPI will refuse. Treat it as "not paired" rather
        // than crashing; the operator can re-pair.
        logger.error('Failed to decrypt device token; device must be re-paired.', error);
        return '';
      }
    }

    return this.store.get('deviceTokenPlain') || '';
  }

  /** @returns {boolean} */
  isPaired() {
    return Boolean(this.get('deviceId') && this.getDeviceToken());
  }

  /**
   * Persists the identity returned by the pairing endpoint.
   * @param {import('../../models/Device').DeviceIdentity} identity
   */
  savePairing(identity) {
    this.setDeviceToken(identity.deviceToken);
    this.setMany({
      deviceId: identity.deviceId,
      restaurantId: identity.restaurantId,
      restaurantName: identity.restaurantName,
      pairedAt: identity.pairedAt,
    });

    logger.info(
      `Paired as device ${identity.deviceId} for "${identity.restaurantName}".`
    );
  }

  /**
   * Wipes device identity. Called when the operator unpairs, or when the server
   * tells us our token was revoked.
   *
   * Deliberately leaves printer settings intact: a device that is re-paired to
   * the same restaurant should not need its printer picked again.
   */
  clearPairing() {
    this.setMany({
      deviceId: '',
      deviceTokenEncrypted: '',
      deviceTokenPlain: '',
      restaurantId: '',
      restaurantName: '',
      pairedAt: 0,
      paused: false,
    });

    logger.warn('Device identity cleared. Agent is now unpaired.');
  }

  /** @returns {string} absolute path to config.json (shown in the About box) */
  get path() {
    return this.store.path;
  }
}

module.exports = { ConfigService, DEFAULTS };
