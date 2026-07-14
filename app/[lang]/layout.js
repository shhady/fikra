import Script from 'next/script';
import {
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  IBM_Plex_Sans_Arabic,
  IBM_Plex_Sans_Hebrew,
  Rubik,
} from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { GoogleTagManager } from '@next/third-parties/google';

import '../globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatButton from '@/components/ChatButton';
import { LanguageProvider } from '@/context/LanguageContext';
import { LOCALES, isRtl, normaliseLocale, alternatesFor, getDictionary } from '@/lib/i18n';

/**
 * Type.
 *
 * IBM Plex is the whole reason this works: it is the only mainstream superfamily
 * that draws Latin, Arabic AND Hebrew from one design, plus a monospace. So a
 * FikraNova page reads as one voice in all three languages instead of three
 * unrelated typefaces bolted together — which is exactly the problem the company
 * solves for its clients.
 *
 * The old site loaded Tajawal (an Arabic face) and applied it to English and
 * Hebrew too.
 */
const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-latin',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-arabic',
  display: 'swap',
});

const hebrew = IBM_Plex_Sans_Hebrew({
  subsets: ['hebrew'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-hebrew',
  display: 'swap',
});

/**
 * Display face. Rubik began life as a Hebrew typeface and grew real Arabic and
 * Latin — one family, all three scripts, so headlines need no per-locale
 * indirection the way the body face does. Plex stays on body text, where its
 * small-size rendering is better.
 */
const displayFace = Rubik({
  subsets: ['latin', 'arabic', 'hebrew'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

/**
 * Which CSS custom property holds the body face for this locale.
 *
 * Tailwind's `font-sans` resolves to `--font-sans`; we point that at the right
 * script per page, so an Arabic reader gets Plex Arabic and an English reader
 * gets Plex Sans — from the same family, so the page still reads as one voice.
 */
function bodyFontVar(locale) {
  if (locale === 'ar') return '--font-sans-arabic';
  if (locale === 'he') return '--font-sans-hebrew';
  return '--font-sans-latin';
}

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  const title = t.meta?.title || 'FikraNova';
  const description = t.meta?.description || '';

  return {
    metadataBase: new URL('https://www.fikranova.com'),
    title: { default: title, template: `%s — FikraNova` },
    description,
    alternates: alternatesFor('', locale),
    openGraph: {
      title,
      description,
      url: `https://www.fikranova.com/${locale}`,
      siteName: 'FikraNova',
      locale: locale === 'ar' ? 'ar_IL' : locale === 'he' ? 'he_IL' : 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const rtl = isRtl(locale);
  const t = await getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={rtl ? 'rtl' : 'ltr'}
      className={`${sans.variable} ${mono.variable} ${arabic.variable} ${hebrew.variable} ${displayFace.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Point the body face at the script this visitor actually reads. */}
        <style>{`:root{--font-sans:var(${bodyFontVar(locale)})}`}</style>
      </head>
      <GoogleTagManager gtmId="GTM-PPZLNWV7" />
      <body className={`${rtl ? 'rtl' : 'ltr'} font-sans antialiased`} suppressHydrationWarning>
        <LanguageProvider initialLocale={locale}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:bg-chalk focus:px-4 focus:py-2 focus:text-ink"
          >
            {t.common?.skipToContent || 'Skip to content'}
          </a>

          <Header lang={locale} t={t} />
          <main id="main" className="min-h-screen">
            {children}
          </main>
          <Footer lang={locale} t={t} />
          <ChatButton />
        </LanguageProvider>

        <Analytics />
        <Script
          src="https://cdn.enable.co.il/licenses/enable-L47784k8n24pqfm7-0925-75470/init.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
