import Link from 'next/link';

/**
 * 404.
 *
 * Was hardcoded Arabic ("عذراً، الصفحة التي تبحث عنها غير موجودة") for every
 * language, with a "back to home" link that dropped the locale entirely.
 *
 * Next renders not-found outside the dynamic segment, so this file has no
 * reliable way to know the reader's language. Rather than guess — which is what
 * the old one did, always guessing Arabic — it offers the way back in all three.
 * An empty screen is an invitation to act, so every line here is an exit.
 */
export default function NotFound() {
  const routes = [
    { lang: 'ar', label: 'العودة إلى الصفحة الرئيسية', dir: 'rtl' },
    { lang: 'he', label: 'חזרה לעמוד הבית', dir: 'rtl' },
    { lang: 'en', label: 'Back to the homepage', dir: 'ltr' },
  ];

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-md">
        <p className="eyebrow">Not found</p>

        <p className="mt-6 font-mono text-6xl font-semibold tabular-nums text-chalk">404</p>

        <div className="perf my-8" />

        <ul className="space-y-2.5">
          {routes.map((route) => (
            <li key={route.lang}>
              <Link
                href={`/${route.lang}`}
                dir={route.dir}
                className="flex items-center justify-between gap-4 rounded border border-hairline bg-surface px-4 py-3.5 text-sm text-steel transition-colors hover:border-steel hover:text-chalk"
              >
                <span>{route.label}</span>
                <span className="font-mono text-xs uppercase tracking-widest text-slate">
                  {route.lang}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
