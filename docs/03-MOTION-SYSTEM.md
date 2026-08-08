# Motion System

**Phase 3 of 5 · Status: Awaiting approval · No implementation until approved**

---

## 0. What the prototype already taught us

Phase 3 is normally written blind. This one isn't — the hero scroll sequence was built and instrumented first, so several numbers below are measured rather than proposed.

| Finding | Value | Where it lands |
| --- | --- | --- |
| Damping constant that reads as "film" | `0.16` per frame | §2.3, and it turns out to *derive* the base duration |
| Time for that damping to close 90% of the gap | **220 ms** | Confirms `--dur-base: 240ms` independently |
| Frames the scroll can actually resolve | 150 over 600vh ≈ 28 px/frame | §4.3 — decimation is imperceptible |
| Decode cost before the sequence can run | 150 × ImageBitmap = 234 MB | §4.3, §6.4 |
| WebP vs AVIF for a scrubbed sequence | WebP; AVIF ~15% smaller but far slower to decode | §4.3 |
| Silent failure mode found in testing | Loader hung forever at 0% | §7.4 — every motion with a load dependency needs a failure state |

The damping result is worth dwelling on. A 0.16 lerp settles 90% of its distance in ~220 ms, which is almost exactly `--dur-base` (240 ms). The scroll-bound motion and the discrete transitions therefore share a felt tempo without anyone tuning them to match. That coherence is the whole point of a motion *system* rather than a pile of animations.

---

## 1. Principles

**1. Every animation must name the information it carries.** If you cannot finish the sentence *"this motion tells the user that ___"*, the animation is decoration and does not ship. This is the gate that removes particle systems (§8.1).

**2. Motion is physical.** Things have mass. They accelerate, they overshoot slightly or not at all, they settle. Nothing moves linearly except things bound to scroll, because scroll *is* the user's hand.

**3. Fast, then patient.** All entrance easing is front-loaded — most of the distance covered in the first third, then a long settle. This is why `cubic-bezier(0.22, 1, 0.36, 1)` is the default: it feels immediate without feeling abrupt.

**4. Travel short distances.** Elements rise 18 px, not 60. Cards lift 2 px, not 12. Large travel reads as a template; small travel reads as expensive. This is the single most common tell of an amateur motion system.

**5. Reveal once, never reverse.** Scroll-triggered animations fire on first entry and unobserve. Re-animating on scroll-up is nauseating, wastes frames, and breaks the fast path.

**6. The fast path is never half-animated.** Any element already in the viewport when its observer registers renders in its final state instantly, with no transition. A recruiter who deep-links to `#work` must land on a fully-formed section, not a frozen mid-animation one. (PRD §7.)

**7. One glow per viewport.** Carried from the design system. Motion may move the light; it may not add a second one.

**8. Transform and opacity only.** Everything else is either not composited or triggers layout. Where a spec below appears to animate something else, it is cross-fading a pseudo-element.

---

## 2. Tokens

### 2.1 Duration

| Token | Value | Use |
| --- | --- | --- |
| `--dur-instant` | 80 ms | Press/active states. Below ~100 ms reads as immediate. |
| `--dur-fast` | 160 ms | Hover, focus, colour and border changes. |
| `--dur-base` | 240 ms | Default. Standard state transitions. |
| `--dur-slow` | 400 ms | Panel entrance, card reveal, dialog. |
| `--dur-slower` | 640 ms | Section reveals, staggered groups. |
| `--dur-cinematic` | 1000 ms | Loading resolve, hero entrance. Used three times on the entire site. |

**Rule:** exit is always faster than entrance — typically the next token down. Things should leave more readily than they arrive.

### 2.2 Easing

| Token | Curve | Character | Use |
| --- | --- | --- | --- |
| `--ease-standard` | `cubic-bezier(0.22, 1, 0.36, 1)` | Fast out, long settle | Default for everything |
| `--ease-entrance` | `cubic-bezier(0.16, 1, 0.30, 1)` | Sharper attack | Things arriving from nothing |
| `--ease-exit` | `cubic-bezier(0.70, 0, 0.84, 0)` | Accelerates away | Things leaving |
| `--ease-inout` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetric | Reversible toggles only |
| `--ease-linear` | `linear` | None | **Scroll-bound only.** Anything tied to scroll position must be linear, because the easing is supplied by the user's hand. |

No spring physics, no bounce, no overshoot anywhere on this site. Overshoot is playful; the brief says never childish.

### 2.3 Distance & damping

| Token | Value | Use |
| --- | --- | --- |
| `--rise` | 18 px | Standard text/element reveal travel |
| `--rise-lg` | 28 px | Section headers only |
| `--lift` | 2 px | Card hover |
| `--shift` | 4 px | Row hover, arrow travel |
| `--stagger` | 60 ms | Delay between siblings |
| `--stagger-cap` | 320 ms | **Total** stagger ceiling per group |
| `--damp` | 0.16 | Scroll-bound lerp coefficient |

**The stagger cap matters.** A 9-item list at 60 ms each puts the last item 540 ms behind the first, which feels broken. Past `--stagger-cap`, remaining siblings share the final delay. Groups larger than six should stagger by row, not by item.

**Frame-rate independence — a required correction.** The prototype applies `cur += (target - cur) * 0.16` once per animation frame. On a 120 Hz display that runs twice as often, so the sequence settles twice as fast and feels different on a MacBook Pro than on an external 60 Hz monitor. Production must normalise against elapsed time:

```
k = 1 - Math.pow(1 - DAMP, dt / 16.667)
cur += (target - cur) * k
```

This is a real bug in the prototype, not a theoretical concern, and it applies to every scroll-bound lerp on the site.

---

## 3. The motion register

Motion energy tracks the emotional arc from PRD §11. Density of animation is itself a compositional device — the quiet sections are quiet *because* the loud one was loud.

| Section | Register | What moves |
| --- | --- | --- |
| Loading | Minimal, single | One progress line, one resolve |
| Hero | High but **slow** | Scroll-bound sequence, staged copy, bloom |
| About | Gentle | Text reveal only |
| Projects | **Peak** | Reveal, parallax, media scale, row wipes |
| Skills | Low, mechanical | Simple fade, no travel |
| Trajectory | Progressive, linear | Scroll-bound spine, node ignition |
| Contact | Single decisive gesture | One bloom, one CTA |
| Footer | None | Static |

---

## 4. Specification catalogue

Every entry carries: **Purpose · Trigger · Duration · Delay · Easing · Performance · Reduced motion.**

### 4.1 Loading experience

**Purpose** — Convey that something is being prepared, and hide the sequence decode so the hero never appears half-ready.
**Trigger** — Document parse.
**Duration** — Progress bar tracks real decode (not faked); resolve is 700 ms.
**Delay** — Resolve waits for decode completion, floor 600 ms so a fast cache doesn't produce a flash.
**Easing** — Bar `--ease-linear` (it reports truth). Resolve `--ease-standard`.
**Performance** — `transform: scaleX()` on the bar, `opacity` + `visibility` on the overlay. No layout. The overlay is `position: fixed` and composited.
**Reduced motion** — Overlay opacity-fades only, 200 ms. Bar still fills (it is information, not decoration) but without transition smoothing.

> **Honesty rule:** the bar reflects actual decoded frames. A fake progress bar that completes on a timer is a lie told in motion, and users can tell.

### 4.2 Navigation

| Behaviour | Purpose | Trigger | Duration / Easing | Performance | Reduced motion |
| --- | --- | --- | --- | --- | --- |
| Entrance | Signals the site is ready and the fast path is open | Loader resolve | 400 ms `--ease-entrance`, 120 ms delay | `opacity` + `translate3d(0,-8px,0)` | Opacity only |
| Compress on scroll | Yields space to content without ever hiding | scrollY > 80 | 240 ms `--ease-standard` | `transform: scale(0.97)` + opacity on backdrop; **never animates height** | No change; static compact state |
| Active item | Tells you where you are | IntersectionObserver | 160 ms `--ease-standard` | Opacity of a pseudo-element pill, not `background-color` | Instant swap |
| Progress hairline | Position in document | Scroll | Linear, continuous | `transform: scaleX()` on a 1px fixed bar | Retained — it is information |
| Mobile menu open | Spatial relationship between trigger and panel | Tap | 400 ms `--ease-entrance`, items stagger 40 ms capped at 200 ms | `opacity` + `translate3d`; `inert` on background | Opacity only, no stagger, no travel |

`backdrop-filter` on the nav pill is **never** animated — see §6.3.

### 4.3 Hero scroll sequence — the centrepiece

**Purpose** — The site's thesis. Scroll is the user's engagement; the subject turning to face them is the reward. The motion *is* the content.

**Trigger** — Scroll position within a 600vh track containing a `position: sticky` stage.

**Duration** — Not time-based. Bound 1:1 to scroll progress `p ∈ [0,1]`, where `p = -track.top / (track.height - viewportHeight)`.

**Delay** — None. Frame 0 is painted synchronously on decode completion, before the first animation frame.

**Easing** — `--ease-linear` for the mapping; damping (§2.3) supplies the feel.

**Choreography**

| Progress | Event |
| --- | --- |
| 0.000 | Frame 001. Eyebrow and display line begin rising. |
| 0.015 → 0.090 | Eyebrow fades in |
| 0.035 → 0.160 | Display line rises 18 px and fades in |
| 0.00 → 0.06 | Scroll cue fades **out** |
| 0.30 → 0.44 | Sub-line arrives — the moment the subject is roughly frontal |
| 0.62 → 0.78 | CTA row arrives |
| 0 → 1 | Crimson bloom opacity 0.18 → 1.00, linear |
| 0 → 1 | Camera push-in: cover scale 1.07× → 1.00× |
| 1.000 | Frame 150. Eye contact. Full bloom. |

The push-in is applied **inside the canvas draw**, by scaling the cover factor — not as a CSS `transform` on the canvas element, which would resample and visibly soften the image.

**Performance**
- 150 frames at 480 × 853, WebP q66 — 2.52 MB payload, **234 MB decoded**. Frame count is a memory budget, not a quality setting: `width × height × 4` bytes are pinned per `ImageBitmap`, so all 300 frames would hold 491 MB in one tab.
- Decode via `atob` → `Uint8Array` → `Blob` → `createImageBitmap`. **Not `fetch()`** — data URIs fall under CSP `connect-src` and are blocked wherever a policy exists.
- One canvas, one `2d` context, one rAF loop. Never 150 DOM nodes.
- Redraw only when the rounded frame index changes.
- Canvas buffer sized by `ResizeObserver`, not a window `resize` listener — the latter misses reflows that don't resize the window (font swap, container change, orientation).
- Adaptive tiers: desktop 150 frames; tablet 75; mobile and `save-data` and `deviceMemory < 6` get a single poster frame.

**Reduced motion** — No sequence, no decode, no scrub. The final frame renders as a composed static hero with all copy at final state. **This must be a beautiful, finished design, not a fallback** — it is reviewed as its own deliverable in Phase 5.

**Failure state** — If decode fails, the loader reports it and degrades to the static hero within 2.6 s. Never an indefinite loading screen (§7.4).

### 4.4 Text reveal

**Purpose** — Direct reading order; give each line a moment.
**Trigger** — IntersectionObserver, `rootMargin: 0px 0px -12% 0px`, fires once then unobserves.
**Duration** — 640 ms. **Delay** — 60 ms stagger per sibling, capped at 320 ms total.
**Easing** — `--ease-entrance`.
**Performance** — `opacity` + `translate3d(0, 18px, 0)`. `will-change` applied on observe and **removed on animation end** (§6.2).
**Reduced motion** — Opacity only, 200 ms, no stagger, no travel.

**Not doing: per-character or per-word reveals.** Splitting text into spans destroys screen-reader continuity, breaks text selection and translation, inflates the DOM, and reads as a 2019 agency site. Lines reveal as lines.

### 4.5 Scroll reveal (generic sections)

Same trigger and easing as 4.4. Elements already intersecting at registration render final-state with no transition (Principle 6). Groups larger than six stagger by row.

### 4.6 Parallax

**Purpose** — Depth cue; separates foreground content from background media.
**Trigger** — Scroll, only while the element is in view.
**Duration** — Continuous, scroll-bound. **Easing** — `--ease-linear` with damping.
**Range** — Maximum **6% of element height**. Anything larger separates the layers visibly and looks cheap.
**Performance** — Single shared rAF loop for *all* parallax elements (§6.1). `translate3d` only. Elements outside the viewport are skipped entirely.
**Reduced motion** — **Disabled completely.** Parallax is a leading vestibular trigger.
**Mobile** — Disabled. It costs frames and reads as jitter on a small screen.

### 4.7 Project cards & image transitions

| Behaviour | Purpose | Trigger | Duration / Easing | Performance | Reduced motion |
| --- | --- | --- | --- | --- | --- |
| Card reveal | Sequence attention through ranked work | IO, once | 640 ms `--ease-entrance`, 60 ms stagger | opacity + `translate3d` | Opacity, 200 ms |
| Media scale | Signals the media is a live surface | Hover | 400 ms `--ease-standard`, scale 1.03 | `transform` on an inner wrapper inside `overflow: hidden` | None |
| Scrim deepen | Preserves text contrast as media brightens | Hover | 240 ms | opacity of a gradient pseudo-element | None |
| Arrow travel | Indicates direction of navigation | Hover | 240 ms `--ease-standard`, 4 px | `translate3d` | None |
| Compact row wipe | Marks the hovered row | Hover | 400 ms `--ease-standard` | `scaleX()` on a 1px pseudo-element, `transform-origin: left` | None |

**Touch devices** get no hover dependency — the arrow is permanently visible and the media is at rest scale. Nothing on this site requires hover to be usable.

### 4.8 Timeline (Trajectory)

**Purpose** — Make the passage of a career legible as forward movement; show how far through it you are.
**Trigger** — Scroll position within the section.
**Duration** — Continuous. **Easing** — `--ease-linear`, damped.
**Spine** — `transform: scaleY()`, `transform-origin: top`. **Never animate `height`** — that is a layout-triggering property and would reflow every entry below it on every frame.
**Node ignition** — When the spine passes a node, it transitions from `--ink-graphite` to `--crimson-500` plus `--glow-sm` over 240 ms `--ease-standard`. Implemented as opacity on a stacked lit-state element, because `box-shadow` is not cheaply animatable.
**Certificate nodes** are diamonds, distinguished by *shape*, so the state survives colour-blindness and forced-colors mode.
**Reduced motion** — Spine renders fully traversed; nodes render in final state; no scroll binding.

### 4.9 Skills

**Purpose** — Present the instrument set as fact. Deliberately the least animated region on the site — its plainness is rhetorical, following the peak of Projects.
**Trigger** — IO once. **Duration** — 400 ms. **Easing** — `--ease-standard`.
**Motion** — Opacity only. **No travel, no stagger, no counters.**

**Not doing: animated proficiency bars or percentage counters.** "React 85%" is unfalsifiable, reads as junior, and animating it doubles down on a weak idea. (Design System §9 already bans the visual; this bans the motion.)

### 4.10 Contact

**Purpose** — Resolution. The lights come back down and one invitation remains.
**Trigger** — IO once.
**Duration** — Bloom 1000 ms `--dur-cinematic`; heading and CTA 640 ms staggered 80 ms.
**Easing** — `--ease-entrance`.
**Performance** — Bloom is opacity on a static radial-gradient element. **Not** an animated gradient — animating gradient stops re-rasterises every frame.
**Reduced motion** — Bloom renders at final opacity; content fades 200 ms.

### 4.11 Buttons & micro-interactions

| Element | State | Duration / Easing | Property |
| --- | --- | --- | --- |
| Primary button | Hover | 160 ms `--ease-standard` | `translateY(-1px)` + glow pseudo-element opacity |
| Primary button | Active | 80 ms | `scale(0.985)` |
| Primary button | Loading | — | Spinner rotate, **width locked to rest width** so nothing shifts |
| Primary button | Success | 240 ms, holds 1600 ms | Label cross-fade to check + confirmation |
| Ghost link | Hover | 160 ms | `background-size` on a 1px gradient underline (compositor-friendly; `text-decoration` is not) |
| Input | Focus | 160 ms | `box-shadow` ring — **never `border-width`**, which reflows the field and shifts everything below |
| Badge dot | Idle | 2400 ms loop | Opacity pulse |
| Tag | — | — | No motion. Tags are labels. |

**Reduced motion** — All hover/active transforms removed; colour and border changes still apply instantly. Spinner becomes a static "Sending…" text label. Badge pulse removed entirely.

### 4.12 Magnetic buttons

**Purpose** — Suggests the control is attracted to the pointer; adds tactility to the single most important CTA.
**Trigger** — `pointermove` within a 90 px radius, `pointer: fine` only.
**Displacement** — **Maximum 6 px**, eased by distance.
**Duration** — Follows pointer with damping; returns over 400 ms `--ease-standard` on leave.
**Performance** — `translate3d` on the button; the shared rAF loop, not a `pointermove` handler that writes styles directly.
**Constraint** — The **hit target must not lead the pointer**. Displacement is capped well below the button's padding so the pointer is always still inside the real target. A control that runs away from the cursor is a usability failure dressed as delight.
**Applied to** — The primary CTA only. One magnetic element per page.
**Reduced motion / touch / coarse pointer** — Disabled entirely.

### 4.13 Pointer light (replaces the custom cursor)

**Purpose** — Extends the site's single-light-source motif to the pointer: the crimson key follows your attention across project media.
**Trigger** — `pointermove` inside a flagship project card, `pointer: fine` only.
**Implementation** — Updates two CSS custom properties (`--mx`, `--my`) consumed by a radial-gradient overlay already present in the card. No new elements, no layout reads.
**Performance** — Coalesced into the shared rAF loop. Custom-property writes on a single element; the gradient is composited.
**Reduced motion / touch** — Disabled; the overlay renders at a static centred position.

See §8.2 for why this replaces a custom cursor rather than accompanying one.

### 4.14 Page transitions

The site is a single document, so this applies only to `/work/[slug]` if those pages ship.

**Purpose** — Preserve spatial continuity between a project card and its detail page.
**Trigger** — Navigation.
**Implementation** — View Transitions API with `view-transition-name` on the card media, so the image morphs into the detail hero. Browsers without support cross-fade — which is a perfectly good transition, not a broken one.
**Duration** — 400 ms `--ease-standard`. Exit 240 ms `--ease-exit`.
**Performance** — Native; the browser handles snapshotting. No JS animation library involved.
**Reduced motion** — Instant navigation, no transition. Honoured via the `prefers-reduced-motion` block in the transition CSS.

### 4.15 SVG, clip-path & mask reveals

| Use | Technique | Note |
| --- | --- | --- |
| Timeline spine | `transform: scaleY()` | Not `stroke-dashoffset` — it forces repaint on a large path |
| Icon state changes | Opacity cross-fade between two paths | Not morphing; morph libraries are weight we don't need |
| Hero portrait edge | Static radial `mask-image` | Not animated |
| Section media reveal | `transform: translateY()` on an inner element inside an `overflow: hidden` parent | **Not animated `clip-path`** |

**Why not animated `clip-path`:** it is a paint-level property in most engines, so every frame re-rasterises the element rather than compositing it. A wrapper with `overflow: hidden` and a transformed child produces an identical result on the compositor. This is the single most common source of jank in "premium" portfolio sites.

### 4.16 Background & ambient

**Purpose** — Grain suppresses 8-bit banding in the dark gradients (Design System §2.6).
**Motion** — **None.** The grain is static.

An animated grain layer would re-rasterise a full-viewport element every frame for a purely textural effect. It is the most expensive thing on a page that can possibly be described as invisible. Static grain solves the banding identically at zero ongoing cost.

---

## 5. Mobile adjustments

| Change | Reason |
| --- | --- |
| Hero sequence → poster or 75 frames | Memory and data (PRD §12) |
| Parallax disabled | Costs frames, reads as jitter |
| Magnetic buttons disabled | No fine pointer |
| Pointer light disabled | No hover |
| Travel distances 18 px → 12 px | Shorter viewport; large travel dominates |
| Stagger 60 ms → 40 ms, cap 200 ms | Thumb scrolling is faster than a wheel; long staggers get scrolled past |
| Hover states → active states | `:active` with a 100 ms hold |
| Durations unchanged | Speeding up motion on mobile is a common mistake — it makes the site feel cheap, not fast |

---

## 6. Performance architecture

### 6.1 One loop

A single application-wide `requestAnimationFrame` loop drives every scroll-bound and pointer-bound animation. Components register a callback; the loop reads scroll and pointer state **once** per frame and passes it to all subscribers.

Per-component rAF loops are the default failure mode of a site like this: eight components each reading `scrollY` and each writing styles produces eight forced layout recalculations per frame. One loop, one read phase, one write phase.

### 6.2 `will-change` hygiene

Applied immediately before an animation begins and **removed when it ends**. A permanent `will-change: transform` promotes the element to its own compositor layer forever, consuming GPU memory and, past a few dozen elements, making everything slower. It is a hint, not an optimisation.

### 6.3 Compositor rules

- Animate `transform` and `opacity`. Nothing else.
- **Never animate** `width`, `height`, `top`, `left`, `margin`, `padding` (layout), or `box-shadow`, `background-color`, `filter`, `clip-path`, `border-width` (paint).
- **Never animate an element with `backdrop-filter`.** It re-rasterises everything beneath it every frame. The nav pill may fade; it may not move or resize.
- Read layout (`getBoundingClientRect`) in the read phase only. Never interleave reads and writes.

### 6.4 Budgets

| Metric | Target |
| --- | --- |
| Sustained scroll FPS, 2020 mid-tier laptop | ≥ 58 |
| Long tasks during scroll | 0 > 50 ms |
| Compositor layers, steady state | ≤ 12 |
| Hero decode memory | ≤ 250 MB desktop, ≤ 120 MB tablet, 0 mobile |
| Motion JS, gzipped | ≤ 14 KB |
| Forced synchronous layouts per frame | **0** |

### 6.5 Library position

Framer Motion for component-level state transitions (mount/unmount, staggered reveals, layout-aware transitions) — it is worth its weight for orchestration and it handles reduced-motion at the API level.

**Not for scroll-bound motion.** The hero sequence, timeline spine, parallax, and pointer light all run on the shared rAF loop with plain `transform` writes. Routing 60 fps scroll updates through a React render path is the wrong shape, and the prototype demonstrates the direct approach is both simpler and faster.

**GSAP: not needed.** Its main draws here would be ScrollTrigger and timeline sequencing, both of which we get from IntersectionObserver plus the shared loop at a fraction of the bytes. Revisit only if a specific effect proves genuinely intractable — and document why before adding it.

---

## 7. Reduced motion

`prefers-reduced-motion: reduce` is treated as a **design variant**, not a kill switch. It will be reviewed as its own deliverable.

### 7.1 What is removed

All parallax; the hero scroll scrub; all translate/scale entrances; magnetic buttons; the pointer light; the badge pulse; media hover scale; page transitions; staggering.

### 7.2 What is retained

Opacity transitions at 200 ms; the scroll progress hairline; the timeline spine (rendered fully traversed); the loading progress bar; all focus indicators; all colour and border state changes. **Information-bearing motion is retained wherever it can be expressed without movement.**

### 7.3 Implementation

A single `@media (prefers-reduced-motion: reduce)` block sets `--dur-*` tokens to `200ms` or `0.01ms` and neutralises travel tokens to `0`. Because every component consumes tokens rather than literals, the entire site adapts without per-component branching. JS reads `matchMedia` once and **subscribes to changes** — users toggle this setting mid-session, and the page should respond without a reload.

### 7.4 Failure states are part of motion design

The prototype shipped with a loader that could hang at 0% forever. That is worse than a crash: it is indistinguishable from a slow connection, so nobody reports it.

**Rule:** any animation gated on an asynchronous dependency must define a failure state and a timeout. The hero degrades to the static composed frame within 2.6 s of a decode error and says so.

---

## 8. What we are not building, and why

The brief listed these. Each is declined on the grounds of Principle 1.

### 8.1 Particle systems

**Cut.** Complete the sentence: *"this motion tells the user that ___."* There is no ending. Particles are pure decoration, and they cost a full-viewport canvas running every frame for the entire session — the single largest sustained cost available, spent on the thing carrying the least information.

They also actively contradict the brief. Apple, Linear, Stripe, Vercel and Figma ship no particle fields. Drifting dots read as *2021 crypto landing page*, which is the opposite of "luxury, confident, never flashy."

The atmosphere they're reaching for is already delivered — by the crimson key light, the grain, and the vignette — at zero per-frame cost.

### 8.2 Custom cursor

**Cut**, replaced by the pointer light (§4.13). A custom cursor lags the real one by at least a frame, discards the OS's own affordances (text I-beam, pointer, resize) which are genuine usability signals, needs bespoke handling on every interactive element, and does nothing on touch — where most traffic is. It is a well-worn portfolio trope that signals *portfolio* rather than *product*.

The pointer light achieves the intended effect — the interface responding to your attention — while reinforcing the light-source motif and costing two custom-property writes per frame.

### 8.3 Scroll-jacking

**Cut**, as established in PRD §5. Any hijacking of scroll velocity or snapping between sections makes the recruiter fast path impossible and fights the user's hand. Scroll maps 1:1 to document position everywhere on this site.

### 8.4 Text splitting (per-character / per-word)

**Cut** — see §4.4. Accessibility and DOM cost for an effect that reads as dated.

### 8.5 Animated counters

**Cut.** If a number matters, show it. Counting up to it delays the information and invites the reader to watch the animation instead of reading the figure.

---

## 9. Verification

Motion is only "done" when measured. Every section in Phase 5 passes this gate before the next begins:

1. **Frame timing** — DevTools Performance recording of a full scroll pass; no frame over 16.7 ms, no long task over 50 ms.
2. **Layer count** — Layers panel; ≤ 12 in steady state, no orphaned promoted layers after animations complete.
3. **Forced reflow audit** — Performance panel flags zero forced synchronous layouts.
4. **Reduced-motion pass** — full visual review with the setting on, treated as a design review.
5. **Keyboard pass** — every animated element reachable, focus visible throughout, no animation traps focus.
6. **Deep-link pass** — load each `#anchor` directly; confirm the section renders fully formed, never mid-animation (Principle 6).
7. **Throttled pass** — 4× CPU throttle; confirm the site degrades in smoothness but never in function.

---

## 10. Phase gate

**Deliverable:** this document. Nothing implemented.

**Four decisions I'd like ratified:**

1. **§8.1 — Cutting particle systems.** Listed in your brief; I think they'd damage the work. This is the one I feel most strongly about.
2. **§8.2 — Cutting the custom cursor**, replaced by the pointer light.
3. **§6.5 — Framer Motion for component state only; scroll-bound motion on a shared rAF loop; no GSAP.**
4. **§2.3 — Frame-rate-independent damping**, correcting a real bug in the prototype where the hero settles twice as fast on a 120 Hz display.

Phases 1–3 are now complete. Phase 4 is the architecture: folder structure, component hierarchy, typed content layer, SEO and metadata structure, image pipeline, error boundaries, and the `CLAUDE.md` that encodes every rule from these three documents as enforceable convention.

**Still blocking Phase 5:** the content inventory in PRD §18. Architecture can proceed without it; implementation cannot.
