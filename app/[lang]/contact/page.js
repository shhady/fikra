import { Container, Section, PageHero, Card, Eyebrow } from '@/components/system';
import { getDictionary, normaliseLocale, alternatesFor } from '@/lib/i18n';

import ContactForm from './ContactForm';

/**
 * All SIX services. The dropdown used to offer four — AI agents and AI automation
 * were missing, even though they exist in every dictionary and on the services
 * page. Sourced from the same keys the services page and footer use, so the three
 * can never drift apart again.
 */
const SERVICE_KEYS = ['webDev', 'business', 'aiAgents', 'aiAutomation', 'marketing', 'content'];

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  return {
    title: t.contact.hero.title,
    description: t.contact.hero.subtitle,
    alternates: alternatesFor('/contact', locale),
  };
}

export default async function ContactPage({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);

  const services = [
    ...SERVICE_KEYS.map((key) => t.home.services.items[key].title),
    t.contact.form.other,
  ];

  return (
    <>
      <PageHero
        eyebrow={t.nav.contact}
        title={t.contact.hero.title}
        lede={t.contact.hero.subtitle}
      />

      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
            <ContactForm t={t} services={services} />

            <div className="space-y-4">
              {/* Booking a call is a stronger action than sending a form, so it
                  gets its own card rather than being buried under the form. */}
              <Card>
                <Eyebrow dot={false}>{t.contact.calendly.title}</Eyebrow>

                <p className="mt-4 text-[15px] leading-relaxed text-steel">
                  {t.contact.calendly.subtitle}
                </p>

                <a
                  href="https://calendly.com/shhadyse/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold transition-colors hover:bg-gold/10"
                >
                  {t.contact.calendly.buttonText}
                </a>
              </Card>

              <Card>
                <Eyebrow dot={false}>{t.contact.info.title}</Eyebrow>

                <dl className="mt-5 space-y-4">
                  <div>
                    <dt className="text-xs text-slate">{t.contact.info.email}</dt>
                    <dd className="mt-1">
                      <a
                        href="mailto:info@fikranova.com"
                        dir="ltr"
                        className="text-[15px] text-chalk transition-colors hover:text-gold"
                      >
                        info@fikranova.com
                      </a>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-slate">{t.contact.info.phone}</dt>
                    <dd className="mt-1">
                      <a
                        href="https://wa.me/972543113297"
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                        className="text-[15px] text-chalk transition-colors hover:text-gold"
                      >
                        +972 54 311 3297
                      </a>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-slate">{t.contact.info.hours}</dt>
                    <dd className="mt-1 text-[15px] text-chalk">{t.contact.info.workingHours}</dd>
                  </div>
                </dl>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
