export async function generateMetadata({ params }) {
  const { lang } = await params
  const base = 'https://www.fikranova.com'
  const titles = {
    en: 'Terms & Conditions — FikraNova AI Automation Agency',
    ar: 'الشروط والأحكام — FikraNova وكالة الأتمتة بالذكاء الاصطناعي',
    he: 'תנאים והגבלות — FikraNova סוכנות אוטומציית AI'
  }
  const descriptions = {
    en: 'Read the terms governing the use of FikraNova services and website.',
    ar: 'اطلع على الشروط التي تحكم استخدام موقع وخدمات FikraNova.',
    he: 'קראו את התנאים החלים על שימוש באתר ובשירותי FikraNova.'
  }
  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `${base}/${lang}/terms`,
      languages: {
        'x-default': `${base}/en/terms`,
        en: `${base}/en/terms`,
        ar: `${base}/ar/terms`,
        he: `${base}/he/terms`,
      },
    },
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      url: `${base}/${lang}/terms`,
    },
  }
}

export default function TermsLayout({ children }) {
  return children
} 

