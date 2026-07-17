import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { connectDB } from '@/lib/db';
import AdminLoginAttempt from '@/models/AdminLoginAttempt';
import Contact from '@/models/Contact';
import Newsletter from '@/models/Newsletter';
import Support from '@/models/Support';
import Device from '@/models/Device';
import Restaurant from '@/models/Restaurant';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';

import LogoutButton from './LogoutButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard | FikraNova Admin',
  robots: { index: false, follow: false },
};

/**
 * Loads the dashboard counters. Kept tolerant: if one collection query fails,
 * the page still renders rather than 500-ing the whole admin area.
 *
 * @returns {Promise<{ contacts: number, newsletter: number, support: number, recentAttempts: Array<object> }>}
 */
async function loadDashboardData() {
  await connectDB();

  const [contacts, newsletter, support, recentAttempts, restaurants, devices] = await Promise.all([
    Contact.estimatedDocumentCount().catch(() => 0),
    Newsletter.estimatedDocumentCount().catch(() => 0),
    Support.estimatedDocumentCount().catch(() => 0),
    AdminLoginAttempt.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .lean()
      .catch(() => []),
    Restaurant.estimatedDocumentCount().catch(() => 0),
    Device.find({ revokedAt: null })
      .select('lastHeartbeatAt')
      .lean()
      .catch(() => []),
  ]);

  // A till is "online" if it has beaten within 2.5 heartbeat intervals — enough
  // to tolerate one lost beat without the dashboard flickering.
  const onlineTills = devices.filter(
    (device) =>
      device.lastHeartbeatAt && Date.now() - new Date(device.lastHeartbeatAt).getTime() < 150_000
  ).length;

  return {
    contacts,
    newsletter,
    support,
    recentAttempts,
    restaurants,
    tills: devices.length,
    onlineTills,
  };
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  // Defence in depth: middleware already gates /admin, but authorization must
  // never rely on middleware alone. Re-verify here, in the server component
  // that actually renders the private data.
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  if (!session) {
    redirect('/admin/login');
  }

  const { contacts, newsletter, support, recentAttempts, restaurants, tills, onlineTills } =
    await loadDashboardData();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Admin dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Signed in as <span className="text-slate-300">{session.sub}</span>
          </p>
        </div>
        <LogoutButton />
      </header>

      {/* Print platform ------------------------------------------------ */}
      <section className="mb-10">
        <Link
          href="/admin/printers"
          className="block rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-indigo-700 hover:bg-slate-900"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Printers</h2>
              <p className="mt-1 text-sm text-slate-400">
                {restaurants === 0 ? (
                  'Add your first restaurant and pair a till →'
                ) : (
                  <>
                    {restaurants} restaurant{restaurants === 1 ? '' : 's'} ·{' '}
                    <span className={onlineTills === tills ? 'text-emerald-400' : 'text-amber-400'}>
                      {onlineTills}/{tills} till{tills === 1 ? '' : 's'} online
                    </span>
                  </>
                )}
              </p>
            </div>
            <span className="text-slate-500">→</span>
          </div>
        </Link>
      </section>

      <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Contact submissions" value={contacts} />
        <StatCard label="Newsletter subscribers" value={newsletter} />
        <StatCard label="Support tickets" value={support} />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Recent sign-in attempts
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  When
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  IP
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentAttempts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No sign-in attempts recorded yet.
                  </td>
                </tr>
              ) : (
                recentAttempts.map((attempt) => (
                  <tr key={String(attempt._id)} className="bg-slate-950/40">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                      {new Date(attempt.createdAt).toLocaleString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{attempt.email || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                      {attempt.ip}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          attempt.success
                            ? 'rounded-full bg-emerald-950 px-2.5 py-1 text-xs font-medium text-emerald-400'
                            : 'rounded-full bg-red-950 px-2.5 py-1 text-xs font-medium text-red-400'
                        }
                      >
                        {attempt.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-600">
          Attempts are retained for 24 hours. After 8 failures from one IP within 15 minutes, that IP
          is locked out.
        </p>
      </section>
    </main>
  );
}
