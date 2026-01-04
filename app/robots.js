export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: 'https://www.fikranova.com/sitemap.xml',
    host: 'https://www.fikranova.com', 
  }
}
