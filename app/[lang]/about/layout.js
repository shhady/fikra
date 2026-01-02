export async function generateMetadata({ params }) {
  const { lang } = await params
  const base = 'https://www.fikranova.com'
  const titles = {
    en: 'About FikraNova — AI Automation Agency in Next.js & Custom AI Agents',
    ar: 'من نحن — وكالة أتمتة بالذكاء الاصطناعي وتكامل Next.js وسفراء AI',
    he: 'אודות FikraNova — סוכנות אוטומציית AI ו-Next.js עם סוכני AI'
  }
  const descriptions = {
    en: 'We help companies scale with AI-powered web development, custom AI agents, and business process automation. Based in Israel, serving MENA and global clients.',
    ar: 'نساعد الشركات على التوسع عبر تطوير مواقع بالذكاء الاصطناعي، ووكلاء ذكاء مخصصين، وأتمتة عمليات الأعمال. نخدم الشرق الأوسط والعالم.',
    he: 'אנחנו מסייעים לחברות לצמוח באמצעות פיתוח אתרים מבוססי AI, סוכני AI ואוטומציה עסקית. משרתים לקוחות בישראל ובעולם.'
  }
  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `${base}/${lang}/about`,
      languages: {
        'x-default': `${base}/en/about`,
        en: `${base}/en/about`,
        ar: `${base}/ar/about`,
        he: `${base}/he/about`,
      },
    },
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      url: `${base}/${lang}/about`,
    },
  }
}

export default function AboutLayout({ children }) {
  return children
} 