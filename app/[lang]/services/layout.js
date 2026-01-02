export async function generateMetadata({ params }) {
  const { lang } = await params
  const base = 'https://www.fikranova.com'
  const titles = {
    en: 'AI Services: AI-powered Web Development, Custom AI Agents, Automation',
    ar: 'خدمات الذكاء الاصطناعي: تطوير مواقع بالذكاء الاصطناعي، وكلاء مخصصون، أتمتة',
    he: 'שירותי AI: פיתוח אתרים מבוססי AI, סוכני AI, אוטומציה'
  }
  const descriptions = {
    en: 'Explore AI-powered web development services, custom AI agents for business, AI automation, and professional AI video production.',
    ar: 'اكتشف خدمات تطوير المواقع بالذكاء الاصطناعي، وكلاء الذكاء الاصطناعي المخصصين، الأتمتة بالذكاء الاصطناعي، وإنتاج الفيديو الاحترافي بالذكاء الاصطناعي.',
    he: 'גלה שירותי פיתוח אתרים מבוססי AI, סוכני AI מותאמים, אוטומציה חכמה והפקת וידאו מקצועית ב-AI.'
  }

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `${base}/${lang}/services`,
      languages: {
        'x-default': `${base}/en/services`,
        en: `${base}/en/services`,
        ar: `${base}/ar/services`,
        he: `${base}/he/services`,
      },
    },
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      url: `${base}/${lang}/services`,
    },
  }
}

export default function ServicesLayout({ children }) {
  return children
} 