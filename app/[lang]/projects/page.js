import Image from 'next/image';
import Link from 'next/link';

import { Container, Section, PageHero, CtaBand } from '@/components/system';
import { getProjects } from '@/lib/content/projects';
import { getDictionary, normaliseLocale, alternatesFor } from '@/lib/i18n';

const COPY = {
  en: {
    eyebrow: 'The work',
    title: 'Systems we built, launched, and still run',
    lede: 'The launched ones are live — click through and use them. The newest is ours and still in the workshop; you can read exactly what it does.',
    visit: 'Visit site',
    caseStudy: 'Read the case study',
    inDevelopment: 'In development',
  },
  ar: {
    eyebrow: 'أعمالنا',
    title: 'أنظمة بنيناها، أطلقناها، وما زلنا نشغّلها',
    lede: 'المُطلَق منها يعمل الآن — ادخل واستخدمه. وأحدثها منتجنا نحن وما زال في الورشة؛ يمكنك قراءة ما يفعله بالضبط.',
    visit: 'زيارة الموقع',
    caseStudy: 'اقرأ دراسة الحالة',
    inDevelopment: 'قيد التطوير',
  },
  he: {
    eyebrow: 'העבודות',
    title: 'מערכות שבנינו, השקנו, ועדיין מפעילים',
    lede: 'מה שהושק — חי באוויר; היכנסו והשתמשו. החדשה שבהן שלנו ועדיין בסדנה; אפשר לקרוא בדיוק מה היא עושה.',
    visit: 'לאתר',
    caseStudy: 'לקרוא את סיפור המוצר',
    inDevelopment: 'בפיתוח',
  },
};

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const c = COPY[locale];

  return {
    title: c.title,
    description: c.lede,
    alternates: alternatesFor('/projects', locale),
  };
}

/** The card body shared by both link types. */
function CardBody({ project, footer }) {
  return (
    <div className="flex flex-1 flex-col p-6">
      <p className="text-xs text-gold">{project.industry}</p>

      <h2 className="mt-2 text-xl font-semibold text-chalk">{project.title}</h2>

      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-steel">{project.description}</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-hairline px-3 py-1 text-xs text-slate">
            {tag}
          </span>
        ))}

        <span className="ms-auto text-sm text-steel transition-colors group-hover:text-gold">
          {footer} →
        </span>
      </div>
    </div>
  );
}

export default async function ProjectsPage({ params }) {
  const { lang } = await params;
  const locale = normaliseLocale(lang);
  const t = await getDictionary(locale);
  const c = COPY[locale];

  const projects = getProjects(locale);

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} lede={c.lede} />

      <Section>
        <Container>
          <div className="grid gap-5 sm:grid-cols-2">
            {projects.map((project, index) =>
              project.url ? (
                /* ---------------- live project → external link ---------- */
                <a
                  key={project.id}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group flex flex-col overflow-hidden !p-0"
                >
                  {/* These files are LOGOS, not product screenshots. Some have
                      a white background baked in while others are transparent.
                      Framing them as logos — contained, padded, on one neutral
                      surface — makes the inconsistency read as intentional. */}
                  <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-hairline bg-surface-2 p-10">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      // Only the first two are above the fold. Eagerly loading
                      // all of them is the most common cause of a bad LCP on a
                      // grid like this.
                      priority={index < 2}
                      className="object-contain p-8 transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>

                  <CardBody project={project} footer={c.visit} />
                </a>
              ) : (
                /* ---------- unlaunched product → internal case study ----- */
                <Link
                  key={project.id}
                  href={`/${locale}/projects/${project.slug}`}
                  className="card group flex flex-col overflow-hidden !p-0"
                >
                  {/* No live site yet, so no logo pretending to be one: a
                      typographic cover plus an unmissable status badge. */}
                  <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-hairline bg-gradient-to-b from-surface to-surface-2/60 px-8">
                    <span className="absolute start-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
                      {c.inDevelopment}
                    </span>
                    <span className="break-words text-center font-display text-3xl font-semibold tracking-tight text-chalk transition-colors duration-300 group-hover:text-accent">
                      {project.title}
                    </span>
                  </div>

                  <CardBody project={project} footer={c.caseStudy} />
                </Link>
              )
            )}
          </div>
        </Container>
      </Section>

      <CtaBand
        lang={locale}
        heading={t.home.cta.title}
        lede={t.home.cta.subtitle}
        primary={t.home.cta.startNow}
      />
    </>
  );
}
