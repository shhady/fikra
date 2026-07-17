import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';

const locales = ['en', 'ar', 'he'];
const defaultLocale = 'ar';

const LOGIN_PATH = '/admin/login';

/**
 * Gate for everything under /admin.
 *
 * Note this is a first line of defence and a redirect convenience, NOT the only
 * one: `app/admin/page.jsx` independently re-verifies the session server-side.
 * Authorization should never live in middleware alone.
 *
 * @param {import('next/server').NextRequest} request
 * @param {string} pathname
 */
async function handleAdmin(request, pathname) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  if (pathname === LOGIN_PATH) {
    // Already signed in? Don't show the login form again.
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL(LOGIN_PATH, request.url);

    // Remember where they were headed, so we can send them back after login.
    // Only a path is stored, never an absolute URL — that would be an open redirect.
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('next', pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * @param {import('next/server').NextRequest} request
 */
export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // /admin lives outside the [lang] segment and must NOT be locale-prefixed.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return handleAdmin(request, pathname);
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;

    // Redirect to the locale path (e.g. /en/services)
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, assets).
    // NOTE: /admin is deliberately NOT excluded here — it must reach the
    // middleware so handleAdmin() can guard it.
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|llms.txt|jomana|coconails|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
