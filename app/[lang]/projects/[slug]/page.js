import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Container, Section, Heading, Lede, Button } from '@/components/system';
import { CASE_STUDIES, getCaseStudy } from '@/lib/content/caseStudies';
import { normaliseLocale, alternatesFor } from '@/lib/i18n';

/**
 * Internal case-study page — the destination for projects that have a `slug`
 * instead of a live `url` (see the link contract in lib/content/projects.js).
 *
 * Design notes: the step numbers below are NOT decorative scaffolding — the
 * flow is a genuine sequence (you cannot run the day before drawing the space),
 * which is the one case numbering earns. The "in development" badge is a status,
 * stated in the first viewport, not buried under the fold.
 */

export function generateStaticParams() {
  return Object.keys(CASE_STUDIES).map((slug) => ({ slug }));
}

// The set of case studies is closed at build time, so an unknown slug must
// 404 BEFORE rendering starts. Relying on notFound() inside the page body is
// not enough: the [lang] layout streams first, the 200 status is already
// committed, and the visitor gets a soft-404 (not-found UI over HTTP 200) —
// which search engines index.
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const locale = normaliseLocale(lang);
  const c = getCaseStudy(slug, locale);
  if (!c) notFound();

  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: alternatesFor(`/projects/${slug}`, locale),
    openGraph: { title: c.meta.title, description: c.meta.description },
  };
}

export default async function CaseStudyPage({ params }) {
  const { lang, slug } = await params;
  const locale = normaliseLocale(lang);
  const c = getCaseStudy(slug, locale);

  if (!c) notFound();

  return (
    <>
      {/* ------------------------------- header ------------------------- */}
      <section className="ambient grain relative isolate overflow-hidden border-b border-hairline pb-16 pt-32 sm:pb-20 sm:pt-40">
        <Container>
          <div className="max-w-3xl">
            <p className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                href={`/${locale}/projects`}
                className="text-steel underline-offset-4 hover:text-chalk hover:underline"
              >
                {c.backToProjects}
              </Link>
              <span aria-hidden="true" className="text-slate">
                /
              </span>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
                {c.badge}
              </span>
            </p>

            <Heading as="h1" size="xl" className="mt-6">
              {c.title}
            </Heading>

            <Lede className="mt-6">{c.lede}</Lede>
          </div>
        </Container>
      </section>

      {/* ------------------------------ overview ------------------------ */}
      <Section className="py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
            <Heading size="md">{c.overviewHeading}</Heading>
            <p className="max-w-prose text-[17px] leading-relaxed text-steel">{c.overviewBody}</p>
          </div>
        </Container>
      </Section>

      {/* ------------------------------ the flow ------------------------
          A real sequence, so the numbers carry information: order matters. */}
      <Section className="border-y border-hairline bg-surface/50 py-20 sm:py-24">
        <Container>
          <Heading size="md">{c.flowHeading}</Heading>

          <ol className="mt-12 max-w-3xl space-y-0">
            {c.steps.map((step, i) => (
              <li
                key={step.title}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 border-t border-hairline py-6 first:border-t-0 sm:gap-8"
              >
                <span
                  aria-hidden="true"
                  className="font-display text-2xl font-semibold tabular-nums text-accent"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-chalk">{step.title}</h3>
                  <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-steel">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ------------------------------ modules ------------------------- */}
      <Section className="py-20 sm:py-24">
        <Container>
          <Heading size="md">{c.modulesHeading}</Heading>

          <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
            {c.modules.map((module) => (
              <div key={module.name} className="border-t-2 border-accent pt-5">
                <h3 className="font-display text-xl font-semibold text-chalk">{module.name}</h3>
                <p className="mt-2 text-sm text-slate">{module.blurb}</p>

                <ul className="mt-5 space-y-3">
                  {module.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex min-w-0 items-baseline gap-2.5 text-[15px] leading-relaxed text-steel"
                    >
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full bg-accent"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------- status + CTA ------------------- */}
      <section className="bg-chalk py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[17px] leading-relaxed text-ink/80 sm:text-lg">{c.statusNote}</p>
            <div className="mt-8">
              <Button href={`/${locale}/contact`}>{c.ctaPrimary}</Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
