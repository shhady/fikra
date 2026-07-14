import { Container, Section, PageHero } from '@/components/system';
import { getSupportContent } from '@/lib/content/support';
import { normaliseLocale, alternatesFor } from '@/lib/i18n';

import SupportForm from './SupportForm';

/**
 * Support.
 *
 * The old page was 100% hardcoded Arabic for every language — title, labels,
 * validation messages, button, all of it — and had no layout.js, so no metadata
 * either. An English visitor who clicked "Technical Support" in the footer landed
 * on a page they could not read.
 */
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const c = getSupportContent(locale);

  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: alternatesFor('/support', locale),
  };
}

export default async function SupportPage({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const c = getSupportContent(locale);

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} lede={c.lede} />

      <Section>
        <Container>
          <div className="max-w-3xl">
            <SupportForm c={c} lang={locale} />
          </div>
        </Container>
      </Section>
    </>
  );
}
