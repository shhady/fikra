'use strict';

const crypto = require('node:crypto');

/**
 * Staged-rollout gate.
 *
 * The server says "roll this version out to 10% of the fleet". Each agent must
 * decide, on its own, whether it is in that 10% — and crucially it must decide
 * the SAME WAY every time it asks. A random draw would let an agent update on
 * one check and refuse on the next, and repeated checks would eventually drag
 * 100% of the fleet in. So we hash the stable deviceId into a fixed bucket.
 *
 * Properties this gives us:
 *   - Deterministic: same device + same version -> same answer, forever.
 *   - Uniform: SHA-256 spreads deviceIds evenly across 0..99.
 *   - Version-scoped: including the version in the hash means a device unlucky
 *     for 1.2.0 is not systematically unlucky for 1.3.0 too. Without this, the
 *     same ~10% of devices would always be the guinea pigs.
 *
 * @param {string} deviceId stable per-device identity from pairing
 * @param {string} version the version being rolled out
 * @returns {number} bucket in [0, 99]
 */
function rolloutBucket(deviceId, version) {
  const digest = crypto
    .createHash('sha256')
    .update(`${deviceId}:${version}`, 'utf8')
    .digest();

  // First 4 bytes as an unsigned int is plenty of entropy for 100 buckets.
  return digest.readUInt32BE(0) % 100;
}

/**
 * Whether this device should apply the given version right now.
 *
 * @param {object} params
 * @param {string} params.deviceId
 * @param {string} params.version version offered by the server
 * @param {number} params.rolloutPercentage 0..100
 * @param {boolean} [params.mandatory] bypasses the rollout gate entirely
 * @returns {boolean}
 */
function isInRollout({ deviceId, version, rolloutPercentage, mandatory = false }) {
  // A mandatory update (e.g. a security fix, or a breaking server change) goes
  // to everyone regardless of the percentage.
  if (mandatory) return true;

  const percentage = Number(rolloutPercentage);

  if (!Number.isFinite(percentage) || percentage <= 0) return false;
  if (percentage >= 100) return true;

  if (!deviceId) return false;

  return rolloutBucket(deviceId, version) < percentage;
}

/**
 * Compares two semantic versions.
 *
 * Deliberately tolerant: trailing pre-release/build metadata ("1.2.0-beta.1")
 * is ignored for ordering, because the fleet only ever ships x.y.z.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number} negative if a < b, 0 if equal, positive if a > b
 */
function compareVersions(a, b) {
  const parse = (value) =>
    String(value || '0')
      .split('-')[0]
      .split('.')
      .map((part) => Number.parseInt(part, 10) || 0);

  const left = parse(a);
  const right = parse(b);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

module.exports = { rolloutBucket, isInRollout, compareVersions };
