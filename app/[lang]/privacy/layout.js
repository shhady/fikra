export async function generateMetadata({ params }) {
  const { lang } = await params
  const base = 'https://www.fikranova.com'
  const titles = {
    en: 'Privacy Policy — FikraNova AI Automation Agency',
    ar: 'سياسة الخصوصية — FikraNova وكالة الأتمتة بالذكاء الاصطناعي',
    he: 'מדיניות פרטיות — FikraNova סוכנות אוטומציית AI'
  }
  const descriptions = {
    en: 'Learn how FikraNova collects, uses, and protects your data for AI-powered services.',
    ar: 'تعرف على كيفية جمع واستخدام وحماية بياناتك ضمن خدماتنا المدعومة بالذكاء الاصطناعي.',
    he: 'מידע על איסוף, שימוש והגנה על המידע שלך במסגרת שירותי AI.'
  }
  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `${base}/${lang}/privacy`,
      languages: {
        'x-default': `${base}/en/privacy`,
        en: `${base}/en/privacy`,
        ar: `${base}/ar/privacy`,
        he: `${base}/he/privacy`,
      },
    },
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      url: `${base}/${lang}/privacy`,
    },
  }
}

export default function PrivacyLayout({ children }) {
  return children
} 

