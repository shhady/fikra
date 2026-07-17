import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/installer
 *
 * Redirects to the current FikraNova Print Agent installer.
 *
 * Deliberately PUBLIC (no admin session required)
 * -----------------------------------------------
 * You install tills yourself, standing at the restaurant or on AnyDesk. Making
 * this admin-only would mean signing into the admin panel on the customer's
 * machine, which is worse in every way — more friction for you, and your admin
 * session cookie left behind on a stranger's PC.
 *
 * And there is nothing to protect: the installer is GENERIC. It contains no
 * customer identity, no credentials, no restaurant data. It is inert until
 * someone types a one-time, restaurant-scoped, 10-minute pairing code into it —
 * and those come from the admin panel, which IS protected. An attacker who
 * downloads this gets a tray app that can do nothing at all.
 *
 * That is the whole point of pairing-at-install-time rather than per-customer
 * builds: the binary is not a secret, so it does not need guarding.
 *
 * ---------------------------------------------------------------------------
 * The binary lives in object storage, NOT in this repo:
 *   - it is ~96 MB, and GitHub hard-blocks files over 100 MB
 *   - git history is forever, so every release would add another ~96 MB blob
 *     that can never be removed
 *
 * It is hosted on Tigris (S3-compatible), the same storage kingclean, sandwich-bar
 * and tishreen-events already use. Publish with `npm run ship` from print-agent/,
 * then set:
 *
 *   INSTALLER_DOWNLOAD_URL=https://<bucket>.t3.storage.dev/print-agent/FikraNovaPrinterSetup.exe
 *
 * The same bucket also serves latest.yml, which is what electron-updater polls —
 * so one upload feeds both the download button and the fleet's auto-updates.
 * ---------------------------------------------------------------------------
 */
export async function GET() {
  const url = process.env.INSTALLER_DOWNLOAD_URL;

  if (!url) {
    return NextResponse.json(
      {
        error: 'The installer download is not configured yet.',
        detail:
          'Set INSTALLER_DOWNLOAD_URL to the hosted FikraNovaPrinterSetup.exe (Vercel Blob, Cloudflare R2, S3...).',
      },
      { status: 503 }
    );
  }

  // 302, not 301: a permanent redirect would be cached by browsers and proxies,
  // and we want a new version to be picked up immediately.
  return NextResponse.redirect(url, 302);
}
