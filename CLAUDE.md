# CLAUDE.md

Working rules for this repository. These are not suggestions — several are enforced by lint or CI, and the rest are the reason the site holds its performance and accessibility budgets.

**Design documents are the source of truth.** Read before changing anything in their domain:

| Document | Governs |
| --- | --- |
| [`docs/01-PRD.md`](docs/01-PRD.md) | Goals, audience, IA, content hierarchy, budgets |
| [`docs/02-DESIGN-SYSTEM.md`](docs/02-DESIGN-SYSTEM.md) | Colour, type, spacing, components, states |
| [`docs/03-MOTION-SYSTEM.md`](docs/03-MOTION-SYSTEM.md) | Every animation, its budget, its fallback |
| [`docs/04-ARCHITECTURE.md`](docs/04-ARCHITECTURE.md) | Structure, data flow, rendering strategy |

If a change contradicts a document, update the document in the same PR or don't make the change.

---

## The three rules that matter most

1. **Server Components by default.** `'use client'` only at animation leaves. Content belongs in the HTML.
2. **Scroll state never enters React state.** It lives in the ticker (`lib/motion/ticker.ts`) and writes straight to the DOM.
3. **The hero LCP element is the poster `<img>`, not the canvas.** Never make the canvas the LCP element.

---

## Folder conventions

```
app/          Routes, metadata, sitemap, OG generation. Thin — composition only.
components/   layout/ ui/ motion/ hero/ sections/
content/      Facts. The only place a name, date, or project detail is written.
lib/          Logic with no JSX. content/ motion/ hero/ seo/ utils/
hooks/        One hook per file, named after the hook.
styles/       globals.css owns tokens, reset, focus, reduced-motion.
public/       Static assets. hero/ is generated — never hand-edit.
scripts/      Build tooling. Committed, not ad hoc.
tests/        unit/ (Vitest) e2e/ (Playwright)
```

- **Never import from `content/` in a component.** Import from `lib/content`. That indirection is the CMS-migration story.
- **Everything in `components/motion/` is `'use client'`.** Almost nothing else is.
- **`public/hero/` is generated** by `scripts/encode-hero.mjs`. Re-run the script; don't edit output.

## Naming conventions

| Thing | Convention | Example |
| --- | --- | --- |
| Component file | `PascalCase.tsx` | `ProjectCard.tsx` |
| Everything else | `kebab-case.ts` | `sequence-controller.ts` |
| Hook | `useThing.ts`, default-exports `useThing` | `useRevealOnce.ts` |
| Type / interface | `PascalCase`, no `I` prefix | `SequenceState` |
| Constant | `SCREAMING_SNAKE` | `FRAME_COUNT` |
| CSS custom property | `--kebab-case` | `--ink-raised` |
| Boolean | `is` / `has` / `should` prefix | `isDecoding` |
| Event handler | `handleX` local, `onX` as prop | `handleSubmit` / `onSubmit` |

Name by role, not by implementation: `Trajectory`, not `TimelineList`.

## Coding conventions

- TypeScript `strict`, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- **No `any`. No non-null `!`.** Narrow properly. `unknown` + a type guard where genuinely unknown.
- Named exports everywhere except Next.js files that require a default.
- Props typed inline as `{ ... }`; no `React.FC`.
- Derive state; don't sync it. No `useEffect` that mirrors one state into another.
- `useEffect` only for genuine external synchronisation (subscriptions, observers, controllers). Every one returns a cleanup.
- Comments explain **why**. The code already says what. Comment the non-obvious constraint — the CSP behaviour, the memory budget, the reason a property isn't animated.
- Small files. A component over ~150 lines is usually two components.

---

## Styling rules

- **Tokens only.** No literal colours, spacing, durations, or radii in component code. `var(--ink-raised)`, never `#141011`. A raw hex in a `.tsx` fails lint.
- Use **semantic** tokens (`--surface-raised`), not ramp tokens (`--ink-raised`), in components.
- Spacing comes from the 8px scale. No arbitrary values like `mt-[13px]`.
- Layout with flex/grid + `gap`. Not sibling margins.
- Fluid type uses `clamp()` with a **`rem` term in the preferred value** — `clamp(2rem, 1.5rem + 2vw, 3rem)`. A pure-`vw` middle value ignores browser zoom and fails WCAG 1.4.4.
- Wide content (tables, code, diagrams) scrolls inside its own `overflow-x: auto`. The body never scrolls sideways.
- `backdrop-filter` is permitted on **two** surfaces: the nav pill and dialogs. Nowhere else.

---

## Animation rules

Every one of these has a measured reason in `docs/03-MOTION-SYSTEM.md`.

- **Animate `transform` and `opacity`. Nothing else.**
- **Never animate:** `width`, `height`, `top`, `left`, `margin`, `padding`, `box-shadow`, `background-color`, `filter`, `clip-path`, `border-width`, or anything carrying `backdrop-filter`.
  - Need a glow? Fade a pseudo-element's opacity.
  - Need a wipe? `transform` a child inside `overflow: hidden` — not `clip-path`.
  - Need a growing spine? `scaleY()` — not `height`.
- **One rAF loop.** Subscribe to `lib/motion/ticker.ts`. Never write your own `requestAnimationFrame`.
- **Never call `getBoundingClientRect()` in the write phase.** Cache it; refresh on `ResizeObserver`.
- **All scroll-bound lerps use `damp()`** from `lib/motion/damp.ts`. Never hand-roll `x += (t - x) * k` — it is frame-rate dependent and behaves differently at 120 Hz.
- **`will-change` is added on animation start and removed on end.** Never static in a stylesheet.
- **Reveal once, then unobserve.** Never re-animate on scroll-up.
- **If an element is already visible when its observer registers, render final-state with no transition.** Deep links must never land mid-animation.
- Travel distances stay small: 18px rise, 2px lift, 4px shift. Large travel reads as a template.
- Stagger 60ms, capped at 320ms total per group.
- **No scroll-jacking. No particles. No custom cursor. No text splitting. No animated counters.** All four were considered and declined with reasons.
- Every animation with an async dependency needs a **failure state and a timeout**. A loader that can hang forever is worse than a crash.

---

## Accessibility rules

Non-negotiable. Lighthouse 100 is the floor, not the goal.

- Semantic HTML first. `<button>` for actions, `<a>` for navigation. Never a `<div>` with `onClick`.
- One `<h1>`. No skipped heading levels.
- **`outline: none` without a designed replacement fails lint.** The focus system lives in `globals.css`.
- `:focus-visible`, never bare `:focus`.
- Every interactive element is keyboard-reachable and operable, in an order matching the visual one.
- Icon-only controls require `aria-label` — enforced as a required prop on `IconButton`.
- Form fields get persistent visible labels. **Placeholder-as-label is banned** (WCAG 3.3.2).
- Errors carry an icon **and** text, never colour alone, wired with `aria-describedby` + `aria-invalid`.
- Touch targets ≥ 44 × 44 px. Give a link padding, not the list a gap — row
  spacing is what leaves text links 19px tall. The one exception is WCAG 2.2's:
  a link **inside a sentence**, whose height is constrained by the line-height
  of the text around it. Forcing 44px there breaks the paragraph, and such a
  link is always a repeat of a full-size target elsewhere. Never use it as an
  excuse for a standalone control.
- Body text ≥ 7:1 (AAA). Never use `crimson-500` for small text — it measures 4.15:1. Use `crimson-200`/`300`.
- Decorative motion is `aria-hidden`. The hero canvas has a text alternative.
- **Reduced motion is a design variant, not a kill switch.** It must look finished.
- Usable at 400% zoom / 320px width with no horizontal scroll.
- Nothing requires hover to be usable.

---

## Performance requirements

Budgets from `docs/01-PRD.md` §12. CI fails on regression.

| Metric | Budget |
| --- | --- |
| LCP (mobile 4G) | ≤ 2.5 s |
| CLS | ≤ 0.02, target 0.00 |
| INP | ≤ 200 ms |
| Route JS, gzipped | ≤ 120 KB |
| Fonts | ≤ 3 files, ≤ 90 KB |
| Sustained scroll FPS | ≥ 58 |
| Forced synchronous layouts / frame | **0** |
| Compositor layers, steady state | ≤ 12 |
| Hero decode memory | ≤ 250 MB desktop |

- Content sections ship **zero** client JS.
- Every media box reserves space before load.
- Hero frame count is a **memory** budget: `width × height × 4` bytes are pinned per `ImageBitmap`.
- Decode base64 with `atob` → `Blob`. **Never `fetch('data:...')`** — data URIs fall under CSP `connect-src` and are blocked wherever a policy exists. This shipped as a real bug once.
- No blocking third-party scripts. Analytics loads post-interactive.

---

## Content rules

- Every project states an **outcome**, in language a non-engineer understands. Numbers where they're true.
- No skill percentages. Group by depth: Daily / Production / Familiar.
- No section over ~120 words of body copy.
- Link text is descriptive — never "click here" or a bare arrow.
- Dates in `<time datetime>`. Tabular numerals wherever digits align.

---

## Git workflow

> This directory is **not yet a git repository**. Run `git init` before the first commit.

- `main` is always deployable and auto-deploys production.
- Branch per unit of work: `feat/hero-sequence`, `fix/focus-ring-contrast`, `docs/motion-system`.
- Never commit directly to `main`. PRs run typecheck, lint, unit tests, contrast check, `size-limit`, and Lighthouse CI.
- Rebase to keep history linear. Squash-merge PRs.
- Never commit: `.env*`, `node_modules/`, raw hero PNGs (~220 MB — keep them outside the repo).

### Commit format

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body — why, not what>

<footer>
```

**Types:** `feat` `fix` `perf` `a11y` `refactor` `style` `docs` `test` `build` `chore`
**Scopes:** `hero` `nav` `projects` `trajectory` `contact` `motion` `content` `seo` `tokens` `deps`

Subject in imperative mood, lower case, no trailing period, ≤ 72 chars.

```
perf(hero): decode frames via atob instead of fetch

fetch() on a data: URI is governed by CSP connect-src, so every frame
request was blocked on hosts that ship a policy. The loader then sat at
0% indefinitely, which is indistinguishable from a slow connection.

atob touches no network subsystem. Verified under the production CSP.
```

```
a11y(tokens): raise ink-muted to 51% lightness

Measured 4.41:1 on ink-base — under the 4.5 AA floor. Now 4.92:1.
```

---

## Before opening a PR

1. `pnpm typecheck` — clean
2. `pnpm lint` — clean
3. `pnpm test` — passing
4. `pnpm check:contrast` — no token regressions
5. Keyboard-only pass over the changed surface
6. Reduced-motion pass over the changed surface
7. Deep-link to the changed section — renders final-state, not mid-animation
8. Performance recording if anything animates — no frame over 16.7 ms

---

## When in doubt

- **Remove rather than add.** Restraint scales; decoration doesn't.
- **Measure rather than assume.** Every significant number in these documents came from measuring, and three of them contradicted the obvious guess.
- **If you can't say what information a motion carries, delete it.**
