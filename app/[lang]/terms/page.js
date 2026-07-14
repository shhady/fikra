import { Container, Section, PageHero } from '@/components/system';
import { getDictionary, normaliseLocale, alternatesFor } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  return {
    title: t.terms.title,
    description: t.terms.intro,
    alternates: alternatesFor('/terms', locale),
    robots: { index: false, follow: true },
  };
}

export default async function TermsPage({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  return (
    <>
      <PageHero title={t.terms.title} lede={t.terms.intro} />

      <Section>
        <Container>
          <div className="max-w-prose">
            <ol className="space-y-12">
              {t.terms.sections.map((section, index) => (
                <li key={section.title}>
                  <div className="flex items-baseline gap-4">
                    {/* The numbering is real here: these are numbered clauses in a
                        legal document, and people cite them by number. */}
                    <span className="text-sm tabular-nums text-gold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-xl font-semibold text-chalk">{section.title}</h2>
                  </div>

                  <p className="mt-4 ps-9 text-[16px] leading-relaxed text-steel">
                    {section.content}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-16 border-t border-hairline pt-6 text-sm text-slate">
              {t.terms.lastUpdated}
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
