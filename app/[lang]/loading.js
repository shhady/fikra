/**
 * The shared loading screen for every locale.
 *
 * It used to say "جاري التحميل..." — hardcoded Arabic, shown to English and
 * Hebrew visitors too. The first thing a prospect saw on the English site was a
 * language they may not read.
 *
 * The fix is to say nothing at all. A loading state does not need a word: motion
 * is understood in every language, and it cannot be wrong in any of them. The
 * only text is the screen-reader label.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center" role="status">
      <span className="sr-only">Loading</span>

      {/* A print head, tracking across the paper. The loading state belongs to the
          same world as the hero. */}
      <span className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-7 animate-pulse bg-steel"
            style={{ animationDelay: `${i * 140}ms`, animationDuration: '900ms' }}
          />
        ))}
      </span>
    </div>
  );
}
