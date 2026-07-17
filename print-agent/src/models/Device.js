'use strict';

const os = require('node:os');

/**
 * @typedef {object} DeviceIdentity
 * @property {string} deviceId   assigned by the server at pairing
 * @property {string} deviceToken bearer token — the ONLY trust input we send
 * @property {string} restaurantId  informational only; never sent as auth
 * @property {string} restaurantName for display in the tray + settings window
 * @property {number} pairedAt epoch ms
 */

/**
 * Facts about this machine, sent when pairing and in every heartbeat.
 *
 * Note what is NOT here: nothing secret, nothing that identifies the restaurant.
 * The server derives the restaurant from the device token, never from anything
 * the agent claims about itself.
 *
 * @param {string} agentVersion
 * @returns {{ hostname: string, os: string, agentVersion: string }}
 */
function describeHost(agentVersion) {
  return {
    hostname: os.hostname(),
    os: `${os.type()} ${os.release()} (${os.arch()})`,
    agentVersion,
  };
}

/**
 * Validates the server's response to a pairing request.
 *
 * Pairing is the one moment the agent's whole identity is established, so a
 * malformed response must fail loudly rather than half-pair the device into a
 * state where it thinks it is paired but cannot authenticate.
 *
 * Unknown extra fields are ignored, not rejected — the server may add some.
 *
 * @param {unknown} payload
 * @returns {DeviceIdentity}
 * @throws {Error} when a required field is missing
 */
function parsePairingResponse(payload) {
  const data = payload && typeof payload === 'object' ? payload : {};

  const deviceToken = String(data.deviceToken ?? '').trim();
  const deviceId = String(data.deviceId ?? '').trim();

  if (!deviceToken) throw new Error('Pairing response is missing deviceToken.');
  if (!deviceId) throw new Error('Pairing response is missing deviceId.');

  return {
    deviceId,
    deviceToken,
    restaurantId: String(data.restaurantId ?? '').trim(),
    restaurantName: String(data.restaurantName ?? '').trim() || 'Unknown restaurant',
    pairedAt: Date.now(),
  };
}

/**
 * Shape of a pairing code: FKN-5F8D-2A9B-C7XK.
 *
 * Validated locally purely to give instant feedback in the pairing window —
 * the server is still the only authority on whether a code is real, unused and
 * unexpired.
 */
const PAIRING_CODE_PATTERN = /^FKN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/**
 * @param {string} code
 * @returns {boolean}
 */
function isWellFormedPairingCode(code) {
  return PAIRING_CODE_PATTERN.test(String(code || '').trim().toUpperCase());
}

/**
 * Accepts what the user typed and returns what we send to the server.
 * Users paste codes with stray spaces and lowercase letters constantly.
 *
 * @param {string} code
 * @returns {string}
 */
function normalisePairingCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

module.exports = {
  describeHost,
  parsePairingResponse,
  isWellFormedPairingCode,
  normalisePairingCode,
  PAIRING_CODE_PATTERN,
};
