/**
 * Server-side dictionary loading.
 *
 * The old pattern imported all three dictionaries into every client component
 * and picked one at runtime:
 *
 *     import { ar } from '@/translations/ar'
 *     import { he } from '@/translations/he'
 *     import { en } from '@/translations/en'
 *     switch (language) { ... }
 *
 * That ships ~3x the translation payload to every visitor, in a bundle, on every
 * page — an English reader downloads the entire Arabic and Hebrew dictionaries
 * and throws them away. It is pure weight on Largest Contentful Paint, which
 * Google measures and ranks on.
 *
 * Here each dictionary is a dynamic import resolved on the SERVER, so exactly one
 * language crosses the wire, already rendered into HTML. Better for the reader,
 * better for the crawler.
 */

export const LOCALES = ['en', 'ar', 'he'];

/**
 * Arabic is the default because most of the client base reads Arabic. Note this
 * makes `/` redirect to `/ar` — see app/page.js for why the root still needs to
 * exist as a real, indexable page.
 */
export const DEFAULT_LOCALE = 'ar';

/** Locales written right-to-left. */
export const RTL_LOCALES = ['ar', 'he'];

const loaders = {
  en: () => import('@/translations/en').then((m) => m.en),
  ar: () => import('@/translations/ar').then((m) => m.ar),
  he: () => import('@/translations/he').then((m) => m.he),
};

/**
 * @param {string} lang
 * @returns {boolean}
 */
export function isRtl(lang) {
  return RTL_LOCALES.includes(lang);
}

/**
 * @param {string} lang
 * @returns {string} a locale we actually support
 */
export function normaliseLocale(lang) {
  return LOCALES.includes(lang) ? lang : DEFAULT_LOCALE;
}

/**
 * Loads one dictionary, on the server.
 *
 * @param {string} lang
 * @returns {Promise<object>}
 */
export async function getDictionary(lang) {
  const locale = normaliseLocale(lang);
  return loaders[locale]();
}

/**
 * Builds the hreflang map for a page.
 *
 * `x-default` matters more than people think: it tells Google which URL to show
 * a searcher whose language we do not serve. Without it, Google picks for us.
 *
 * @param {string} path e.g. '' for home, '/services'
 * @returns {{ canonical: string, languages: Record<string,string> }}
 */
export function alternatesFor(path = '', lang = DEFAULT_LOCALE) {
  const base = 'https://www.fikranova.com';
  const clean = path && !path.startsWith('/') ? `/${path}` : path;

  return {
    canonical: `${base}/${normaliseLocale(lang)}${clean}`,
    languages: {
      'x-default': `${base}/en${clean}`,
      en: `${base}/en${clean}`,
      ar: `${base}/ar${clean}`,
      he: `${base}/he${clean}`,
    },
  };
}
