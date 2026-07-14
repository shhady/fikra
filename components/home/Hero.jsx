import Link from 'next/link';

import { Container, Eyebrow, Heading, Lede, Button } from '@/components/system';

/**
 * The hero.
 *
 * Its job is to catch the eye and say who FikraNova is — not to sell one product
 * and not to dump a project gallery on someone in the first three seconds.
 *
 * So: a big confident statement, a warm ambient light, and a quiet marquee of the
 * things the studio actually builds. The capability strip is the eye-catcher AND
 * the argument: you cannot read it without understanding the breadth of the work.
 *
 * @param {{ lang: string, c: object }} props
 */
export default function Hero({ lang, c }) {
  return (
    <section className="ambient grain relative isolate overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-44">
      {/* The warm source, breathing. Almost subliminal — you register that the page
          is alive without being able to say why. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 end-[-10%] -z-10 h-[38rem] w-[38rem] animate-drift rounded-full opacity-60 blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--gold) / 0.30), transparent 65%)' }}
      />

      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-rise">
            <Eyebrow>{c.hero.eyebrow}</Eyebrow>
          </div>

          <Heading
            as="h1"
            size="xl"
            className="mt-8 animate-rise [animation-delay:80ms]"
          >
            {c.hero.headingLead}{' '}
            <span className="accent-text">{c.hero.headingAccent}</span>
          </Heading>

          <Lede className="mx-auto mt-7 animate-rise text-center [animation-delay:160ms]">
            {c.hero.lede}
          </Lede>

          <div className="mt-10 flex animate-rise flex-wrap justify-center gap-3 [animation-delay:240ms]">
            <Button href={`/${lang}/contact`}>{c.hero.primary}</Button>
            <Button href={`/${lang}/projects`} variant="ghost">
              {c.hero.secondary}
            </Button>
          </div>
        </div>
      </Container>

      {/* The capability marquee.
          Everything the studio builds, moving past. It reads as texture at a
          glance and as a list if you stop — which is exactly the right amount of
          work to ask of someone in their first five seconds. */}
      <div className="relative mt-20 animate-rise [animation-delay:320ms]">
        {/* Physical left/right, not logical: the fade is symmetric, so it looks
            identical in RTL and needs no mirroring. Tailwind has no logical
            gradient direction anyway. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent sm:w-40" />

        <div className="flex overflow-hidden">
          {/* Rendered twice so the loop is seamless. aria-hidden on the copy so a
              screen reader hears the list once, not twice. */}
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
          className="whitespace-nowrap rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-sm text-steel backdrop-blur"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
