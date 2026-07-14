import { Container, Section, Card, Heading, PageHero, CtaBand } from '@/components/system';
import { getDictionary, normaliseLocale, alternatesFor } from '@/lib/i18n';

/**
 * Services.
 *
 * Converted from a client component to a server one. The old version imported all
 * three dictionaries and picked one at runtime, so every visitor downloaded the
 * Arabic AND Hebrew AND English copy and threw two of them away — pure weight on
 * a metric Google ranks you on. Now the server loads one and sends HTML.
 */

/** All six. The old footer listed four of these and the contact form offered four. */
const SERVICE_KEYS = ['webDev', 'business', 'aiAgents', 'aiAutomation', 'marketing', 'content'];

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  return {
    title: t.home.services.title,
    description: t.home.services.subtitle,
    alternates: alternatesFor('/services', locale),
  };
}

export default async function ServicesPage({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  const services = SERVICE_KEYS.map((key) => ({ key, ...t.home.services.items[key] }));

  return (
    <>
      <PageHero
        eyebrow={t.nav.services}
        title={t.home.services.title}
        lede={t.home.services.subtitle}
      />

      <Section>
        <Container>
          <div className="grid gap-4 lg:grid-cols-2">
            {services.map((service) => (
              <Card key={service.key} className="flex flex-col">
                <Heading as="h2" size="md">
                  {service.title}
                </Heading>

                <p className="mt-4 text-[15px] leading-relaxed text-steel">
                  {service.description}
                </p>

                <ul className="mt-6 space-y-2.5 border-t border-hairline pt-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-[15px] text-chalk">
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
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
