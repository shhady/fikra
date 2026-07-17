import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AdminLoginAttempt from '@/models/AdminLoginAttempt';
// Explicit .mjs extension: this package is not "type": "module", so the file
// must declare its own ESM-ness for the `admin:credentials` script to import it
// under plain Node as well as under Next's bundler.
import { equalizeVerifyTiming, isValidPasswordHash, verifyPassword } from '@/lib/adminPassword.mjs';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  adminCookieOptions,
  createAdminSessionToken,
  getAllowedAdminEmail,
  normalizeEmail,
} from '@/lib/adminSession';

// scrypt needs node:crypto, so this route must not run on the Edge runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Rate limit window and thresholds. */
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES_PER_IP = 8;
const MAX_FAILURES_GLOBAL = 30; // stops a distributed / rotating-IP attack

/**
 * Best-effort client IP. On Vercel, `x-forwarded-for` is set by the platform
 * edge and the left-most entry is the real client.
 *
 * @param {Request} request
 * @returns {string}
 */
function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Identical response for every failure mode, so the endpoint never reveals
 * whether the email was right, the password was right, or the account exists.
 *
 * @returns {NextResponse}
 */
function invalidCredentialsResponse() {
  return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
}

export async function POST(request) {
  try {
    const allowedEmail = getAllowedAdminEmail();
    const storedHash = process.env.ADMIN_PASSWORD_HASH;

    // Fail closed: if the server is not configured, nobody gets in.
    if (!allowedEmail || !storedHash || !process.env.ADMIN_SESSION_SECRET) {
      console.error(
        'Admin login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET (npm run admin:credentials).'
      );
      return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 500 });
    }

    // A malformed hash would otherwise just fail every verify, which is
    // indistinguishable from a wrong password and painful to diagnose. Say so.
    if (!isValidPasswordHash(storedHash)) {
      console.error(
        'ADMIN_PASSWORD_HASH is malformed. Expected "scrypt:N:r:p:salt:hash". ' +
          'Regenerate with `npm run admin:credentials` and copy the value verbatim.'
      );
      return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 500 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';

    await connectDB();

    const since = new Date(Date.now() - WINDOW_MS);

    const [ipFailures, globalFailures] = await Promise.all([
      AdminLoginAttempt.countDocuments({ ip, success: false, createdAt: { $gte: since } }),
      AdminLoginAttempt.countDocuments({ success: false, createdAt: { $gte: since } }),
    ]);

    if (ipFailures >= MAX_FAILURES_PER_IP || globalFailures >= MAX_FAILURES_GLOBAL) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Try again in 15 minutes.' },
        { status: 429, headers: { 'Retry-After': String(WINDOW_MS / 1000) } }
      );
    }

    const emailMatches = email === allowedEmail;

    // Always run a scrypt derivation, even for a wrong email, so response time
    // does not leak which of the two fields was wrong.
    const passwordMatches = emailMatches
      ? await verifyPassword(password, storedHash)
      : await equalizeVerifyTiming(password);

    if (!emailMatches || !passwordMatches) {
      await AdminLoginAttempt.create({ ip, email, success: false, userAgent });
      return invalidCredentialsResponse();
    }

    await AdminLoginAttempt.create({ ip, email, success: true, userAgent });

    const token = await createAdminSessionToken(allowedEmail);

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, adminCookieOptions(ADMIN_SESSION_TTL_SECONDS));

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
