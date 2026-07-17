import { Container, Heading, Lede, Button } from '@/components/system';
import Hero3D from '@/components/home/Hero3D';

/**
 * The hero.
 *
 * A thesis, not a slogan: the left column SAYS what the studio does, the right
 * column embodies it — a small hovering robot (the AI thread that runs through
 * everything the studio sells) built from the site's own design tokens. It
 * bobs, blinks on an irregular clock, and watches the pointer.
 *
 * Motion budget: this entrance plus the bot's idle is the page's ONE
 * orchestrated moment. Everything below reveals quietly or not at all.
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

          {/* ------------------------------ the object --------------------
              The bot. Decorative (aria-hidden), desktop-only (the component
              gates itself on lg and never ships three.js to phones), still
              under reduced motion. */}
          <div
            aria-hidden="true"
            className="relative hidden h-[26rem] animate-rise [animation-delay:240ms] lg:block"
          >
            <Hero3D />
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
