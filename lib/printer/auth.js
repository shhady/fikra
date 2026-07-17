import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import Device from '@/models/Device';
import Restaurant from '@/models/Restaurant';

/**
 * Authentication for the Print API.
 *
 * ============================================================================
 * THE ONE RULE
 * ----------------------------------------------------------------------------
 * The restaurant is derived from the CREDENTIAL. Never from the request body.
 *
 * Both helpers below return a `restaurantId` that was read out of the database
 * record the credential resolved to. No caller — not the agent on a till, not a
 * restaurant's website — can name its own tenant. If a body contains
 * `restaurantId`, it is ignored.
 *
 * This is what stops a tampered agent, or a leaked API key, from printing into
 * a different restaurant's kitchen. Every multi-tenant bug in a system like this
 * traces back to trusting an id that came in over the wire.
 * ============================================================================
 */

/**
 * Hashes a bearer credential for storage and lookup.
 *
 * SHA-256 (not bcrypt/scrypt) is the correct choice here, and deliberately so:
 * these are 256-bit random tokens, not human-chosen passwords. There is no
 * dictionary to attack, so the slow-hash property that protects passwords buys
 * nothing — while the speed matters, because this runs on every single request
 * from every till in the fleet.
 *
 * @param {string} token
 * @returns {string} hex digest
 */
export function hashToken(token) {
  return createHash('sha256').update(String(token), 'utf8').digest('hex');
}

/**
 * Mints a device token. 32 random bytes = 256 bits; not guessable.
 * @returns {string}
 */
export function generateDeviceToken() {
  return `dt_live_${randomBytes(32).toString('hex')}`;
}

/**
 * Mints a restaurant API key.
 * @returns {string}
 */
export function generateApiKey() {
  return `rk_live_${randomBytes(24).toString('hex')}`;
}

/**
 * Mints a pairing code in the form FKN-5F8D-2A9B-C7XK.
 *
 * The alphabet excludes I, O, 0 and 1 — a human reads this off a screen and
 * types it on a different machine, and those four characters are where they will
 * make a mistake.
 *
 * @returns {string}
 */
export function generatePairingCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(12);

  const chars = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]);

  return `FKN-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}`;
}

/**
 * Pulls the bearer token out of the Authorization header.
 * @param {Request} request
 * @returns {string} the token, or '' if absent/malformed
 */
export function bearerToken(request) {
  const header = request.headers.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());

  return match ? match[1].trim() : '';
}

/**
 * A uniform error envelope. The agent reads `.error`.
 *
 * @param {string} message
 * @param {number} status
 * @returns {NextResponse}
 */
export function fail(message, status) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Authenticates an agent by its device token.
 *
 * Returns the Device document. The caller reads `device.restaurantId` from it —
 * that value came from our database, not from the request.
 *
 * @param {Request} request
 * @returns {Promise<{ device: import('mongoose').Document | null, response: NextResponse | null }>}
 *          Exactly one of the two is non-null.
 */
export async function authenticateDevice(request) {
  const token = bearerToken(request);

  if (!token) {
    return { device: null, response: fail('Missing device token.', 401) };
  }

  await connectDB();

  const device = await Device.findOne({ tokenHash: hashToken(token) });

  // 401 for both "no such token" and "revoked": the agent treats 401/403 the
  // same way (wipe the token, show the pairing screen), and distinguishing them
  // would tell an attacker which of their guesses were once-valid tokens.
  if (!device || device.revokedAt) {
    return { device: null, response: fail('Device token is invalid or has been revoked.', 401) };
  }

  const restaurant = await Restaurant.findById(device.restaurantId);

  if (!restaurant || restaurant.disabledAt) {
    return { device: null, response: fail('This restaurant account is disabled.', 403) };
  }

  return { device, response: null };
}

/**
 * Authenticates a restaurant's website/back-office by API key.
 *
 * @param {Request} request
 * @returns {Promise<{ restaurant: import('mongoose').Document | null, response: NextResponse | null }>}
 */
export async function authenticateRestaurant(request) {
  const key = bearerToken(request);

  if (!key) {
    return { restaurant: null, response: fail('Missing API key.', 401) };
  }

  await connectDB();

  const hash = hashToken(key);

  // Match on the hash of a key that is present AND not revoked, in one query —
  // so a revoked key can never resolve to a restaurant.
  const restaurant = await Restaurant.findOne({
    apiKeys: { $elemMatch: { hash, revokedAt: null } },
  });

  if (!restaurant) {
    return { restaurant: null, response: fail('API key is invalid or has been revoked.', 401) };
  }

  if (restaurant.disabledAt) {
    return { restaurant: null, response: fail('This restaurant account is disabled.', 403) };
  }

  return { restaurant, response: null };
}
