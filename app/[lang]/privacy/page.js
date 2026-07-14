import { Container, Section, PageHero } from '@/components/system';
import { getDictionary, normaliseLocale, alternatesFor } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  return {
    title: t.privacy.title,
    description: t.privacy.intro,
    alternates: alternatesFor('/privacy', locale),
    // Legal pages should not compete with real pages in search results.
    robots: { index: false, follow: true },
  };
}

export default async function PrivacyPage({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  const sections = [t.privacy.collection, t.privacy.usage, t.privacy.protection];

  return (
    <>
      <PageHero title={t.privacy.title} lede={t.privacy.intro} />

      <Section>
        <Container>
          <div className="max-w-prose space-y-12">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-chalk">{section.title}</h2>

                <p className="mt-4 text-[16px] leading-relaxed text-steel">
                  {section.description}
                </p>

                {section.items ? (
                  <ul className="mt-5 space-y-2.5">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[16px] text-steel">
                        <span
                          className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
