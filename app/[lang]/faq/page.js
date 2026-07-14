import { Container, Section, PageHero, CtaBand } from '@/components/system';
import { getDictionary, normaliseLocale, alternatesFor } from '@/lib/i18n';

import Faq from './Faq';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  return {
    title: t.faq.hero.title,
    description: t.faq.hero.subtitle,
    alternates: alternatesFor('/faq', locale),
  };
}

export default async function FaqPage({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  // FAQPage structured data. This is the one page type where Google will show the
  // questions and answers directly in the search result — worth the markup.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faq.categories.flatMap((category) =>
      category.questions.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero title={t.faq.hero.title} lede={t.faq.hero.subtitle} />

      <Section>
        <Container>
          <div className="max-w-3xl">
            <Faq categories={t.faq.categories} />
          </div>
        </Container>
      </Section>

      <CtaBand
        lang={locale}
        heading={t.faq.cta.title}
        lede={t.faq.cta.subtitle}
        primary={t.faq.cta.button}
      />
    </>
  );
}
