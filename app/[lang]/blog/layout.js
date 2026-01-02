export async function generateMetadata({ params }) {
  const { lang } = await params
  const base = 'https://www.fikranova.com'
  const titles = {
    en: 'AI Blog — AI Automation, Custom AI Agents, Next.js AI Integration',
    ar: 'مدونة الذكاء الاصطناعي — الأتمتة ووكلاء الذكاء وتكامل Next.js',
    he: 'בלוג AI — אוטומציית AI, סוכני AI ואינטגרציית AI ב-Next.js'
  }
  const descriptions = {
    en: 'Insights on AI-powered web development, business automation, and professional AI video production.',
    ar: 'مقالات حول تطوير المواقع بالذكاء الاصطناعي، أتمتة الأعمال، وإنتاج الفيديو بالذكاء الاصطناعي.',
    he: 'תובנות על פיתוח אתרים מבוססי AI, אוטומציה עסקית והפקת וידאו ב-AI.'
  }
  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `${base}/${lang}/blog`,
      languages: {
        'x-default': `${base}/en/blog`,
        en: `${base}/en/blog`,
        ar: `${base}/ar/blog`,
        he: `${base}/he/blog`,
      },
    },
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      url: `${base}/${lang}/blog`,
    },
  }
}

export default function BlogLayout({ children }) {
  return children
} 

