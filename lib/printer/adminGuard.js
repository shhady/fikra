import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';

/**
 * Guards the admin API.
 *
 * ============================================================================
 * READ THIS BEFORE ADDING A ROUTE UNDER /api/admin
 * ----------------------------------------------------------------------------
 * The middleware matcher in middleware.js EXCLUDES `api`. That is correct — we
 * do not want an Edge function running on every API call — but it means the
 * middleware that protects the /admin *pages* does NOT protect the /api/admin
 * *routes*.
 *
 * So every single route under /api/admin must call requireAdmin() itself. Forget
 * it in one route and that endpoint is public to the internet, with no warning
 * and nothing in the UI to reveal it.
 * ============================================================================
 *
 * @returns {Promise<{ session: object | null, response: NextResponse | null }>}
 *          Exactly one of the two is non-null.
 */
export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Not signed in.' }, { status: 401 }),
    };
  }

  return { session, response: null };
}

/**
 * @param {string} message
 * @param {number} status
 * @returns {NextResponse}
 */
export function adminFail(message, status) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * @param {unknown} id
 * @returns {boolean}
 */
export function isObjectId(id) {
  return /^[a-f0-9]{24}$/i.test(String(id || ''));
}
