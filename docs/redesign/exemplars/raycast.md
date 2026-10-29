# raycast.com (home) teardown

Captured 2026-10-28. Shots: `img/raycast-d-01..14.png`, `img/raycast-m-01..14.png`. Page height 14,435 px desktop / 14,052 px mobile.

## Hero
Near-black (#07080a) page with a floating rounded nav pill (logo, Store, Pro, AI, iOS, Windows, Teams, Enterprise, Blog, Pricing, Log in, Download). Centred two-line H1 "Your shortcut to everything." (64 px/600), a two-line grey sub-line ("A collection of powerful productivity tools all within an extendable launcher. Fast, ergonomic and reliable."), and a small pill link "The Raycast Keyboard ->" at the bottom of the fold (`raycast-d-01`). In the intro capture the H1 fades in at about 0.7 s, and a small "Download for Mac" button with a version line appears at the very bottom of the fold at about 3.5 s (hero text `fade-in-up` 1 s, staggered by 1 s). In my captures the large hero artwork was absent: the first fold is mostly empty black (see Defects).

## Section flow
1. Hero (`d-01`).
2. "It's not about saving time. It's about feeling like you're never wasting it." with four dim feature tiles (Fast, Ergonomic, Personal, Reliable 99.8 % crash-free) lit up over a ghosted keyboard (`d-02`, `m-02`).
3. "There's an extension for that." with category tabs (Productivity, Engineering, Design, Writing) and a horizontally slideable row of extension cards (Linear, Google Translate, Spotify) each with a small animated illustration (`d-03`, `d-04`).
4. "AI AGENT / Meet your new virtual assistant" with a window mock (AI Chat) and two cards (Quick AI with typing demo, AI Extensions) (`d-05`, `d-06`).
5. Testimonial carousel "Built for professionals like you. Used by seriously productive people." with Favorite Feature / Top Extension fields (`d-07`).
6. "Don't repeat yourself. Automate the things you do all the time." Snippets card with typed `!address`, Quicklinks, Hotkeys keycaps (option+command+L) (`d-07`, `d-08`).
7. "What else can Raycast do? It can take notes. ..." scrubbed paragraph with a Notes window beside it (`d-09`).
8. "Stay in the loop": Slack (37k members) and X (90k followers) cards + a YouTube video row (`d-10`).
9. "Build the perfect tools." Developer chapter with isometric line-art on a measured grid, FIG labels, Built-in UI, Cross-platform, Publish to the Store (`d-11` to `d-13`).
10. "Take the short way. Download and use Raycast for free." over a full-bleed keyboard with command and space keys glowing red; footer (`d-14`).

## Showing the product
Recreated in HTML: AI chat window with traffic lights, Quick AI input with a blinking cursor and typed text, a Snippets card, a Notes window, keycap UI built from divs (`h8MSgW_key`). Extension cards use blurred gradient art. No screen recording. Product is shown as many small, single-idea cards, each with one loop.

## Signature moment
The oversized backlit keyboard: it is a ghost texture behind the "not about saving time" tiles, then returns at the very end with command and the space bar glowing red as the CTA ("Take the short way."). The keycaps animate their colour/shadow with a 1.5 s ease-out (`--key-bg-end-color` transition). The scrubbed paragraph "What else can Raycast do?" where one phrase lights up in white and the rest stays grey is the second.

## CTAs
Nav: "Download" appears (white pill) only after you scroll past the hero (hidden in `d-01`, present from `d-02`). Hero: a pill link to the Keyboard and, late, "Download for Mac". Closing section: "Download for Mac" under the keyboard. Per-feature "Learn more about Raycast AI ->" links. On mobile the nav shows only logo + hamburger, no Download (`m-01`).

## Social proof
Named individuals with role (Guillermo Rauch, CEO Vercel; Adam Whitcroft; Marques Brownlee) in a centre-focused carousel, with structured "Favorite Feature: AI Chat" and "Top Extension: Notion Search" chips and a pull quote; community counts (Slack 37k members, X 90k followers).

## Type/space/colour numbers
- Font: Inter; mono: Geist Mono / JetBrains Mono for the developer chapter. H1 64/70.4, weight 600, letter-spacing normal. Section heads are small: 18-20 px/500 with +0.2 px tracking, white first sentence then grey second sentence (#6a6b6c). Body 18/400.
- Mobile: H1 36/39.6; section head 18/28.8; body 14.
- Palette tokens: grey scale #e6e6e6, #cdcece, #9c9c9d, #6a6b6c, #434345, #2f3031, #1b1c1e, #111214, #0c0d0f, #07080a; bg #07080a; text white; accent red/orange `rgb(255,99,99)` family on the keycaps and Raycast logo (not sampled exactly). Surfaces rgba(255,255,255,.05) (104 elements) and .1 (30).
- Radii: 11 px (158 elements), 8, 12, 6, 20, 100 %. Button: bg #e6e6e6, text #2f3031, radius 8 px, 14/500, 36 px tall. Hero pill link radius 1000 px.
- Shadows: `0 0 0 1px #1b1c1e, inset 0 0 0 1px #07080a` ring pairs on cards (54), key shadows (156).

## Motion (with real numbers and where found)
- Hero text: `fade-in-up` 1 s `ease`, with the lede delayed 1 s (`animationstart` events).
- Extension cards: `slideIn` 0.7 s `cubic-bezier(.215,.61,.355,1)` staggered +0.08 s each (0.1, 0.18, 0.26 ... 0.66 s).
- Keycaps: opacity and transform 1.5 s `cubic-bezier(.23,1,.32,1)` with 0 / 0.125 s delay; colour variables 1.5 s with 0.1 s delay.
- UI: 0.2-0.3 s `ease` for backdrop/arrow buttons; nav link visibility 0.2 s `ease-in-out`.
- Other easings in CSS: `.165,.84,.44,1` (10), `.23,1,.32,1` (9+6), `.4,0,.2,1` (9), `.16,1,.3,1` (7). 54 `@keyframes`; 7 reduced-motion rules.
- IntersectionObserver instances: 136 (each card/section observes itself), Embla carousel for sliders; WAAPI present; no GSAP/Lenis detected. The scrub of the "What else" paragraph and the testimonial fade is JS-driven (I did not trace the driver).
- Nav: `position: fixed`, 92 px container; no `sticky`; no pinned sections.

## Mobile behaviour
Nav collapses to logo + hamburger inside the pill. Feature grids stack to one column. Extension and testimonial rows stay horizontal swipers with prev/next buttons (`m-03`). The keyboard backdrop crops to the centre. The scrubbed paragraph still scrubs (phrase highlight in `m-09` region). Dev-chapter FIG grid becomes a vertical list with hairlines.

## Tech
Webpack/Next-style CSS modules (hashed classes), Embla carousel, IO-driven reveals. 2.38 MB transfer total, JS 0.61 MB (1.75 MB raw), images 1.28 MB, fonts 0.35 MB, 104 requests in my full-scroll probe.

## What to steal
- Hand-built keycap/hardware metaphor as the final CTA backdrop; for us, playing-card chips or a range grid lit by cursor.
- Staggered card entrance: 0.7 s ease-out with 80 ms offsets.
- Section heads as one white sentence + one grey sentence at 20 px (small, calm), the opposite of shouty.
- Structured testimonials (Favorite feature / Top extension) which look like data, not marketing.
- Nav Download button that appears only after the hero.
- Typed-text and blinking-cursor micro demos inside cards.

## What not to copy
- A hero with no visible product and the CTA delayed 3.5 s.
- 136 IntersectionObservers; share one.
- Floating nav pill that overlaps content with a blur (hard to keep legible).
- The pale red glow overload at the bottom.

## Defects seen
- In every capture the first fold is an almost empty black field: no hero artwork rendered and no Download button until about 3.5 s (`raycast-d-01`, `raycast-m-01`). I do not know if the artwork is video/WebGL that headless Chromium did not play; the intro frames at 0.3-2 s show the same emptiness.
- The sticky nav pill overlaps the extension card row with a translucent blur at 1440 (`d-04`), content seen through it looks messy.
- Mobile hero has the same void under the pill link (`m-01`).
- Ghosted keyboard tiles in `d-02` are so dim the four feature headings are barely legible.
