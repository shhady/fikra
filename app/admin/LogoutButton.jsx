'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);

    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Even if the request fails, send them to the login screen; the cookie
      // will be rejected on the next guarded request anyway.
    }

    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSigningOut}
      className="rounded-lg border border-slate-700 px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60"
    >
      {isSigningOut ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
