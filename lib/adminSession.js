import { SignJWT, jwtVerify } from 'jose';

/**
 * Edge-runtime-safe admin session helpers.
 *
 * This module is imported by `middleware.js`, which runs on the Edge runtime.
 * It must therefore only use Web Crypto / `jose` — never `node:crypto`.
 * Password hashing (which needs `node:crypto.scrypt`) lives in `lib/adminPassword.js`
 * and is only imported from Node-runtime API routes.
 */

export const ADMIN_SESSION_COOKIE = 'fikra_admin_session';

/** Session lifetime. Shorten this if you want to be re-prompted more often. */
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const ISSUER = 'fikranova';
const AUDIENCE = 'fikranova-admin';

/**
 * @returns {Uint8Array} HMAC key derived from ADMIN_SESSION_SECRET.
 */
function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET is missing or too short (need >= 32 chars). Run: npm run admin:credentials'
    );
  }

  return new TextEncoder().encode(secret);
}

/**
 * Fingerprint of the current password hash, embedded in every session token.
 *
 * Changing ADMIN_PASSWORD_HASH changes this value, which invalidates every
 * previously issued session — i.e. rotating the password logs out all devices.
 *
 * @returns {Promise<string>} first 16 hex chars of SHA-256(ADMIN_PASSWORD_HASH)
 */
async function passwordFingerprint() {
  const stored = process.env.ADMIN_PASSWORD_HASH || '';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(stored));

  return Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Normalizes an email for comparison (case-insensitive, trimmed).
 * @param {string | undefined | null} value
 * @returns {string}
 */
export function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

/**
 * The single email address allowed to sign in.
 * @returns {string}
 */
export function getAllowedAdminEmail() {
  return normalizeEmail(process.env.ADMIN_EMAIL);
}

/**
 * Mints a signed session JWT for the admin.
 * @param {string} email
 * @returns {Promise<string>} compact JWS
 */
export async function createAdminSessionToken(email) {
  const nowSeconds = Math.floor(Date.now() / 1000);

  return new SignJWT({ role: 'admin', pwf: await passwordFingerprint() })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(normalizeEmail(email))
    .setIssuedAt(nowSeconds)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(nowSeconds + ADMIN_SESSION_TTL_SECONDS)
    .sign(getSecretKey());
}

/**
 * Verifies a session token. Returns null for anything less than a fully valid,
 * unexpired, correctly-scoped admin session.
 *
 * @param {string | undefined | null} token
 * @returns {Promise<{ sub: string, role: string } | null>}
 */
export async function verifyAdminSessionToken(token) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      // Pinning the algorithm prevents "alg" confusion / "none" downgrade attacks.
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    if (payload.role !== 'admin') return null;

    // The token must still name the currently-allowed admin. Changing
    // ADMIN_EMAIL therefore revokes every outstanding session.
    const allowed = getAllowedAdminEmail();
    if (!allowed || normalizeEmail(payload.sub) !== allowed) return null;

    // ...and it must match the current password. Rotating the password
    // revokes every outstanding session.
    if (payload.pwf !== (await passwordFingerprint())) return null;

    return /** @type {{ sub: string, role: string }} */ (payload);
  } catch {
    // Expired, tampered, wrong signature, malformed — all equally "not signed in".
    return null;
  }
}

/**
 * Cookie attributes for the session cookie.
 * `secure` is disabled on localhost so login works over plain HTTP in dev.
 *
 * @param {number} maxAge seconds; 0 clears the cookie
 * @returns {import('next/dist/compiled/@edge-runtime/cookies').CookieListItem}
 */
export function adminCookieOptions(maxAge = ADMIN_SESSION_TTL_SECONDS) {
  return {
    httpOnly: true, // not readable from JS — blunts XSS token theft
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // survives top-level navigation, blocks cross-site POSTs
    path: '/',
    maxAge,
  };
}
