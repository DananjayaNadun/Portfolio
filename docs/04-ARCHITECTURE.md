# Software Architecture

**Phase 4 of 5 · Status: Awaiting approval · No UI until approved**

---

## 0. The three decisions everything else follows from

| # | Decision | Consequence |
| --- | --- | --- |
| A | **Server Components by default.** `'use client'` appears only at animation leaves. | All content is in the HTML at first paint. SEO, the recruiter fast path, and LCP all fall out of this for free. |
| B | **Scroll state never enters React.** The frame ticker is a module singleton outside the component tree. | 60 fps scroll updates write directly to the DOM. Zero re-renders during scroll — the single largest perf decision on the project. |
| C | **The hero LCP element is a server-rendered `<img>`, not the canvas.** | The poster frame is real HTML with `priority`. The canvas hydrates behind it and takes over. If JS never arrives, the hero is still a finished composition. |

Decision C deserves emphasis. The obvious build makes the canvas the hero, which means LCP waits on hydration *and* a 2.5 MB decode — guaranteeing the >95 mobile Lighthouse target is unreachable. Rendering the poster as a normal optimised image and letting the canvas replace it turns the sequence into pure progressive enhancement.

---

## 1. Stack

| Layer | Choice | Note |
| --- | --- | --- |
| Framework | **Next.js 15+, App Router** | Static export of a single route |
| Language | **TypeScript, `strict: true`** | Plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Styling | **Tailwind CSS v4** | CSS-first `@theme`; tokens are CSS custom properties, not JS config |
| Component motion | **Framer Motion** | Mount/unmount, stagger orchestration only |
| Scroll motion | **Native rAF + IntersectionObserver** | No library. Phase 3 §6.5 |
| Validation | **Zod** | Content schemas, validated at build |
| Images | **`next/image`** for content; **raw `<img>` + canvas** for the hero sequence | The sequence is pre-encoded by `scripts/encode-hero.mjs`; `next/image` would fight it |
| Testing | **Vitest** (logic) + **Playwright** (gates) | Phase 3 §9 becomes executable |
| Analytics | **Vercel Analytics** or **Plausible** | Cookieless, no consent banner |

**No GSAP.** **No state management library.** **No component library.** **No CSS-in-JS.** Each would earn its weight only if the design system didn't already exist.

---

## 2. Folder structure

```
portfolio/
├─ app/
│  ├─ layout.tsx                 Root: fonts, providers, skip link, grain, JSON-LD
│  ├─ page.tsx                   The single document — composes all sections
│  ├─ error.tsx                  Route-level boundary
│  ├─ global-error.tsx           Last-resort boundary (own <html>)
│  ├─ not-found.tsx
│  ├─ sitemap.ts                 Generated at build
│  ├─ robots.ts                  Permits AI crawlers deliberately (PRD §14)
│  ├─ opengraph-image.tsx        Built from a hero frame at build time
│  ├─ icon.svg  apple-icon.png
│  └─ work/[slug]/               RESERVED — deep case studies (not v1)
│     ├─ page.tsx
│     └─ opengraph-image.tsx
│
├─ components/
│  ├─ layout/
│  │  ├─ Section.tsx             Landmark + spacing + header lockup + reveal registration
│  │  ├─ Container.tsx           prose | default | wide | full
│  │  ├─ Stack.tsx  Grid.tsx     gap-based layout primitives
│  │  ├─ SkipLink.tsx
│  │  └─ Hairline.tsx            The fading section divider
│  ├─ ui/
│  │  ├─ Button.tsx              primary | secondary | ghost | icon
│  │  ├─ Card.tsx  Tag.tsx  Badge.tsx
│  │  ├─ Input.tsx  Textarea.tsx  Field.tsx
│  │  ├─ Dialog.tsx              Native <dialog>
│  │  └─ GlassPanel.tsx          The only place backdrop-filter is allowed
│  ├─ motion/                    ← every file here is 'use client'
│  │  ├─ Reveal.tsx              Wraps server-rendered children
│  │  ├─ Stagger.tsx
│  │  ├─ Parallax.tsx
│  │  ├─ MagneticButton.tsx
│  │  ├─ PointerLight.tsx
│  │  └─ ScrollProgressBar.tsx
│  ├─ hero/
│  │  ├─ Hero.tsx                Server. Composes poster + copy + client canvas
│  │  ├─ HeroPoster.tsx          Server. The LCP <img>
│  │  ├─ HeroCopy.tsx            Server markup, client-driven opacity
│  │  └─ HeroSequence.tsx        Client. Canvas + controller binding
│  └─ sections/
│     ├─ LoadingScreen.tsx  Navigation.tsx  About.tsx
│     ├─ Projects.tsx  ProjectCard.tsx  ProjectRow.tsx
│     ├─ Skills.tsx  Trajectory.tsx  TimelineEntry.tsx
│     └─ Contact.tsx  ContactForm.tsx  Footer.tsx
│
├─ content/                      ← the only place facts live
│  ├─ schema.ts                  Zod schemas — the source of truth for shape
│  ├─ profile.ts  projects.ts  skills.ts
│  ├─ trajectory.ts  certificates.ts  social.ts
│  └─ site.ts                    Domain, titles, defaults
│
├─ lib/
│  ├─ content/index.ts           ACCESSOR LAYER — components import only from here
│  ├─ motion/
│  │  ├─ ticker.ts               The single rAF loop (module singleton)
│  │  ├─ scroll.ts               Read-phase scroll/pointer state
│  │  ├─ damp.ts                 Frame-rate-independent damping
│  │  └─ tokens.ts               Durations/easings mirrored from CSS for JS use
│  ├─ hero/
│  │  ├─ sequence-controller.ts  Framework-agnostic. Unit-testable.
│  │  ├─ decode.ts               atob → Blob → ImageBitmap, with fallback
│  │  └─ tiers.ts                Device capability → tier selection
│  ├─ seo/
│  │  ├─ metadata.ts             Typed Metadata builders
│  │  └─ jsonld.ts               Person, WebSite, CreativeWork, Credential
│  └─ utils/
│     ├─ cn.ts  clamp.ts  env.ts
│
├─ hooks/
│  ├─ useReducedMotion.ts        Subscribes to changes, not a one-shot read
│  ├─ useRevealOnce.ts           IO wrapper; skips animation if already visible
│  ├─ useFrame.ts                Subscribe to the shared ticker
│  ├─ useScrollProgress.ts       Element-scoped progress
│  ├─ useActiveSection.ts        Drives nav aria-current
│  └─ useMediaQuery.ts
│
├─ styles/
│  ├─ globals.css                @theme tokens, resets, focus system, reduced-motion block
│  └─ grain.css
│
├─ public/
│  ├─ hero/{desktop,tablet,mobile}/*.webp  +  manifest.json
│  ├─ fonts/Satoshi-Variable.woff2  JetBrainsMono-Variable.woff2
│  ├─ resume.pdf
│  └─ og/
│
├─ scripts/
│  ├─ encode-hero.mjs            ✅ already written
│  └─ check-contrast.mjs         Fails CI if a token pair regresses below its rating
│
├─ docs/  01-PRD · 02-DESIGN-SYSTEM · 03-MOTION-SYSTEM · 04-ARCHITECTURE
├─ CLAUDE.md
└─ tests/  unit/  e2e/
```

---

## 3. Component hierarchy

```
RootLayout                          server
├─ SkipLink                         server
├─ MotionProvider                   client — reduced-motion + ticker lifecycle
├─ LoadingScreen                    client — owns decode progress
├─ Navigation                       client — needs scroll + active section
│  └─ ScrollProgressBar             client
├─ main
│  ├─ Hero                          server
│  │  ├─ HeroPoster                 server   ← LCP element
│  │  ├─ HeroSequence               client   ← canvas, absolutely positioned over poster
│  │  └─ HeroCopy                   server markup, opacity driven by ticker
│  ├─ Section#about                 server
│  │  └─ Reveal > prose             client wrapper, server children
│  ├─ Section#work                  server
│  │  ├─ ProjectCard × 2            server
│  │  │  └─ PointerLight            client wrapper
│  │  └─ ProjectRow × n             server
│  ├─ Section#skills                server
│  ├─ Section#experience            server
│  │  └─ TimelineSpine              client — scroll-bound scaleY
│  └─ Section#contact               server
│     └─ ContactForm                client
└─ Footer                           server
```

**The wrapper pattern is the whole trick:**

```tsx
// Reveal is a client component. Its children are not.
<Reveal>
  <h2>{project.title}</h2>
  <p>{project.outcome}</p>
</Reveal>
```

`children` arrives as an already-rendered `ReactNode` from the server. The client bundle contains the animation logic; the text is in the HTML. This is how the site gets full motion with essentially no content in the JS payload.

---

## 4. Animation architecture

### 4.1 The ticker

```
lib/motion/ticker.ts
```

A module singleton, deliberately outside React:

```
subscribe(fn: (state: FrameState) => void): () => void
```

One `requestAnimationFrame` loop, strictly two phases:

1. **Read** — `scrollY`, viewport size, pointer position sampled *once*.
2. **Write** — every subscriber receives that snapshot and writes styles.

No subscriber may call `getBoundingClientRect()` during write. Elements needing their own rect cache it and refresh on `ResizeObserver`, never per frame. This is what guarantees the "0 forced synchronous layouts" budget.

The loop is idle-stopped: with zero subscribers, no rAF is scheduled.

### 4.2 Damping

```ts
// lib/motion/damp.ts
export function damp(current: number, target: number, lambda: number, dt: number) {
  const k = 1 - Math.pow(1 - lambda, dt / 16.667);
  return current + (target - current) * k;
}
```

Corrects the 120 Hz bug from Motion System §2.3. Every scroll-bound lerp uses this; nothing hand-rolls the arithmetic.

### 4.3 Hero sequence controller

`lib/hero/sequence-controller.ts` is a plain class with **no React and no DOM-framework coupling**:

```ts
class HeroSequenceController {
  constructor(canvas: HTMLCanvasElement, opts: SequenceOptions)
  load(onProgress: (n: number) => void): Promise<void>
  renderAt(progress: number): void      // deterministic, no damping
  sync(): void                          // read scroll, damp, render
  destroy(): void
  get state(): SequenceState
}
```

`renderAt` is the seam that made the prototype testable, and it is what reduced-motion and deep-links use — both need to render a frame with no scroll gesture to read. `HeroSequence.tsx` is a thin binding: create on mount, subscribe to the ticker, `destroy()` on unmount.

Everything the prototype learned is encoded here: `atob` decode (never `fetch`, CSP §7.4), `ResizeObserver` sizing, synchronous first paint, bounded-concurrency decode, and a mandatory failure state.

### 4.4 Reveal

`useRevealOnce` wraps IntersectionObserver with three rules from Motion System §1:

- Fires once, then unobserves.
- **If the element is already intersecting at registration, it renders final-state with no transition** — the fast path is never half-animated.
- Under reduced motion, the observer isn't created at all; children render final-state immediately.

---

## 5. Content layer

### 5.1 Shape

```
content/schema.ts   →  Zod schemas + inferred types
content/*.ts        →  const data satisfies Schema
lib/content/index.ts →  getProfile() getProjects() getTrajectory() …
```

**Components import from `lib/content`, never from `content/` directly.** That indirection is the entire CMS-migration story (PRD §16): swapping to MDX or a headless CMS changes one file, because the accessor's return types are the contract.

Schemas are parsed at **build** time. A malformed project fails the build rather than shipping a broken card.

### 5.2 Why data, not MDX, in v1

Projects have structure — role, timeframe, constraint, decisions, outcome, stack, links. Typed objects let the SEO layer derive `CreativeWork` JSON-LD automatically and let the UI enforce that every project *has* an outcome. Prose in MDX cannot be validated that way. When deep case studies arrive, MDX becomes the *body* of a project whose metadata still lives here.

---

## 6. SEO architecture

| Concern | Location | Approach |
| --- | --- | --- |
| Base metadata | `app/layout.tsx` | `metadataBase`, title template, defaults |
| Page metadata | `lib/seo/metadata.ts` | Typed builders composing from `content/site.ts` |
| Structured data | `lib/seo/jsonld.ts` | `Person`, `WebSite`, `ProfilePage`, `CreativeWork[]`, `EducationalOccupationalCredential[]` |
| OG image | `app/opengraph-image.tsx` | Generated at build from a hero frame — the share card *is* the portrait |
| Sitemap / robots | `app/sitemap.ts`, `app/robots.ts` | Generated; canonical from `site.ts` |

JSON-LD is emitted from the same typed content the UI renders, so the structured data cannot drift from the visible page — a common and quietly damaging bug.

---

## 7. Accessibility architecture

Accessibility is structural, not a review step:

- **`<Section>` requires an `id`, a `label`, and a heading.** It emits `<section aria-labelledby>` and registers with `useActiveSection`. A section cannot be added without a landmark.
- **`<Button>` and `<Input>` have no `outline: none` escape hatch.** The focus system lives in `globals.css`; components cannot opt out.
- **`<Field>` owns label/error/`aria-describedby` wiring**, so an input cannot be rendered without a programmatic label.
- **`useReducedMotion` subscribes to `matchMedia` changes** — users toggle this mid-session.
- **Icon-only controls fail typecheck without `aria-label`** (required prop on `IconButton`).
- **ESLint** `jsx-a11y` at error level, plus a custom rule banning `outline: none` and raw colour literals.

---

## 8. Performance architecture

### 8.1 Rendering & loading

- Fully static. No client data fetching on first load.
- Content sections ship **zero JS** — only motion wrappers hydrate.
- `next/dynamic` for `HeroSequence` (`ssr: false`) — the poster is already server-rendered, so there is nothing to lose.
- Fonts: self-hosted, preloaded, `size-adjust`/`ascent-override` on the fallback so the swap causes **zero** layout shift.
- Every media box declares `aspect-ratio` or explicit dimensions. CLS target 0.00.

### 8.2 Image strategy

| Asset | Pipeline |
| --- | --- |
| Hero sequence | `scripts/encode-hero.mjs` → three tiers + manifest → `<canvas>`. Bypasses `next/image` entirely. |
| Hero poster | `next/image`, `priority`, `fetchPriority="high"`, explicit dimensions |
| Project media | `next/image`, AVIF+WebP, responsive `sizes`, `loading="lazy"` below fold, blur placeholder |
| OG images | Build-time generation |

### 8.3 CI budgets

`size-limit` on the route bundle, `check-contrast.mjs` on tokens, Lighthouse CI on every PR. Any budget in PRD §12 that regresses fails the build rather than being discovered later.

---

## 9. State management

No library. Three tiers:

1. **Server** — all content. Not state.
2. **Module singletons** — the ticker and scroll state. Outside React by design (Decision B).
3. **React** — only genuinely shared UI state: reduced-motion preference, active section, mobile menu open, form status. One small context (`MotionProvider`) plus local `useState`.

If a global store ever seems necessary, it means scroll state leaked into React. Fix that instead.

---

## 10. Error boundaries

| Level | File | Behaviour |
| --- | --- | --- |
| Global | `app/global-error.tsx` | Own `<html>`; minimal branded fallback |
| Route | `app/error.tsx` | Recoverable, offers reset |
| Section | `components/layout/SectionBoundary.tsx` | **One failing section must not blank the page.** Renders a quiet fallback in place. |
| Hero | Inside the controller | Decode failure → static poster + message within 2.6 s (Motion System §7.4) |

---

## 11. Testing

| Layer | Tool | Covers |
| --- | --- | --- |
| Unit | Vitest | `damp()`, `sequence-controller` frame mapping, tier selection, Zod schemas |
| Contrast | `check-contrast.mjs` | Every token pair against its documented rating |
| E2E | Playwright | Phase 3 §9 gates: deep-link renders final-state, keyboard traversal, reduced-motion pass, throttled scroll |

The sequence controller is testable precisely because `renderAt()` exists — the lesson from the prototype, where the render path was sealed in a closure and unverifiable.

---

## 12. Deployment

Vercel. `main` auto-deploys production; PRs get previews. Lighthouse CI and `size-limit` gate merges. Security headers, including a CSP — **which the hero decode is already compatible with**, since it avoids `fetch()` on data URIs.

---

## 13. Phase gate

**Deliverables:** this document and [`CLAUDE.md`](../CLAUDE.md).

**Three decisions to ratify:**

1. **Decision C — the hero LCP element is a server-rendered poster `<img>`, with the canvas as pure progressive enhancement.** This is what makes >95 mobile Lighthouse achievable alongside a 2.5 MB sequence.
2. **Decision B — scroll state lives outside React**, in a module-singleton ticker. This is why no state library appears anywhere.
3. **§5.2 — typed data modules over MDX for v1**, so outcomes can be enforced and JSON-LD derived.

**Note:** this directory is not yet a git repository. `CLAUDE.md` documents the intended workflow; say the word and I'll `git init` with a sensible `.gitignore` and an initial commit.

**Still blocking Phase 5: the content inventory in PRD §18.** Architecture is complete without it; implementation is not. On approval I'll scaffold the project and begin Phase 5 in the specified order — Loading, Navigation, Hero — using clearly-marked placeholder content that your real content drops into without layout changes.
