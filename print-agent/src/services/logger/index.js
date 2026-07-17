'use strict';

const path = require('node:path');
const log = require('electron-log/main');

/**
 * Rotating file logger.
 *
 * These logs are the only forensic trail we have when a restaurant 2,000 km
 * away says "it didn't print". They must therefore (a) survive a crash,
 * (b) never grow without bound on a cashier PC with a small disk, and
 * (c) never contain a device token.
 */

/** Rotate at 5 MB; electron-log keeps the previous file as <name>.old.log. */
const MAX_LOG_SIZE_BYTES = 5 * 1024 * 1024;

/** Keys whose values must never reach disk. */
const REDACTED_KEYS = /^(devicetoken|token|authorization|pairingcode|apikey|password)$/i;

/**
 * Recursively redacts secrets from anything we log.
 *
 * Support engineers will ask customers to send their logs by email. A device
 * token in there is a credential that can print to that restaurant, so it must
 * never be written in the first place — redacting at read time would be too
 * late.
 *
 * @param {unknown} value
 * @param {number} [depth]
 * @returns {unknown}
 */
function redact(value, depth = 0) {
  if (depth > 6 || value === null || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.map((entry) => redact(entry, depth + 1));
  }

  /** @type {Record<string, unknown>} */
  const output = {};

  for (const [key, entry] of Object.entries(value)) {
    output[key] = REDACTED_KEYS.test(key) ? '[redacted]' : redact(entry, depth + 1);
  }

  return output;
}

/**
 * Initialises logging. Call once, as early in the main process as possible —
 * before anything that might throw.
 *
 * @param {object} options
 * @param {string} options.logsDir
 * @param {string} options.version
 * @param {boolean} [options.verbose]
 */
function initLogger({ logsDir, version, verbose = false }) {
  log.initialize();

  log.transports.file.level = verbose ? 'debug' : 'info';
  log.transports.file.maxSize = MAX_LOG_SIZE_BYTES;
  log.transports.file.resolvePathFn = () => path.join(logsDir, 'agent.log');
  log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

  // In a packaged tray app there is no console to read, so keep console output
  // for development only.
  log.transports.console.level = verbose ? 'debug' : false;

  // Redact every structured argument before it is serialised.
  log.hooks.push((message) => {
    message.data = message.data.map((entry) => redact(entry));
    return message;
  });

  log.info('---------------------------------------------');
  log.info(`FikraNova Print Agent v${version} starting`);
  log.info(`Logs: ${logsDir}`);

  return log;
}

/**
 * @param {string} [scope] short label, e.g. 'queue' or 'printer'
 * @returns {import('electron-log').LogFunctions}
 */
function createLogger(scope) {
  return scope ? log.scope(scope) : log;
}

module.exports = { initLogger, createLogger, redact, log };
