export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: [
      'https://www.fikranova.com/sitemap.xml',
      'https://www.fikranova.com/llms.txt',
    ],
    host: 'https://www.fikranova.com', 
  }
}
