import Image from 'next/image';
import Link from 'next/link';

import { Container, Section, Eyebrow, Heading, Lede, Button, Card } from '@/components/system';
import Hero from '@/components/home/Hero';
import { getHomeContent } from '@/lib/content/home';
import { getFeaturedProjects } from '@/lib/content/projects';
import { normaliseLocale, alternatesFor } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const c = getHomeContent(locale);

  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: alternatesFor('', locale),
    openGraph: { title: c.meta.title, description: c.meta.description },
  };
}

export default async function HomePage({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const c = getHomeContent(locale);
  const featured = getFeaturedProjects(locale);

  // Structured data. Google reads it; visitors never see it. It is the difference
  // between a blue link and a rich result.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'FikraNova',
    url: `https://www.fikranova.com/${locale}`,
    description: c.meta.description,
    areaServed: 'IL',
    availableLanguage: ['ar', 'he', 'en'],
    knowsAbout: c.hero.capabilities,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero lang={locale} c={c} />

      {/* ============================== WHAT WE DO ======================
          Outcomes, not a technology list. The old site led with "Next.js,
          TensorFlow.js, Power BI" — a stack nobody buying this is qualified
          to evaluate, and nobody buying this cares about.
          ================================================================ */}
      <Section className="relative">
        <Container>
          <Eyebrow>{c.services.eyebrow}</Eyebrow>
          <Heading className="mt-6">{c.services.heading}</Heading>
          <Lede className="mt-5">{c.services.lede}</Lede>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.services.items.map((item) => (
              <Card key={item.title}>
                <h3 className="text-lg font-semibold text-chalk">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-steel">{item.body}</p>
              </Card>
            ))}
          </div>

          <p className="mt-10 text-[15px] leading-relaxed text-steel">
            {c.services.afterLaunch}{' '}
            <Link href={`/${locale}/support`} className="text-gold underline-offset-4 hover:underline">
              {c.services.afterLaunchLink}
            </Link>
          </p>
        </Container>
      </Section>

      {/* ============================ SELECTED WORK =====================
          The proof. Real brands, real live links — every URL here was
          verified to return 200. Projects whose sites are down are listed
          on /projects but are NOT featured (see lib/content/projects.js).

          These images are LOGOS, not screenshots — some have a white
          background baked in, others are dark — so they are contained and
          padded on one neutral surface rather than cropped, exactly as
          /projects frames them. Do not describe them as screenshots.
          ================================================================ */}
      <Section>
        <Container>
          <Eyebrow>{c.work.eyebrow}</Eyebrow>
          <Heading className="mt-6">{c.work.heading}</Heading>
          <Lede className="mt-5">{c.work.lede}</Lede>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex flex-col overflow-hidden !p-0"
              >
                <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-hairline bg-surface-2 p-10">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-8 transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-chalk">{project.title}</h3>
                  <p className="mt-2 text-sm text-steel">{project.industry}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10">
            <Button href={`/${locale}/projects`} variant="ghost">
              {c.work.cta}
            </Button>
          </div>
        </Container>
      </Section>

      {/* ============================== INDUSTRIES ====================== */}
      <Section className="border-y border-hairline bg-surface/30">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <Eyebrow>{c.industries.eyebrow}</Eyebrow>
              <Heading className="mt-6">{c.industries.heading}</Heading>
              <Lede className="mt-5">{c.industries.lede}</Lede>
            </div>

            <ul className="grid grid-cols-2 gap-x-6 gap-y-4 self-center">
              {c.industries.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 border-b border-hairline pb-4 text-[15px] text-chalk"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* ============================== LANGUAGES =======================
          The signature. What replaced the proof grid — the old grid claimed
          "17 systems delivered", a number nobody could check. This claim a
          visitor verifies by switching locale and watching the layout flip.

          It is the one full-colour moment on the page, and it gets the
          display face at full size: the three scripts ARE the studio's
          identity, so they are set as the identity, not as a footnote.
          Deliberately not a <Heading>: that primitive hard-codes the primary
          text colour, and this band inverts.
          ================================================================ */}
      <Section className="bg-accent">
        <Container>
          <div className="text-center">
            <h2 className="text-display-lg font-display text-white">{c.languages.heading}</h2>
            <p className="mx-auto mt-6 max-w-prose text-[17px] leading-relaxed text-white/75 sm:text-lg">
              {c.languages.body}
            </p>
          </div>
        </Container>
      </Section>

      {/* ================================= CTA ========================== */}
      <Section>
        <Container>
          <div className="ambient relative isolate overflow-hidden rounded-xl border border-hairline px-6 py-14 text-center sm:px-14 sm:py-20">
            <Heading size="md" className="mx-auto max-w-[22ch]">
              {c.cta.heading}
            </Heading>

            <Lede className="mx-auto mt-5 text-center">{c.cta.lede}</Lede>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href={`/${locale}/contact`}>{c.cta.primary}</Button>
              <Button href={`/${locale}/projects`} variant="ghost">
                {c.cta.secondary}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
