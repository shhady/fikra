'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

/**
 * The error screen.
 *
 * Was hardcoded Arabic ("حدث خطأ ما" / "حاول مرة أخرى") for every language.
 *
 * Unlike not-found, an error boundary DOES sit inside the [lang] segment, so it
 * can read the locale from the route and speak the reader's language.
 *
 * Errors do not apologise and they are never vague about what to do next. There
 * is exactly one action here, and it is the one that usually works.
 */
const COPY = {
  en: { title: 'Something went wrong on our side.', action: 'Try again' },
  ar: { title: 'حدث خطأ لدينا.', action: 'حاول مرة أخرى' },
  he: { title: 'משהו השתבש אצלנו.', action: 'נסו שוב' },
};

export default function Error({ error, reset }) {
  const params = useParams();
  const lang = ['en', 'ar', 'he'].includes(params?.lang) ? params.lang : 'ar';
  const copy = COPY[lang];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-md">
        <p className="eyebrow !text-steel">Error</p>

        <p className="mt-6 text-2xl font-semibold text-chalk">{copy.title}</p>

        <div className="perf my-8" />

        <button
          type="button"
          onClick={reset}
          className="rounded bg-chalk px-5 py-3 font-mono text-[13px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-white"
        >
          {copy.action}
        </button>
      </div>
    </div>
  );
}
