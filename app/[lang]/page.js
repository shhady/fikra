import Link from 'next/link';

import { Container, Section, Heading, Lede, Button } from '@/components/system';
import Hero from '@/components/home/Hero';
import Reveal from '@/components/home/Reveal';
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

/** "https://www.eventy.vip" → "eventy.vip" — what a person would type. */
function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
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
          A ledger, not a card grid. Six identical icon-heading-text cards is
          the pattern every generated page ships; a ruled list forces real
          hierarchy — the offering's NAME does the work, set in the display
          face, with the body reading like a commitment rather than a caption.
          ================================================================ */}
      <Section className="pt-8 sm:pt-12">
        <Container>
          <div className="max-w-2xl">
            <Heading>{c.services.heading}</Heading>
            <Lede className="mt-5">{c.services.lede}</Lede>
          </div>

          <div className="mt-14 border-b border-hairline">
            {c.services.items.map((item, i) => (
              <Reveal key={item.title} i={i % 3}>
                <div className="grid gap-2 border-t border-hairline py-7 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-10">
                  <h3 className="font-display text-xl font-semibold text-chalk sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="max-w-prose text-[15px] leading-relaxed text-steel">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 text-[15px] leading-relaxed text-steel">
            {c.services.afterLaunch}{' '}
            <Link
              href={`/${locale}/support`}
              className="text-accent underline-offset-4 hover:underline"
            >
              {c.services.afterLaunchLink}
            </Link>
          </p>
        </Container>
      </Section>

      {/* ============================ SELECTED WORK =====================
          The proof, given the space proof deserves: one project per row, its
          real domain in a browser frame, the localized description doing the
          selling, and the live link as the verification. Every URL here was
          checked to resolve; projects whose sites are down are listed on
          /projects but not featured (see lib/content/projects.js).

          No screenshots are faked and no logo wall: the cover is typographic
          — the project's own name, set large — because the honest evidence is
          the running site one click away, not a picture of it.
          ================================================================ */}
      <Section className="border-y border-hairline bg-surface/50 py-24 sm:py-32">
        <Container>
          <div className="max-w-2xl">
            <Heading>{c.work.heading}</Heading>
            <Lede className="mt-5">{c.work.lede}</Lede>
          </div>

          <div className="mt-16 space-y-16 sm:space-y-20">
            {featured.map((project, i) => (
              <Reveal key={project.id}>
                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  {/* The browser frame — a real domain behind real chrome. */}
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} — ${c.work.visit}`}
                    className={`lifted group block overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
                      i % 2 ? 'lg:order-2' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 border-b border-hairline bg-surface-2/60 px-4 py-2.5" dir="ltr">
                      <span className="flex gap-1.5" aria-hidden="true">
                        <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
                        <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
                        <span className="h-2.5 w-2.5 rounded-full bg-hairline" />
                      </span>
                      <span className="rounded-md bg-ink px-3 py-1 font-mono text-xs text-steel">
                        {domainOf(project.url)}
                      </span>
                    </div>

                    <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-b from-surface to-surface-2/40 px-8">
                      <span className="break-words text-center font-display text-3xl font-semibold tracking-tight text-chalk transition-colors duration-300 group-hover:text-accent sm:text-4xl">
                        {project.title}
                      </span>
                    </div>
                  </a>

                  <div className={i % 2 ? 'lg:order-1' : ''}>
                    <p className="text-sm font-medium text-accent">{project.industry}</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-chalk sm:text-3xl">
                      {project.title}
                    </h3>
                    <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-steel">
                      {project.description}
                    </p>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-accent underline-offset-4 hover:underline"
                    >
                      {c.work.visit}
                      <span aria-hidden="true" className="rtl:-scale-x-100">
                        ↗
                      </span>
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-16">
            <Button href={`/${locale}/projects`} variant="ghost">
              {c.work.cta}
            </Button>
          </div>
        </Container>
      </Section>

      {/* ============================== LANGUAGES =======================
          The signature. The one full-colour moment on the page: the three
          scripts ARE the studio's identity, so they are set as the identity,
          not as a footnote. The claim is also the page's only self-verifying
          one — switch locale and watch the layout flip.
          ================================================================ */}
      <Section className="bg-accent py-20 sm:py-24">
        <Container>
          <div className="text-center">
            <h2 className="text-display-lg font-display text-white">{c.languages.heading}</h2>
            <p className="mx-auto mt-6 max-w-prose text-[17px] leading-relaxed text-white/75 sm:text-lg">
              {c.languages.body}
            </p>
          </div>
        </Container>
      </Section>

      {/* ============================== INDUSTRIES ======================
          Quiet on purpose, after the colour. minmax(0,…) columns and a
          wrapping list: nothing here is allowed to be wider than the
          viewport — the earlier inline-flow version created a horizontal
          scrollbar, which is a design failure, not a quirk.
          ================================================================ */}
      <Section className="py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
            <div>
              <Heading size="md">{c.industries.heading}</Heading>
              <Lede className="mt-5">{c.industries.lede}</Lede>
            </div>

            <ul className="grid grid-cols-2 content-center gap-x-8 gap-y-3.5 self-center">
              {c.industries.items.map((item) => (
                <li key={item} className="flex min-w-0 items-baseline gap-2.5 text-[15px] text-chalk sm:text-base">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full bg-accent"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* ================================= CTA ==========================
          The close inverts to ink — the page's only dark surface, book-ending
          the ultramarine band above. `bg-chalk`/`text-ink` is the documented
          role inversion (see the naming note in globals.css).
          ================================================================ */}
      <section className="bg-chalk py-24 sm:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-display-md font-display text-balance text-ink">{c.cta.heading}</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-ink/70 sm:text-lg">{c.cta.lede}</p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href={`/${locale}/contact`}>{c.cta.primary}</Button>
              <Link
                href={`/${locale}/projects`}
                className="inline-flex items-center justify-center rounded-full border border-ink/25 px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:border-ink/60"
              >
                {c.cta.secondary}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
