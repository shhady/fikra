import Link from 'next/link';

/**
 * Layout primitives.
 *
 * Before this, every page re-implemented its own hero and CTA by copy-paste, and
 * handled RTL with `isRTL ? 'text-right' : 'text-left'` ternaries scattered
 * through the markup. Everything here uses LOGICAL properties, so one rule works
 * in English, Arabic and Hebrew — direction is the browser's job.
 */

export function Container({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

export function Section({ children, className = '', id }) {
  return (
    <section id={id} className={`py-20 sm:py-28 ${className}`}>
      {children}
    </section>
  );
}

/** A pill. Quiet, glassy — sets the register before the headline lands. */
export function Eyebrow({ children, dot = true }) {
  return (
    <p className="eyebrow">
      {dot ? (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
      ) : null}
      {children}
    </p>
  );
}

export function Heading({ children, as: Tag = 'h2', size = 'lg', className = '' }) {
  const scale = { xl: 'text-display-xl', lg: 'text-display-lg', md: 'text-display-md' }[size];

  return (
    <Tag className={`${scale} font-display text-balance text-chalk ${className}`}>{children}</Tag>
  );
}

export function Lede({ children, className = '' }) {
  return (
    <p className={`max-w-prose text-[17px] leading-relaxed text-steel sm:text-lg ${className}`}>
      {children}
    </p>
  );
}

/**
 * @param {{href: string, children: React.ReactNode, variant?: 'primary'|'ghost', className?: string}} props
 */
export function Button({ href, children, variant = 'primary', className = '' }) {
  const styles =
    variant === 'primary'
      ? 'bg-accent text-white hover:bg-accent-soft'
      : 'border border-hairline bg-surface/60 text-chalk hover:border-accent/50 hover:bg-surface';

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium transition-all duration-200 ${styles} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`card p-6 sm:p-7 ${className}`}>{children}</div>;
}

/**
 * The page header.
 *
 * Every inner page used to copy-paste its own: `py-20` + a blue→purple gradient +
 * a /grid.svg overlay. Six near-identical blocks that drifted apart over time.
 * One component now, so a change lands everywhere.
 */
export function PageHero({ eyebrow, title, lede }) {
  return (
    <section className="ambient grain relative isolate overflow-hidden border-b border-hairline pb-16 pt-32 sm:pb-20 sm:pt-40">
      <Container>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}

        <Heading as="h1" size="xl" className={eyebrow ? 'mt-6' : ''}>
          {title}
        </Heading>

        {lede ? <Lede className="mt-5">{lede}</Lede> : null}
      </Container>
    </section>
  );
}

/**
 * A CTA band. Also used to be copy-pasted per page.
 */
export function CtaBand({ lang, heading, lede, primary, secondary }) {
  return (
    <Section>
      <Container>
        <div className="ambient relative isolate overflow-hidden rounded-xl border border-hairline px-6 py-14 text-center sm:px-14 sm:py-16">
          <Heading size="md" className="mx-auto max-w-[24ch]">
            {heading}
          </Heading>

          {lede ? <Lede className="mx-auto mt-4 text-center">{lede}</Lede> : null}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={`/${lang}/contact`}>{primary}</Button>
            {secondary ? (
              <Button href={`/${lang}/projects`} variant="ghost">
                {secondary}
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
