# Portfolio — Product Requirements Document

**Phase 1 of 5 · Status: Awaiting approval · No code to be written until approved**

---

## 0. Decisions locked before this document

| Decision | Choice | Consequence |
| --- | --- | --- |
| Primary conversion goal | **Land a job — recruiter-facing** | IA leads with proof of work and employability. Resume is a first-class artifact. Contact is low-friction and one-directional. |
| Accent system | **Crimson-only monochrome** | A single hue, sampled from the hero footage's own key light. All other differentiation comes from light, elevation, and typography. |
| Hero sequence scope | **Adaptive** | Full scroll-scrub on desktop, reduced on tablet, poster + motion treatment on mobile. |

---

## 1. Asset analysis

The supplied `portfolio video.zip` is the single most important creative asset in this project, and it dictates a large part of the design language.

**Technical inventory**

| Property | Value |
| --- | --- |
| Frames | 300 (`ezgif-frame-001.png` … `ezgif-frame-300.png`) |
| Dimensions | 720 × 1280 px (9:16 portrait) |
| Colour depth | 24-bit RGB, no alpha |
| Size on disk | 220 MB total, ~730 KB average per frame |
| Content | Cinematic portrait. Subject rotates from a three-quarter profile (frame 1) through a near-frontal pose (frame 150) to a locked, straight-to-camera gaze (frame 300). Crimson/magenta rim and key light on a near-black falloff background. |

**Creative reading**

This is not b-roll. It is a single continuous gesture with a beginning and an end: *a person turning to look at you*. Scroll direction maps onto it perfectly — the visitor's own act of engaging with the page is what earns eye contact. That is the emotional thesis of the entire site, and everything else is built to support it.

Consequences that flow from the asset:

1. **Portrait aspect ratio, not full-bleed.** A 9:16 asset cannot fill a 16:9 desktop viewport without catastrophic cropping (we would lose the head, which is the whole point) or upscaling past its native 720 px width. The hero must therefore be a **composed split layout on desktop** — figure held in a portrait column, typography occupying the negative space beside it — rather than a background video. This is a constraint, but it is a better design than full-bleed anyway: it produces an editorial, Porsche-brochure composition instead of a generic hero video.
2. **Never display wider than ~720 CSS px.** Above that the source softens visibly. This becomes a hard layout rule.
3. **The palette is decided for us.** The footage is obsidian black with a crimson key. Introducing electric blue would put two saturated hues in competition. Crimson-only, sampled directly from the frames, makes the site read as a continuation of the photograph rather than a container for it.
4. **220 MB is roughly 90× over the LCP budget.** Solving this is the single largest engineering risk in the project (see §12 and Risk R1).

---

## 2. Product vision

> A portfolio that behaves like a product launch, not a résumé — and that a hiring manager can still fully evaluate in ninety seconds.

Most developer portfolios optimise for one of two things and sacrifice the other: they are either *impressive and slow to read*, or *readable and forgettable*. This project refuses that trade by treating them as two distinct user paths through one artefact.

The site opens cinematically — dark, quiet, deliberate, one figure and one line of type — and then progressively resolves into a dense, scannable, evidence-rich document. The visitor is never asked to choose between being moved and being informed; they are moved first, and informed immediately after, in the same continuous scroll.

**The product is the proof.** For a software engineer, the portfolio *is* a work sample. A site that holds 60 FPS, ships a >95 Lighthouse score, and passes WCAG AA demonstrates craft more credibly than any bullet point claiming it. Every performance and accessibility target in this document is therefore also a *content* requirement.

**Design north star:** the feeling of a well-lit architectural interior at night. Confident, expensive, mostly empty, one light source. Nothing shouts. Everything is intentional.

---

## 3. Target audience

Ranked by decision-making power over the primary goal.

| Tier | Audience | Share of traffic (est.) | What they need |
| --- | --- | --- | --- |
| **P0** | Technical recruiters & talent partners | ~40% | Role fit, stack, seniority, location, availability, resume file, contact. Skimming on a laptop, often with 8 tabs open. |
| **P0** | Engineering hiring managers / team leads | ~20% | Depth of a small number of projects. Architecture decisions, trade-offs, ownership, code links. Will click into GitHub. |
| **P1** | Peer engineers (referral source) | ~20% | Something worth sharing in a group chat. Technical taste. Craft signals. |
| **P2** | Prospective freelance clients | ~10% | Outcomes, reliability, how to start a conversation. |
| **P2** | The author, as a maintainer | ~10% | Ability to add a project or update a role in minutes, years from now, without touching layout code. |

---

## 4. User personas

### P0 — Priya, Technical Recruiter
**Context:** 34, agency and in-house experience, screens 60–100 candidates a week. Opens the portfolio from a link in an application, on a 1440 × 900 laptop, in a tab she may abandon in 20 seconds.

**Job to be done:** *"Decide in under two minutes whether this person is worth a 30-minute call, and get their resume into my ATS."*

**Needs:** Name, current title, and years of experience visible without scrolling. Stack keywords she can match against a job spec. A downloadable PDF. An email address she can copy in one click.

**Frustrations:** Portfolios where the hero is a full-screen animation with no text. Having to hunt for a resume. Contact forms that don't tell her the email address. Sites that are slow on hotel wifi.

**Design implication:** The name, role, and a one-line positioning statement must be present in the DOM at first paint, *beside* the cinematic hero rather than after it. Resume download and email must be reachable from the persistent navigation, not only from the footer.

---

### P0 — Marcus, Engineering Manager
**Context:** 41, leads a platform team of seven. Received the link from Priya with a note. Has 10 minutes, on a 27" display. Will open two or three things in new tabs and read them later.

**Job to be done:** *"Find out whether this person has actually built something hard, and whether they can explain why they built it that way."*

**Needs:** Two or three projects with real depth — problem, constraint, decision, trade-off, outcome, measurement. Live links and source links. Evidence of ownership rather than tutorial-following.

**Frustrations:** Twelve projects of equal weight with no hierarchy. "Built with React, Node, MongoDB" as the entire description. Screenshots with no context. Dead demo links.

**Design implication:** Projects must be **ranked, not gridded**. One or two flagship case studies get disproportionate space and a narrative structure. The remainder are a compact secondary list. Every project needs a stated outcome, and dead links are a content-integrity requirement.

---

### P1 — Dev, Peer Engineer
**Context:** 27, saw the link on X or in a Discord. Scrolling on a phone, on mobile data, in three minutes of downtime.

**Job to be done:** *"Is this cool enough to send to someone else?"*

**Needs:** Immediate visual payoff. Smoothness. Something technically interesting he can identify. A fast, non-janky mobile experience.

**Frustrations:** A 40 MB mobile page. Scroll-jacking that fights his thumb. Animation that stutters.

**Design implication:** Mobile is not a degraded desktop — it is the *share surface*, and therefore has to feel excellent while staying inside a strict byte budget. This is exactly why the hero is adaptive rather than uniform.

---

### P2 — Ana, Prospective Client
**Context:** 38, non-technical founder, evaluating whether to hire a contractor.

**Job to be done:** *"Does this person seem reliable, and how do I reach them?"*

**Needs:** Plain-language outcomes. Evidence of finishing things. An unambiguous way to make contact.

**Design implication:** Every project's outcome line must be legible to a non-engineer, even when the detail beneath it is not. Contact must not assume technical context.

---

## 5. Goals

### Primary
1. Convert a P0 visitor into a contact event — an email, a resume download, or a LinkedIn visit.
2. Communicate seniority and craft within the first viewport, before any scroll.
3. Make two or three flagship projects legible, credible, and memorable.

### Secondary
4. Be worth sharing — produce at least one moment a peer would screenshot.
5. Function as a permanent, self-owned professional identity independent of any platform.
6. Serve as a live demonstration of front-end, performance, and accessibility skill.

### Explicit non-goals
- Not a blog or CMS. (Architected so one *could* be added — see §16 — but not built now.)
- Not a light/dark theme toggle. Dark mode only is a design position, not an omission.
- Not an exhaustive list of every project ever built. Curation is the product.
- Not a scroll-jacked, "hijack the wheel" experience. The visitor's scroll always maps 1:1 to page position.
- No multi-language support in v1.

---

## 6. Success metrics

| Metric | Target | Why it matters | How measured |
| --- | --- | --- | --- |
| **Contact conversion** | ≥ 6% of sessions trigger a contact event | The single business KPI | Analytics events on mail/resume/social intents |
| Resume downloads | ≥ 4% of sessions | Direct recruiter intent signal | Download event |
| Scroll depth to Projects | ≥ 60% of sessions | Proves the hero doesn't trap people | IntersectionObserver milestone events |
| Scroll depth to Contact | ≥ 25% of sessions | Full-journey completion | Milestone event |
| Median engaged time | ≥ 75 s | Beats the ~30 s portfolio norm | Engagement timer |
| Bounce (< 10 s, no scroll) | ≤ 30% | Detects a slow or confusing entry | Analytics |
| Lighthouse Performance (mobile) | ≥ 95 | Craft proof; hardest of the four | CI on every PR |
| Lighthouse A11y / BP / SEO | 100 | Non-negotiable | CI on every PR |
| LCP (mobile, 4G) | ≤ 2.0 s (budget 2.5 s) | Recruiter on bad wifi | Field + lab |
| INP | ≤ 200 ms | Scroll responsiveness | Field |
| CLS | ≤ 0.01 (target 0) | Every media box pre-reserved | Lab + field |
| Sustained scroll FPS | ≥ 58 on a 2020 mid-tier laptop | The hero must not stutter | Manual profiling per section |
| Axe violations | 0 | Gate, not goal | Automated in CI |
| Keyboard-only completion | 100% of actions | Full parity | Manual audit checklist |

**Analytics posture:** cookieless, privacy-respecting, no consent banner required (a consent banner would itself damage the first impression). Events are intent-level only; no PII, no cross-site identifiers.

---

## 7. The central tension, and how we resolve it

A cinematic experience wants the visitor to move slowly. A recruiter has ninety seconds. These pull in opposite directions, and pretending otherwise is how portfolios fail.

**Resolution — the dual-speed page.** One page, two legitimate speeds, no compromise in either:

- **The cinematic path (default).** Scroll from top to bottom. The hero sequence plays out, sections reveal in sequence, the story lands. This is what Dev and Marcus experience.
- **The fast path (always available).** From the first second, the persistent navigation exposes *Work*, *Experience*, *Resume*, and *Contact*. The name, role, and positioning line are rendered as real text at first paint. Priya can read the header, hit Resume, and leave in eleven seconds without ever seeing the sequence — and she will still have got what she came for.

Critically: **the fast path is never a degraded experience.** Jumping to a section lands you in a fully-formed, beautifully composed view, not a half-animated one. Any element whose entrance animation has not yet fired renders in its final state when scrolled to directly.

This tension is also why we reject scroll-jacking outright. Taking control of the scroll makes the fast path impossible.

---

## 8. Information architecture

### 8.1 A structural challenge to the proposed section list

The brief specifies: Loading, Navigation, Hero, About, **Journey**, Projects, Skills, **Experience**, **Timeline**, Certificates, Contact, Footer.

**Journey, Experience, and Timeline are three names for one chronological narrative.** Shipping all three would produce three consecutive scroll regions containing the same dates and the same employers in three different visual treatments. To a recruiter this reads as padding, and padding is the opposite of confidence. It also triples the maintenance surface and dilutes the emotional arc precisely where the site should be at its most authoritative.

**Recommendation:** merge them into a single section, **Trajectory**, that carries a *rendered timeline* as its layout. One data source, one visual language, one place to update.

| Original section | Fate |
| --- | --- |
| Journey | Merged → becomes the *narrative framing* line that opens Trajectory |
| Experience | Merged → becomes the *content* (roles, companies, dates, achievements) |
| Timeline | Merged → becomes the *visual form* (the vertical spine and progressive scroll reveal) |

This removes two redundant sections while losing nothing — the timeline treatment survives, the narrative framing survives, the role detail survives. It also makes room for Certificates to sit inside Trajectory as terminal nodes on the same spine, which is more truthful (a certification *is* a dated event) and far more elegant than a detached grid of badges.

**Standing by the brief where it is right:** every other section is retained exactly as specified, in the specified order.

### 8.2 Final IA

Single-page primary document with progressive disclosure. Deep routes exist only where content genuinely warrants a dedicated page.

```
/                                    Primary experience (single scroll)
├─ 00  Loading Experience            Pre-paint; not a nav target
├─ 01  Navigation                    Persistent overlay
├─ 02  Hero                #hero     ← scroll-driven portrait sequence
├─ 03  About               #about
├─ 04  Projects            #work     ← primary conversion surface
│      ├─ Flagship case study 01
│      ├─ Flagship case study 02
│      └─ Selected work (compact)
├─ 05  Skills              #skills
├─ 06  Trajectory          #experience   [Journey + Experience + Timeline + Certificates]
├─ 07  Contact             #contact
└─ 08  Footer

/work/[slug]              Optional deep case study (Phase 5+, only if a project earns it)
/resume.pdf               Static asset, tracked as a conversion
/sitemap.xml  /robots.txt  /og/*  Machine surfaces
```

**One reordering, deliberately:** **Projects precedes Skills.** The brief lists Skills first. But evidence should precede claims — showing what was built, then naming the tools used to build it, is more persuasive than a tool list looking for a justification. Marcus wants proof before taxonomy. (Say the word and I'll restore the original order; this is a recommendation, not a unilateral change.)

### 8.3 Navigation model

- **Desktop:** a floating glass pill, top-centre, containing 4 section links + a distinct Resume affordance. Backdrop-blurred, elevated above content, never occluding the hero's face. A hairline progress indicator tracks document position.
- **Mobile:** a compact bar with a full-screen overlay menu on tap. Menu items are large touch targets with a staggered entrance.
- **Always present:** appears immediately after the loading experience and never fully hides. It may compress and reduce opacity on downward scroll, but it never disappears — the fast path depends on it.
- **Active state:** driven by IntersectionObserver against section boundaries, not scroll offsets.

---

## 9. Content hierarchy

Content ranked by how much it moves a P0 visitor toward a contact event. Higher rank earns more space, more light, and earlier position.

| Rank | Content | Placement | Treatment |
| --- | --- | --- | --- |
| 1 | Name + role + one-line positioning | Hero, above the fold, real text at first paint | Display type, highest contrast on the page |
| 2 | Flagship project outcomes | Projects, first two entries | Large-format, narrative, most space of any component |
| 3 | Contact affordance | Persistent nav + dedicated section | Highest-emphasis interactive element |
| 4 | Resume (PDF) | Persistent nav + Contact + Footer | Distinct from other nav items |
| 5 | Current role + years of experience | Hero sub-line + Trajectory | Immediate, unambiguous |
| 6 | Core stack (6–8 items max) | Skills, primary tier | Grouped, weighted by depth |
| 7 | Secondary projects | Projects, compact list | Dense, one line each |
| 8 | Career narrative | Trajectory | Timeline spine |
| 9 | Personal story | About | Restrained; two short paragraphs maximum |
| 10 | Certificates | Trajectory, terminal nodes | Small, credible, never a badge wall |
| 11 | Social links | Footer + Contact | Quiet, secondary |

**Editorial rules**
- Every project states an outcome in language Ana could understand.
- No section exceeds ~120 words of body copy. Density lives in structure, not prose.
- Numbers wherever they exist and are true. "Cut p95 latency from 800 ms to 120 ms" outperforms "improved performance" by an enormous margin.
- No skill proficiency percentages. "React — 85%" is unfalsifiable and reads as junior. Group by depth of use instead (Daily / Production / Familiar).

---

## 10. Storytelling strategy

The site is structured as a **five-act introduction**, using the hero footage's own gesture as its spine.

**Act I — Arrival (Loading + Hero).** The screen is black. Something is resolving. A figure appears, turned away. As you scroll, he turns. By the time the hero completes, he is looking directly at you and his name is beside him. *Nothing has been claimed yet — only presence has been established.*

**Act II — Voice (About).** The first time the site speaks in first person. Short, specific, unpolished-sounding but carefully written. Establishes that there is a person here with a point of view, not a template. *The eye contact is now a conversation.*

**Act III — Evidence (Projects).** The claim is cashed. Two flagship works presented as case studies — problem, constraint, decision, outcome — with the visual generosity of a product page. This is the longest act and the one that converts. *The conversation is now a demonstration.*

**Act IV — Foundation (Skills + Trajectory).** The instrument set and the road that produced it. Deliberately the densest, most factual, most "documentary" region of the site — its plainness is a rhetorical device after the cinema of Act III. *The demonstration is now a record.*

**Act V — Invitation (Contact + Footer).** The lights come back down. The page returns to the quiet of Act I, but the visitor now knows who is in the room. A single, generous, unmissable invitation to make contact. *The record becomes an offer.*

**Motif — the light source.** One crimson key light is the site's recurring visual character. It arrives with the portrait, follows the cursor faintly across Act III's cards, marks the traversed portion of the Trajectory spine, and returns at full strength behind the Contact call to action. It is never used decoratively and never appears in more than one place at a time. It is the site's way of pointing.

---

## 11. Emotional progression through the scroll

The site is choreographed as **Night → Studio → Night**. Perceived brightness, information density, and motion energy all move together along the arc, so the visitor's attention is being actively managed rather than left to drift.

| Act | Section | Feeling | Light | Density | Motion energy | Typographic scale |
| --- | --- | --- | --- | --- | --- | --- |
| I | Loading | Anticipation | Near-total black | Zero | Minimal, single | — |
| I | Hero | Arrest, intrigue | Single crimson key on black | Very low | High but *slow* — the sequence | Maximum |
| II | About | Intimacy, trust | Marginally lifted | Low | Gentle, text-led | Large |
| III | Projects | Momentum, conviction | Brightest region; elevated surfaces | High | Highest — parallax, transitions | Medium, with large numerals |
| IV | Skills | Competence, calm | Even, flat, unglamorous | Highest | Low, mechanical | Small |
| IV | Trajectory | Authority, weight | Dimming again | High | Progressive, linear | Small–medium |
| V | Contact | Warmth, resolution | Black + full crimson bloom | Minimal | Single decisive gesture | Maximum |
| V | Footer | Quiet close | Black | Low | None | Small |

**Two rules that keep this from becoming decoration:**
1. **Peak intensity happens once.** The Projects section is the site's loudest moment, and nothing after it competes. A site with four climaxes has none.
2. **Every brightness change is legible as meaning.** Light rises when the site is showing you evidence and falls when it is speaking to you directly. A visitor should feel this without ever noticing it.

---

## 12. Performance goals

Performance is a feature of this product, not a constraint on it. The hero asset makes it the hardest engineering problem in the build.

### Budgets

| Metric | Budget | Stretch |
| --- | --- | --- |
| LCP (mobile 4G, Moto G-class) | 2.5 s | 2.0 s |
| FCP | 1.5 s | 1.0 s |
| CLS | 0.02 | 0.00 |
| INP | 200 ms | 120 ms |
| TBT | 200 ms | 100 ms |
| Initial JS (gzipped, route) | 120 KB | 90 KB |
| Initial CSS | 20 KB | 14 KB |
| Above-fold image payload (mobile) | 180 KB | 120 KB |
| Total page weight, full scroll (mobile) | 1.6 MB | 1.2 MB |
| Total page weight, full scroll (desktop) | 4.5 MB | 3.5 MB |
| Fonts | ≤ 3 files, ≤ 90 KB, subset, `swap` | 2 files |
| Sustained scroll FPS | ≥ 58 | 60 locked |

### The hero sequence budget — the central problem

Source is 220 MB. The desktop budget for the entire sequence is **≤ 2.5 MB**, mobile **≤ 150 KB**. That is a required reduction of roughly **99%**, which is achievable but only with a deliberate pipeline:

- **Frame decimation.** 300 frames is far more than scroll can resolve. A ~600 px scroll distance at 120 frames yields a new frame every 5 px — already beyond the perceptual threshold for smooth motion. Target **90–120 frames desktop, 30–40 tablet, 1 poster mobile.**
- **Modern codecs.** AVIF at quality ~50 on near-black footage with a smooth gradient background compresses extraordinarily well; WebP as the fallback. Expect 15–25 KB/frame at 720 px width.
- **Alternative under evaluation:** a fragmented MP4/WebM scrubbed via `currentTime`. Dramatically smaller (~1 MB for the full 300 frames) but seek behaviour is inconsistent across Safari/iOS and can stutter. **Decision deferred to Phase 4**, where both will be prototyped and measured rather than assumed.
- **Decode discipline.** Frames are decoded off the main thread via `createImageBitmap`, painted to a single `<canvas>`, and never inserted as 120 DOM nodes.
- **Progressive readiness.** Frame 1 is the LCP element, preloaded and inlined-poster-backed. The sequence becomes interactive only once a sufficient buffer has decoded; before that, scroll shows the poster and the hero *still looks finished*.
- **Adaptive gating.** Sequence loading is gated on viewport, `navigator.connection.saveData`, `deviceMemory`, and `prefers-reduced-motion`. Any one of these failing yields the poster experience, which is a legitimate design, not a fallback.

### Rendering strategy
Static generation for the entire route. No client-side data fetching on first load. Zero blocking third-party scripts. Analytics loaded post-interactive. Route-level code splitting so no below-fold section's JavaScript is in the initial bundle.

---

## 13. Accessibility goals

**Target: WCAG 2.2 Level AA in full, with AAA contrast on all body text.** Lighthouse Accessibility 100 is a floor, not the goal — it catches perhaps 30% of real issues.

| Area | Commitment |
| --- | --- |
| Semantics | True landmark structure. One `<h1>`. No heading level skipped. Sections are `<section>` with `aria-labelledby`. Lists are lists. |
| Keyboard | 100% of functionality reachable and operable. Logical tab order matching visual order. Skip-to-content as the first focusable element. No keyboard traps. Escape closes any overlay and restores focus to its trigger. |
| Focus | A visible, high-contrast focus ring on every interactive element, meeting 2.2's *Focus Appearance* criteria. Never `outline: none` without a designed replacement. Focus-visible only, so mouse users aren't shown rings. |
| Contrast | Body text ≥ 7:1 (AAA). Large text and UI components ≥ 4.5:1. **Every crimson-on-black pairing is verified against the specific token, not assumed** — saturated red on black is a common failure point and will be measured in Phase 2. |
| Motion | `prefers-reduced-motion: reduce` fully honoured. The hero becomes a static composed frame; reveals become instant opacity changes or nothing; parallax, magnetic cursor, and background motion are disabled entirely. **The reduced-motion site must be a complete, beautiful experience, not a broken one** — it will be reviewed as a first-class design deliverable, not a switch. |
| Screen readers | Tested with NVDA/Firefox, VoiceOver/Safari, VoiceOver/iOS. The hero canvas is `aria-hidden` with an equivalent text alternative. Decorative motion is invisible to AT. Live regions only where genuinely needed. |
| Images | Meaningful alt text on every content image; empty alt on decoration. |
| Zoom & reflow | Usable at 400% zoom / 320 px width with no horizontal scroll and no content loss. |
| Text spacing | Survives the WCAG 1.4.12 text-spacing overrides without clipping. |
| Forms | Persistent visible labels, programmatic association, inline errors linked via `aria-describedby`, never colour alone to indicate state. |
| Targets | ≥ 44 × 44 px on touch. |
| Language | `lang` set; `prefers-contrast` and forced-colors modes verified. |

**Position:** the reduced-motion experience is the accessibility commitment that matters most on a site this animated, and it is the one most often botched. It gets its own review pass in Phase 5.

---

## 14. SEO goals

**Intent:** rank first for the author's name, be perfectly presentable when pasted into Slack/LinkedIn/X, and be machine-readable to recruiter tooling and AI agents.

| Area | Commitment |
| --- | --- |
| Rendering | Fully static HTML. All primary content present without JavaScript. A single-page cinematic site fails SEO the instant content is client-rendered — so nothing is. |
| Metadata | Complete title/description via Next.js Metadata API. Unique per route. Canonical URL on every page. |
| Open Graph | `og:title`, `og:description`, `og:image` (1200 × 630, generated from the hero footage so the share card *is* the portrait), `og:type`, `og:url`, `og:site_name`, `og:locale`. |
| Twitter | `summary_large_image` with matching card metadata. |
| Structured data | JSON-LD: `Person` (with `jobTitle`, `knowsAbout`, `alumniOf`, `sameAs`), `WebSite`, `BreadcrumbList`, `ProfilePage`; `CreativeWork` per flagship project; `EducationalOccupationalCredential` per certificate. Validated against Rich Results. |
| Sitemap / robots | Generated at build. `robots.txt` permits AI crawlers deliberately — being cited by an assistant is a distribution channel for a personal brand. |
| Semantics | Heading hierarchy that reads as a document outline. Descriptive link text — never "click here" or a bare "→". |
| Assets | `og` images pre-generated at build, not runtime. Favicon set, `manifest.webmanifest`, `apple-touch-icon`. |
| Vitals | Core Web Vitals are a ranking input; §12's budgets are also the SEO plan. |

---

## 15. Responsive strategy

**Mobile-first**, with the hero as the one genuinely art-directed exception (its composition inverts between breakpoints rather than reflowing).

| Breakpoint | Width | Layout posture |
| --- | --- | --- |
| Small mobile | 320–389 | Single column, 20 px gutters. Absolute floor — must not break. |
| Mobile | 390–767 | Single column, 24 px gutters. Hero = poster + typography stacked. Overlay nav. |
| Tablet | 768–1023 | Single column, wider measure, 40 px gutters. Reduced hero sequence. 2-up project grid. |
| Laptop | 1024–1439 | Split hero (portrait column + type). Full sequence. Persistent nav pill. |
| Desktop | 1440–1919 | Reference design width. Maximum spatial generosity. |
| Large desktop | 1920–2559 | Content max-width holds at 1440–1600; surrounding space becomes deliberate darkness, not stretched layout. |
| Ultra-wide | 2560+ | Same. Hero portrait remains ≤ 720 CSS px (source limit). Vignette prevents the composition floating in a void. |

**Principles**
- Fluid type and space via `clamp()` between breakpoints — no jumps.
- Container queries for components that appear at multiple widths, so a card doesn't need to know the viewport.
- `dvh` units for mobile viewport height, so browser chrome doesn't cause jumps.
- Touch devices lose hover-dependent affordances entirely and gain equivalent always-visible ones. Nothing is hover-only.
- **Test matrix:** iPhone SE (smallest realistic), iPhone 15 Pro, Pixel 8, iPad Air portrait + landscape, 13" laptop, 27" 1440p, 34" ultra-wide. Safari/iOS specifically, because it will be where the hero breaks.

---

## 16. Future scalability

Built for v1 scope, architected so the following require no refactor:

| Extension | Prepared how |
| --- | --- |
| Add / reorder a project | All content lives in typed data modules (`content/*.ts`) with Zod-validated schemas. Adding an entry is a data edit; layout, SEO, and structured data derive automatically. |
| Deep case-study pages | `/work/[slug]` route reserved. The project schema already carries the fields a long-form page needs, unused for now. |
| Blog / writing | Route and IA slot reserved. Content layer is source-agnostic, so a future MDX or CMS source swaps in behind the same interface. |
| CMS migration | Content modules are consumed through a thin accessor layer, not imported directly by components. Swapping the source touches one file. |
| i18n | All user-facing strings live in content modules, none hardcoded in components. `next-intl` can be added without touching component code. |
| Light mode | Every colour is a semantic CSS custom property (`--surface-raised`, not `--gray-900`). A light theme is a token-set addition — though it remains an explicit non-goal. |
| New sections | Section components conform to a shared contract (id, spacing, scroll-reveal, landmark, nav registration). A new section is one component plus one registry entry. |
| Replacing the hero footage | The sequence component is parameterised by frame count, path pattern, and format. New footage is a config change plus re-running the encode script — which will be committed to the repo, not run ad hoc. |

---

## 17. Risks

| # | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| R1 | Hero asset cannot reach the perf budget without visible quality loss | **High** | Prototype both AVIF-sequence and video-scrub in Phase 4 and *measure* before committing. Poster-only path is a validated design, so there is a safe floor. |
| R2 | iOS Safari video `currentTime` scrubbing stutters | High | Feature-detect; fall back to the image sequence on iOS regardless of the desktop decision. |
| R3 | Crimson-on-black fails contrast at small sizes | Medium | Contrast is verified per-token in Phase 2, before any component is designed. Crimson is restricted to large text, glows, and non-text indicators — never small body copy. |
| R4 | Cinematic pacing costs recruiter conversion | Medium | The dual-speed model (§7). Measured directly via the scroll-depth and conversion metrics in §6. |
| R5 | Animation complexity erodes the 58 FPS floor | Medium | Transform/opacity only, strict `will-change` hygiene, a single shared rAF loop rather than per-component loops, per-section profiling gate in Phase 5. |
| R6 | Thin content undermines a premium shell | **High** | A premium frame around weak content looks worse than a plain frame. §18 is a hard gate: two genuine flagship case studies with real outcomes are required before Projects is built. |
| R7 | Scope creep across five phases | Medium | Non-goals are explicit (§5). Each phase requires sign-off before the next begins. |

---

## 18. Required content inputs — blocking for Phase 5

The design and architecture phases (2–4) can proceed on this document alone. **Phase 5 cannot start without the following.** Please supply as plain text, a doc, or a filled-in copy of this list — I'll structure it.

**Identity**
- Full name; how you want it displayed (the hero sets it in display type)
- Current title / role, and years of professional experience
- Location and work preference (remote / hybrid / relocation)
- One-line positioning statement — or raw material and I'll draft three options
- Pronunciation guide, if useful

**About (Act II)**
- 2–3 short paragraphs of raw material: what you build, why, what you're unreasonably good at, what you're chasing next. Rough notes are fine and often better.

**Projects (highest priority — this is the conversion surface)**
For **each of 2–3 flagships**:
- Name, one-line description, your role, timeframe, team size
- The problem, and the constraint that made it hard
- Key technical decisions and the trade-offs behind them
- **Outcome, with a number if one exists**
- Stack
- Live URL, repo URL
- Screenshots / recordings at the highest resolution available

For **4–8 secondary projects**: name, one line, stack, links.

**Skills**
- Grouped by real depth of use, not a flat list. Suggested tiers: *Daily* / *Production* / *Familiar*.

**Trajectory (Journey + Experience + Timeline + Certificates)**
- Each role: company, title, dates, location, 2–3 achievement bullets (numbers where true)
- Education
- Certificates: name, issuer, date, credential URL
- Optional: one sentence on what changed you at each stage — this is what makes a timeline a story rather than a table

**Contact**
- Email; GitHub, LinkedIn, X/Twitter, others
- Current resume PDF (or the source, and I'll handle export)
- Availability status you want stated

**Domain & meta**
- Final domain (needed for canonicals, OG URLs, sitemap)
- Analytics preference (I recommend Vercel Analytics or Plausible — both cookieless, no banner)

**Assets**
- Any additional photography in the same lighting setup as the hero footage — the visual language will be much stronger if About and Contact can draw from the same shoot.

---

## 19. Phase gate

**Deliverable:** this document.
**Requested:** approval, or specific changes.

Three items I'd particularly like a ruling on, since they are departures from the brief:

1. **§8.1 — Merging Journey + Experience + Timeline into one "Trajectory" section**, with Certificates as nodes on its spine. Removes redundancy that would read as padding.
2. **§8.2 — Projects before Skills.** Evidence before claims.
3. **§12 — Deferring the hero encode decision (AVIF sequence vs. video scrub) to Phase 4**, to be settled by measurement rather than assumption.

On approval, Phase 2 delivers the full design system: colour tokens sampled directly from the hero frames with measured contrast ratios, the type scale, the 8 px spacing system, elevation and glass rules, the glow system, and complete component specifications with every state.
