'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// The 3D scene ships ~150KB of three.js — loaded only when it will actually
// render (desktop widths), never server-side.
const HeroBot = dynamic(() => import('./HeroBot'), { ssr: false });

/**
 * Mount gate for the hero's 3D object.
 *
 * The parent hides the hero's visual column below lg with CSS, but CSS-hidden
 * React still executes — a phone would parse and run the whole three.js bundle
 * for a canvas nobody sees. So the gate is JS: the scene only mounts when the
 * viewport is actually lg+. Reduced-motion stills the animation, not the
 * object.
 */
export default function Hero3D() {
  const [mount, setMount] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const lg = window.matchMedia('(min-width: 1024px)');
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => {
      setMount(lg.matches);
      setStill(rm.matches);
    };

    update();
    lg.addEventListener('change', update);
    rm.addEventListener('change', update);
    return () => {
      lg.removeEventListener('change', update);
      rm.removeEventListener('change', update);
    };
  }, []);

  if (!mount) return null;

  return <HeroBot still={still} />;
}
