import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'Sign in | FikraNova Admin',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">FikraNova</h1>
          <p className="mt-1.5 text-sm text-slate-400">Admin access</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-black/40">
          {/* LoginForm reads search params, which Next requires to sit behind a Suspense boundary. */}
          <Suspense fallback={<div className="h-64" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          This is a private area. All sign-in attempts are logged.
        </p>
      </div>
    </main>
  );
}
