# Website overhaul: design spec

Stan's decisions, 2026-10-28. This is a copy of the spec from the private app
repo, saved here so later phases and later cloud sessions can read it. If the
two differ, Stan's latest word wins; update this file when he changes a call.

Notes added while building (not part of the spec):

- `next/css/tokens.css` leads the spec on two points, by Stan's decision on the
  same day: the typeface is Hanken Grotesk (not Outfit) and the radii are
  14 / 10 / 6.
- `facts.json` holds the prices, the trial and `dailyFreeHands`. It has no
  practice-spot count yet, so "30,000+" on `/next/` is written in the page;
  see the Phase 2 PR.

---

## Goal

A clean, modern, animated site for preflopapp.com, informed by high-converting
app sites, built slowly element by element into one cohesive design system.
Static HTML/CSS/JS, no framework build step, GSAP + ScrollTrigger vendored in
Phase 0 (no CDN, no request leaving the origin).

## Decisions

1. One homepage at `/` later. The cutover is Phase 5, NOT before; `/landing/`
   then redirects.
2. The main button is the public TestFlight link
   `https://testflight.apple.com/join/ayujQfvg` until launch, then the App
   Store badge. It lives in ONE constant in the shell so every CTA slot and the
   QR change together. If it breaks, the constant flips back to a "Coming soon"
   badge. No email capture.
3. Proof is real numbers from the app only (30,000+ spots, 20 free hands a day,
   no ads, no tracking; take them from `facts.json`). No ratings, testimonials
   or superlatives like "#1".
4. Keep the headline "Know your play before the flop." One primary CTA in the
   hero; on desktop a small QR beside it (self-hosted static QR, generated
   offline, to the TestFlight link; no third-party QR service).

## Patterns

- One benefit-first headline with one primary button right under it.
- A proof bar directly under the hero with four real facts, counting up once as
  they scroll in.
- The playable demo in a phone frame is the differentiator (ported as is; make
  it the hero).
- Desktop visitors get the QR.

## Design system

- Near-black violet-cast surfaces in dark (default), off-white in light, one
  amber accent. `background / panel / well / border` as CSS variables. Both
  schemes via `prefers-color-scheme` plus the existing manual toggle. No
  gradients.
- Outfit self-hosted (see the note above), fluid `clamp()` type scale.
- Shape: slabs, buttons and cards use the radii already in the `/next/` tokens
  (14 / 10 / 6), 1px borders, 8px grid.
- Motion tokens copied from the app so the site moves like the app: short
  staggered reveals, a slow ambient glow behind the hero, physical press
  states.
- Reduced motion: no count-up, no parallax, reveals instant; content never
  hidden behind an animation that doesn't run. Animate only `transform` and
  `opacity`. Nothing blocks first paint or hides the headline or CTA until JS
  runs.

## Settled design calls

Terse copy. No dashed or dotted lines. Two ambers (bright fill for buttons,
darker amber for text and strokes). Action colours: green = raise, blue = call,
red = fold. Correct is green and a miss stays neutral. Never white text on a
panel fill. The app icon is final.

## Edge states

- No JS or blocked JS: content is in the HTML and visible, the demo shows its
  first hand statically.
- Reduced motion: no pin, no count-up.
- Slow phone: no pinned layout below 768px.
- Light and dark, forced and system: both checked.

## Constraints

- No third-party requests (fonts, scripts, images, QR all self-hosted).
  `check-site.py` should fail any external src/href asset.
- CSP on `/next/` is `script-src 'self'` (external files, no inline) from
  `_headers`.
- Prices, trial wording and free-tier numbers stay behind `facts.json` markers,
  and the page must not advertise a trial. Claims are only what the app does.
- JS under 150 KB gzipped total, no render-blocking script, every image has
  width and height, no layout shift.

## Phases

| # | Phase | Status |
|---|-------|--------|
| 0 | Foundation | done |
| 1 | Shell | done |
| 2 | Hero + demo + proof bar + QR | this PR |
| 3 | Scroll story (desktop pin, mobile stack) | built in the Phase 2 PR at Stan's request (sticky phone, real app screenshots) |
| 4 | Bento + pricing + FAQ + closing | built in the Phase 2 PR at Stan's request (plus marquee, scrubbed statement, progress line) |
| 5 | Cutover | |
| 6 | Secondary pages | |

Phase 2 is done when: the demo plays and replays; the LCP element is the
headline, not the demo; the reduced-motion pass is clean; `check-site` passes.
