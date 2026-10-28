# linear.app (home) teardown

Captured 2026-10-28, Playwright Chromium, 1440x900 and 390x844 @2x. Shots: `img/linear-d-01..14.png` (desktop), `img/linear-m-01..11.png` (mobile). Page height 9,960 px desktop / 5,876 px mobile. Raw numbers come from `getComputedStyle` and the page's own CSS, not from memory.

## Hero
Pure black (#08090a) page, nav bar with a hairline, then a lot of empty space above a two-line H1: "The product development system for teams and agents" (`linear-d-01`). Under it one grey line of sub-copy ("Purpose-built for planning and building products. Designed for the AI era.") with a small "New  Loops ->" link on the right. The first fold contains **no big CTA button**; the only CTA is the small white "Sign up" pill in the nav. The real app UI (sidebar, issue, an agent chat panel) starts below the copy and is cropped by the fold, so the next scroll step reveals it (`linear-d-02`).

## Section flow
1. Hero copy + cropped app UI in a framed window (`d-01`, `d-02`).
2. Logo row: OpenAI, Vercel, Salesforce, Figma, Cursor, Coinbase, Ramp, under a mono-caps eyebrow "POWERING THE COMPANIES BUILDING THE FUTURE" (`d-02`).
3. Statement block: "A new species of product tool." in near-white, the rest of the sentence in grey (`d-03`).
4. Three numbered isometric line-art illustrations "FIG 0.1 / 0.2 / 0.3" (Purpose-built, Powered by agents, Designed for speed) separated by hairline column dividers (`d-03`).
5. Four feature chapters, each the same template: H2 on the left in two lines ("Intake and integrations", "Planning and monitoring", "AI and automations", "Build, review, and ship"), one grey paragraph plus "Learn more ->" on the right, then a wide UI mock that bleeds off the right edge, then a "Features" list of 4-6 text links with "+" glyphs (`d-04` to `d-11`).
6. Changelog: four dated entries on a horizontal timeline with dots (`d-12`).
7. Two big testimonial cards, one lavender gradient (OpenAI engineer) and one acid yellow (Ramp), then "Linear powers over 40,000 product teams" (`d-12`, `d-13`).
8. Closing: "Built for the future. Available today." + two pills (Get started, Contact sales) (`d-13`, `d-14`).
9. Footer: 5 columns of links, no extra art (`d-14`).

## Showing the product
Real UI rebuilt as HTML/SVG, not screenshots or video: the mock issue list, thread composer, kanban columns, Gantt, scatter chart and a code diff are all text-selectable DOM (font "Inter Variable" and "Berkeley Mono" are loaded for the code). Mocks are masked so they fade out at the edges, are cropped by their frame, and are dimmed behind a foreground floating card (e.g. the "Thread #product" chat on top of the kanban, `d-05`). Small ambient CSS loops run inside them (typing sweeps, "agent" badge border sweep, dot-grid blinking with `steps(1)`, 2.4-2.8 s).

## Signature moment
There is no single stunt. The memorable thing is restraint: a near-monochrome page where the product UI itself is the only colour, with bright-then-grey sentences and thin isometric diagrams. The most "wow" frame is the framed app window arriving from under the fold on first scroll (`d-01` to `d-02`).

## CTAs
Nav "Sign up" (white pill, 13 px/510, 32 px tall) is always visible, on mobile too (`m-01`). No hero button. Repeats only at the end: "Get started" (light pill) + "Contact sales" (dark pill) (`d-13`). Per chapter there are only quiet "Learn more ->" text links. No sticky bar.

## Social proof
Logo row straight under the hero, then a long gap, then two oversize quote cards in brand colour that break the dark page (the only saturated blocks on the whole page), each with avatar, name, title, then a single sentence "Linear powers over 40,000 product teams. From ambitious startups to major enterprises." (`d-13`).

## Type/space/colour numbers
- Font: Inter Variable (stack falls back to SF Pro Display); mono: Berkeley Mono.
- Desktop H1 64/64 px, weight 510, letter-spacing -1.408 px (-0.022 em). H2 48/48, 510, -1.056 px. Body 15/24, 400, -0.165 px, colour #8a8f98. UI text 13/20.
- Mobile H1 38/41.8, -0.836 px; H2 24/31.9, -0.288 px; body unchanged 15/24.
- Container: chapters are 1,344 px wide in a 1,440 viewport (48 px gutters). Chapter sections have 128 px top and bottom padding.
- Colour: bg #08090a; surface #0f1011 (37 elements) and rgba(255,255,255,.02-.08) fills; text three-step #f7f8f8 / #8a8f98 / #62666d; accent indigo #5e6ad2 (only on tiny UI bits); semantic green #27a644, red #eb5757, orange #fc7840, yellow #f0bf00, blue #4ea7fc.
- Radii: pill 9999 px (82 elements), 8, 12, 9, 6, 4. Shadows: 1 px hairline `rgba(0,0,0,.2) 0 0 0 1px`, inset white 5-8 % hairlines, one soft `0 2px 32px rgba(0,0,0,.25)`. No coloured glows.
- CTA pill: bg #e5e5e6, text #08090a, 13 px/510, 32 px tall.

## Motion (with real numbers and where found)
- Easing tokens in CSS: `cubic-bezier(0.32, 0.72, 0, 1)` (16 declarations, the dominant one), `cubic-bezier(0.16, 1, 0.3, 1)` (2), a quint/expo family `.55,.085,.68,.53 ... .95,.05,.795,.035` (ease-in curves).
- Durations in stylesheet counts: 0.2 s (53), 0.15 s (37), 0.12 s (28), 0.4 s (22), 0.18 s (16), 0.3 s (15), 0.5 s (18). Hover/UI is 120-200 ms; entrances 0.4-0.5 s.
- Ambient loops: 12-16 s (43 uses of 16 s), 2.4-2.8 s dot/typing loops. 272 `@keyframes` in the CSS.
- No GSAP/ScrollTrigger/Lenis found in any script (signature scan of all 393 JS responses). `animation-timeline` appears in one rule; WAAPI `.animate(` and IntersectionObserver (5 constructed) are present. Reveals are IO-triggered, not scrubbed. 40 `prefers-reduced-motion` rules.
- Header: `position: fixed`, 73 px, with blur/hairline. No `position: sticky` anywhere and no pinned/`pin-spacer` sections.

## Mobile behaviour
Nothing is pinned on desktop either, so nothing changes there. Mobile keeps the same order, shrinks H2 to 24 px, turns the three FIG cards into a horizontal swipe row (`m-03`), keeps the UI mocks but crops them to the viewport width, and puts a hamburger beside persistent "Log in" and "Sign up" (`m-01`). Mobile page is 40 % shorter (5,876 vs 9,960 px).

## Tech
Custom React-style build (hashed CSS modules like `TZTsQG_header`), not GSAP. Transfer measured 2.37 MB total (probe including lazy loads), of which JS 1.24 MB (2.7 MB raw), fonts 0.52 MB, images 0.30 MB, 332 requests. The first load transfer through `requestfinished` sizes was similar on mobile (about 2.4 MB).

## What to steal
- Bright-lead / grey-tail sentence for the main promise.
- App UI as real HTML with edge masks and a floating foreground card; hero UI cropped by the fold so the first scroll reveals it.
- Three-level grey text scale and 1 px inset-white hairlines instead of shadows.
- Chapter template: H2 left / paragraph right / bleed-off mock / link list.
- One signature ease `cubic-bezier(.32,.72,0,1)` for everything.

## What not to copy
- Hero with no CTA: our goal is the TestFlight join, it must be in the first fold.
- Content that only exists once JS runs (see Defects).
- Isometric "FIG" diagrams and enterprise logos: irrelevant for a consumer trainer.
- 128 px section padding on mobile is not used here (they cut it); do not port desktop padding.

## Defects seen
- With JavaScript disabled the page renders only the nav on a black field (no H1, no body) even though the DOM holds 8,715 characters of text (`nojs` capture, hero invisible). With `reducedMotion: reduce` the hero was also not visible at 4.5 s in my capture. Hero content also had not appeared 3.5 s after navigation commit in a throttled intro run; it was there after network idle.
- At one scroll position the sticky nav shows a heavy dark gradient over the testimonial cards (`d-13`).
- Not a bug but worth noting: some UI mocks are dim at capture time because they animate in on view (`d-04`, `d-05`).
