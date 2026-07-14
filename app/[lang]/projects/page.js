import Image from 'next/image';

import { Container, Section, PageHero, CtaBand } from '@/components/system';
import { getProjects } from '@/lib/content/projects';
import { getDictionary, normaliseLocale, alternatesFor } from '@/lib/i18n';

const COPY = {
  en: {
    eyebrow: 'The work',
    title: 'Systems we built, launched, and still run',
    lede: 'Every one of these is live. Click through and use it — that is the point of showing them.',
    visit: 'Visit site',
  },
  ar: {
    eyebrow: 'أعمالنا',
    title: 'أنظمة بنيناها، أطلقناها، وما زلنا نشغّلها',
    lede: 'كل واحد من هذه المشاريع يعمل الآن. ادخل واستخدمه — لهذا نعرضها.',
    visit: 'زيارة الموقع',
  },
  he: {
    eyebrow: 'העבודות',
    title: 'מערכות שבנינו, השקנו, ועדיין מפעילים',
    lede: 'כל אחת מהן חיה באוויר. היכנסו והשתמשו — בשביל זה אנחנו מציגים אותן.',
    visit: 'לאתר',
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
            {projects.map((project, index) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex flex-col overflow-hidden !p-0"
              >
                {/* These files are LOGOS, not product screenshots — and some have a
                    white background baked in (eventy.jpg) while others are dark
                    (keysmatch.png). Cropping them like screenshots looks broken.
                    Framing them as logos — contained, padded, on one neutral
                    surface — makes the inconsistency read as intentional.

                    The real fix is content, not code: a screenshot of each live
                    site would sell the work far better than its logo does. */}
                <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-hairline bg-surface-2 p-10">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    // Only the first two are above the fold. Eagerly loading all
                    // eight is the most common cause of a bad Largest Contentful
                    // Paint on a grid like this.
                    priority={index < 2}
                    className="object-contain p-8 transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs text-gold">{project.industry}</p>

                  <h2 className="mt-2 text-xl font-semibold text-chalk">{project.title}</h2>

                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-steel">
                    {project.description}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-hairline px-3 py-1 text-xs text-slate"
                      >
                        {tag}
                      </span>
                    ))}

                    <span className="ms-auto text-sm text-steel transition-colors group-hover:text-gold">
                      {c.visit} →
                    </span>
                  </div>
                </div>
              </a>
            ))}
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
