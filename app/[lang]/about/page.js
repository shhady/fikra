import { Container, Section, Card, Heading, Lede, Eyebrow, PageHero, CtaBand } from '@/components/system';
import { getDictionary, normaliseLocale, alternatesFor } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  return {
    title: t.about.hero.title,
    description: t.about.hero.description,
    alternates: alternatesFor('/about', locale),
  };
}

export default async function AboutPage({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  return (
    <>
      <PageHero
        eyebrow={t.nav.about}
        title={t.about.hero.title}
        lede={t.about.hero.description}
      />

      {/* Vision + mission, side by side. They were stacked full-width blocks
          before, which made two short paragraphs occupy an entire screen. */}
      <Section>
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <Eyebrow dot={false}>{t.about.vision.title}</Eyebrow>
              <p className="mt-5 text-[17px] leading-relaxed text-steel">
                {t.about.vision.description}
              </p>
            </Card>

            <Card>
              <Eyebrow dot={false}>{t.about.mission.title}</Eyebrow>
              <p className="mt-5 text-[17px] leading-relaxed text-steel">
                {t.about.mission.description}
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      <Section className="border-y border-hairline bg-surface/30">
        <Container>
          <Heading>{t.about.values.title}</Heading>
          <Lede className="mt-5">{t.about.values.description}</Lede>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.about.values.items.map((value) => (
              <div key={value.title} className="border-t border-gold/40 pt-5">
                <h3 className="text-base font-semibold text-chalk">{value.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-steel">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        lang={locale}
        heading={t.home.cta.title}
        lede={t.home.cta.subtitle}
        primary={t.home.cta.startNow}
        secondary={t.nav.projects}
      />
    </>
  );
}
