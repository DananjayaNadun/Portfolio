/**
 * First focusable element in the document.
 *
 * Implemented by moving a permanently-positioned element off-screen rather than
 * by toggling `sr-only`/`not-sr-only`. Those two utilities both set `position`
 * — `not-sr-only` resets it to `static` — so pairing `focus:not-sr-only` with
 * `focus:fixed` produces a silent conflict where the link becomes visible but
 * is no longer positioned, and lands wherever it falls in flow.
 *
 * Keeping `fixed` constant and moving only `translate` avoids the collision and
 * gives the link a proper entrance.
 *
 * Two details that are easy to get wrong:
 *  - `:focus`, not `:focus-visible`. A skip link must appear for every route
 *    into it, including programmatic and assistive-technology focus.
 *  - `transition-[translate]`, not `transition-transform`. Tailwind v4's
 *    translate utilities write the standalone `translate` property, which
 *    `transition-transform` does not cover, so the link would jump into place.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-4 left-4 z-[100] -translate-y-[200%] rounded-(--radius-md) bg-(--text-primary) px-6 py-3 text-sm font-medium text-(--surface-void) transition-[translate] duration-(--dur-base) ease-(--ease-entrance) focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}
