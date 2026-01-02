import { blogData } from './lib/blogData'

export default async function sitemap() {
  const baseUrl = 'https://www.fikranova.com'
  const langs = ['en', 'ar', 'he']

  const basePaths = ['', 'services', 'blog', 'faq', 'contact', 'support', 'privacy', 'terms', 'site-map', 'projects']

  // Localized static routes
  const routes = basePaths.flatMap((p) =>
    langs.map((lng) => ({
      url: `${baseUrl}/${lng}${p ? `/${p}` : ''}`,
      lastModified: new Date(),
      changeFrequency: p ? (p === 'services' || p === 'blog' ? 'weekly' : 'monthly') : 'daily',
      priority: p ? (p === 'services' || p === 'blog' ? 0.9 : 0.8) : 1,
    })),
  )

  // Localized blog posts
  const blogRoutes = Object.keys(blogData).flatMap((slug) =>
    langs.map((lng) => ({
      url: `${baseUrl}/${lng}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
  )

  return [...routes, ...blogRoutes]
}