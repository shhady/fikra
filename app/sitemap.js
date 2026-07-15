import { blogData } from '@/lib/blogData';
import { LOCALES } from '@/lib/i18n';

const BASE = 'https://www.fikranova.com';

/**
 * The sitemap.
 *
 * Two things were wrong before:
 *
 *  1. It omitted `/about` entirely — one of the pages a prospect most reliably
 *     visits before contacting an agency, and Google was never told it existed.
 *
 *  2. It listed each locale as a separate, unrelated URL. Without `alternates`,
 *     Google sees three pages that happen to look similar rather than one page in
 *     three languages, and has to guess which to show an Arabic searcher. Telling
 *     it explicitly is the single highest-leverage SEO fix on a multilingual site.
 */
function alternatesFor(path) {
  const languages = Object.fromEntries(
    LOCALES.map((lang) => [lang, `${BASE}/${lang}${path ? `/${path}` : ''}`])
  );

  return { languages };
}

export default async function sitemap() {
  const paths = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: 'services', priority: 0.9, changeFrequency: 'monthly' },
    { path: 'projects', priority: 0.9, changeFrequency: 'monthly' },
    { path: 'projects/business-suite', priority: 0.7, changeFrequency: 'monthly' },
    { path: 'about', priority: 0.8, changeFrequency: 'monthly' },
    { path: 'blog', priority: 0.8, changeFrequency: 'weekly' },
    { path: 'contact', priority: 0.8, changeFrequency: 'monthly' },
    { path: 'faq', priority: 0.6, changeFrequency: 'monthly' },
    { path: 'support', priority: 0.5, changeFrequency: 'monthly' },
    { path: 'privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: 'terms', priority: 0.3, changeFrequency: 'yearly' },
  ];

  const routes = paths.flatMap(({ path, priority, changeFrequency }) =>
    LOCALES.map((lang) => ({
      url: `${BASE}/${lang}${path ? `/${path}` : ''}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: alternatesFor(path),
    }))
  );

  const posts = Object.keys(blogData).flatMap((slug) =>
    LOCALES.map((lang) => ({
      url: `${BASE}/${lang}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  );

  return [...routes, ...posts];
}
