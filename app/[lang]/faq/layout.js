export async function generateMetadata({ params }) {
  const { lang } = await params
  const base = 'https://www.fikranova.com'
  const titles = {
    en: 'FAQ — AI Automation, Custom AI Agents, and Next.js AI Integration',
    ar: 'الأسئلة الشائعة — الأتمتة بالذكاء الاصطناعي ووكلاء الذكاء وتكامل Next.js',
    he: 'שאלות נפוצות — אוטומציית AI, סוכני AI ואינטגרציית AI ב-Next.js'
  }
  const descriptions = {
    en: 'Answers about AI-powered web development services, AI automation, and custom AI agents for business.',
    ar: 'إجابات حول تطوير المواقع بالذكاء الاصطناعي، الأتمتة بالذكاء الاصطناعي، ووكلاء الذكاء المخصصين للأعمال.',
    he: 'תשובות על פיתוח אתרים מבוססי AI, אוטומציה חכמה וסוכני AI מותאמים לעסקים.'
  }
  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `${base}/${lang}/faq`,
      languages: {
        'x-default': `${base}/en/faq`,
        en: `${base}/en/faq`,
        ar: `${base}/ar/faq`,
        he: `${base}/he/faq`,
      },
    },
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      url: `${base}/${lang}/faq`,
    },
  }
}

export default function FAQLayout({ children }) {
  return children
} 