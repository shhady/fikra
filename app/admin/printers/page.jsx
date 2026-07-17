import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';

import PrintersConsole from './PrintersConsole';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Printers | FikraNova Admin',
  robots: { index: false, follow: false },
};

export default async function PrintersPage() {
  // Defence in depth: middleware guards /admin, but authorization must never rest
  // on middleware alone (it has been bypassable in Next before). Re-verify here,
  // in the component that actually renders the private data.
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  if (!session) redirect('/admin/login');

  const installerConfigured = Boolean(process.env.INSTALLER_DOWNLOAD_URL);

  return <PrintersConsole installerConfigured={installerConfigured} />;
}
