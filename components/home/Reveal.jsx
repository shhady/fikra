'use client';

import { useEffect, useRef } from 'react';

/**
 * Scroll-in reveal for LIST ITEMS (project rows, ledger rows) — not for whole
 * sections; a fade on every section is the saturated default this site avoids.
 *
 * The animated state only exists under `@media (scripting: enabled)` (see
 * globals.css), so content is visible-by-default for crawlers, no-JS readers
 * and reduced-motion users. This component only ever ADDS the `.in` class —
 * it never hides anything.
 *
 * @param {{ children: React.ReactNode, className?: string, i?: number }} props
 *   `i` staggers siblings: transition-delay = i × 80ms.
 */
export default function Reveal({ children, className = '', i = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in');
          io.disconnect();
        }
      },
      // Fire slightly before the element fully enters, so the motion reads as
      // the page responding to the reader, not lagging behind them.
      { rootMargin: '0px 0px -8% 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ '--i': i }}>
      {children}
    </div>
  );
}
