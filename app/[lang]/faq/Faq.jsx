'use client';

import { useState } from 'react';

/**
 * FAQ.
 *
 * The old version showed one category at a time behind tab pills, so the page
 * loaded showing 3 of the 9 questions and the other 6 looked like they did not
 * exist. It was reported to us as "the FAQ only has three questions" — which is
 * exactly how a hidden-by-default interface reads to someone who is not looking
 * for a tab.
 *
 * Now every category and every question is on the page. Answers collapse, headings
 * do not. A FAQ page has one job: let someone find their question. Hiding two
 * thirds of them behind a control they did not notice defeats it.
 *
 * @param {{ categories: Array<{title: string, questions: Array<{question: string, answer: string}>}> }} props
 */
export default function Faq({ categories }) {
  // `${categoryIndex}-${questionIndex}` of whatever is open. One at a time.
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-16">
      {categories.map((category, ci) => (
        <section key={category.title}>
          <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-gold">
            {category.title}
          </h2>

          <div className="mt-6 divide-y divide-hairline border-y border-hairline">
            {category.questions.map((item, qi) => {
              const id = `${ci}-${qi}`;
              const isOpen = open === id;

              return (
                <div key={item.question}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : id)}
                      aria-expanded={isOpen}
                      aria-controls={`answer-${id}`}
                      className="flex w-full items-center justify-between gap-6 py-5 text-start text-[17px] font-medium text-chalk transition-colors hover:text-gold"
                    >
                      {item.question}

                      <span
                        className={`shrink-0 text-steel transition-transform duration-200 ${
                          isOpen ? 'rotate-45' : ''
                        }`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>
                  </h3>

                  {/* Kept in the DOM, height-collapsed. A crawler reads the answer
                      even when it is closed, which is the whole point of an FAQ
                      page from Google's side. */}
                  <div
                    id={`answer-${id}`}
                    hidden={!isOpen}
                    className="pb-6 pe-10 text-[16px] leading-relaxed text-steel"
                  >
                    {item.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
