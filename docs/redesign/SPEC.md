# preflopapp.com rebuild: the spec

The contract for the rebuild of the Preflop marketing site. Written 2026-10-28
from the audit, the technique research and the exemplar teardowns in this
folder, for a builder session that has not seen how it was made. Stan (the
owner) decides anything this file leaves open (§12) and merges every PR.

---

## 0. How to read this

**Order of authority.** (1) Stan's latest word. (2) `facts.json` and
`docs/app-handoff/FACTS.md`: what is true about the app. (3) This spec.
(4) `.claude/rules/*.md`. (5) The exemplars, which are inspiration only.

**Words.** *Must* is a contract and has an acceptance check. A number is the
target: change it only with a measured reason, and give that reason in the PR.
"Drawn" means rebuilt in HTML/CSS. "Captured" means a real app screenshot.

**Evidence references** (so you can check why):
- `ISSUES:DEMO-01` is that heading in `docs/redesign/audit/ISSUES.md`.
  `METRICS` is `audit/METRICS.md`. Screenshots are in `audit/img/`.
- `R§1.4` is that section of `docs/redesign/research-technique.md`. Its tags:
  [S] the page was read, [SR] a search summary only, [B] the author's own
  knowledge or inference.
- `X:flighty` is `docs/redesign/exemplars/flighty.md`. `S-apps#2` is ranked
  pattern 2 in `SUMMARY-apps.md` (likewise `S-saas`, `S-niche`).
- `MD:` is `docs/app-handoff/motion-and-design.md`. `FACTS#18` is row 18 of the
  claims table in `docs/app-handoff/FACTS.md`.

---

## 1. Concept

**The site is a hand of Preflop.** It feels like the app: near-black violet
surfaces, one amber, Hanken Grotesk, flat panels with a single hairline, and
the action colours (green raise, blue call, red fold) used only for actions.
Nothing on the page moves until it has something to say, and what moves is the
product itself, never decoration. **The one signature moment is the app's own
answer reveal, rebuilt in the page** (`MD:` "Answer reveal"). You tap Raise on a
real hand from the app. Your button rings. Every button fills, from the left,
to how often the chart plays it. The answer card rises with your two cards, the
grade (Correct, Mixed or Wrong) and the app's own explanation, and a Chart
button opens the 13 × 13 chart with your hand ringed. Everything below the
hero is that moment at a larger scale: the mix, the reason and the chart; the
spots it covers; the real screens; what is free and what is Pro. Each part ends
on the same amber button.

**The first ten seconds.**
- *On an iPhone* (most beta sign-ups): the headline paints at once, the
  full-width **Join the beta** button sits under the thumb with "Free on
  TestFlight" beneath it, and the top of a dealt table shows below that, so
  the page plainly continues. One flick brings the whole table into view, and
  one tap answers it.
- *On a computer:* the headline, the button with a QR code to scan with an
  iPhone, and a playable phone beside them, already dealt, all in the first
  screen.

---

## 2. Design principles (ranked)

| # | Principle | The rule it implies |
|---|---|---|
| 1 | **The product is the proof.** | Every picture is the app's own data (spots, charts, explanations, counts) or a real capture. Anything drawn carries a caption that says so. No invented numbers, quotes, logos or ratings (R§4.3, `S-niche` "Proof row"). |
| 2 | **Content first, motion second.** | Headings, body text, prices and buttons never wait for, depend on, or take part in an animation. JS adds a hidden start state only when it is sure it can reveal it (§4.7). No-JS, blocked JS and Reduce Motion each render the complete page (R§2.1–2.2, `ISSUES:FOCUS-01`). |
| 3 | **One signature, few effects.** | One interactive moment (the reveal) and a short, named list of motion patterns. Nothing loops. No pinning, no scrubbing, no parallax, no marquee (R takeaway 14, `ISSUES` "Structural problems" 5, METRICS "Always-on work"). |
| 4 | **One goal, one button.** | "Join the beta" in one style, at the end of each persuasion beat, plus a persistent nav button. One label everywhere, from one config constant (R§4.2, `X:gtowizard` "five CTA verbs"). |
| 5 | **Phone first, measured.** | Each section is designed at 390 px first. Wider screens get more columns, never more effects. Every section has a height budget (§4.3). |
| 6 | **Fit the screen.** | On a computer the hero fits the first screen. No fixed or sticky overlay other than the nav. Nothing covers what it describes (`ISSUES:STORY-02`, `X:opal` defects). |
| 7 | **Robust over clever.** | Use only techniques the research marks safe on iOS: no sticky stages, no `backdrop-filter`, no `filter: blur`, `svh` (never `vh` or `dvh`) for any viewport-sized box, transform and opacity only, no scroll handlers that write styles (R§1.1–1.3, R§3.2–3.3, `ISSUES` "Not testable here"). |

---

## 3. Trade-offs made on purpose

1. **No pinned story** (§4.1). It loses a desktop scroll "wow". It gains about
   4 screens of length, removes `STORY-01` to `STORY-07` and `RESIZE-01` at the
   root, and avoids the iOS pin problems GSAP's own docs describe (R§1.2). Of 23
   exemplars, Linear, Stripe, Vercel, Raycast, Things and all nine poker and
   learning sites pin nothing. None of the SaaS sites pins on mobile
   (`S-saas` findings, `S-niche` coverage).
2. **No GSAP.** 46 KB gzip goes (`ISSUES:PERF-02`, R§3.6). What remains (entrances,
   count-up, fills, the deal) is IntersectionObserver, CSS transitions and the
   Web Animations API. None of the six SaaS exemplars uses GSAP; their reveals
   are IntersectionObserver plus CSS or the Web Animations API (`S-saas`
   findings). The vendored files stay on disk until Phase 6 (§12, decision 2).
3. **Solid nav, no glass.** It loses the blurred-glass look and avoids WebKit
   re-rasterising a backdrop-filtered sticky layer over moving content
   (`ISSUES` "Not testable here" 3, R§3.3).
4. **The decorative motion goes.** Marquee, scrubbed statement, progress bar,
   floating pieces, bobbing cards, the hero glow and parallax are removed. The
   page may look less busy, and it should look less broken. What moves now is
   the product: the deal, the fill, the reveal and the chart.
5. **Five in-page calls to action plus the nav, down from eight** (`ISSUES:SPACE-02`).
   There is still one at the end of every beat (Flighty's pattern, `X:flighty`
   "CTAs").
6. **Screenshots go into one dark gallery.** Drawn components, which already use
   the app's current Hanken type and radii, carry the explanation everywhere
   else. The captures are dark-only and predate the Hanken refresh
   (`docs/app-handoff/screens-README.md`).
7. **The demo shows the first sentence of the app's explanation**, so the answer
   card fits a phone-sized screen. The full text is in the teaching section,
   for the same hand.
8. **The demo deals at the app's speed for a returning player** (×0.6 of Normal,
   `MD:` "The practice loop"), so a hand takes up to about 3.3 s to deal, and a
   tap skips the deal. Speed is honest to the app rather than a web flourish.
9. **The nav button stays visible next to the hero button on a phone**, so two
   amber buttons share the first screen (Chess.com does the same, `X:chess`).
   Hiding it until the hero button scrolls away (`S-apps#2`) would make it
   visible for a frame on every load and then fade out, because the scripts are
   deferred. That is an artifact.
10. **A stored theme choice still applies one frame late** (the existing
    `.claude/rules/next.md` note). A blocking theme script would fix it, but it
    would need an exception to the "no render-blocking script" check.
    Accepted; see §12.

---

## 4. Structural decisions

### 4.1 The pinned scroll story: removed, not repaired

The six-chapter sticky story, its "pieces" and its sticky screenshot stage are
deleted at every width. Its jobs are split between three normal-flow sections
with no `position: sticky` and no scroll-linked motion:

| Old chapter | Goes to |
|---|---|
| 01 A real spot | Hero demo (playable) and §6.5 Coverage |
| 02 Every answer comes with the reason | Hero demo's answer card and §6.4 How it teaches |
| 03 See the chart | Demo's Chart view and §6.4 (interactive chart) |
| 04 Leaks (Pro) / 05 History (Pro) | §6.6 The app (captured screens, tagged Pro) and §6.8 Pricing |
| 06 Short stacks | Demo hand 3 (KTs at 20bb), §6.4 tab 1, §6.5 Coverage |

**Rule:** apart from `.nav` (sticky) and `.skip-link` (absolute until
focused), no element on any page has a computed `position` of `sticky` or
`fixed`. The harness enforces this (§10).

*Why:* `ISSUES:STORY-01..07`, `RESIZE-01` and "Structural problems" 1–2. Pins
are fragile on iOS by GSAP's own account (R§1.2). NN/g advises against
important content inside scroll-controlled sections, especially on mobile
(R§1.4). No exemplar pins on mobile except Flighty, Opal and Apple, and the
teardown advises against copying Opal's (`X:opal` "What not to copy").

### 4.2 How the app is shown: three tiers, never mixed in one picture

| Tier | What | Where | Label |
|---|---|---|---|
| **Playable** | The demo phone: the app's practice screen drawn in HTML from the page tokens, three real spots from `docs/app-handoff/data/spots.json`, the app's grading rule and the app's own explanation text | Hero only | Caption under the phone: "Drawn from the app's practice screen, with its real spots, grading and explanations." The head reads "Try it". |
| **Drawn** | App components rebuilt at a legible size: answer card, mix rows, range chart (real data from `ranges.json`), streak and badge discs, widget, bankroll line | §6.4, §6.7 | One caption per drawn picture that could be taken for a capture: "Drawn from the app's chart data." / "Drawn from the widget's layout, not a screenshot." / "An example line, not real results." |
| **Captured** | Real screenshots from `assets/screens/app-*.webp` | §6.6 gallery only. Also the no-JS fallback in §6.4. | Section lede says they are from the beta build, with a sample player's history. Pro screens are tagged "Pro". |

Hard rules:
- **No drawn element is ever laid over a captured screenshot.** This removes the
  "pieces" problem (`ISSUES:STORY-02`).
- **Screenshots appear only on a forced-dark band** (§4.5), because they are
  dark-only (`ISSUES:STORY-08`).
- The demo's table uses the page tokens, not the app's felt palette (Stan,
  `.claude/rules/next.md`). Only its *layout* follows the app: a tall oval
  table, pods, a hero seat badge, decision slabs, and an answer card that rises
  over the table and repeats your two cards in its header, as in
  `assets/screens/app-answer.webp`.

### 4.3 Sections, order and page length

| # | id | Section | Job | Surface |
|---|---|---|---|---|
| — | | Nav (sticky) | brand, 3 links, persistent CTA | `--bg` |
| 1 | `#top` | Hero with the demo (`#try`) | say what it is, CTA A, let them play | `--bg` |
| 2 | | Proof strip | four true numbers | `--bg` (flush under the hero) |
| 3 | `#features` | How it teaches | the mix, the reason, the chart | `--panel` band |
| 4 | `#spots` | Every seat. Every depth. | coverage, unlock levels, spots per depth | `--bg` |
| 5 | `#app` | The app (gallery) + CTA C | real screens, Pro screens | **forced-dark** `--panel` band |
| 6 | `#progress` | Free for everyone | streak/levels/badges, widget, bankroll | `--bg` |
| 7 | `#pricing` | Pricing + CTA D | Free vs Pro | `--panel` band |
| 8 | `#faq` | FAQ | six objections | `--bg` |
| 9 | | Closing + CTA E | last ask | `--bg` (flush), panel card |
| — | | Footer | links, contact, theme toggle | `--bg` |

The id `#features` is kept for the teaching section so old `/#features` links
still land, and the nav labels it "How it works".

**Removed sections:** marquee, statement, story, the old explorer (rebuilt as
§6.4), the 60-badge grid and unlock pills (folded into §6.5 and §6.7), the
seven-card bento (replaced by §6.7), both old CTA bands (one survives as C),
the page progress bar.

**Length** is measured by the harness as `scrollHeight / innerHeight`:

| Viewport | Now (`ISSUES:STORY-03`) | **Target** | **Ceiling** | `#features` top | `#pricing` top |
|---|---|---|---|---|---|
| 390×844 | 19.3 screens | **≤ 10.5** (≈ 8,850 px) | 11.5 | ≤ 1.7 screens | ≤ 7.0 screens |
| 1440×900 | 13.7 | **≤ 8.0** (≈ 7,140 px) | 9.0 | ≤ 1.3 | ≤ 5.4 |
| 320×568 | n/a | ≤ 16 | 17 | — | — |
| 820×1180 | 11.0 | ≤ 7.0 | 8.0 | — | — |
| 1920×1080 | 13.1 | ≤ 7.5 | 8.5 | — | — |

Height budget per section, in px. If a section is over budget, cut content
before you shrink type or spacing:

| Section | 390×844 | 1440×900 |
|---|---|---|
| Nav + hero | ≤ 1,120 | ≤ 900 (must fit the first screen) |
| Proof strip | ≤ 260 | ≤ 280 |
| How it teaches | ≤ 1,250 | ≤ 860 |
| Coverage | ≤ 820 | ≤ 680 |
| The app + CTA C | ≤ 1,120 | ≤ 1,080 |
| Free for everyone | ≤ 1,280 | ≤ 820 |
| Pricing | ≤ 1,400 | ≤ 1,040 |
| FAQ (first item open) | ≤ 680 | ≤ 600 |
| Closing | ≤ 560 | ≤ 560 |
| Footer | ≤ 360 | ≤ 320 |

### 4.4 The CTA system

**Label: "Join the beta"**, on every button (current wording; Stan may change
it, §12). Under the hero and closing buttons, a note says what happens next
(R§4.2, NN/g "Get started" [S]): **"Free on TestFlight · iPhone, iOS 17 or
later"**.

| # | Place | Component | Phone (< 600 px) | Desktop |
|---|---|---|---|---|
| N | Nav, every page | `.btn--primary.btn--sm` | always visible | always visible |
| A | Hero | `.cta` cluster: `.btn--lg` + note + QR | full-width button | button + QR card |
| B | Demo score screen | `.btn--primary.btn--sm`, built by `demo.js` from config | in the phone | in the phone |
| C | End of the gallery band (§6.6) | `.cta-band`: title + `.btn--lg` + note | stacked, full-width button | one row |
| D | Free plan card | `.btn--primary`, full card width | ✓ | ✓ |
| E | Closing | `.cta` cluster, as A | full-width button | button + QR card |

- **One config constant.** `next/js/config.js` holds
  `{ mode: "testflight" | "coming-soon", testflightUrl, label: "Join the beta" }`.
  Every `a[data-cta]` (N, A, C, D, E) has that href and that text in the HTML,
  so no-JS works. B is built from config. In `coming-soon` mode every slot
  becomes the "Coming soon" badge and every `[data-cta-qr]` is hidden (existing
  `site.js` behaviour). `check-site.py` must fail an `a[data-cta]` whose text is
  not `label` (new check, §11 Phase 0).
- **QR**: `assets/qr/testflight.svg` (made by `scripts/make-qr.py` and checked
  against config) beside A and E only. It shows at
  `(min-width: 60rem) and (hover: hover) and (pointer: fine)`; today the query
  lacks `pointer: fine`, so a touch laptop showed it. Caption: "On a computer?
  Scan with your iPhone's camera." QR card: 104 px code, `--panel`, `--r-panel`,
  hairline.
- **Persistent CTA**: the sticky nav's button. **No bottom bar** on phones: the
  nav button already persists, and the teardowns show fixed bottom overlays
  covering content (`X:opal`, `S-saas#6` note).
- **Size**: `.btn--lg` is 52 px tall at 18 px/600. At < 600 px it is `width:
  100%`, as Chess.com and Brilliant do (`X:chess`, `X:brilliant`).
- **Primary button**: `--accent-fill` with `--accent-fill-ink`, plus the app's
  slab lip as `box-shadow: inset 0 -3px 0 var(--accent-edge)`, taken from the
  app's accentFillEdge (`MD:` colour table). It is a flat fill with no gradient,
  and gives the tactile "press me" key of `S-niche#4`.

### 4.5 Theme

- **Dark is the default.** Light follows `prefers-color-scheme`, plus the existing
  footer toggle (`localStorage` `preflop-theme`). Both are first-class and
  checked in every phase (R§4.6).
- **Fix `ISSUES:THEME-01`:** on toggle (and on load with a stored choice), set
  both `<meta name="theme-color">` contents to the chosen scheme's `--bg`
  (`#0e0f14` / `#f4f4f7`).
- **The screenshots are dark-only and light ones are parked.** The gallery
  section carries `data-theme="dark"`, which `tokens.css` already supports on
  any subtree, so it is the same dark band in both schemes. Like Flighty's
  white-to-dark flip, it reads as intended (`X:flighty` "Signature moment").
  Screenshots appear nowhere else (the §6.4 no-JS fallback also sits inside a
  forced-dark box).
- **Remove the hero glow in both schemes** (`ISSUES:HERO-02`, "Not testable here" 4).
  Both schemes then have the same hero.
- Drawn components (demo, chart, cards) follow the theme through tokens.

### 4.6 Visual system

Build on `next/css/tokens.css`. Colours stay as they are. These are the
changes, with the reason for each:

| Token | Now | New | Why |
|---|---|---|---|
| `--fs-display` | `clamp(2.5rem, 1.9rem + 3vw, 3.875rem)` (40→62) | `clamp(2.25rem, 1.85rem + 2.667vw, 4.25rem)`: 38 @320, 40 @390, 51.5 @820, 68 @1440, 76.5 @1920 | Exemplar heroes are 64–80 desktop and 36–48 phone (`S-saas` findings, `X:apple`); the type holds the first screen |
| `--fs-headline` | 32→56 | `clamp(1.875rem, 1.456rem + 1.714vw, 3rem)`: 30 @390, 37.4 @820, 48 @1440 | Exemplars use 40–48 for desktop h2 and 24–40 on phones; nine 56 px h2s lengthened the page |
| `--fs-title` | 24→36 | `clamp(1.25rem, 1.111rem + 0.571vw, 1.625rem)`: 20 @390, 22.5 @820, 26 @1440 | Card titles at 36 px competed with h2 |
| `--fs-lede` *(new)* | (ledes used `--fs-section`) | `clamp(1.125rem, 1.078rem + 0.19vw, 1.25rem)`: 18→20 | One size for every lede |
| `--fs-figure` *(new)* | (`.card__figure` used `--fs-title`) | `clamp(1.75rem, 1.4rem + 1.4vw, 2.5rem)`: 28 @390, 40 @1440 | Proof figures and prices |
| `--fs-statement` | 28→60 | **delete** | Statement removed |
| `--section-y` | `clamp(3.25rem, 2.25rem + 4.5vw, 6.5rem)` (52→104) | `clamp(3rem, 2rem + 3vw, 5rem)`: 48 @390, 57 @820, 75 @1440, 5rem max (80 px, 90 px at 1920's 18 px root) | `ISSUES:SPACE-02` and the length targets |
| `--lh-display` | 1.05 | 1.04 | 68 px display needs slightly less leading |
| `--accent-edge` *(new)* | — | dark `#b4841f`, light `#b87808` | The app's slab lip (`MD:` accentEdge / accentFillEdge) |
| `--act-tint` *(new, scoped to `.dbtn`)* | — | `color-mix(in srgb, var(--act) 40%, var(--well))` | Revealed buttons fill their full height while the label keeps ≥ 4.5:1. Computed with these tokens: `--text` on the 40% tints is 6.97 (raise), 8.11 (call) and 9.03 (fold) in dark, and 5.60, 5.27 and 5.08 in light. At 45% the light fold tint drops to 4.73, so don't go above 40%. Verify with axe. |
| Fonts | 400/500/600/700 | **400, 600, 700 only**; delete the 500 `@font-face`; the nav and footer brand become 600; 400 and 600 stay preloaded, 700 is not | The text whose width decides layout (nav, h1, lede, buttons) is all preloaded, which removes the font-swap shift (`METRICS` CLS load note), and the unused Medium request goes. Every 700 text (figures, card ranks, pot) sits in a box whose size doesn't depend on its glyphs, so a late swap shifts nothing. |

All motion tokens stay as they are. "The site moves like the app" is Stan's
earlier decision (`docs/website-overhaul-design.md` "Design system"), and the
values fall inside every evidence range (R§2.3).

**Type roles**

| Role | Size 320 / 390 / 820 / 1440 / 1920 | Wt | LH | Tracking | Used for |
|---|---|---|---|---|---|
| display | 38 / 40 / 51.5 / 68 / 76.5 | 600 | 1.04 | −0.035em | the h1, and nothing else |
| headline | 30 / 30 / 37.4 / 48 / 54 | 600 | 1.08 | −0.03em | section h2 |
| title | 20 / 20 / 22.5 / 26 / 29 | 600 | 1.15 | −0.02em | card h3, CTA band title, answer-card hand |
| figure | 28 / 28 / 33 / 40 / 45 | 700 | 1.05 | −0.04em, tabular | proof figures, prices |
| lede | 18 / 18 / 18.8 / 20 / 22.5 | 400 | 1.5 | 0 | hero line, section ledes (`--text-2`) |
| section | 18 / 18 / 19 / 22 / 24 | 600 | 1.3 | 0 | FAQ questions |
| body | 16 (18 at ≥ 1920 via the root) | 400 | 1.55 | 0 | |
| meta | 14 | 400 | 1.45 | 0 | captions, notes, legends |
| label | 12, uppercase | 600 | 1.3 | +0.14em | eyebrows (`--accent`), tags |

**Spacing.** Use the existing 8 px tokens, as follows:

| Use | < 1024 px | ≥ 1024 px |
|---|---|---|
| Section padding (each side) | `--section-y` | `--section-y` |
| Same-background neighbour | `.section--flush` (no top padding) | same |
| Eyebrow → h2 / h2 → lede | 8 / 16 | 8 / 16 |
| Section header → content | 32 | 48 |
| Card padding | 24 | 32 |
| Grid and card gaps | 16 | 24 |
| Button cluster gaps | 16 | 24 |
| Gutter | `--gutter` (16 @390, 24 @820, 32 @1440) | |
| Content max width | `--page-max` 72rem (1152 px; 1296 @1920; 1440 @2560 via root scaling) | |

**12-column grid** at ≥ 1024 px: 72rem wide, 24 px column gaps (74 px columns
at 1440). Below 1024 px layouts are 1 or 2 columns.

**Colour use**
- **Amber fill** (`--accent-fill`): primary buttons, the demo's hero seat
  badge, the active progress dot. Nothing else.
- **Amber line or text** (`--accent`): eyebrows, the hero's "flop.", the
  selected tab's outline, the hero cell's ring, links, the Pro plan border, the
  "Level N" pills.
- **Action colours** (`--act-*`): decision buttons, mix bars, chart cells,
  legends. Never decoration (`MD:` rules).
- **Grade colours** (`--good`, `--mid`): Correct and Mixed only. Wrong stays
  neutral (the settled design call).
- **`--celebration` violet**: not used on the site.
- **Surfaces**: `--bg` for the page, `--panel` for cards and bands, `--well` for
  tracks, chips, the phone bezel and empty chart cells. A card inside a
  `--panel` band uses `--bg`.
- **Never white text on a panel fill.** Text uses `--text`, `--text-2` and
  `--text-3`, each ≥ 4.5:1 on its background.

**Radii and elevation**
- **Radii**: `--r-panel` 14 (cards, bands' inner cards, answer card, plan cards,
  QR card), `--r-button` 10 (buttons, tabs, decision slabs), `--r-card` 6
  (playing cards, depth chips), `--r-pill` (tags, Level pills, segmented tab
  group). The phone frame is `38px × --s`. A gallery screenshot frame is
  `calc(var(--shot-w) * 0.1)`, the iPhone corner in proportion.
- **Elevation**: none by shadow. Order is `--bg` → `--panel` → `--well`, plus
  one 1 px `--border` hairline. The only `box-shadow`s are the primary button's
  inset lip, the demo's picked-button ring, and focus rings.

### 4.7 Motion system

**Global rules**
1. **Only `transform` and `opacity` animate.** Colour changes on hover are
   instant, with no `transition` on `color`, `background` or `box-shadow`.
2. **Nothing loops.** The page has zero infinite animations at any time (the
   harness counts them).
3. **No scroll-linked motion.** No scrub, no `animation-timeline`, no parallax,
   no scroll handler that writes styles. Triggers are IntersectionObserver,
   firing once.
4. **Never animated:** the h1, the hero line, any h2 or h3, paragraph and list
   text, prices, plan cards, FAQ questions, the nav and footer (no hide or show
   on scroll), CTAs (press and hover only, no entrance), section backgrounds,
   the scroll position (no JS scrolling; keep the default
   `scroll-behavior: auto`).
5. **Visible by default.** CSS never hides anything by itself. JS gives an
   element a hidden start state (`data-enter="pending"`, a zero `--f`, a dimmed
   chart) only when *all* of these hold:
   - `matchMedia('(prefers-reduced-motion: no-preference)')` matches;
   - `IntersectionObserver` exists;
   - the element's top is below the viewport bottom at that moment
     (`getBoundingClientRect().top > innerHeight`);
   - the observer that reveals it is registered in the same task.

   Safety net: reveal everything on `beforeprint` and on `pageshow` with
   `persisted`, and a 4 s timer reveals any pending element that is
   intersecting the viewport.
6. **Every pattern finishes within 600 ms of its trigger**, which is the
   harness's settle wait (§10). Two exceptions: the demo deal, which the
   visitor started and can skip, and the count-up (900 ms), which changes only
   the digits and never opacity.

**The patterns** (all values are existing tokens):

| Pattern | Applies to | Animation | Duration / easing | Travel / stagger | Trigger | Reduced motion | No JS |
|---|---|---|---|---|---|---|---|
| **enter** | Visuals only, marked `[data-enter]`: gallery shots, the §6.7 widget and bankroll visuals (card 1's visual uses its own timing, §6.7) | opacity 0→1, translateY(`--entrance-rise`)→0 | `--dur-entrance` 240 ms, `--ease-out` | 12 px; in a `[data-enter-group]`, `--entrance-step` 40 ms per item, capped at `--entrance-max-delay` 160 ms | IO, `rootMargin: 0px` (any part on screen), once. *Phase 1: the −10% bottom margin first written here left a hidden picture visible in the bottom tenth of the screen, which §10's pending probe fails.* | never hidden | visible |
| **stagger** | (part of enter) | — | — | as above | — | — | — |
| **hover** | links, tabs, buttons, chart cells (`hover: hover`) | colour swap (instant) or opacity 1→0.92 on primary | opacity: `--dur-snappy` 200 ms, `--ease-out` | none: **no lifts**; a hovered thing never moves under the pointer | `:hover` | same | same (CSS) |
| **press** | buttons, tabs, decision slabs | scale(`--press-scale` 0.97) + opacity 0.85 | `--dur-press` 240 ms, `--ease-press` | — | `:active` | none (tokens zeroed) | CSS |
| **scrub** | **not used** | — | — | — | — | — | — |
| **count** | proof figures 25,000 and 20 | textContent counts 0→N (rAF), en-US grouping, tabular digits | `--dur-count` 900 ms, `--ease-out` | — | IO, once, *only if below the fold at script start* (never reset a number already seen) | final number | final number |
| **fill** | demo decision slabs; mix rows (§6.4); depth bars (§6.5) | `transform: scaleX(0 → var(--f))`, `transform-origin: left` | slabs: `--dur-emphasis` 370 ms `--ease-emphasis` (the app's answer transition), all together; rows/bars: `--dur-settle` 300 ms `--ease-out`, 60 ms apart | — | the answer; a selection change; enter (bars) | final widths at once | final widths in CSS (`--f` set by class) |
| **deal** | demo hands 2 and 3; closing cards | demo: each seat's cards from translate(towards the pot), scale 0.5, opacity 0; then the hero cards flip `rotateY(90deg)`→0. Closing: two cards from translateY(24px), opacity 0, to their fan angle | seats `--dur-emphasis` 370 ms `--ease-emphasis`; flip `--dur-slide` 330 ms `--ease-slide` | demo timeline = the app's at ×0.6 (`MD:` practice loop): seats 66 ms apart, 150 ms pause, each prior action 300 ms apart, 210 ms before the decision. Closing: 80 ms apart. | Next hand (demo); enter (closing) | final state; demo prints the hand at once | demo shows hand 1 static; closing cards static |
| **reveal** | the demo answer | t=0: the picked slab gets a 2 px ring in the grade colour (`--good`, `--mid`, or `--text-3` for Wrong), held 250 ms, then a pseudo-element fades it over 300 ms to the `--text` ring under it; the slabs *fill*; the answer card rises translateY(16px)→0 + opacity. t=240 ms: grade line (opacity, 8 px rise). t=280 ms: explanation. Correct only: tick scale 0.6→1.12→1 | card `--dur-emphasis` `--ease-emphasis`; lines `--dur-entrance`; tick `--dur-emphasis` then `--dur-settle` | **no particle burst** (fewer effects) | tap or Enter on a slab | everything lands at once | — (demo needs JS) |
| **wash** | the §6.4 chart's first paint | cells opacity 0.25→1. **No scale.** It is never blank. | 240 ms `--ease-out`, delay (row+col) × 8 ms, total ≤ 432 ms | — | IO at 30% visible, once, *only if below the fold at script start* | none | static |
| **swap** | tab change (§6.4), Chart/Back toggle (demo) | the new content replaces the old instantly; the container goes opacity 0.6→1 | 200 ms `--ease-out` | — | click | instant | — |
| **disclosure** | FAQ answers, the nav menu | FAQ: answer opacity 0→1 (no travel) and the chevron rotates. Menu: the existing `nav-in` (opacity, −12 px) | 200 ms / `--dur-entrance` | — | toggle | instant | native `<details>` |
| **nudge** | the demo's decision slabs | translateY(−4px) and back | 2 × 200 ms `--ease-in-out`, 60 ms apart | once per page view | the demo ≥ 60% visible and no scroll, wheel, pointer, touch or key input for 3 s after load | never | — |

*Why these numbers:* they are the app's own tokens (`MD:` Motion). They sit
inside NN/g's ranges (100–400 ms, ease-out for arrivals, play once, never make
text wait) [S] (R§2.1, R§2.3). The exemplars use 0.3–0.7 s reveals
(`S-saas#4`, `S-niche#10`); we keep the shorter app values because only visuals
animate here, never text. Where this departs from exemplars: Raycast fades its
hero text in over 1 s, and we never animate text.

### 4.8 Caching, versioning and the zone's injected scripts

**`ISSUES:LIVE-02`.** Live `/next/css` and `/next/js` are served with
`max-age=14400` (4 h). `_headers` sets no such value, so this is inferred to
come from the zone's Browser Cache TTL overriding Pages' `max-age=0`. A
`max-age=0` header therefore would *not* fix it. The fix is URLs that change
when the file does:

1. **`scripts/stamp-assets.py`** (new). For every local asset reference, it
   appends or rewrites `?v=` + the first 8 hex characters of the SHA-256 of the
   file's bytes. That covers `src`, `srcset`, and `<link rel=stylesheet|preload|icon|apple-touch-icon>`
   on every HTML page except `s/index.html`, and every `url()` in
   `next/css/*.css`. It processes the CSS first and then the HTML, because
   stamping fonts changes `tokens.css`. Run it before every commit that changes
   an asset. A font preload and its `@font-face url()` must carry the same `?v`,
   or the font downloads twice; the script guarantees this because both come
   from the same file.
   **Except `/assets/suits/`** (Stan, 2026-10-29): `demo.js` builds those
   URLs unstamped, so a stamped copy in the HTML (the no-JS hand) made the
   browser download the same file twice. They are never stamped, and the
   checker fails a stamp on one; they are renamed when they change.
2. **`check-site.py`** must fail any such reference that has no stamp or a
   stale one (new check and test). Update `check_next_qr`'s regex to accept
   `?v=…`: as it stands, a stamped QR would silently skip the QR check.
3. **`_headers`**: add `Cache-Control: public, max-age=31536000, immutable` to
   `/next/css/*` and `/next/js/*` only. **Not `/next/*`**, which would also
   make the style guide's HTML immutable. `/assets/*` stays 7 days:
   JS-built URLs (suits in `demo.js`), the press downloads and the OG image are
   unstamped, so the rename-on-change rule still applies to them
   (`.claude/rules/cache-and-headers.md`).

**`ISSUES:LIVE-01`.** The zone injects Cloudflare Web Analytics and a Bot Fight
Mode "JS Detections" script. Only Stan can switch these off (§12). Until then:
- The site behaves the same either way. **Never loosen the CSP** for them: no
  `static.cloudflareinsights.com`, no `'unsafe-inline'`, no hashes. They stay
  blocked, and nothing on the page depends on them.
- Locally there must be zero console errors. In `--live` mode the harness lists
  the two known zone errors separately as "zone-injected (owner action)" and
  fails on any other.
- **404**: today it logs 7 errors because it carries `config.js` and `site.js`
  under the site-wide `script-src 'none'` header. Move the two `<script>` tags
  out of the `shared:head` block, to just after `<!-- /shared:head -->` on each
  text page, and leave them out of `404.html`. `check-site.py` must fail a
  `<script` in `404.html` (new check and test).

### 4.9 Performance budgets

| Metric | Budget | Enforced by |
|---|---|---|
| LCP element | `h1#hero-title`, in every run | harness (`largest-contentful-paint` observer) |
| LCP time | ≤ 1.0 s desktop, local; ≤ 2.0 s iPhone-emulated with 4× CPU and 1.6 Mbps, local (now 1.67 s, `METRICS`) | harness |
| CLS | ≤ 0.01 at load; ≤ 0.01 over a full scripted scroll; **0** from hovering in the chart | harness |
| TBT, throttled mobile load | ≤ 400 ms (now 650–1,000 ms) | harness |
| JS, gzip, union of every `/next/` page | **≤ 40 KB** (`JS_BUDGET`, now 150 KB) | `check-site.py` (update the constant and its test) |
| CSS, gzip, same union | **≤ 26 KB** (`CSS_BUDGET`, now 30 KB) | `check-site.py` |
| `index.html` as served | ≤ 40 KB raw, ≤ 9 KB gzip, ≤ 900 elements before JS (now 50 KB, 1,555 elements) | harness |
| Images over a full scroll | ≤ 300 KB at 390, ≤ 320 KB at 1440 | harness (transfer sizes) |
| Font files | 3 (400 and 600 preloaded, 700 not) | harness |
| Requests before `load` at 1440 | ≤ 20 | harness |
| Infinite animations | 0 | harness (`document.getAnimations()`) |
| Blur layers | 0 elements with `filter` or `backdrop-filter` other than `none` | harness |
| Video, WebGL, `<canvas>` | none | harness |
| Suit SVGs | ≤ 1.5 KB each, same shapes (now 5–7 KB; reduce coordinate precision) | harness |

### 4.10 Accessibility

- **Contrast**: every text ≥ 4.5:1 against what is actually behind it, including
  dimmed states, cell labels and button labels on `--act-tint`. Large text ≥ 3:1.
  UI boundaries (hairlines that carry meaning, the chart's hero ring, focus
  rings) ≥ 3:1. Run axe-core through Playwright in every phase (install it in a
  scratch directory, not the repo). Zero serious or critical violations.
  Disabled demo buttons in the no-JS state are exempt as disabled controls.
- **Focus**: a 2 px `--accent` outline, offset 2 px, on every interactive
  element in both schemes. Focus never lands on an element at opacity < 1
  (`ISSUES:FOCUS-01`): CTAs are never in an entrance. No focused element is
  hidden under the sticky nav (§6.1, scroll-margin rule).
- **Keyboard**:
  - Demo: Tab reaches the decision slabs and Enter or Space answers. Focus then
    moves to "Next hand" (with `preventScroll`), and after a deal to the first
    slab (with `preventScroll`). "Chart" and "Back to answer" are buttons. The
    `#demo-announce` live region speaks each prompt, the grade with its
    explanation, and a chart summary ("Chart: Opening from the button, 100bb.
    A5s: Raise 100%.").
  - Teaching section: a real `tablist` with roving tabindex. Arrow keys move,
    Home and End jump to the ends, and `aria-selected`, `aria-controls` and a
    `tabpanel` with `aria-labelledby` are set (`ISSUES:EXPL-05`). The chart grid
    is one Tab stop (`tabindex="0"`, `role="group"`, `aria-label` names the
    chart and the keys). Arrows move the selection; Home returns to the spot's
    hand. Hand and mix (not the explanation) are announced through
    `aria-live="polite"`.
  - Gallery: the track is a focusable scroller (`tabindex="0"`,
    `aria-label="App screens"`), and the arrow keys scroll it natively. The
    previous and next buttons are real buttons and are disabled at the ends.
- **Semantics**: one `h1`. One `h2` per section; the proof strip and closing use
  `aria-labelledby` or `aria-label`. `h3` for cards. Landmarks are `header` /
  `nav` / `main` / `footer`. Lists are `ul`/`ol`. The FAQ uses
  `details`/`summary`. Fact figures are text, not images.
- **Reduce Motion**: every pattern in §4.7 lands in its final state. The demo
  deals instantly. Nothing is ever pending.
- **No-JS is complete**: every section shows its content. The demo shows hand 1
  with disabled slabs and "Turn on JavaScript to play this demo." §6.4 shows the
  KTs answer card and the real chart capture. The gallery scrolls natively.
  Tabs, the theme toggle and the gallery buttons are hidden.
- **Target size**: ≥ 44 × 44 px for buttons, links in the nav and footer, tabs
  and gallery buttons. Chart cells are ≥ 24 px wherever the chart is ≥ 340 px
  wide. Below that (viewports under about 360 px) cells fall to about 21 px.
  This is accepted because picking a cell is supplementary: the spot's own hand
  is shown by default.

---

## 5. Shared components

Keep the existing class names where they exist. New ones are suggested; any
name works if it is used consistently.

| Component | Spec |
|---|---|
| **Button** `.btn` | Primary: `--accent-fill`, ink, lip (§4.4). Secondary: transparent with a hairline, `--text`. Sizes: `--sm` 44 px tall, 15–16 px; default 48; `--lg` 52 px, 18 px. Press and hover per §4.7. Below 360 px the nav's `--sm` gets 12 px side padding. |
| **CTA cluster** `.cta` | Button + note (14 px, `--text-2`) + optional QR card. Phone: column, full-width button. ≥ 60rem with a fine pointer: button and note in one column, the QR card to its right, 24 px gap. |
| **Phone frame** `.phone` | Existing `--s` scaling. Text floors: every text in `#demo` is ≥ 11 px computed, except `.pod__detail` and `.pot__meta` (≥ 10 px). Use `max(11px, calc(N px * var(--s)))`. Sizing per §6.2. |
| **Decision slab** `.dbtn` | App look: 48 px × `--s`, `--r-button`, label 16/600. Before the answer: `--act` fill with `--act-ink` (existing per-scheme inks). After: `--well`, plus a full-height `--act-tint` fill layer with `scaleX(--f)`, the label on top in `--text`, and the percentage under the label (13 px/700). Picked: a 2 px `--text` ring with the grade-colour flash on a pseudo-element (§4.7 reveal). Replaces today's 5 px bar. |
| **Answer card** `.answer` | §6.2. Shared look with §6.4's card. |
| **Range chart** `.cgrid` | `next/js/chart.js` (new, shared by the demo and §6.4). 13 × 13, 2 px gap, cell radius 2. Segments f / c / r in the app's order, width % set through the CSSOM (allowed under the CSP). **Hero cell**: a 2 px `--accent` inner ring ("amber outlined = you", `MD:` rules). **Selected cell**: a 2 px `--text` outline, offset 1 px (`ISSUES:EXPL-04`). Cell labels show only when cells are ≥ 30 px (container query on the grid); otherwise the hand's name is in the card. No transform on cells, ever. |
| **Mix row** `.mix__row` | Name, track, percentage (existing). The bar is the full `--act` colour on a `--well` track (text sits beside the bar, never on it, so no tint is needed). |
| **Playing card** `.pcard` | Existing: white face, two-colour deck. |
| **Shot** `.shot` | A captured screenshot: `width: var(--shot-w)`; 4 px `--well` bezel; radius `calc(var(--shot-w) * .1)`; `<img width="600" height="1304" loading="lazy" decoding="async">`. |
| **Tag** `.tag` | "Pro": amber outline pill, 12 px label (existing). |
| **Caption** `.figcap` | 14 px `--text-3`, at most 2 lines, directly under the picture it describes. |
| **Section header** `.section-header` | Eyebrow (label, `--accent`), h2 (headline), lede. Left-aligned at every width except §6.6 and §6.7 at ≥ 1024, which are centred. One alignment per section. |

---

## 6. The homepage, section by section

Widths are CSS px. "320" covers 320–359, "390" 360–599, "820" 600–1023, "1440"
1024–1919, "1920+" from 1920. The root font grows to 18 px at 1920 and to 20 px
at 2400 (existing rule), so every rem value scales with it.

### 6.1 Nav

**Purpose:** brand, three links, the persistent CTA.
**Content:** mark + "Preflop" (600, 18 px) · links "How it works" (`/#features`),
"Pricing" (`/#pricing`), "FAQ" (`/#faq` on the homepage, `/faq/` on text pages)
· `Join the beta` (CTA N) · menu toggle (narrow, JS only).

| | 320 | 390 | 820 | 1440 | 1920+ |
|---|---|---|---|---|---|
| Height | 64 | 64 | 64 | 64 | 72 (rem) |
| Layout | brand · CTA · toggle | same | brand · links · CTA | same | same |
| Links | in the menu | in the menu | inline (container ≥ 40rem) | inline | inline |

- **Solid `--bg` background** and a hairline bottom border. Delete the
  `backdrop-filter` and `color-mix` block.
- **Fix `ISSUES:NAV-01`**: delete `scroll-padding-top` on `html`. Add
  `scroll-margin-top: calc(var(--nav-h) + var(--space-2))` to
  `main [id], main a[href], main button, main summary, main [tabindex]`. Every
  scripted focus inside the nav uses `focus({ preventScroll: true })`.
- **iOS menu**: while the menu is open, set `overflow: hidden` on `html`, and
  `touch-action: none` on the open bar and the scrim, which together cover the
  screen, so no swipe pans the page and taps still work. **Not on `body`**:
  with `html` hidden too, `body` becomes the sticky nav's scroll container and
  the open nav leaves the screen (found by the menu probe in Phase 0; Stan
  approved the change, 2026-10-29). The scrim's height becomes `100lvh`, so it
  covers the screen with the toolbar collapsed too. The menu keeps inert, the
  focus trap and Escape (all pass today).
- **`ISSUES:NAV-02`**: `site.js` sets `aria-current="page"` on the link whose
  path matches. Style it with `--text` plus a 2 px underline. It is done in JS
  because the shared header must stay identical across pages.
- **Motion**: the menu's `nav-in` only.
- **No JS**: wide shows links inline; narrow shows brand + CTA (existing).
- **Accept**:
  - no horizontal overflow at 320;
  - opening and closing the menu at scroll 3000 (390) changes `scrollY` by ≤ 2 px;
  - Shift+Tab into the nav from mid-page (1440) changes `scrollY` by ≤ 2 px;
  - each nav link lands its section's h2 between the nav's bottom + 8 px and 40% of the viewport height;
  - on `/faq/` the FAQ link has `aria-current="page"`.

### 6.2 Hero and the demo (`#top`, `#try`)

**Purpose:** say what it is, offer CTA A, let them play.

**Copy** (keep the h1, Stan's decision in `website-overhaul-design.md`):
- h1: `Know your play before the <span class="hero__accent">flop.</span>`
- Lede: "Play three real hands, then see what the chart does and why."
- CTA A: "Join the beta" · note: "Free on TestFlight · iPhone, iOS 17 or later"
  · QR caption: "On a computer? Scan with your iPhone's camera."
- Under the phone: progress dots, a status line ("Hand 1 of 3 · 100bb ·
  6-max"), and the caption "Drawn from the app's practice screen, with its real
  spots, grading and explanations."

**The three hands** are generated into `next/js/app-data.js` by
`scripts/gen-app-data.py` from `docs/app-handoff/data/spots.json`. They are
the three spots that also have a chart in `ranges.json`, which replace today's
K5s, AQo and AJo:

| # | Spot id | Hero | Before hero acts | Slabs | Mix | Situation title |
|---|---|---|---|---|---|---|
| 1 | `gen-rfi-6max-btn-A5s` | BTN, A♥5♥, 100bb | UTG, HJ, CO fold; pot 1.5bb | Fold · Raise | Raise 100 | Opening |
| 2 | `gen-vsopen-6max-bb-vs-btn-J8s` | BB, J♠8♠, 100bb | UTG, HJ, CO fold; BTN raises to 3; SB folds; pot 4.5bb | Fold · Call · 3-Bet | 1 / 39 / 60 | Facing an open |
| 3 | `gen-vsallin-6max-20bb-co-vs-bb-rejam-KTs` | CO, K♠T♠, 20bb | UTG, HJ fold; CO (you) opens to 2; BTN, SB fold; BB all-in 20; pot 22.5bb | Fold · Call | 33 / 67 | Facing an all-in |

- **Prompts**: "UTG, HJ and CO fold. Your move." / "BTN raises to 3bb. SB folds.
  Your move." / "You open to 2bb. BB moves all-in for 20bb. Your move."
- **Seat order around the table**, clockwise from the top, with the hero at the
  bottom (`data-i` 3), matching `app-practice.webp`: with
  `L = [utg, hj, co, btn, sb, bb]` and the hero at index `h`, the order is
  `[L[(h+3)%6], L[(h+4)%6], L[(h+5)%6], L[h], L[(h+1)%6], L[(h+2)%6]]`.
  For hero BTN this gives top UTG, right HJ/CO, left SB/BB.
- **Grading**: the existing `demo.js` rule. Correct is the top action. Mixed is
  within 10 points of the top, or any action played ≥ 25%. Wrong is the rest.
  The headline reads "Mixed — the chart plays both" (or "all three"), as in the
  app (`FACTS#17-18`). Outcomes: A5s Raise is Correct and Fold is Wrong. J8s
  3-Bet is Correct, Call is Mixed and Fold is Wrong. KTs Call is Correct and
  Fold is Mixed.
- **Explanation shown**: the first sentence (up to the first ". ") of
  `correctSummary` for Correct and Mixed, and of `mistakeSummaries[picked]` for
  Wrong, falling back to `correctSummary`. If Stan says the app shows something
  else for Mixed, follow the app.

**Answer card** (DEMO-01 fix, modelled on `app-answer.webp`). It is anchored
above the decision slabs, spans the screen's inner width, and overlays the
table, as in the app. Inside, top to bottom:
- two mini cards (28×40 × `--s`) and the hand title, "A5s from the button" /
  "J8s from the big blind" / "KTs from the cutoff" (16/600). The app's
  screenshots show "from the button" and "from the cutoff"; the blind wording is
  inferred. Under it the context: "Folded to you · 100bb · 6-max" / "vs a 3bb
  BTN open · 100bb · 6-max" / "vs a BB jam · 20bb · 6-max" (12 px `--text-2`);
- the grade: a tick in a `--good` circle for Correct, a tick in `--mid` for
  Mixed, nothing for Wrong, then the grade text (20/600);
- the explanation (13.5 px/1.45 `--text`);
- a row of `Chart` (secondary, amber hairline, as in the app) and `Next hand`
  (primary). On hand 3 the second button reads "See your score".

The card's border: 2 px `--good` (Correct), 2 px `--mid` (Mixed), 1 px
`--border` (Wrong: neutral). Its background is `--panel`, max-height is the
table area, and it never scrolls internally (the first-sentence rule
guarantees the fit; check at 320).

**Chart view.** `Chart` swaps (§4.7 *swap*) the table area for that spot's
13×13 grid, drawn by `chart.js` from `app-data.js`, with the hero cell ringed,
no cell labels, a title (the chart's title and sub) and a legend. The button
becomes "Back to answer". Cells are not interactive here.

**Score screen** (CTA B): "N / 3" + label "Correct or mixed" + the existing
title and copy (which says "25,000+", checked by `check_js_claims`) +
`Join the beta` (from config) + `Play again`.

**Removed from the hero:** the floating cards and the "Correct" pill
(`ISSUES:DEMO-02`), the glow, the pointer tilt, parallax.

**Layout**

| | 320×568 | 390×844 | 820×1180 | 1440×900 | 1920×1080 / 2560×1440 |
|---|---|---|---|---|---|
| Grid | one column: copy, then the phone | same | 2 cols: copy `minmax(0,1fr)`, phone `auto`, gap 48, `align-items: center` (from 768) | 12 cols: copy cols 1–6, phone cols 8–12 `justify-self: end` | same as 1440 |
| Padding top / bottom | 24 / 48 | 24 / 48 | `clamp(1.5rem, 4svh, 3rem)` | same | same |
| h1 (measured: 2 lines at every width) | 38 px | 40 px | 51.5 px, `max-width: 11em` | 68 px | 76.5 / 85 px |
| CTA | full width, 52 px | full width | auto width | auto width + QR | + QR |
| Phone width | 100% of content (288) | 100% (358) | `402px × 0.8` | `402px × 1` (`--s` 0.9 at height ≤ 820, 0.8 at ≤ 740) | `--s` 1.125 at `(min-width:120rem) and (min-height:1000px)`; 1.25 at `(min-width:150rem) and (min-height:1300px)` |
| Phone height | `clamp(27.5rem, calc(100svh - var(--nav-h) - 2rem), 37.5rem)` → 440 here | same → 600 (in emulation; ≈ 568 on a real iPhone) | `608px × --s` | `608px × --s` | `608px × --s` |
| Table area | stage fills the screen's free height (flex), seats in %: a tall oval like the app | same | fixed stage `374×435 × --s` (existing) | same | same |
| `--s` (type, pods) | 0.75 | 0.85 | 0.8 | 1 | 1.125 / 1.25 |

`--s` steps on phones (viewport width): ≤ 353 px → 0.75 (today 0.68/0.75; the
text floors make 0.68 unnecessary); 354–373 → 0.8; 374–393 → 0.85; 394–426 →
0.9; 427–767 → 1. On phones the phone's *width* is 100% of the content box
whatever `--s` is; `--s` only sizes type, pods, chips and cards.

- **Landscape phones**, `(orientation: landscape) and (max-height: 500px)`
  (`ISSUES:HERO-01`): one column, copy first, the phone at `--s` 0.85 and its
  natural height. The visitor scrolls to play. Don't shrink the phone to fit
  (at 0.6 the text is unreadable).
- Copy positions at 390: h1 at y≈88, the CTA's bottom at y ≤ 330, the phone's
  top at y ≤ 390.

**Motion:** nothing at load. Hand 1 is already dealt in the HTML; `demo.js`
re-renders it identically and does **not** re-deal it. Then *reveal* on an
answer, *deal* on Next hand, *swap* for Chart, *nudge* once.

**No JS:** hand 1 static (regenerate it with `scripts/capture-demo-static.js`
after any change to `renderTable()` or hand 1), disabled slabs, the noscript
line. The QR shows on desktop.

**Accept:**
- At 1440×900 and 1280×720 the hero's bottom and the slabs' bottom are ≤ the
  viewport height.
- At 390×844 and 320×568 the h1, lede, CTA and note are fully in the first
  viewport, and ≥ 120 px of the phone is visible there.
- After answering each hand at 320, 390 and 1440, the answer card shows the
  hand title, and no text inside `#demo` computes below 11 px (10 px for pod
  details).
- Every combination of the three hands × each slab produces the grade above.
- With Reduce Motion, `document.getAnimations()` is empty during and after a
  hand.
- Chart view shows 169 cells with exactly one hero ring.
- The score CTA's href equals config.
- LCP is the h1.
- No element outside the phone overlaps it (harness overlap probe).

### 6.3 Proof strip

**Purpose:** four true numbers directly under the hero (`S-niche#6`,
`S-apps#10`, `X:apple` stat triplet). It has `aria-label="Preflop in numbers"`.

| Figure | Label |
|---|---|
| `<!-- fact:practiceSpotsShown -->25,000<!-- /fact -->+` (count) | practice spots, from every seat |
| 100 · 30 · 20 | bb stack depths, cash and tournament |
| `<!-- fact:dailyFreeHands -->20<!-- /fact -->` (count) | free hands a day, every day |
| No ads | no account and no tracking in the app |

Write "in the app": `ISSUES:LIVE-01` shows the zone injecting analytics into the
*website*, blocked by the CSP. The privacy policy is about the app.

**Layout:** no cards. A hairline grid: at < 1024, 2×2, with a vertical hairline
between the columns and a horizontal one between the rows; at ≥ 1024, four
columns with vertical hairlines. Cell padding is 16/12 on phones and 24 at
≥ 1024. Figure: `--fs-figure` 700 tabular, on **one line, always**. Measured:
"100 · 30 · 20bb" is 171 px at 28 px and overflows a 155 px cell at 390, which
is why the unit moved into the label. Below 360 px the figure is 1.5rem (24 px)
so "100 · 30 · 20" fits a 120 px cell. Label: 14 px `--text-2`. The strip
directly follows the hero (`.section--flush`), with `--section-y` below it.
Phone height ≈ 200.

**Motion:** *count* on the two numbers (only when they start below the fold).
**No JS:** final numbers.
**Accept:** heights per §4.3; on a fresh load at 1440 the 25,000 figure never
shows a value other than 25,000 unless it started below the fold.

### 6.4 How it teaches (`#features`, panel band)

**Purpose:** the mix, the reason and the chart, at full size, on real data. It
replaces story chapters 2–3, the bento "mix" card and the old explorer.

**Copy:**
- Eyebrow "How it teaches" · h2 "Every answer, explained."
- Lede: "After each hand you see how often the chart takes every action with
  your cards, the reason in plain words, and the whole chart for the spot."

**Tabs** (`role=tablist`, a segmented pill group, one row at every width; each
tab has two lines, the hand at 16/600 over the situation at 12/400):
"KTs / 20bb jam" (selected by default) · "J8s / vs an open" · "A5s /
opening". These are the three charts in `app-data.js`. KTs is the default
because its chart is the one real capture we have (`app-jam-chart.webp`), so
the no-JS fallback matches what JS shows.

**Answer card** (`.teach__card`, `--bg` on the band, `--r-panel`, hairline):
- The hand (`--fs-title`), then the chart's title and sub from `app-data.js`
  ("Cutoff facing a big-blind re-jam · 20bb · 6-max · re-jam").
- Mix rows for the chart's actions (2 or 3).
- "Why" (label, `--accent`), then the **full** `correctSummary` of that spot's
  hand (16 px/1.55).
- Selecting another hand replaces the explanation with: "Every hand the app
  deals you comes with its own explanation. Pick the ringed hand to read this
  spot's."
- The explanation box's `min-height` is the measured height of the spot hand's
  explanation at the current width. JS measures it on tab change and on a
  resize (debounced 150 ms), and sets a custom property through the CSSOM. The
  card therefore never changes height while you hover or tap (`ISSUES:EXPL-02`).

**Chart:** `chart.js`. Legend (Fold / Call / 3-Bet or Raise, as the chart has)
and "s = suited, o = offsuit". Hint: "Hover or tap any hand to see its mix."
(`hover: hover`) or "Tap any hand to see its mix." Caption: "Drawn from the
app's chart data."

**Interaction** (`ISSUES:EXPL-02`):
- Mouse: `pointermove` selects a *preview*, only when `clientX`/`clientY` differ
  from the last recorded position, so a wheel scroll under a still pointer
  changes nothing. `pointerleave` returns to the pinned selection.
- Click or tap pins it. Arrow keys move the pinned selection; Home pins the
  spot's hand.
- Tab change: *swap*; selection resets to the spot hand.

| | 320 / 390 | 820 | 1440 | 1920+ |
|---|---|---|---|---|
| Order | header, tabs, chart, legend + hint, card | same | 2 cols: left (cols 1–5) header, tabs, card; right (cols 6–12) chart + legend, both `align-self: start` | same |
| Chart width | 100% (288 / 358); labels hidden | max 560, centred; labels 11 px | max 600; labels 12 px | max 36rem |
| Card | full width, below the chart (a tap never moves the chart) | max 560, centred | left column | left column |

**Motion:** *wash* (first paint, below the fold only), *fill* on mix rows (on
each selection), *swap* on tabs, *hover* on cells.

**No JS:** the tabs are hidden. The KTs card is static HTML (mix widths from
`.mix__bar--v33` and `--v67`) with its full explanation. The chart area shows
`assets/screens/app-jam-chart.webp` as a `.shot`, 280 px wide, inside a
`data-theme="dark"` box, captioned "The same chart in the app." When JS runs it
hides that figure before it can load (`loading="lazy"`).

**Accept:**
- At 1440 the left and right columns' bottoms differ by ≤ 120 px (`ISSUES:EXPL-01`).
- Hovering 20 random cells adds 0 to CLS and changes the card's height by 0 px.
- A wheel scroll across the chart with a still pointer leaves the selection
  unchanged.
- The hero cell's ring is amber and the selected ring is `--text`, and they can
  be told apart in a screenshot.
- The tabs pass the keyboard pattern in §4.10.
- The section height is within budget.

### 6.5 Every seat. Every depth. (`#spots`)

**Purpose:** coverage, without a marquee (`ISSUES:MARQ-01`): specific
examples instead of umbrella words (R§4.1, NN/g [S]).

**Copy:**
- Eyebrow "What you'll practise" · h2 "Every seat. Every depth."
- Lede: "Five situations at 6-max and 8-max tables, 100bb deep and at the 30bb
  and 20bb tournament depths. New situations open as you level up."

**List** (`ul.spots`; every row is true per `FACTS#9-15, #27`):

| Situation | Who | Depths | Unlocks |
|---|---|---|---|
| Opening | First in, from UTG to the button | 100 · 30 · 20 | Level 1 |
| Facing an open | Every seat that can face one, against every opener | 100 · 30 · 20 | Level 3 |
| Blind vs blind | Small blind first in; big blind facing a limp | 100 · 30 · 20 | Level 3 |
| Facing a 3-bet | After you open, from UTG to the small blind | 100 · 30 · 20 | Level 5 |
| Facing an all-in | Jams and re-jams | 30 · 20 | Level 6 |

Under the list: "Seats: UTG, UTG+1, LJ, HJ, CO, BTN, SB, BB (UTG+1 and LJ at
8-max)."

**Depth bars** (title "Practice spots by stack depth"): 100bb
`<!-- fact:spots100 -->6,431<!-- /fact -->`, 30bb
`<!-- fact:spots30 -->9,552<!-- /fact -->`, 20bb
`<!-- fact:spots20 -->9,496<!-- /fact -->`. Exact figures, never a "+" (rule
in `next.md`). Bar lengths are proportional to the largest (0.673 / 1 / 0.994),
drawn as `scaleX(var(--f))` on a `--well` track in `--accent`.

| | 320 / 390 | 820 | 1440 / 1920+ |
|---|---|---|---|
| List | each row: name (16/600) + Level pill on one line, "who" (14 `--text-2`) beneath, depth chips beside the Level pill; rows split by hairlines; ≈ 56–64 px per row | a 4-column table-like grid: situation · who · depths · level | 2 cols: left (1–5) header + depth bars; right (6–12) the list as a 4-column grid |
| Bars | full width, stacked, 3 rows | 3 columns | left column, stacked |

**Motion:** *fill* on the three bars (once, enter-triggered, 60 ms apart). The
rows are text and do not animate.
**No JS:** bars at their final length.
**Accept:**
- `check-site.py` passes (markers).
- No row wraps to more than 3 lines at 320.
- Height within budget.

### 6.6 The app (`#app`, forced-dark panel band) and CTA C

**Purpose:** prove it is a real iPhone app, show the Pro screens, and ask (C).

**Copy:**
- Eyebrow "The app" · h2 "This is the app."
- Lede: "Screens from the iPhone app's beta build, with a sample player's
  history. Dark is its default look."

**Track** (`ul.gallery__track`, horizontal scroll-snap, `scroll-snap-type: x
mandatory`, `scroll-padding-inline: var(--gutter)`, items `scroll-snap-align:
start`). The existing alt texts carry over:

| # | Image | Caption |
|---|---|---|
| 1 | `app-practice.webp` | A spot: the button faces a cutoff open, 100bb. |
| 2 | `app-answer.webp` | Your answer, graded and explained, with the mix on the buttons. |
| 3 | `app-chart.webp` | The chart for the spot, with your hand ringed. |
| 4 | `app-home.webp` | `Pro` Your accuracy, and the spot to fix next. |
| 5 | `app-history.webp` | `Pro` Every hand you've played, graded. |

| | 320 / 390 | 820 | 1440 | 1920+ |
|---|---|---|---|---|
| `--shot-w` | 220 px (shot ≈ 486 tall with bezel; ≈ 1.4 visible: the next one peeks) | 240 | 232 (5 × 232 + 4 × 24 + 32 end padding = 1,288 ≤ 1,296 available: all five fit, no scroll) | 14.5rem |
| Track | bleeds to both viewport edges; the first item aligns with the gutter | same | starts at the content's left edge and bleeds to the right edge | same |
| Prev/next | hidden (touch) | shown if it overflows and `(hover:hover)` | hidden when it doesn't overflow | — |

**CTA C** (inside the band, after the track): title "Play your first hand in a
minute." (`--fs-title`) · line "Join the beta on TestFlight. No account
needed." · `Join the beta`. On phones it stacks with a full-width button; at
≥ 768 it is one row (copy left, button right).

**Motion:** *enter* on the five figures as a group (40 ms step, 160 ms cap). No
hover effects on the shots.
**No JS:** the track scrolls natively, with a visible scrollbar on fine pointers
and no buttons.

**Accept:**
- In light mode the band and its shots look exactly as in dark (same pixels in
  the screenshot).
- No drawn element overlaps a shot.
- At 1440 all five shots are fully visible without scrolling.
- At 390 the second shot peeks by ≥ 80 px.
- Every image has width and height, and is lazy.

### 6.7 Free for everyone (`#progress`)

**Purpose:** habit features, compact. It replaces the 60-badge grid, the
unlock pills and the seven-card bento (`ISSUES:BENTO-01`, `BADGE-01`,
"Structural problems" 6).

**Copy:**
- Eyebrow "Free for everyone" · h2 "A reason to come back tomorrow."
- Lede: "Your streak, XP, levels and badges cost nothing, and neither do the
  Home Screen widget and the bankroll tracker."

**Three cards** (`article.perk`, h3 each):
1. **"Streak, levels and 60 badges"**: "A day counts with one hand. Each
   correct or mixed hand earns 15 XP, and new situations open as you level up.
   Badges for every seat and situation, from Bronze at 25 correct answers to
   Diamond at 1,000." (`FACTS#26-28`.) Visual: a streak row of 7 circles (5
   filled `--accent-fill`, today's ringed), and a badge row for "Facing an open"
   with 4 tier discs (bronze, silver, gold, diamond tokens). Motion, once on
   enter: the five filled circles go scale 0.6→1 and opacity 0→1 over
   `--dur-settle`, 40 ms apart. The discs do the same at the same time, 80 ms
   apart. Everything is done within 540 ms.
2. **"On your Home Screen"**: "A widget in three sizes shows your streak. The
   medium and large ones deal you a hand that opens straight into practice.
   Reminders only if you turn them on." (`FACTS#29-30`.) Visual: a small widget
   (flame + "7" + "day streak") and a medium widget (flame + "7 days", divider,
   two overlapping cards with the first tilted −6°, a "BTN" seat pill, "Facing
   an open", and Fold / 3-Bet stand-in buttons), from
   `docs/app-handoff/data/widget-layouts.json`. Don't invent the hands-left
   wording. Caption: "Drawn from the widget's layout, not a screenshot." Below
   360 px, show the medium widget only.
3. **"A bankroll tracker"**: "Log a session live or after the fact, cash or
   tournament, with buy-ins and rebuys. See where you win and how many buy-ins
   you have." (`FACTS#31`.) Visual: the existing line, drawn by a
   `--panel`-coloured cover sliding off it (transform), once. Caption: "An
   example line, not real results."

| | 320 / 390 | 820 | 1440 / 1920+ |
|---|---|---|---|
| Grid | 1 column, gap 16; card padding 24; visuals ≤ 120 px tall | 2 columns: card 1 spans both (text left, visual right); cards 2 and 3 side by side | 3 equal columns (4/4/4), padding 32, visuals aligned to the card bottom |

**Accept:**
- No empty grid cell at any width.
- The widget's two cards overlap, rather than sitting at opposite edges.
- Height within budget.
- Captions present.

### 6.8 Pricing (`#pricing`, panel band) and CTA D

**Copy:**
- Eyebrow "Pricing" · h2 "Free every day. Pro when you want more."
- Lede: "Play `<!-- fact:dailyFreeHands -->20<!-- /fact -->` hands a day, free
  for good. Pro takes the cap off and shows you what to work on."

| Free | Preflop Pro |
|---|---|
| Tier "Free" · "$0" · "No account, no card." | Tier "Preflop Pro" (amber) · `$<!-- fact:lifetime -->59.99<!-- /fact -->` + " once" · "or `$<!-- fact:monthly -->7.99<!-- /fact -->` a month" (drop "cancel any time", per the app's voice note in `MD:` Brand notes; see §12) |
| `<!-- fact:dailyFreeHands -->20<!-- /fact -->` hands every day | Everything in Free, plus: |
| The answer, the chart's mix and the reason after every hand | **Unlimited hands**, no daily cap |
| The full range chart after every hand | **Your stats and leaks**, by situation and seat |
| Streak, XP, levels and badges | **Practice Filters**: drill any spot |
| A Home Screen widget and reminders | **Every hand saved**, with filters |
| A bankroll tracker | **Your Home dashboard**: accuracy, its trend, and the spot to fix next |
| `Join the beta` (CTA D, full card width) | **A daily goal** you set yourself |
| | Status line (not a button): "Available in the app at launch." |

Both lists are true per `FACTS#3-4`. Keep them in line with the app repo's
`AppStorePlan.md` §4a (CLAUDE.md). Fine print below (14 px `--text-3`): "US
prices. The App Store shows your country's price before you buy, and every
purchase happens in the app. The free plan has no time limit." **Never** show
annual, a trial, or $39.99.

| | 320 / 390 | 820 / 1440 / 1920+ |
|---|---|---|
| Layout | stacked, Free first | 2 equal columns, cards stretch to the same height; Free's button and Pro's status line both sit at the bottom (`margin-top: auto`); 6 list items each, so the bottoms balance (`ISSUES:PRICE-01`) |

**Motion:** none. **Accept:** `check-site.py` passes; the two cards' heights are
equal at ≥ 768; no annual and no "trial".

### 6.9 FAQ (`#faq`)

**Copy:** eyebrow "FAQ" · h2 "Before you join." · "More answers in the
[full FAQ](/faq/)." Six `details`, the first one open:
1. **Is this gambling?** Existing answer.
2. **How do I join the beta?** "Tap Join the beta on your iPhone. If you don't
   have Apple's TestFlight app yet, the page sends you to the App Store for it
   first. Then accept the invite in TestFlight and install Preflop. It needs
   iOS 17 or later, and there is no iPad or Android version." *Add this
   question to `/faq/` too.*
3. **Where do the answers come from?** Existing answer (names no source).
4. **Why does it sometimes say "Mixed"?** Existing answer.
5. **What's free, and what does Pro add?** Existing "What exactly is free?"
   answer.
6. **Do I need an account?** Existing answer.

(The solver question stays on `/faq/` only.)

| | 320 / 390 / 820 | 1440 / 1920+ |
|---|---|---|
| Layout | aside above the list | aside cols 1–4 (not sticky), list cols 5–12 |

**Motion:** *disclosure*. **Accept:** height within budget; `#faq` anchor
lands correctly.

### 6.10 Closing and CTA E

**Copy:** h2 "Start with a hand." · line "Join the beta on TestFlight. Free,
with no account." · CTA E cluster (button, note, QR).
**Visual:** two large playing cards, A♥ and 5♥ (hand 1 of the demo), fanned at
−8° and +6°, overlapping by 30%, `aria-hidden`. **Delete** the old `play.webp`
phone.

| | 320 / 390 | 820 | 1440 / 1920+ |
|---|---|---|---|
| Panel | `--panel`, `--r-panel`, padding 32/24; copy then cards (cards 96×136, centred) | 2 cols: copy, cards (112×158) | 2 cols (copy cols 1–7, cards 8–12, 128×180), padding 64 |

**Motion:** *deal* on the cards, once. **No JS:** static fan.
**Accept:** height within budget; QR only with a fine pointer at ≥ 60rem.

### 6.11 Footer

Structure and copy unchanged (brand line, Product / Help / Legal, mailto in
`email_off` markers, the fine print, the theme toggle). The Product group gets
"How it works". At ≥ 360 px the three link groups sit in **3 columns** (today
2), so the footer is ≤ 360 px tall on a phone. **Accept:** height within
budget, every link ≥ 44 px tall.

---

## 7. Text pages, 404, /s/, style guide

**FAQ, Support, Press, Privacy, Terms** share the head, header and footer, plus
`pages.css`. Changes:
- The new nav labels (shared header). The scripts move out of `shared:head`
  (§4.8). The FAQ list styles move from `sections.css` into `components.css`,
  so `/faq/` gets its top rule (`ISSUES:FAQ-01`). `aria-current` comes through
  `site.js`.
- Add the "How do I join the beta?" question to `/faq/`.
- **Press** (`ISSUES:TEXT-01`): tiles are square (`aspect-ratio: 1; object-fit:
  contain`, a `--panel` background with 12% padding for every tile, including
  the OG card), and the grid is `minmax(11rem, 1fr)`, so captions fit on one
  line at 1440. Refreshing the screenshots is §12.
- **Privacy**: **no edits** to its markup or text without Stan. CSS in
  `pages.css` may change, and must be checked on this page at 390 and 1440 in
  both schemes. A table of contents is §12.
- No other content changes. `ISSUES:TEXT-02` (plain column) is accepted as it
  is: these pages are for reading.

**404:** shared head, header and footer; **no `<script>`** (§4.8). Without JS it
shows the nav (brand and CTA when narrow, links when wide) and the footer
without the theme toggle. **Accept:** 0 console errors locally; on live, only
the zone's.

**`/s/`** (shared hand): out of scope. Don't stamp it; leave its CSP alone.

**Style guide** `/next/styleguide/`: it stops loading GSAP and
`sections.css` in Phase 1, and its `.sg-*` rules move from `components.css` to
`next/css/styleguide.css`, loaded only there (≈ 5 KB off every page,
`METRICS` asset table). Phase 6 rebuilds it on the new components, or deletes
it if Stan says so (§12).

---

## 8. Audit checklist: every ID resolved

| ID | Resolution | Phase | Verified by |
|---|---|---|---|
| DEMO-01 verdict covers the hand; 8 px text | App-style answer card with the hand in its header; text floors | 2 | demo probe at 320/390/1440 + screenshot after each answer |
| DEMO-02 static "Correct" pill and cards | Floats deleted | 1 | screenshot 1440 |
| HERO-01 landscape buttons below the fold | Landscape short-height layout: stacked, phone at natural size | 2 | 844×390 pass |
| HERO-02 schemes differ | Glow removed in both | 1 | dark/light pair at 1440 |
| STORY-01…07 | Story removed (§4.1) | 1 (pin, pieces), 3 (section) | harness: no sticky or fixed except the nav; no double exposure |
| STORY-08 dark shots on a light page | Gallery forced dark; shots nowhere else | 4 | light pass at 390/1440 |
| STATEMENT-01 | Statement removed | 1 | — |
| MARQ-01 | Marquee removed; §6.5 instead | 1 | 0 infinite animations |
| EXPL-01 dangling inspector | New two-column layout, bottoms within 120 px | 3 | measure at 1440 |
| EXPL-02 hover on scroll; height changes | Pointer-moved filter; measured `min-height` | 3 | hover/wheel probe, CLS 0 |
| EXPL-03 chart blank mid-wash | Opacity 0.25→1, ≤ 432 ms, below the fold only | 3 | mid-scroll frames |
| EXPL-04 two identical rings | Hero ring amber, selected ring `--text` | 3 | screenshot |
| EXPL-05 tabs without semantics | Full tablist pattern | 3 | keyboard probe, axe |
| BENTO-01 hole in the grid; widget layout | Three-card grid; widget rebuilt | 4 | 768/820 screenshots |
| BADGE-01 orphan rows; half-filled discs | Grid removed; compact discs | 4 | — |
| SPACE-02 uneven gaps; 8 CTAs | `--section-y`, flush rule, 5 CTAs + nav | 1–5 | section heights vs budget |
| PRICE-01 empty area in the Free card | Balanced lists; status line | 5 | 1440 screenshot |
| FAQ-01 missing top rule on /faq/ | Rule moved to `components.css` | 0 | /faq/ screenshot |
| NAV-01 menu and focus scroll jumps | `scroll-margin` instead of `html` `scroll-padding`; `preventScroll` | 0 | menu and Shift+Tab probes (Δ ≤ 2 px) |
| NAV-02 no current page | `aria-current` from `site.js` | 0 | DOM check on /faq/ |
| FOCUS-01 CTAs focused mid-fade | CTAs and text never enter-animated | 1 | Tab probe: focused element opacity 1 |
| THEME-01 Safari bar colour | `theme-color` metas updated | 0 | probe reads the meta after toggling |
| RESIZE-01 scroll resets on resize | No `gsap.matchMedia`, no JS scroll writes | 1 | resize and rotate probes |
| RELOAD-01, ANCHOR-01, SCROLLUP-01, RM-01, NOJS-01 (all pass) | Keep passing | every phase | regression probes |
| TEXT-01 press tiles | Square tiles, wider minimum | 5 | 1440 light screenshot |
| TEXT-02 plain text pages | Accepted; privacy TOC is §12 | — | — |
| PERF-01 TBT and DOM size | ≤ 900 elements before JS; no GSAP; TBT ≤ 400 ms | 1–6 | throttled pass |
| PERF-02 GSAP weight; 20 loops; blur | GSAP gone; 0 loops; 0 blur layers | 1 | harness counts |
| LIVE-01 zone scripts; 404 errors | 404 without scripts; owner switches the zone features off; harness allowlist on live | 0 + owner | live pass |
| LIVE-02 stale CSS/JS after a deploy | Stamped URLs, immutable `/next/css` and `/next/js`, a checker | 0 | `check-site.py` + response headers on live after the merge |
| LIVE-03 www duplicate, style guide public | Owner: www→apex redirect rule (§12); style guide per §7 | owner / 6 | live curl |
| "Not testable here" 1 (iOS menu) | `overflow: hidden` on html, `touch-action: none` on the open bar and scrim (§6.1); scrim `100lvh` | 0 | menu probe + real device (§13) |
| 2 (iPad rotation) | = RESIZE-01 | 1 | rotate probe + device |
| 3 (blurred sticky nav) | Solid nav | 1 | — |
| 4 (glow, bobbing) | Removed | 1 | — |
| 5 (`overflow: clip`, iOS 15) | Nothing wider than the viewport remains (the glow is gone); keep `overflow-x: clip` only where a harness frame proves it is needed | 1 | overflow probe |
| 6 (pins in `svh`) | No pins; `svh` only for the phone's height on phones | 2 | device |
| 7 (lazy stage images) | No stage | 3 | — |
| 8 (newer CSS) | `linear()` falls back to `ease` (harmless); `text-wrap` is progressive; container queries need iOS 16+ (accepted) | — | — |
| 9 (scrub on touch) | No scrub | 1 | — |
| 10 (live CDN) | = LIVE-02 | 0 | — |

---

## 9. Hard constraints (never violate)

**Repo and process**
- Never push to `main`. One PR open at a time. Only Stan merges, because a merge
  deploys.
- Work on a branch, in a `git worktree`. Commit only your own files; never
  `git add -A` blind.
- Follow `CLAUDE.md`.

**Stack**
- Static HTML, CSS and JS, with **no build step**. Generators
  (`gen-app-data.py`, `stamp-assets.py`, `make-qr.py`) run before commit, and
  their output is committed.
- **CSP:** `script-src 'self'` and `style-src 'self'`. No inline `<script>`, no
  `style=` attribute (in HTML or in any `innerHTML` string), and no `on*=`
  attributes. JS sets styles through the CSSOM only. No external requests of
  any kind (fonts, scripts, images, QR all self-hosted).
- If GSAP is ever needed again, use only the vendored copy at
  `/assets/vendor/gsap/`, never a CDN. This spec uses none.

**Drawing and motion**
- Animate only `transform` and `opacity`.
- **No gradients, no dashed or dotted lines** (`check-site.py` enforces this).
- Never white text on a panel fill.

**Numbers and claims**
- Prices, the free-tier numbers and spot counts come from `facts.json` through
  `<!-- fact:key -->` markers. `python3 scripts/check-site.py .` and
  `python3 -m unittest discover -s scripts -p 'test_*.py'` must pass.
- Advertise only **$7.99/month and $59.99 lifetime**. No annual plan, no $39.99,
  no trial. **20 free hands a day.**
- Grades are **Correct / Mixed / Wrong**. Spots are **"25,000+"** at
  **100/30/20bb**; per-depth figures are exact and have no "+".
- No "solver" or "GTO" claims, and no content-source claims.
- No invented ratings, testimonials, logos, user counts or press. Levels are
  numbers only.

**Pictures**
- App screenshots are dark-only and predate the Hanken refresh. They are
  illustrations and are captioned as beta-build screens. Anything drawn is
  captioned as drawn.
- The app is iPhone only, iOS 17+, in an external TestFlight beta and not yet on
  the App Store. CTAs say "Join the beta". Pro is "Available in the app at
  launch".

**Pages**
- The privacy policy is not edited without Stan.
- The shared `head`, `header` and `footer` blocks stay identical across the
  text pages (the checker enforces this).
- Every `mailto:` sits inside `email_off` markers.
- `.well-known` deploys untouched.
- The LCP element stays the `<h1>`.

---

## 10. Verification method

The previous build passed full-page screenshots and failed in use: its defects
showed **only mid-scroll and after resize** (`ISSUES` "How it was tested").
Every phase is verified the same way, with the harness committed in Phase 0.

### 10.1 The harness: `scripts/scroll-pass.js`

Node with the global Playwright, Chromium only:
`NODE_PATH=$(npm root -g) node scripts/scroll-pass.js [options]`. Serve the
site with `python3 -m http.server 8123` from the repo root (it doesn't apply
`_headers`, but the pages' meta CSP still applies).

**Options**
- `--base` (default `http://localhost:8123`); `--live` = `https://preflopapp.com`.
- `--pages` (default `/`); `--viewports` (default: the standard set below).
- `--schemes dark,light`; `--modes default,reduced,nojs,blockedjs,iphone`.
- `--probes all|name,...`; `--out` (default `$TMPDIR/scroll-pass/<stamp>`;
  **never inside the repo**).
- `--budgets scripts/scroll-pass.budgets.json` (committed: the §4.3 and §4.9
  numbers).

**Standard viewports:** 320×568, 360×740, 390×844, 430×932, 600×960, 768×1024,
820×1180, 1024×768, 1280×720, 1440×900, 1920×1080, 2560×1440 and 844×390.

**Context setup per mode.** Set `colorScheme` always (headless defaults to
light, `next.md`). Then:
- `reduced`: `reducedMotion: 'reduce'`.
- `nojs`: `javaScriptEnabled: false`.
- `blockedjs`: route-abort `**/next/js/**`.
- `iphone`: the Playwright iPhone descriptor (UA, DPR 3, `isMobile`, `hasTouch`)
  in Chromium, plus CDP `Emulation.setCPUThrottlingRate {rate: 4}` and
  `Network.emulateNetworkConditions` (1.6 Mbps down, 750 kbps up, 150 ms RTT).

**Each run**
1. Inject `PerformanceObserver`s (layout-shift without recent input, LCP,
   longtask) before any script, and record console messages and failed
   requests.
2. Load, await `document.fonts.ready`, then wait 500 ms.
3. Scroll in steps of **0.4 × viewport height**: mouse-wheel on desktop, CDP
   `Input.synthesizeScrollGesture` on touch. **Wait 600 ms after each step**.
4. Take a **viewport screenshot** (never full-page), named
   `{page}-{w}x{h}-{scheme}-{mode}-{step}-y{scrollY}.png`.
5. At each step, run the probes:
   - **overflow**: `scrollWidth > innerWidth`, or any element whose right edge
     is past the viewport + 1 px, outside `[data-scroller]`. *Fail.*
   - **position**: any element with computed `position` sticky or fixed other
     than `.nav` and `.skip-link`. *Fail.*
   - **double exposure**: two visible `<img>` (opacity > 0.05) overlapping by
     > 50% of the smaller. *Fail.*
   - **half-faded**: an element intersecting the viewport with opacity strictly
     between 0.05 and 0.9, other than `:disabled` controls and elements marked
     `[data-dim]` (folded seats). The 0.9 ceiling leaves room for a primary
     button's 0.92 hover under a parked pointer. *Fail on default runs.*
   - **pending**: a `[data-enter="pending"]` element intersecting the viewport.
     *Fail.*
   - **running**: running, non-infinite animations 600 ms after the step. *Warn.*
   - **text overlap**: bounding boxes of text-bearing elements (h1–h3, p, li,
     figcaption, button, a) from different components intersecting, unless
     inside `[data-overlay]` (the demo's answer card). *Warn.*
6. After the pass, record:
   - page height (px and screens) and section tops (in screens);
   - CLS for load and scroll; the LCP element and time; TBT; the longest task;
   - console errors and warnings (*fail* on any locally; on `--live`, list the
     two zone-injected ones separately);
   - failed requests; request count before `load`;
   - transferred bytes by type (JS, CSS, image, font); DOM element count before
     JS (from the `nojs` run);
   - infinite animations; elements with `filter` or `backdrop-filter`;
   - all budget checks against `budgets.json`.
7. Write `report.md` and `report.json`, plus one **contact sheet** per run (a PNG
   grid of every frame, made by rendering an HTML page of the thumbnails).
   Print one line per run: PASS, WARN or FAIL plus the key numbers. Exit
   non-zero on any FAIL.

### 10.2 Probes (`--probes`)

| Probe | Steps | Pass |
|---|---|---|
| resize | at 820×1180 scroll to 40% of the page height, resize to 1180×820, wait 1 s; likewise 390→1440, 1440→390, 1000→1440 | `scrollY > 0`, and the section that held the top of the viewport still intersects it |
| rotate | iPhone 390×844 mid-page → 844×390 → back | same |
| menu | 390, scroll 3000; open and close with the button, with Escape, and by tapping the scrim; then tap "Pricing" in the menu | Δ scrollY ≤ 2 px for each close; Pricing h2 below the nav |
| keyfocus | 1440, scroll 3000, Shift+Tab into the nav; then Tab through the whole page | Δ ≤ 2 px; every focused element has opacity 1, a visible outline, and is not under the nav |
| anchors | each nav link, at 390 and 1440 | the h2 top is between nav bottom + 8 and 40% vh |
| demo | play all 3 hands × every slab (reload between); toggle Chart; Next; score; Play again; with Reduce Motion too | grades as in §6.2; the card shows the hand title; text floors; Chart shows 169 cells and 1 hero ring; score CTA href = config; Reduce Motion gives `getAnimations()` empty |
| explorer | 1440: hover 20 random cells; wheel over the chart with the pointer still; each tab; arrow keys; Home | CLS +0; card height Δ 0; selection unchanged on wheel; ARIA state correct |
| theme | click the toggle, reload, go to /faq/ | `data-theme` set and persisted; both `theme-color` metas equal the scheme's `--bg` |
| fastjump | End, then Home, then step down again | no pending or half-faded frames; no stale state |
| nojs / blockedjs | 390 and 1440 | every section's text has a non-zero box; the demo noscript line is visible; the §6.4 fallback image is visible; CTA hrefs = config; 0 console errors |
| axe | 390 and 1440, both schemes, after a full scroll | 0 serious or critical |
| live | `--live`, 390 iPhone and 1440 | response headers: `/next/css/*` and `/next/js/*` immutable; only the known zone errors |

### 10.3 What every phase must show (in its PR)

- A harness run over all 13 viewports in dark; light at 390, 820 and 1440;
  `reduced` and `nojs` at 390 and 1440; `iphone` (throttled) at 390. Plus the
  probes listed for that phase.
- **Committed evidence**: at most 24 PNGs, ≤ 3 MB, in
  `docs/redesign/shots/phase-N/`. The contact sheets of 390 dark, 1440 dark and
  390 light, plus the specific frames the phase's acceptance names. Link them
  from the PR body. The full output stays in the scratch directory.
- `report.md` summary lines pasted into the PR body.

### 10.4 What cannot be tested here (say so in every report)

WebKit and real iOS Safari don't run in this environment. Chromium's iPhone
emulation has no dynamic toolbar, no momentum scrolling, no real GPU, and no
Safari quirks. Don't try to install WebKit. Keep to the techniques §2 rule 7
lists as safe, and leave the rest to Stan's one-minute device check (§13) after
each merge that touches layout or motion.

---

## 11. Phases

Each phase is **one PR from a fresh branch off the latest `main`**, opened only
after the previous one has merged (or Stan says go). Every PR must pass both
checks, the harness (§10.3), and the phase's acceptance. In Phase 0 the old
design is still in place, so only that phase's own probes must pass. Then
**stop and report to Stan**.

### Phase 0: infrastructure and cheap fixes (no visual redesign)
- **Scope**:
  - Add `scripts/scroll-pass.js` and `scripts/scroll-pass.budgets.json`, and a
    section in `scripts/README.md`.
  - **Baseline**: run the harness on live and on local `main`, and commit
    `docs/redesign/baseline/report.md` with 6 contact sheets. The baseline is
    *expected* to FAIL (story crossfades, half-faded chapters, infinite
    animations). Record those failures as the before-picture; don't fix them in
    this phase.
  - Add `scripts/stamp-assets.py`; stamp every page.
  - Add the `_headers` immutable rules for `/next/css/*` and `/next/js/*`.
  - Fix the `check_next_qr` regex.
  - New checks with tests: stamps, `404.html` has no `<script>`, CTA label =
    config `label` (add `label` to `config.js`).
  - NAV-01 (scroll-margin, `preventScroll`, the iOS menu lock and `100lvh`
    scrim), NAV-02, THEME-01, FAQ-01.
  - 404 scripts moved out of the shared head.
- **Files**: `scripts/*`, `_headers`, `next/js/site.js`, `next/js/config.js`,
  `next/css/components.css`, `next/css/sections.css`, all HTML pages (stamps,
  shared head), `.claude/rules/cache-and-headers.md` (stamping rule).
- **Screens**: harness baseline vs after at 390 and 1440 (expect no visual
  change except /faq/'s top rule).
- **Probes**: menu, keyfocus, anchors, theme, nojs. The `live` probe (immutable
  headers, the stamped URLs served) runs at the start of Phase 1, once Stan has
  merged and the deploy is out. Report its result there.
- **Stop**: report the baseline numbers and list the owner actions (§12).

### Phase 1: calm (delete the artifact sources) and foundations
- **Scope**:
  - Tokens per §4.6, including fonts 400/600/700 and the deleted 500.
  - Buttons with the lip; solid nav; QR with `pointer: fine`.
  - **The motion engine in `site.js`** (enter, count, the PreflopMotion tokens)
    without GSAP.
  - Delete: story pin and pieces (the story is plain stacked chapters until
    Phase 3), floats, glow, pointer tilt, parallax, marquee, statement, progress
    bar, every infinite animation, and bento hover lifts.
  - Delete the bento and badge effects, leaving those sections static until
    Phase 4 replaces them; don't port them.
  - The explorer's wash simply stops: `explorer.js` already skips it without
    `window.gsap`. Phase 3 rebuilds it.
  - Remove `data-reveal` from all text, because the new engine only handles
    `[data-enter]` visuals.
  - **Stop loading GSAP and ScrollTrigger** on every page (style guide
    included). Move `.sg-*` to `styleguide.css`.
  - `JS_BUDGET` 40 KB, `CSS_BUDGET` 26 KB (and their tests).
- **Screens**: the full harness. RESIZE-01 and the menu probes must pass.
  Infinite animations 0, blur layers 0.
- **Stop**: report the length change (expect about −3 screens at 390) and the
  frames that used to fail.

### Phase 2: hero, demo and proof strip
- **Scope**:
  - `gen-app-data.py` emits `spots` (three hands, with explanation, context,
    title, seat order, mix) and stops rewriting the badge grid (Phase 4 removes
    the grid).
  - New `chart.js`. `demo.js` rebuilt per §6.2: answer card, Chart view, deal
    timeline, nudge, text floors, phone sizing, the landscape rule.
  - Regenerate the static hand 1. Hero copy and layout per §6.2.
  - Proof strip per §6.3.
  - Suit SVGs ≤ 1.5 KB.
- **Files**: `index.html`, `next/css/demo.css`, `next/css/components.css`,
  `next/js/{demo,chart,app-data}.js`, `scripts/gen-app-data.py`, `assets/suits/*`
  (rename them on change, e.g. `heart-v2.svg`, because JS builds these URLs).
- **Screens**: hero at all 13 viewports in both schemes; after-answer frames for
  each grade at 320, 390 and 1440; Chart view; score screen; 844×390.
- **Probes**: demo, nojs, keyfocus.
- **Stop.**

### Phase 3: How it teaches and Coverage
- **Scope**:
  - §6.4: tabs, card, chart, the no-JS fallback.
  - §6.5.
  - Delete the old story section, the old explorer markup and its CSS and JS.
- **Screens**: §6.4 at 320, 390, 820, 1440 and 1920 in both schemes, with the
  hover state, each tab, and no-JS; §6.5 likewise.
- **Probes**: explorer, fastjump, axe.
- **Stop.**

### Phase 4: The app gallery, CTA C, Free for everyone
- **Scope**:
  - §6.6 (forced dark, track, controls, CTA C).
  - §6.7 (three cards, widget, bankroll).
  - Delete the badge grid, the unlock pills, the bento and both old CTA bands.
- **Screens**: §6.6 in light *and* dark at 390, 820, 1440 and 1920; the track
  scrolled to the end at 390; §6.7 at 600, 768, 820 and 1024 (the BENTO-01
  widths).
- **Probes**: nojs, axe.
- **Stop.**

### Phase 5: pricing, FAQ, closing, footer, text pages
- **Scope**:
  - §6.8–§6.11.
  - §7: the shared header labels, the new FAQ question on `/faq/`, press tiles,
    the 404 check.
  - Any §12 answers Stan has given by then.
- **Screens**: the pricing cards at 390, 820 and 1440 in both schemes; every
  text page at 390 and 1440 in both schemes; 404 at 390.
- **Probes**: anchors, theme, nojs, axe.
- **Stop.**

### Phase 6: cleanup and final QA
- **Scope**:
  - Delete unused CSS and JS selectors and files: GSAP (if Stan agrees),
    `app-jam.webp`, `Outfit-Medium.woff2` (only `/s/` uses Outfit, and it uses
    Regular, SemiBold and Bold), and `play.webp` if no page uses it any more
    (press still links `play.png` and `play.webp`; keep them if so).
  - Style guide per §7.
  - Tighten `scroll-pass.budgets.json` to the measured values plus 10%.
  - **Final QA in the audit's own way**: the full harness on all 13 viewports ×
    both schemes × the default, reduced, nojs and iphone modes (about 40
    passes); every probe; a live pass after the merge; and
    `docs/redesign/QA.md`, structured like `audit/ISSUES.md` (severity,
    confidence, repro, cause), listing every remaining defect honestly, with
    §8's table marked done or open.
- **Stop**: final report with the §13 checklist for Stan.

---

## 12. Decisions for Stan

Each had a recommendation. **Stan's answer (2026-10-29, on the Phase 0 PR):
go with every recommendation.** Where an answer needs him to act, the last
column says where it stands.

| # | Decision | Recommendation (accepted) | Status |
|---|---|---|---|
| 1 | CTA label: "Join the beta" everywhere, or "Join the TestFlight beta" on the large hero and closing buttons | **Keep "Join the beta"** everywhere. It fits the nav at 320, and the note under the big buttons says "TestFlight". | Accepted. |
| 2 | Drop GSAP and ScrollTrigger (vendored, merged in Phase 0 of the last overhaul) | **Drop them**: no pattern here needs them, and they are 46 KB. Delete the files in Phase 6. | Accepted. Phase 1 stops loading them; Phase 6 deletes the files. |
| 3 | The demo's hands become A5s, J8s and KTs (the app's spots that also have charts and explanations) instead of K5s, AQo and AJo | **Yes**: the app's own explanation text after every answer, and a matching chart. | Accepted (Phase 2). |
| 4 | Nav: solid background instead of blurred glass | **Solid** (iOS robustness). | Accepted (Phase 1). |
| 5 | **Owner actions in Cloudflare**: switch off Web Analytics and Bot Fight Mode "JS Detections" on the zone; add a `www` → apex redirect rule; optionally set Browser Cache TTL to "Respect existing headers" | **Do all three.** The site says "no tracking" for the app, and the zone injects a (blocked) beacon into the website. | Web Analytics: off (the beacon is gone from live pages, checked 2026-10-29). Bot Fight Mode: Stan switched it off, but its JS Detections script was still injected at 03:04 UTC; recheck at the start of Phase 1. `www` → apex redirect: not set yet (steps on the Phase 0 PR). Browser Cache TTL: optional. |
| 6 | Remove "cancel any time" from the Pro price line (the app's voice note says no "cancel anytime" lines) | **Remove it.** | Accepted (Phase 5). |
| 7 | Press kit: replace the older `play/explain/leaks/history` screenshots with the `app-*` set (PNG made from the lossless WebP) | **Yes**, in Phase 5. | Accepted (Phase 5). |
| 8 | Privacy page: add a table of contents (markup change, needs your OK) | **Not now**: the policy was just approved. | Accepted: no table of contents for now. |
| 9 | Style guide `/next/styleguide/`: rebuild it on the new components, or delete it | **Delete it** unless you use it. Keeping it current costs a phase. | Accepted: delete it in Phase 6. |
| 10 | When light-mode screenshots exist: should the gallery follow the theme? | **Keep it dark.** Dark is the app's default look, and one dark band gives the page its rhythm. | Accepted. |
| 11 | The stored theme applies one frame late; fix it with a tiny blocking `theme.js` (needs a checker exception) | **Accept the frame.** Only visitors who overrode their system scheme ever see it. | Accepted. |
| 12 | 20bb and 30bb content rights (`FACTS` "Needs Stan"): the site already advertises them | **Keep**, unless your content-rights answer changes. | Accepted. |

---

## 13. Real-device checklist for Stan (about a minute, iPhone, Safari)

Before the first check after Phase 0 only: Settings → Apps → Safari → Advanced
→ Website Data → delete preflopapp.com, so a stale cache can't fool you.

1. **First screen**: the headline, the amber button and the top of the card
   table, with nothing overlapping.
2. **Scroll the whole page once, slowly, then fast**: no flicker at the top bar,
   no half-faded or blank boxes, no sideways wobble.
3. **Play the demo**: tap an answer. The buttons fill, and the answer card shows
   your two cards and the reason. Tap Chart, then Next hand twice. The score
   screen's button opens TestFlight.
4. **Menu**: open it, close it with the X. The page must not move. Open it, tap
   Pricing: it lands on Pricing.
5. **Rotate** to landscape and back mid-page: you stay where you were. (An iPad,
   if you have one: portrait ↔ landscape.)
6. **Footer → Light mode**: the page *and* Safari's bar turn light. Reload: it
   stays light.
7. **Settings → Accessibility → Motion → Reduce Motion on**, reload: everything
   is there, and nothing slides.

Report anything odd with a screenshot and your iOS version.
