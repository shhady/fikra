'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Header.
 *
 * Every link is built as `/${lang}/...`. That sounds obvious, but the old header
 * and hero linked to bare `/contact` and `/services`, which middleware then
 * rewrote to `/ar/...` — so an English visitor who clicked the main call to
 * action landed on an Arabic page. That single missing prefix was quietly
 * throwing away English and Hebrew leads.
 *
 * @param {{ lang: string, t: object }} props
 */
export default function Header({ lang, t }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const nav = [
    { name: t.nav.services, href: `/${lang}/services` },
    { name: t.nav.projects, href: `/${lang}/projects` },
    { name: t.nav.about, href: `/${lang}/about` },
    { name: t.nav.contact, href: `/${lang}/contact` },
  ];

  /** Swap the locale segment, keep the reader where they are. */
  function switchLanguage(next) {
    const segments = (pathname || `/${lang}`).split('/');
    segments[1] = next;
    router.push(segments.join('/') || `/${next}`);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-ink/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href={`/${lang}`} className="flex shrink-0 items-center" aria-label="FikraNova">
          <Image
            src="/logo-11.png"
            alt="FikraNova"
            width={120}
            height={40}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  active ? 'text-chalk' : 'text-steel hover:text-chalk'
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          <LanguageSwitch lang={lang} onChange={switchLanguage} />

          <Link
            href={`/${lang}/contact`}
            className="rounded bg-chalk px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-ink transition-colors hover:bg-white"
          >
            {t.nav.startProject || t.nav.contact}
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-4 md:hidden">
          <LanguageSwitch lang={lang} onChange={switchLanguage} />

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-steel hover:text-chalk"
            aria-expanded={open}
            aria-label="Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeWidth={1.5}
                d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'}
              />
            </svg>
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-hairline bg-ink md:hidden">
          <div className="space-y-1 px-5 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-steel hover:text-chalk"
              >
                {item.name}
              </Link>
            ))}

            <Link
              href={`/${lang}/contact`}
              onClick={() => setOpen(false)}
              className="mt-3 block rounded bg-chalk px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.12em] text-ink"
            >
              {t.nav.startProject || t.nav.contact}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/**
 * The language switch shows each language IN that language. A Hebrew reader
 * looking for their language scans for עברית, not for "Hebrew".
 */
function LanguageSwitch({ lang, onChange }) {
  const languages = [
    { code: 'ar', label: 'ع' },
    { code: 'he', label: 'ע' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <div className="flex items-center gap-1 rounded border border-hairline p-0.5">
      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => onChange(item.code)}
          aria-current={lang === item.code ? 'true' : undefined}
          className={`rounded px-2 py-1 font-mono text-xs transition-colors ${
            lang === item.code
              ? 'bg-surface-2 text-chalk'
              : 'text-slate hover:text-steel'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
