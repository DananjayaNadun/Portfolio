# Design System

**Phase 2 of 5 · Status: Awaiting approval · No implementation until approved**
**Codename: OBSIDIAN**

---

## 0. Method note

Every colour value in this document was **sampled from the hero footage and measured**, not chosen by eye. The sampling pass read 1,152,000 pixels across frames 001/075/150/225/300 and produced:

| Finding | Value | Consequence |
| --- | --- | --- |
| Peak key-light chroma | `#E50744` — HSL(343.5°, 94%, 46%) | Becomes `crimson-500`, the brand anchor |
| Median frame luminance | 14 / 255 | Page base is set *darker* (luma ≈ 5) so the portrait glows out of the page rather than sitting on it |
| Frame below luma 24 | 77.3% | The site is legitimately a dark, low-key composition; light is the scarce resource |
| Dominant shadow bins | `#180808`, `#180818`, `#280818` — **R > B > G**, hue ≈ 330° | **The blacks are not neutral.** The entire neutral ramp is tinted to hue 340. |

That last finding is the single most important decision in this document, and it is the kind of thing you only get by measuring. Standard portfolio practice is a neutral `#0A0A0A` background. Against this footage, neutral grey reads as *cold* next to the warm magenta falloff, and the hero visibly sits inside a rectangle. Tinting the neutrals to hue 340 at 4–20% saturation dissolves that seam — the photograph and the page become one continuous space.

All contrast ratios below are computed WCAG 2.x values, not estimates. Three failures were found and corrected during this phase; they are documented in §2.7 rather than hidden.

---

## 1. Design principles

Six rules. Every later decision defers to these, and any component that violates one is wrong regardless of how it looks.

1. **Light is the only ornament.** Structure comes from typography and space. Where emphasis is needed, the answer is light — a glow, a highlight, a raised edge — never a decorative shape, gradient-for-its-own-sake, or illustration.
2. **One light source.** The site is lit from above and, in moments of emphasis, from a single crimson key. Every highlight, shadow, and glow must be consistent with that physical model. Two competing light directions read as amateur instantly.
3. **One accent, used rarely.** Crimson appears on perhaps 2% of any given viewport. Its power is entirely a function of its scarcity. If a screen has three crimson elements, two are wrong.
4. **Crimson is light, not paint.** It glows, rims, and indicates. It does not fill large areas and — per the measurement in §2.7 — it never sits behind label text.
5. **Restraint scales, decoration doesn't.** When choosing between adding something and removing something, remove.
6. **Accessible by construction.** Contrast, focus, and motion alternatives are properties of the tokens themselves, so a component built correctly from tokens is accessible by default rather than by audit.

---

## 2. Colour

### 2.1 Neutral ramp — "Ink" (hue 340°, tinted obsidian)

Saturation deliberately decays as lightness rises: deep surfaces carry the footage's magenta tint, while text approaches neutral so it never reads as pink.

| Token | Hex | RGB | HSL | Role |
| --- | --- | --- | --- | --- |
| `--ink-void` | `#090607` | 9, 6, 7 | 340 20% 3% | Absolute base. Body background, loading screen, modal scrim, hero letterbox. |
| `--ink-base` | `#0D0A0B` | 13, 10, 11 | 340 16% 4.5% | Default section background. **The reference background for all contrast claims.** |
| `--ink-raised` | `#141011` | 20, 16, 17 | 340 12% 7% | Cards, inputs, any surface lifted one step. |
| `--ink-overlay` | `#1C1719` | 28, 23, 25 | 340 10% 10% | Popovers, dialogs, nav pill base, hover fills. |
| `--ink-line-soft` | `#272123` | 39, 33, 35 | 340 8% 14% | Decorative dividers, disabled surfaces. |
| `--ink-line` | `#312B2D` | 49, 43, 45 | 340 7% 18% | Default hairline border. Decorative — **not** a UI affordance boundary. |
| `--ink-line-strong` | `#6C6064` | 108, 96, 100 | 340 6% 40% | **Interactive boundaries** (input borders). 3.14:1 on raised — meets 1.4.11. |
| `--ink-graphite` | `#463E41` | 70, 62, 65 | 340 6% 26% | Non-text decoration only (1.9:1). Timeline spine, inactive nodes. |
| `--ink-muted` | `#887C80` | 136, 124, 128 | 340 5% 51% | Tertiary text, placeholders, metadata. 4.92:1 — AA. |
| `--ink-secondary` | `#A29A9D` | 162, 154, 157 | 340 4% 62% | Body copy, descriptions. 7.18:1 — **AAA**. |
| `--ink-primary` | `#EFECED` | 239, 236, 237 | 340 8% 93% | Headings, primary text, primary button fill. 16.79:1 — AAA. |

> Note `--ink-primary` is `#EFECED`, not `#FFFFFF`. Pure white on near-black causes halation (visual bleed) and eye strain in dark interfaces, and it looks cheap. Softening to 93% lightness with a whisper of the footage's tint is what makes it read as *paper in low light* rather than *screen*.

### 2.2 Accent ramp — "Crimson" (anchored on the sampled key light)

| Token | Hex | RGB | On `--ink-base` | Permitted use |
| --- | --- | --- | --- | --- |
| `--crimson-100` | `#FA99B1` | 250, 153, 177 | **9.63:1** AAA | Text on crimson-heavy backgrounds; highest-emphasis inline accent. |
| `--crimson-200` | `#F87797` | 248, 119, 151 | **7.58:1** AAA | Accent body text, inline links, error message text. |
| `--crimson-300` | `#F74574` | 247, 69, 116 | **5.69:1** AA | Link hover, error borders, active timeline labels. |
| `--crimson-400` | `#F71D5A` | 247, 29, 90 | **4.95:1** AA | **Focus rings** (4.95 on base / 4.75 on raised), input focus borders. |
| `--crimson-500` | `#E40746` | 228, 7, 70 | 4.15:1 — large/UI only | **Brand anchor.** Glows, rim light, progress spine, large display accents ≥24px. Never small text. Never a text-bearing fill. |
| `--crimson-600` | `#BF083C` | 191, 8, 60 | 3.11:1 — non-text | Glow cores, gradient midpoints. |
| `--crimson-700` | `#960830` | 150, 8, 48 | non-text | Gradient beds. |
| `--crimson-800` | `#6D0927` | 109, 9, 39 | non-text | Deep ambient wash. |
| `--crimson-900` | `#49081C` | 73, 8, 28 | non-text | Radial key-light bed behind hero and contact. |
| `--crimson-950` | `#2B0813` | 43, 8, 19 | non-text | Barely-there section tint. |

### 2.3 Semantic colours

Deliberately minimal. Two hues besides crimson exist in the entire system, and both are restricted to feedback.

| Token | Hex | On base | Use |
| --- | --- | --- | --- |
| `--jade-400` | `#55BE98` | 8.64:1 AAA | Success confirmation, "available for work" indicator. |
| `--jade-300` | `#7DCAAD` | 10.25:1 AAA | Success text. |
| `--amber-300` | `#F2BC5F` | 11.39:1 AAA | Warning. Reserved; likely unused in v1. |

**The error-colour problem.** Crimson is the brand accent *and* red is the conventional error colour. This is genuinely ambiguous, and the resolution is a rule rather than a colour: **error states are never signalled by colour alone.** Every error carries an icon and text, is announced via `aria-describedby` / `aria-invalid`, and uses `--crimson-200` (7.58:1) for its message text — a lighter tint than any brand usage, so the two read as different registers. This satisfies WCAG 1.4.1 and removes the ambiguity for everyone, not only for colour-blind users.

### 2.4 Background & surface hierarchy

Adjacent surfaces are separated by only ~1.05:1 of luminance. **This is intentional and it is why the elevation model matters so much.** In a low-key composition, separating surfaces by brightness alone would flatten the whole page into grey mush. Instead, surfaces are separated the way real objects are: by *edges* and *light*.

Every raised surface carries three signals:

1. A **top-edge inset highlight** — `inset 0 1px 0 rgba(255,255,255,0.05)` — the light from above catching the surface's leading edge.
2. A **hairline border** — `1px solid var(--ink-line)`.
3. A **downward shadow** appropriate to its elevation.

| Level | Surface | Border | Shadow | Used by |
| --- | --- | --- | --- | --- |
| `e0` | `--ink-base` | none | none | Sections, page |
| `e1` | `--ink-raised` | `--ink-line` | `0 1px 2px rgba(0,0,0,0.4)` + inset highlight | Cards at rest, inputs |
| `e2` | `--ink-raised` | `--ink-line-strong` | `0 4px 16px -4px rgba(0,0,0,0.5)` + inset highlight | Cards on hover |
| `e3` | `--ink-overlay` | `rgba(255,255,255,0.08)` | `0 12px 40px -8px rgba(0,0,0,0.6)` | Nav pill, popovers |
| `e4` | `--ink-overlay` | `rgba(255,255,255,0.10)` | `0 32px 80px -16px rgba(0,0,0,0.7)` | Dialogs |

### 2.5 Glass

Glass is expensive (`backdrop-filter` forces a compositing pass on everything beneath it) and easy to overuse. It is therefore a **licensed material**, permitted on exactly two surfaces: the navigation pill and dialog panels.

```
--glass-bg:      rgba(28, 23, 25, 0.72);
--glass-blur:    blur(24px) saturate(180%);
--glass-border:  1px solid rgba(255, 255, 255, 0.08);
--glass-inset:   inset 0 1px 0 rgba(255, 255, 255, 0.07);
```

**Rules, non-negotiable:**
- Maximum **two** glass surfaces composited at once.
- Never apply `backdrop-filter` to an element that is being transformed or scroll-animated — it re-rasterises every frame and will destroy the 58 FPS floor.
- Always supply an opaque fallback via `@supports not (backdrop-filter: blur(1px))` → solid `--ink-overlay` at 0.96 alpha. Roughly 3% of sessions will take it and must not see transparent text.
- Glass must never be the only thing separating text from a busy background — the `0.72` alpha floor exists to guarantee the text contrast ratios above still hold.

### 2.6 Gradients, glow, and overlays

**Gradient system** — four gradients exist. There is no fifth.

| Token | Definition | Purpose |
| --- | --- | --- |
| `--g-surface` | `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 140px)` | The "lit from above" wash on large surfaces. Reinforces principle 2. |
| `--g-key` | `radial-gradient(ellipse 80% 60% at 50% 0%, var(--crimson-900) 0%, transparent 70%)` | The crimson key light bed. Hero and Contact only. |
| `--g-hairline` | `linear-gradient(90deg, transparent, var(--ink-line) 15%, var(--ink-line) 85%, transparent)` | Section dividers that fade at both ends — a hard-stopping 1px line reads as a table border, which is the opposite of cinematic. |
| `--g-scrim` | `linear-gradient(180deg, transparent 0%, rgba(9,6,7,0.85) 100%)` | Legibility scrim beneath text over imagery. |

**Glow rules.** Glow is the site's emphasis mechanism and its most abusable feature.

```
--glow-sm:  0 0 24px -4px  rgba(228, 7, 70, 0.35);
--glow-md:  0 0 60px -10px rgba(228, 7, 70, 0.45);
--glow-lg:  0 0 140px -20px rgba(228, 7, 70, 0.50);
```

- **One glow visible per viewport.** This is the PRD's light-source motif made enforceable. If two glows can be seen simultaneously, the design is wrong.
- Glow is **always** attached to something that plausibly emits or receives light — a button being pressed, the traversed portion of the timeline, the hero's rim. Never a decorative halo on a static box.
- Glow never appears on text (`text-shadow` glow on small text destroys legibility and anti-aliasing). Emphasis on text is achieved by weight, size, and colour.
- Glow uses `box-shadow`, which is composited but **not** free — never animate `box-shadow` directly. Animate the `opacity` of a pseudo-element that carries the glow.

**Overlay system**

| Token | Value | Use |
| --- | --- | --- |
| `--scrim-soft` | `rgba(9,6,7,0.40)` | Image dimming |
| `--scrim` | `rgba(9,6,7,0.70)` | Mobile menu backdrop |
| `--scrim-heavy` | `rgba(9,6,7,0.88)` | Dialog backdrop |
| `--vignette` | `radial-gradient(ellipse at center, transparent 45%, rgba(9,6,7,0.55) 100%)` | Hero and ultra-wide framing; prevents the composition floating in a void at 2560px+ |

**Film grain — a technical requirement, not a texture choice.**

The page operates almost entirely between luma 5 and luma 30. In that range, 8-bit sRGB has roughly 25 distinguishable steps, and any large gradient — `--g-key`, `--vignette`, the hero's own background falloff — will produce **visible banding** on the majority of displays. Grain is the standard fix: dithering the gradient with noise breaks the bands below the perceptual threshold.

```
--grain-opacity: 0.028;
```
Implementation: one `position: fixed`, `pointer-events: none`, full-viewport element carrying an inline SVG `feTurbulence` (baseFrequency 0.8, numOctaves 3), `mix-blend-mode: soft-light`, promoted to its own layer. **Exactly one instance for the whole document** — per-section grain would multiply the compositing cost for no visual gain. It happens to also reinforce the film language, but banding is why it ships.

### 2.7 Contrast audit — measured, including the failures

Full matrix, computed against all four background surfaces:

| Token | on void | on base | on raised | on overlay | Verdict |
| --- | --- | --- | --- | --- | --- |
| `ink-primary` | 17.19 | **16.79** | 16.09 | 15.09 | AAA body |
| `ink-secondary` | 7.35 | **7.18** | 6.88 | 6.45 | AAA body |
| `ink-muted` | 5.04 | **4.92** | 4.71 | 4.42 | AA body |
| `ink-line-strong` | 3.36 | **3.28** | 3.14 | 2.95 | UI boundary (1.4.11) |
| `ink-graphite` | 1.95 | **1.90** | 1.82 | 1.71 | Non-text decoration only |
| `ink-line` | 1.45 | **1.42** | 1.36 | 1.28 | Non-text decoration only |
| `crimson-100` | 9.85 | **9.63** | 9.22 | 8.65 | AAA body |
| `crimson-200` | 7.76 | **7.58** | 7.26 | 6.81 | AAA body |
| `crimson-300` | 5.82 | **5.69** | 5.45 | 5.11 | AA body |
| `crimson-400` | 5.07 | **4.95** | 4.75 | 4.45 | AA body / focus ring |
| `crimson-500` | 4.24 | **4.15** | 3.97 | 3.72 | Large text ≥24px & UI only |
| `jade-400` | 8.84 | **8.64** | 8.28 | 7.76 | AAA body |
| `jade-300` | 10.50 | **10.25** | 9.82 | 9.21 | AAA body |
| `amber-300` | 11.66 | **11.39** | 10.91 | 10.23 | AAA body |

**Three failures found and corrected during this phase:**

| # | Failure | Measured | Fix |
| --- | --- | --- | --- |
| F1 | The sampled key light `#E50744` as body text | **4.17:1** — fails AA (needs 4.5) | Crimson-500 restricted to large text (≥24px, or ≥18.66px bold), glows, and non-text indicators. Body-weight accent text uses `crimson-200`/`300`. This was predicted as risk R3 in the PRD and is now confirmed and constrained. |
| F2 | `ink-muted` at 48% lightness | **4.41:1** — fails AA by 0.09 | Raised to 51% lightness → 4.92:1. |
| F3 | No token met the 3:1 required for input borders | best was 1.42:1 | Added `--ink-line-strong` at 40% lightness → 3.14:1 on raised. |

**F4 — the finding that changed a component.**

A crimson-filled primary button is impossible:

| Combination | Ratio | Result |
| --- | --- | --- |
| `ink-primary` label on `crimson-500` fill | **4.05:1** | Fails |
| `ink-void` label on `crimson-500` fill | **4.24:1** | Fails |
| `ink-void` label on `ink-primary` fill | **17.19:1** | Passes with enormous headroom |

Crimson-500 sits at exactly the lightness where *neither* white nor black can reach 4.5:1 against it. There is no label colour that works. The options were: shift the brand hue away from the footage (defeats the entire premise), enlarge all button text to 24px (absurd), or **stop filling things with crimson**.

We take the third. **Primary buttons are soft-white fills with void labels, and crimson becomes the glow around them on interaction.** This is materially better than the pattern it replaces: it is exactly what Apple does on dark surfaces, it keeps crimson behaving as *light* rather than *paint* per principle 4, and it means the site's single most important interactive element carries a 17:1 contrast ratio.

A constraint discovered by measurement produced a better design than the one we would have drawn.

---

## 3. Typography

### 3.1 Selection

| Role | Family | Why | Weights used |
| --- | --- | --- | --- |
| Display + UI | **Satoshi Variable** (Fontshare) | A geometric-humanist grotesque with genuine character at display sizes — tight apertures, a distinctive single-storey `a` at weight, and excellent optical presence at 100px+ — while staying completely neutral at 15px for dense recruiter-scannable text. | 400, 500, 600, 700 |
| Structural + code | **JetBrains Mono Variable** | Carries the "engineering document" voice: section numerals, dates, metadata, stack labels, code. Large x-height keeps it legible at 12px with wide tracking. | 400, 500 |

**Two families, two files, ~60 KB subset** — comfortably inside the 90 KB budget with room for a third if needed.

**Why not Inter or Geist.** Both are excellent and both are wrong here. Geist *is* Vercel's brand — using it makes the site read as a Vercel template. Inter is the default of every dark developer portfolio in existence; it is invisible, which is a virtue in a product UI and a liability in a portfolio whose job is to be distinctive. Satoshi gives display presence without eccentricity.

**Fallback plan.** If small-size legibility testing in Phase 5 shows Satoshi underperforming in the dense Trajectory and Skills sections, the swap is **Satoshi for display only + Inter Variable for UI/body** (three files, ~92 KB — still within budget). This is a documented contingency, not a default.

**Licensing action item:** confirm the Fontshare ITF Free Font License permits self-hosted commercial use before Phase 5. If there is any doubt, the drop-in replacement is **Manrope** (Google Fonts, OFL, variable, geometric) with no other changes to this system.

**Loading strategy:** self-hosted, `woff2`, Latin subset, `font-display: swap`, `<link rel="preload">` on the two variable files, `size-adjust`/`ascent-override` on the fallback stack so the swap causes **zero layout shift** (this is how CLS stays at 0.00).

### 3.2 Scale

Fluid via `clamp()`, interpolating between a 390px and a 1440px viewport, then capped.

**Every preferred value contains a `rem` term.** A `clamp()` whose middle value is pure `vw` does not respond to browser zoom and fails WCAG 1.4.4 (Resize Text) at 200%. The `rem + vw` form scales correctly with both viewport and user zoom. This is a common and serious mistake in fluid type systems.

| Token | Clamp | Range | Line height | Tracking | Weight |
| --- | --- | --- | --- | --- | --- |
| `display-1` | `clamp(3.25rem, 1.3rem + 8vw, 8.5rem)` | 52 → 136px | 0.88 | -0.045em | 600 |
| `display-2` | `clamp(2.5rem, 1.665rem + 3.43vw, 4.75rem)` | 40 → 76px | 0.95 | -0.035em | 600 |
| `heading-1` | `clamp(2rem, 1.536rem + 1.9vw, 3.25rem)` | 32 → 52px | 1.05 | -0.03em | 600 |
| `heading-2` | `clamp(1.5rem, 1.268rem + 0.95vw, 2.125rem)` | 24 → 34px | 1.15 | -0.02em | 600 |
| `heading-3` | `clamp(1.1875rem, 1.118rem + 0.29vw, 1.375rem)` | 19 → 22px | 1.30 | -0.01em | 500 |
| `body-lg` | `clamp(1.0625rem, 1.016rem + 0.19vw, 1.1875rem)` | 17 → 19px | 1.65 | 0 | 400 |
| `body` | `1rem` | 16px | 1.70 | 0 | 400 |
| `body-sm` | `0.9375rem` | 15px | 1.60 | 0 | 400 |
| `caption` | `0.8125rem` | 13px | 1.50 | 0.005em | 400 |
| `label` (mono) | `0.75rem` | 12px | 1.40 | **0.14em**, uppercase | 500 |
| `code` (mono) | `0.875rem` | 14px | 1.60 | 0 | 400 |

### 3.3 Typographic rules

- **Optical tracking.** Letter-spacing tightens as size grows (-0.045em at display-1, 0 at body, +0.14em at 12px labels). Large type set at 0 tracking looks loose and amateur; small caps set at 0 looks cramped. This curve is the single highest-leverage typographic detail in the system.
- **Line height inverts against size.** 0.88 at display, 1.70 at body. Long-form text needs air; display type needs to lock together as a shape.
- **Measure.** Body copy is capped at **65ch**; large intro copy at **50ch**. Enforced by container, not by hand.
- **Weights.** 400 body, 500 mono/subheads, 600 headings, 700 for rare inline emphasis. **800 and 900 are banned** — heavy weights read as shouting, which violates "never flashy."
- **The mono voice is structural.** JetBrains Mono is never used decoratively. It marks things that are *data*: section indices (`01 — ABOUT`), dates, durations, stack names, credential IDs, coordinates in the footer. This is what produces the "engineering document" register that makes the cinematic parts feel earned rather than styled.
- **Numerals.** `font-variant-numeric: tabular-nums` on all dates, metrics, and timeline entries so columns align and animated counters don't jitter.
- **Hyphenation & wrapping.** `text-wrap: balance` on headings (prevents orphaned single words), `text-wrap: pretty` on body. `hyphens: none` — hyphenated display type looks broken.
- **No text in images.** Ever. Everything is selectable, translatable, and readable by AT.

---

## 4. Spacing & layout

### 4.1 The 8px grid

Base unit 8px, with a 4px half-step for optical adjustments inside components. No value outside this scale appears in the codebase.

| Token | px | rem | Typical use |
| --- | --- | --- | --- |
| `space-0` | 0 | 0 | — |
| `space-px` | 1 | — | Hairlines |
| `space-0.5` | 4 | 0.25 | Icon/label gaps, chip padding |
| `space-1` | 8 | 0.5 | Tight component internals |
| `space-1.5` | 12 | 0.75 | Chip padding-x, small gaps |
| `space-2` | 16 | 1 | Default component padding |
| `space-3` | 24 | 1.5 | Card padding (mobile), stack gaps |
| `space-4` | 32 | 2 | Card padding (desktop) |
| `space-5` | 40 | 2.5 | Component group separation |
| `space-6` | 48 | 3 | Sub-section separation |
| `space-8` | 64 | 4 | Major component separation |
| `space-10` | 80 | 5 | Section padding (mobile) |
| `space-12` | 96 | 6 | Large section internals |
| `space-16` | 128 | 8 | Section padding (desktop) |
| `space-20` | 160 | 10 | Section padding (large desktop) |
| `space-24` | 192 | 12 | Hero breathing room |
| `space-32` | 256 | 16 | Maximum — reserved for Contact |

### 4.2 Containers & gutters

| Token | Width | Use |
| --- | --- | --- |
| `--container-prose` | 44rem / 704px | About copy, any long-form text (≈65ch) |
| `--container-default` | 75rem / 1200px | Most sections |
| `--container-wide` | 90rem / 1440px | Projects, hero |
| `--container-full` | 100rem / 1600px | Absolute maximum. Beyond this, space is intentional darkness, not stretched layout. |

| Viewport | Gutter |
| --- | --- |
| 320–389 | 20px |
| 390–767 | 24px |
| 768–1023 | 40px |
| 1024–1919 | 64px |
| 1920+ | 80px |

### 4.3 Section rhythm

```
--section-py: clamp(5rem, 3rem + 8vw, 10rem);   /* 80px → 160px */
--section-gap-heading: clamp(2.5rem, 5vw, 4rem);
```

- Hero: `min-height: 100dvh` (`dvh`, not `vh` — mobile browser chrome otherwise causes a jump on first scroll).
- Every section carries a top hairline (`--g-hairline`) except Hero and Contact, which are lit rather than ruled.
- Section headers use a consistent three-part lockup: mono index (`01`), em dash, uppercase label — then the `heading-1` title beneath. This repetition is the spine that holds a cinematic site together.

### 4.4 Radii

| Token | Value | Use |
| --- | --- | --- |
| `--r-xs` | 4px | Tags, inline code |
| `--r-sm` | 8px | Badges, small controls |
| `--r-md` | 12px | Inputs, buttons (non-pill) |
| `--r-lg` | 16px | Cards |
| `--r-xl` | 24px | Dialogs, large media |
| `--r-2xl` | 32px | Hero media frame |
| `--r-full` | 9999px | Pills — nav, primary CTA, status badges |

**Nested radius rule:** an inner radius equals the outer radius minus the padding between them. A 16px card with 8px padding takes an 8px inner radius. Concentric radii are one of those details nobody consciously notices and everybody feels.

---

## 5. Motion tokens

Full choreography is Phase 3. These are the primitives the components below reference.

| Token | Value | Use |
| --- | --- | --- |
| `--dur-instant` | 80ms | Active/pressed states |
| `--dur-fast` | 160ms | Hover, focus, small state changes |
| `--dur-base` | 240ms | Standard transitions |
| `--dur-slow` | 400ms | Panel entrance, card reveal |
| `--dur-slower` | 640ms | Section reveal |
| `--dur-cinematic` | 1000ms | Hero, loading, deliberate moments |
| `--ease-standard` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default. Fast start, long settle — "physical." |
| `--ease-entrance` | `cubic-bezier(0.16, 1, 0.30, 1)` | Things arriving |
| `--ease-exit` | `cubic-bezier(0.70, 0, 0.84, 0)` | Things leaving (accelerates away) |
| `--ease-linear` | `linear` | Scroll-bound progress only |

**Only `transform` and `opacity` are animated.** Any component spec below that appears to animate colour, shadow, or size is in fact cross-fading the `opacity` of a pseudo-element.

---

## 6. Components

Every component is specified across the full state set: **rest, hover, active, focus-visible, disabled, loading, success, error** (where applicable).

### 6.1 Buttons

**Primary** — the site's single most important control. White fill, void label (17.19:1), crimson glow on interaction.

| State | Specification |
| --- | --- |
| Rest | `bg: --ink-primary`; `color: --ink-void`; `height: 48px` (52 on touch); `padding-inline: 24px`; `radius: --r-full`; `font: body-sm/500`; no glow |
| Hover | `bg: #FFFFFF`; `transform: translateY(-1px)`; glow pseudo-element `--glow-md` fades in over `--dur-fast`; cursor pointer |
| Active | `transform: translateY(0) scale(0.985)` over `--dur-instant` |
| Focus-visible | `outline: 2px solid --crimson-400` (4.95:1); `outline-offset: 2px`; plus a 1px `--ink-void` inner ring so the indicator survives against any backdrop (WCAG 2.2 Focus Appearance) |
| Disabled | `bg: --ink-line-soft`; `color: --ink-muted`; no glow; `cursor: not-allowed`; `aria-disabled` (not the `disabled` attribute — keeps it focusable and discoverable by AT) |
| Loading | Label `opacity: 0`, centred 16px spinner; **width locked to the rest-state width** to prevent CLS; `aria-busy="true"`; status announced via a polite live region |
| Success | Label cross-fades to a check icon + confirmation text in `--jade-400`; holds 1600ms; reverts |

**Secondary** — transparent, hairline bordered.
Rest: `bg: transparent`; `border: 1px solid --ink-line`; `color: --ink-primary`. Hover: `border-color: --ink-line-strong`; `bg: rgba(255,255,255,0.03)`. Focus/disabled as Primary.

**Ghost / text** — `color: --ink-secondary` → `--ink-primary` on hover, with an underline that wipes in via `background-size` on a 1px gradient (animating `background-size` on a gradient is compositor-friendly; animating `text-decoration` is not).

**Icon button** — 44×44 minimum (WCAG 2.5.8), `--r-full`, `--ink-secondary` → `--ink-primary`. **Always** carries an `aria-label`.

> **No crimson-filled buttons exist in this system.** See F4 in §2.7. Crimson appears on buttons only as glow.

### 6.2 Cards

**Base card** — `bg: --ink-raised`; `border: 1px solid --ink-line`; `radius: --r-lg`; `padding: space-3` mobile / `space-4` desktop; elevation `e1` plus the inset top highlight; `--g-surface` overlay.
Hover: elevation `e2`, `border-color: --ink-line-strong`, `translateY(-2px)` over `--dur-base`.
Focus-within: crimson focus ring on the card itself when it contains the focused element.

**Flagship project card** — the largest component in the system.
- Media: `aspect-ratio` declared inline so the box is reserved before load (CLS 0.00). `--g-scrim` at the bottom third for text legibility.
- Mono index (`01`) top-left, `--ink-muted`.
- Title: `heading-2`, `--ink-primary`.
- **Outcome line**: `body-lg`, `--ink-primary` — visually the second-loudest element after the title, because per the PRD this is what converts Marcus.
- Description: `body`, `--ink-secondary`, capped at 65ch.
- Stack tags row, then two links (live + source).
- Hover: media scales `1.03` (`transform` on an inner wrapper with `overflow: hidden`), scrim deepens, arrow translates 4px.
- Touch: no hover dependency — the arrow is always visible.

**Compact project row** — hairline-separated list. Index, title, stack, arrow. Hover: title `translateX(4px)`, a crimson hairline wipes left→right beneath (`scaleX` on a pseudo-element), arrow travels. The entire row is one link target with a single accessible name.

### 6.3 Inputs

- `bg: --ink-raised`; `border: 1px solid --ink-line-strong` (**3.14:1** — this is why F3 was fixed); `radius: --r-md`; `height: 52px`; `padding: 16px`; `color: --ink-primary`.
- **Labels are persistent and above the field.** Placeholder-as-label is banned: it fails WCAG 3.3.2, disappears on focus, and defeats autofill.
- Placeholder: `--ink-muted` (4.71:1 on raised).
- Focus: `border-color: --crimson-400` plus `box-shadow: 0 0 0 3px rgba(247,29,90,0.22)`. **Implemented as `box-shadow`, never by changing `border-width`** — a width change reflows the field and shifts every element below it.
- Error: `border-color: --crimson-300`; alert icon; message in `--crimson-200` (7.26:1 on raised) linked by `aria-describedby`; `aria-invalid="true"`. Icon + text always accompany the colour.
- Success: `border-color: --jade-400` + check icon.
- Disabled: `bg: --ink-base`; `border: --ink-line`; `color: --ink-muted`; `cursor: not-allowed`.
- Textarea: `min-height: 140px`; `resize: vertical` only.
- Autofill: `-webkit-autofill` overridden with an inset box-shadow so Chrome's blue-white fill never appears and blows the dark theme apart.

### 6.4 Tags & badges

**Tag** (stack chips) — height 28px, `padding-inline: 10px`, `--r-xs`, `bg: rgba(255,255,255,0.04)`, `border: 1px solid --ink-line`, `caption` size, `--ink-secondary`. Non-interactive; marked up as an `<ul>` so screen readers announce the count. Sentence case, not uppercase — "TypeScript" must not become "TYPESCRIPT".

**Badge** (status, e.g. *Available for work*) — `--r-full`, 8px `--jade-400` dot + `label` mono uppercase. The dot carries a slow 2.4s opacity pulse; **removed entirely under `prefers-reduced-motion`**. Status is conveyed by the text, never by the dot alone.

### 6.5 Timeline (Trajectory)

- **Spine:** 1px `--ink-graphite`, at the left gutter on mobile, on a left rail on desktop.
- **Progress:** a crimson overlay spine bound to scroll position, animated with `transform: scaleY()` and `transform-origin: top` — GPU-only, never `height`.
- **Nodes:** 9px circles. Untraversed `--ink-graphite`; traversed `--crimson-500` with `--glow-sm`.
- **Certificate nodes** are 7px **diamonds** — a different *shape*, not merely a different colour, so the distinction survives colour-blindness and forced-colors mode.
- **Entry:** mono date range → `heading-3` company → `body` role in `--ink-secondary` → up to three `body-sm` achievement bullets.
- Semantics: an ordered list (`<ol>`), because it is chronological. Dates in `<time datetime>`.

### 6.6 Navigation

**Desktop pill** — glass (`e3`), `height: 52px`, `--r-full`, fixed top-centre at `space-3` from the top. Items 36px tall, `--r-full`, `padding-inline: 16px`, `body-sm`. Active item: `bg: rgba(255,255,255,0.06)`, `color: --ink-primary`. Resume is separated by a 1px divider and carries a download glyph.
- Positioned so it never occludes the hero's face at any breakpoint — a hard layout constraint.
- **Scroll progress:** a 1px `--crimson-500` hairline pinned to the very top of the viewport, `transform: scaleX()` bound to document progress. `aria-hidden` — it is decorative; the accessible equivalent is the nav's `aria-current`.
- Active section detection via `IntersectionObserver`, never scroll-offset math.

**Mobile** — 60px bar, name left, 44×44 menu button right. Overlay: full-screen `--ink-void` at 0.98 + blur, items at `display-2` size with a staggered entrance. Focus trapped, Escape closes, focus returns to the trigger, background `inert`.

### 6.7 Dialogs

Built on the native `<dialog>` element — free focus trap, free `inert` backdrop, free Escape, free top-layer stacking.
Panel: glass, `e4`, `--r-xl`, `max-width: 32rem`, `padding: space-4`. Backdrop: `--scrim-heavy` + `blur(8px)`.
Entrance: `opacity 0→1`, `scale 0.97→1`, `--dur-base` / `--ease-entrance`. Exit uses `--ease-exit` at `--dur-fast`.
`aria-modal`, `aria-labelledby`. Focus returns to the invoking element on close. Under `prefers-reduced-motion`, opacity only — no scale.

### 6.8 Footer

Top `--g-hairline` divider. Three zones: name + positioning line; section links; social + colophon. Colophon in mono `caption` at `--ink-muted`. Back-to-top control. `<footer>` landmark with `contentinfo` role implicit.

---

## 7. Focus system

A single, consistent focus indicator across the entire site:

```
:focus-visible {
  outline: 2px solid var(--crimson-400);
  outline-offset: 2px;
  border-radius: inherit;
}
```

- `:focus-visible`, not `:focus` — mouse users never see rings; keyboard users always do.
- `--crimson-400` measures 4.95:1 on base and 4.75:1 on raised, clearing the 3:1 requirement with margin on every surface.
- On light fills (the primary button), an additional 1px `--ink-void` inner ring guarantees the indicator is visible against *both* the fill and the page — WCAG 2.2's Focus Appearance criterion.
- **`outline: none` without a designed replacement is a build-breaking error**, enforced by lint rule in Phase 4.
- Skip-to-content link is the first focusable element, visually hidden until focused, then a fully styled primary button.

---

## 8. Token implementation

Tokens are CSS custom properties on `:root`, surfaced to Tailwind v4 via `@theme`. Two rules govern their use:

1. **Components reference semantic tokens, never raw ramp values.** A card says `var(--surface-raised)`, not `var(--ink-raised)`. The semantic layer maps onto the ramp. This is what makes a future light theme a token-set swap rather than a refactor (PRD §16).
2. **No literal colour, spacing, or duration values in component code.** Enforced by lint.

```
:root {
  /* ramp → semantic */
  --surface-page:     var(--ink-base);
  --surface-raised:   var(--ink-raised);
  --surface-overlay:  var(--ink-overlay);
  --border-subtle:    var(--ink-line);
  --border-interactive: var(--ink-line-strong);
  --text-primary:     var(--ink-primary);
  --text-secondary:   var(--ink-secondary);
  --text-tertiary:    var(--ink-muted);
  --accent:           var(--crimson-500);
  --accent-text:      var(--crimson-200);
  --focus-ring:       var(--crimson-400);
}
```

**Forced-colors mode:** all decorative glow, grain, and gradients are suppressed via `@media (forced-colors: active)`; borders switch to `CanvasText` so structure survives when the palette is replaced wholesale by the OS.

---

## 9. What this system deliberately does not have

Stating the omissions is how a system stays coherent under pressure later.

- No secondary brand hue. No electric blue.
- No crimson-filled surfaces larger than a 9px timeline node.
- No decorative illustrations, blobs, mesh gradients, or 3D.
- No drop shadows in colour other than black.
- No more than four gradients.
- No font weight above 700.
- No border-radius values outside the scale.
- No light theme.
- No component that requires hover to be usable.

---

## 10. Phase gate

**Deliverable:** this document, plus a verified palette with measured contrast on every token.

**Three decisions I'd like ratified, all of which departed from the obvious choice because measurement forced it:**

1. **§2.1 — Hue-340-tinted neutrals instead of neutral grey.** Derived from the footage's actual shadow bins. This is what makes the hero dissolve into the page.
2. **§2.7 F4 — No crimson-filled buttons; primary CTA is a white pill with a crimson glow.** Forced by the 4.05 / 4.24 measurements. I believe this is a better design than what we would have drawn freehand.
3. **§3.1 — Satoshi + JetBrains Mono**, explicitly rejecting Inter and Geist, with Manrope as a licence-safe substitute. Say the word if you'd rather play it safe with Inter.

One action item carried forward: **confirm the Fontshare licence** before Phase 5.

On approval, Phase 3 delivers the motion system: every animation with purpose, trigger, duration, delay, easing, performance budget, and reduced-motion fallback — including the full scroll-scrub choreography for the 300-frame hero and the decision framework for resolving AVIF-sequence vs. video-scrub in Phase 4.
