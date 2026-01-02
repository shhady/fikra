import Hero from '@/components/Hero'
import ServicesShowcase from '@/components/ServicesShowcase'
import FeaturesSection from '@/components/FeaturesSection'
import CTASection from '@/components/CTASection'
import Script from 'next/script'
import Link from 'next/link'

export async function generateMetadata({ params }) {
  const { lang } = await params
  const base = 'https://www.fikranova.com'

  const titles = {
    en: 'AI Automation Agency | AI-powered Web Development, Custom AI Agents',
    ar: 'وكالة الأتمتة بالذكاء الاصطناعي | تطوير مواقع الذكاء الاصطناعي ووكلاء مخصصون',
    he: 'סוכנות אוטומציית AI | פיתוח אתרים מבוססי בינה מלאכותית וסוכני AI'
  }
  const descriptions = {
    en: 'Scale your business with AI-powered web development, custom AI agents, and business process automation. Next.js AI integration and professional AI video production.',
    ar: 'طوّر عملك عبر تطوير مواقع بالذكاء الاصطناعي، وكلاء ذكاء اصطناعي مخصصين، وأتمتة عمليات الأعمال. تكامل Next.js مع الذكاء الاصطناعي وإنتاج فيديو احترافي بالذكاء الاصطناعي.',
    he: 'קדם את העסק עם פיתוח אתרים מבוססי AI, סוכני AI מותאמים ואוטומציה לעסקים. אינטגרציית Next.js עם AI והפקת וידאו מקצועית ב-AI.'
  }

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `${base}/${lang}`,
      languages: {
        'x-default': `${base}/en`,
        en: `${base}/en`,
        ar: `${base}/ar`,
        he: `${base}/he`,
      },
    },
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      url: `${base}/${lang}`,
    },
  }
}

export default function Home() {
  return (
    <main className="bg-black">
      <Script id="org-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'FikraNova',
            url: 'https://www.fikranova.com',
            logo: 'https://www.fikranova.com/logo-11.png',
            sameAs: [
              'https://www.linkedin.com/company/fikranova',
              'https://www.instagram.com/fikra.nova'
            ]
          })
        }}
      />
      <Script id="website-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'FikraNova',
            url: 'https://www.fikranova.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://www.fikranova.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          })
        }}
      />
      <Hero />
      <ServicesShowcase />
      <FeaturesSection />
      <CTASection />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <Link href="services" className="text-blue-400 hover:text-blue-300 underline">Explore our Services</Link>
          <Link href="projects" className="text-blue-400 hover:text-blue-300 underline">See recent Projects</Link>
          <Link href="blog" className="text-blue-400 hover:text-blue-300 underline">Read AI Insights</Link>
          <Link href="contact" className="text-blue-400 hover:text-blue-300 underline">Get a Free Audit</Link>
        </div>
      </section>
    </main>
  )
}