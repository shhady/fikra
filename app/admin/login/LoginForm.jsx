'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

/**
 * Only allow redirects to an internal /admin path. Anything else — an absolute
 * URL, a protocol-relative "//evil.com", a path outside /admin — is discarded.
 * Without this check, ?next=https://evil.com would make our own login page a
 * credible-looking open redirect.
 *
 * @param {string | null} target
 * @returns {string}
 */
function safeRedirect(target) {
  if (!target) return '/admin';
  if (!target.startsWith('/admin')) return '/admin';
  if (target.startsWith('//')) return '/admin';

  return target;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'Invalid email or password.');
        setPassword('');
        setIsSubmitting(false);
        return;
      }

      const destination = safeRedirect(searchParams.get('next'));

      // refresh() re-runs the server components so they pick up the new cookie.
      router.replace(destination);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          // Password-manager / autofill extensions stamp attributes such as
          // `fdprocessedid` onto form controls before React hydrates, which
          // React reports as a hydration mismatch. The value is controlled, so
          // the extra attribute is harmless.
          suppressHydrationWarning
          className="w-full rounded-lg border border-slate-700 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          suppressHydrationWarning
          className="w-full rounded-lg border border-slate-700 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
          placeholder="••••••••••••"
        />
      </div>

      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-900/60 bg-red-950/50 px-3.5 py-2.5 text-sm text-red-300"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        suppressHydrationWarning
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
