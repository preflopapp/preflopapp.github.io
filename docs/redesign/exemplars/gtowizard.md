# GTO Wizard (https://gtowizard.com)

Captured 2026-10-28 with headless Chromium, desktop 1440x900 and mobile 390x844 @2x. Screenshots are every second capture step (about 1.2 viewports apart): `img/gtowizard-d-01.png`, `-02`, `-03`, `-05` ... `-13` (desktop) and `img/gtowizard-m-01.png`, `-03` ... `-13` (mobile). The cookie banner was accepted before the shots, so it is not in them (it was in my first pass and covered the bottom quarter of the desktop viewport and about 40% of the mobile one).

## Hero
Full-bleed dark photograph of a named pro (caption: "Espen Uhlen Jorstad, 2022 WSOP Main Event Winner") pointing at a laptop that shows a range grid. Left-aligned H1 "Start Crushing Poker Today" (two lines, 68px, line-height 1.0), one-line sub, one green button "Begin Your Journey". The photo fades into the #0f0f0f page at the bottom, so there is no hard edge. See `img/gtowizard-d-01.png`. On mobile the photo goes behind the headline and the headline is centred (`img/gtowizard-m-01.png`).

## Section flow
Measured section tops at 1440 wide (class names are the site's own):
1. `s-lphero` 0 to 765, hero.
2. `s-features` 765, a row of three dark tiles: Analyze, Study, Practice. Each has a product screenshot and a title; hovering a tile slides its paragraph up (`img/gtowizard-d-02.png` shows "Study" revealed).
3. `s-study` 1400, centred green-highlighted headline "Master Every Decision in Poker", then two bento cards (solver, library of solutions) and a wide "Aggregated Reports" card.
4. `s-practice` 2647, "The Best Poker Trainer in the World", a horizontal card carousel with four text tabs under it (Advanced Trainer, Train Any Spots, Custom Drills, Instant Feedback) and arrows (`img/gtowizard-d-05.png`).
5. `s-analyze` 3624, "Understand Your Game Like Never Before", a video of the reports table, two cards.
6. `s-content` 5048, article, study plan, video and coaching cards.
7. `s-pokerarena` 6274, a separate free game product with leaderboard video and three cards.
8. `s-cta` 7762 ("Enter The PokerArena"), `s-integrity` 8264, second `s-cta` 9307, `s-faq` 9833, `s-footer` 11202 ("BEAT THE BEST, CRUSH THE REST"). Total height 12,297px desktop, 13,729px mobile.

Every section opens with a small green pill label (STUDY, PRACTICE, ANALYZE, CONTENT, POKERARENA) above a centred 44px headline in which the key phrase is green (#aafbb2).

## Showing the product
Real product UI, not mock-ups: cropped screenshots of the range grid, reports and trainer inside dark cards, plus four autoplaying, looping, muted `<video>` clips (reports table, PokerArena). Each video has a visible pause button in its bottom-right corner (seen in `img/gtowizard-d-09.png`). The range grid is the hero artefact: 13x13, red and green cells, cells that hold a mix are split into proportional coloured segments, and a floating popover lists the action sizes for the position (UTG 200 / Fold, Raise 2.5, Raise 3, Raise 3.5, All-in 200) (`img/gtowizard-d-02.png`). The trainer screenshot shows a mini range as orange pixel bars above an equity curve (`img/gtowizard-d-05.png`).

## Signature moment
The three-tile row under the hero (Analyze / Study / Practice) plus the "blueprint" frame: 1px vertical rails at x=45 and x=1395 with small L-shaped corner ticks at every section boundary (visible in `-03`, `-07`, `-09`). It reads like a technical drawing and costs almost nothing. I probed the tiles: text blocks sit at `translateY(72px)` and `translateY(120px)` with opacity 0 and move to 0 / opacity 1 when the tile is hovered or reached; the tile also tilts by a `matrix3d` with perspective of about 0.02 (rotation about 1 degree).

## CTAs
Single green button style everywhere: background #aafbb2, text #0f0f0f, 8px radius, 64px tall, 18px/600, with a very faint green glow (`0 12px 12px rgba(170,251,179,.07)`). The nav button "Go To App" is the same colour at 40px tall, fixed top right. CTA text changes per section and has five different verbs: "Begin Your Journey" (hero), "Play For Free", "Download on iOS" (ghost), "Join Us", "Try It Now!". No sticky bottom bar; the fixed top nav is the persistent CTA.

## Social proof
Light. One named-pro photo with a title in the hero, a "Game Integrity" section, a Discord link in the nav. I did not find a review wall or star rating on the page.

## Type/space/colour numbers
Font: Poppins only (loaded family list from `document.fonts`). Desktop: H1 68px/600/line-height 68px (1.0); H2 44px/500/-0.5px/48.4px; H3 32px/500; body 14px/400/19.6px; nav 14px/500/+0.15px. Mobile: H1 36px/600/43.2px; H2 28px/500/30.8px; the same 14px body and a 16px nav item. Containers: `max-width` 1232px (41 elements) and 1296px (37), h1 left edge at x=112 at 1440. Section nodes have 0 padding (spacing comes from inner wrappers, not measured). Fixed nav 76px tall desktop, 72px mobile.
Colour: page #0f0f0f; card surfaces `rgba(24,24,27,.6)` (#18181b at 60%) and #131315; text #fdfdfd; muted #b3b3b8; dim #676671; accent #aafbb2. Radii: 16px on cards (38 elements), 100px pills, 8px buttons. One deep shadow `0 24px 64px rgba(0,0,0,.4)`; otherwise flat with hairline borders.

## Motion (with real numbers and where found)
Webflow Interactions (generator meta = Webflow; 18 `data-w-id` elements, 10 `data-w-tab`). CSS transitions in the stylesheet: `.3s` x46, `.5s` x15, `.2s` x7, `.1s` x3. Easings found in CSS: `cubic-bezier(.25,.46,.45,.94)` and `(.215,.61,.355,1)`, `(.645,.045,.355,1)`. Scroll-driven part measured by scrolling to y=200/500/800 and reading computed styles: card text `translateY` 72 then 2.6 then 0 with opacity 0 then .98 then 1 over 600px of scroll. `backdrop-filter` appears 50 times (blurred nav and chips). No GSAP, no Lenis, no ScrollTrigger; jQuery and Lottie strings present. The "duration:500" and "duration:0" counts in the Webflow chunk (397 and 379) are the runtime's defaults, not necessarily used. No pinned sections: only the nav is fixed.

## Mobile behaviour
Nothing pins. Tiles stack to one column, the tile text is already revealed (no hover), the nav collapses to logo, "Go To App" button and burger (72px). H1 36px. The carousel remains a horizontal scroller. Pages are 13,729px tall, 1,400px taller than desktop, so mobile is not shortened.

## Tech
Webflow, jQuery. Desktop transfer 9.7 MB over 192 requests: media 5.3 MB (the videos), JS 2.1 MB (3.9 MB raw, mostly analytics and Webflow), images 1.4 MB, fonts 459 KB, CSS 320 KB. Mobile 8.2 MB over 190 requests. `prefers-reduced-motion` appears 3 times in CSS. No Rive, no WebGL.

## What to steal
- The pill label + two-tone headline (one coloured phrase) opening each section; it gives rhythm with no extra graphics.
- Pause control on every autoplaying clip (accessible and it looks professional).
- Frequency mix shown as proportional split fills inside the cell plus a popover listing sizes: the exact thing the Preflop chart view needs to look at home.
- Blueprint rails and corner ticks as a pure CSS decoration (borders and pseudo-elements).
- One accent colour used only for CTAs and highlight phrases, with a faint glow instead of a hard shadow.

## What not to copy
- Five different CTA verbs; a single phrase repeated ("Join the beta") is stronger for a one-goal page.
- A 5 MB autoplay video payload and a 2 MB JS payload; far beyond our budget.
- Poppins at 14px body on dark with #b3b3b8 muted text: small and low contrast for long reading.
- Nine nav items; we need three or four.

## Defects seen
- Cookie panel (3 buttons) covers the bottom 25% of the desktop viewport and 40% of mobile until dismissed, on first load.
- On mobile (`img/gtowizard-m-05.png` to `-07`) the heading "Most Powerful & Fastest AI Solver" runs over an orange pixel graphic and is harder to read.
- Headings appear twice in the DOM (hidden duplicates at y=0) for the carousel text, which would double up for screen readers if not aria-hidden.

## Poker lens
- Range charts: 13x13, red/green, mixed cells split proportionally, a hover popover with sizes; trainer view adds an equity curve (`img/gtowizard-d-02.png`, `-05`).
- Claims (paraphrased): the most advanced solver, the largest library of solutions, the best trainer, millions of pre-solved spots (login page says 10,000,000+), a free game mode. All are superlatives with no sourcing on the page.
- Pricing: the public pricing page is not reachable without login (the pricing URL returns a 404 and the app redirects to a login screen). Third-party coverage (PokerNews, 2026) lists Starter, Premium, Elite and an Ultra tier with monthly and annual billing; I could not confirm numbers from the site, so treat those as unverified.
- CTA wording: Begin Your Journey, Go To App, Play For Free, Download on iOS, Join Us, Try It Now!.
- Where Preflop could be clearly more modern: GTO Wizard is a desktop-first study product shown as screenshots; Preflop can show the actual card, the chart and the reason in one interactive hand on the page, and can do it on a phone-sized frame.
