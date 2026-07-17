import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

/**
 * Password hashing for the single admin account.
 *
 * Uses scrypt from Node's standard library — memory-hard, no native build step,
 * no third-party dependency. This module uses `node:crypto` and therefore may
 * ONLY be imported from Node-runtime code (API routes, scripts) — never from
 * middleware, which runs on the Edge runtime.
 */

const scrypt = promisify(scryptCallback);

/** scrypt cost parameters. Raising N makes both hashing and guessing slower. */
const COST = 16384; // N — CPU/memory cost
const BLOCK_SIZE = 8; // r
const PARALLELIZATION = 1; // p
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

// 128 * N * r = 16 MiB for the params above; allow headroom.
const SCRYPT_OPTIONS = {
  N: COST,
  r: BLOCK_SIZE,
  p: PARALLELIZATION,
  maxmem: 64 * 1024 * 1024,
};

/**
 * Field separator for the encoded hash.
 *
 * Deliberately ":" and NOT the conventional "$". Next.js (via dotenv-expand)
 * performs variable expansion on .env values, so a "$" in ADMIN_PASSWORD_HASH
 * would be read as a variable reference and silently expanded away — e.g.
 * "scrypt$16384$8$1$..." arrives as "scrypt6384====". ":" cannot appear in
 * base64, so it stays an unambiguous separator and needs no escaping in .env,
 * Vercel, or Docker.
 */
const SEP = ':';
const SCHEME = 'scrypt';
const FIELD_COUNT = 6;

/**
 * Hashes a plaintext password into a self-describing string:
 * `scrypt:N:r:p:<salt-b64>:<hash-b64>`
 *
 * The parameters travel with the hash, so verification keeps working even if
 * the constants above are tuned later.
 *
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string.');
  }

  const salt = randomBytes(SALT_LENGTH);
  const derived = /** @type {Buffer} */ (
    await scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, SCRYPT_OPTIONS)
  );

  return [
    SCHEME,
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString('base64'),
    derived.toString('base64'),
  ].join(SEP);
}

/**
 * Parses an encoded hash into its parts, or returns null if it is malformed.
 *
 * @param {unknown} stored
 * @returns {{ cost: number, blockSize: number, parallelization: number, salt: Buffer, expected: Buffer } | null}
 */
function parseHash(stored) {
  if (typeof stored !== 'string' || stored.length === 0) return null;

  const parts = stored.split(SEP);
  if (parts.length !== FIELD_COUNT || parts[0] !== SCHEME) return null;

  const [, costRaw, blockRaw, parallelRaw, saltB64, hashB64] = parts;

  const cost = Number.parseInt(costRaw, 10);
  const blockSize = Number.parseInt(blockRaw, 10);
  const parallelization = Number.parseInt(parallelRaw, 10);

  if (
    !Number.isInteger(cost) ||
    !Number.isInteger(blockSize) ||
    !Number.isInteger(parallelization) ||
    cost < 2 ||
    blockSize < 1 ||
    parallelization < 1
  ) {
    return null;
  }

  let salt;
  let expected;

  try {
    salt = Buffer.from(saltB64, 'base64');
    expected = Buffer.from(hashB64, 'base64');
  } catch {
    return null;
  }

  if (salt.length === 0 || expected.length === 0) return null;

  return { cost, blockSize, parallelization, salt, expected };
}

/**
 * Whether ADMIN_PASSWORD_HASH is well-formed. Lets callers surface a clear
 * "server is misconfigured" error instead of an indistinguishable "wrong
 * password" — which is exactly how a mangled env var hides itself.
 *
 * @param {unknown} stored
 * @returns {boolean}
 */
export function isValidPasswordHash(stored) {
  return parseHash(stored) !== null;
}

/**
 * Verifies a plaintext password against a stored hash, in constant time.
 * Returns false (rather than throwing) on any malformed input, so a corrupt
 * env var can never accidentally authenticate someone.
 *
 * @param {string} password
 * @param {string | undefined} stored value of ADMIN_PASSWORD_HASH
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, stored) {
  if (typeof password !== 'string') return false;

  const parsed = parseHash(stored);
  if (!parsed) return false;

  const { cost, blockSize, parallelization, salt, expected } = parsed;

  try {
    const actual = /** @type {Buffer} */ (
      await scrypt(password.normalize('NFKC'), salt, expected.length, {
        N: cost,
        r: blockSize,
        p: parallelization,
        maxmem: 64 * 1024 * 1024,
      })
    );

    // Lengths match by construction (we derive exactly expected.length bytes),
    // so timingSafeEqual will not throw.
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/**
 * Burns roughly the same CPU as a real verify, without revealing anything.
 *
 * Called when the submitted email does not match ADMIN_EMAIL, so that a wrong
 * email and a wrong password take the same amount of time. Without this, an
 * attacker could discover the admin address by timing the response.
 *
 * @param {string} password
 * @returns {Promise<false>} always false
 */
export async function equalizeVerifyTiming(password) {
  const dummySalt = Buffer.alloc(SALT_LENGTH, 0);

  try {
    await scrypt(String(password || '').normalize('NFKC'), dummySalt, KEY_LENGTH, SCRYPT_OPTIONS);
  } catch {
    // Ignore — this call exists purely to consume time.
  }

  return false;
}
