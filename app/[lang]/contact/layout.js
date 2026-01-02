export async function generateMetadata({ params }) {
  const { lang } = await params
  const base = 'https://www.fikranova.com'
  const titles = {
    en: 'Contact FikraNova — Get a Free AI Automation Audit',
    ar: 'تواصل معنا — احصل على تقييم مجاني للأتمتة بالذكاء الاصطناعي',
    he: 'צור קשר — קבל בדיקת אוטומציית AI בחינם'
  }
  const descriptions = {
    en: 'Speak with our AI automation experts about AI-powered web development, custom AI agents, and Next.js AI integration.',
    ar: 'تواصل مع خبراء الأتمتة بالذكاء الاصطناعي حول تطوير مواقع الذكاء الاصطناعي ووكلاء الذكاء المخصصين وتكامل Next.js.',
    he: 'שוחחו עם מומחי האוטומציה שלנו לגבי פיתוח אתרים מבוססי AI, סוכני AI מותאמים ואינטגרציית AI ב-Next.js.'
  }
  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `${base}/${lang}/contact`,
      languages: {
        'x-default': `${base}/en/contact`,
        en: `${base}/en/contact`,
        ar: `${base}/ar/contact`,
        he: `${base}/he/contact`,
      },
    },
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      url: `${base}/${lang}/contact`,
    },
  }
}

export default function ContactLayout({ children }) {
  return children
} 