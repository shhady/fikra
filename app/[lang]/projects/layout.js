export async function generateMetadata({ params }) {
  const { lang } = await params
  const base = 'https://www.fikranova.com'
  const titles = {
    en: 'AI Projects & Case Studies — AI-powered Web Development & Automation',
    ar: 'مشاريع ودراسات حالة — تطوير مواقع وأتمتة بالذكاء الاصطناعي',
    he: 'פרויקטים ומקרי בוחן — פיתוח אתרים ואוטומציית AI'
  }
  const descriptions = {
    en: 'See examples of AI-powered web development, custom AI agents, and AI automation results.',
    ar: 'اطلع على أمثلة لتطوير المواقع بالذكاء الاصطناعي ووكلاء الذكاء والأتمتة الذكية.',
    he: 'ראו דוגמאות לפיתוח אתרים מבוססי AI, סוכני AI ואוטומציה חכמה.'
  }
  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `${base}/${lang}/projects`,
      languages: {
        'x-default': `${base}/en/projects`,
        en: `${base}/en/projects`,
        ar: `${base}/ar/projects`,
        he: `${base}/he/projects`,
      },
    },
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      url: `${base}/${lang}/projects`,
    },
  }
}

export default function ProjectsLayout({ children }) {
  return children
} 

