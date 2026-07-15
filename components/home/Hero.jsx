import { Container, Heading, Lede, Button } from '@/components/system';

/**
 * The hero.
 *
 * A thesis, not a slogan: the left column SAYS what the studio does, the right
 * column SHOWS it — three small pieces of product UI, one per script. An order
 * ticket in Arabic, an RSVP confirmation in Hebrew, a dashboard row in English.
 * That is the studio's actual world; no stock illustration could say it as
 * precisely. The vignettes are decorative (aria-hidden) and use invented,
 * generic data — they are furniture, not claims.
 *
 * Motion budget: this entrance choreography is the page's ONE orchestrated
 * moment. Everything below reveals quietly or not at all.
 *
 * @param {{ lang: string, c: object }} props
 */
export default function Hero({ lang, c }) {
  return (
    <section className="ambient grain relative isolate overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          {/* ------------------------------- the thesis ------------------- */}
          <div>
            <p className="animate-rise text-[15px] text-steel">{c.hero.eyebrow}</p>

            <Heading as="h1" size="xl" className="mt-5 animate-rise [animation-delay:80ms]">
              {c.hero.headingLead}{' '}
              <span className="accent-text">{c.hero.headingAccent}</span>
            </Heading>

            <Lede className="mt-6 animate-rise [animation-delay:160ms]">{c.hero.lede}</Lede>

            <div className="mt-9 flex animate-rise flex-wrap gap-3 [animation-delay:240ms]">
              <Button href={`/${lang}/contact`}>{c.hero.primary}</Button>
              <Button href={`/${lang}/projects`} variant="ghost">
                {c.hero.secondary}
              </Button>
            </div>
          </div>

          {/* ------------------------------ the evidence ------------------
              Hidden below lg: on a phone the artifacts would push the CTA
              under the fold, and the capability marquee already carries the
              breadth argument there. */}
          <div aria-hidden="true" className="relative hidden h-[26rem] lg:block">
            {/* Arabic — an order ticket */}
            <div
              dir="rtl"
              className="lifted absolute end-0 top-0 w-72 rotate-1 p-5 animate-rise [animation-delay:200ms]"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-chalk">طلب جديد</p>
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  قيد التحضير
                </span>
              </div>
              <p className="mt-3 text-sm text-steel">طاولة ٤ · مشاوي مشكّلة ×٢</p>
              <p className="mt-1 text-sm text-steel">بدون بصل · خبز إضافي</p>
              <div className="mt-4 border-t border-hairline pt-3 text-xs text-slate">
                وصل قبل دقيقتين · المطبخ
              </div>
            </div>

            {/* Hebrew — an RSVP confirmation */}
            <div
              dir="rtl"
              className="lifted absolute start-0 top-32 w-72 -rotate-1 p-5 animate-rise [animation-delay:320ms]"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-chalk">אישורי הגעה</p>
                <span className="text-xs text-slate">וואטסאפ</span>
              </div>
              <p className="mt-3 text-sm text-steel">החתונה של מאיה ויוסי</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full w-3/4 rounded-full bg-accent" />
                </div>
                <span className="text-xs font-medium text-chalk">128 / 170</span>
              </div>
            </div>

            {/* English — a dashboard row */}
            <div className="lifted absolute bottom-0 end-10 w-64 rotate-[0.5deg] p-5 animate-rise [animation-delay:440ms]">
              <p className="font-display text-sm font-semibold text-chalk">Orders today</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-display text-3xl font-semibold tracking-tight text-chalk">
                  142
                </p>
                <div className="flex items-end gap-1">
                  <div className="h-3 w-1.5 rounded-sm bg-surface-2" />
                  <div className="h-5 w-1.5 rounded-sm bg-surface-2" />
                  <div className="h-4 w-1.5 rounded-sm bg-accent/40" />
                  <div className="h-7 w-1.5 rounded-sm bg-accent" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate">Printed to kitchen · 0 failed</p>
            </div>
          </div>
        </div>
      </Container>

      {/* The capability marquee.
          Everything the studio builds, moving past. It reads as texture at a
          glance and as a list if you stop — which is exactly the right amount
          of work to ask of someone in their first five seconds. */}
      <div className="relative mt-16 animate-rise [animation-delay:400ms]">
        {/* Physical left/right, not logical: the fade is symmetric, so it looks
            identical in RTL and needs no mirroring. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent sm:w-40" />

        <div className="flex overflow-hidden">
          {/* Rendered twice so the loop is seamless. aria-hidden on the copy so
              a screen reader hears the list once, not twice. */}
          <Marquee items={c.hero.capabilities} />
          <Marquee items={c.hero.capabilities} duplicate />
        </div>
      </div>
    </section>
  );
}

function Marquee({ items, duplicate = false }) {
  return (
    <ul
      className="flex shrink-0 animate-marquee items-center gap-3 pe-3"
      aria-hidden={duplicate ? 'true' : undefined}
    >
      {items.map((item) => (
        <li
          key={item}
          className="whitespace-nowrap rounded-full border border-hairline bg-surface/70 px-5 py-2.5 text-sm text-steel"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
