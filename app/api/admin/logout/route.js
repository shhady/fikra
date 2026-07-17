import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, adminCookieOptions } from '@/lib/adminSession';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Clears the admin session cookie.
 *
 * POST-only on purpose: a GET logout can be triggered by any third-party page
 * embedding <img src="/api/admin/logout">, which would log you out at random.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  // maxAge 0 tells the browser to drop the cookie immediately.
  response.cookies.set(ADMIN_SESSION_COOKIE, '', adminCookieOptions(0));

  return response;
}
