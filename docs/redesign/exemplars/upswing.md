# Upswing Poker (https://upswingpoker.com)

Captured 2026-10-28, desktop 1440x900 only. Mobile capture was blocked: headless Chromium at 390x844 received a Cloudflare-style "Checking your browser / Confirm you are human" page on two runs, so there are no mobile numbers for this site. I did not try to get around the check. Desktop screenshots: `img/upswing-d-01.png`, `-03`, `-05`, `-07`, `-09`, `-11`, `-13`. Extra pages: `img/up-charts-02.png` (the free charts page).

## Hero
Dark photo of a named pro on the right (Garrett Adelstein), left column: a red monospace eyebrow ("NEW FROM GARRETT ADELSTEIN", JetBrains Mono 12px, +0.96px tracking), an H1 of four lines in Plus Jakarta Sans 64px/800 with the last two lines in red, a three-line grey paragraph, a green button "EXPLORE DESTROY LIVE CASH" and a ghost button "WATCH A FREE LESSON", and a micro-stat line (hours, lessons). See `img/upswing-d-01.png`. The H1 is 64px with 62.8px line height.

## Section flow
1. Sticky header 78px: logo, nine small text items, plus a 10-12px utility strip above it (Members Home, Preflop Prodigy App, Merch, FAQ, Contact, Log In, Sign Up).
2. Hero (78 to 906).
3. "As seen on" strip: PokerNews, WPT, ESPN, WSOP, Forbes, PokerGO (`-03`).
4. "We Create Winners": two long testimonial cards with photo, name and result line.
5. Red full-width band "Elite Poker Training".
6. "Beginners start here": two round-badge cards, Free (charts) and $7 (postflop playbook).
7. "Signature courses": three course cards with pro photos, "$999" each, bonus badge, bullet list, small green "GET THE DETAILS" buttons, then a big "SEE ALL COURSES" button.
8. Dark "Lucid Poker" trainer band: "Train by Playing. Win More Pots. Punt Fewer." with a phone video, three tick bullets and "Start Playing For Free Now" (`-09`).
9. Red band "Poker Strategy Articles & Tips", Articles row, Quizzes row, black "Watch, learn and talk with top poker pros" band with "Join Our Community", grey footer with newsletter pill ("Sign up for free poker strategies!"). Page height 8,943px.

## Showing the product
Mostly marketing images: course covers with pro portraits, a phone video thumbnail with a play button for the trainer, small article and quiz thumbnails. The charts live on a separate page: 13x13 images, one pair per format, each card headed by a small meta line (ACTION RFI, POSITION UTG, STACK 200bb, RAISE SIZE 6bb), an "Expand" button, and a legend line under the grid (RAISE 18.5%, FOLD 81.5%) (`img/up-charts-02.png`). The grids I saw are two-colour (salmon for raise, blue for fold); I saw no mixed-frequency cells on the open-raise charts.

## Signature moment
None I would call a moment. The nearest is the hexagonal pro portraits on the course cards (clip-path, 15 uses in CSS) and the red/black diagonal pattern bands.

## CTAs
Green #00a651, white text, ALL CAPS in the small buttons ("GET THE CHARTS", "GET THE DETAILS", "SEE ALL COURSES"), sentence case on the big ones ("Start Playing For Free Now", "Join Our Community"). Sizes vary: 42px tall with 3-4px radius for card buttons, 64px tall with 8px radius for hero and trainer. The free app page (`/preflop/`) repeats "GET FREE ACCESS" at top and bottom and "GET FREE ACCESS INSTANTLY" in the closing band.

## Social proof
Logo strip ("As seen on"), long testimonials with a named winner and a headline result ("Won $4.7 Million in WSOP Main Event"), course reviews link in nav. Paragraph-length quotes make it a wall of text.

## Type/space/colour numbers
Eight font families load (Font Awesome 7, JetBrains Mono, Plus Jakarta Sans, DM Sans, Arvo, Prata, Open Sans, Yellowtail). Body Open Sans 12-18px, colour #595858 on #f5f4f9. Section H2s are Arvo (a serif) 48px/400/60px; H3s are 48px Open Sans/400 uppercase (BEGINNERS START HERE); hero H1 Plus Jakarta Sans 64px/800/62.8px. Containers 1160 / 1180 / 1200px. Palette: ink #202020, red #db2e1c and #ff0612, green #00a651, near-black #000100 and #1e1e22, grey #d1d1d1. Radii 2-10px, shadows almost none (`0 1px 4px rgba(0,0,0,.53)` once, a green glow `0 4px 14px rgba(0,166,81,.25)` on the trainer CTA).

## Motion (with real numbers and where found)
Little scroll animation. CSS: `200ms` x66, `.3s` x26, `.15s` x16, `1s` x13. Easings: `cubic-bezier(.215,.61,.355,1)`, `(.55,.055,.675,.19)`, `(.175,.885,.32,1)` each x24 (a matched set, which looks like a library's defaults), `(.16,1,.3,1)` x6. A GSAP string appears 6 times and "ScrollTrigger" once, but `window.gsap` is not defined in the page, so it is a plugin default, not used on this view. `IntersectionObserver` is created 14 times (lazy-loading). `prefers-reduced-motion` appears 4 times. Sticky: only the header.

## Mobile behaviour
Not captured (blocked).

## Tech
WordPress with NitroPack (generator meta), jQuery, PixelYourSite plus Google Tag Manager. 5.9 MB over 172 requests: JS 2.65 MB transfer (5.5 MB raw), CSS 1.7 MB transfer (1.0 MB raw in the file count I could decode), fonts 696 KB, images 422 KB, HTML 384 KB.

## What to steal
- The "What it is / What it isn't" two-column comparison on the free-app page (green list of ticks vs red list of crosses): it states positioning in 30 seconds and answers objections ("an app you have to download", "static one-size-fits-all charts", "dense solver spreadsheets"). We can build it as two CSS cards.
- Chart cards with a one-line meta header (action, position, stack, size) and a legend line with the percentages under the grid.
- "How it works" in three short steps (pick game type, choose position, view the chart).

## What not to copy
- Eight font families, three display faces and red/green/black all on one page: looks assembled, not designed.
- Paragraph-length testimonials, all-caps small buttons, and nine tiny header links over a 10px utility strip.
- Charts as flat images with no frequency information.

## Defects seen
- Several H1s on one page ("Elite Poker Training" twice, hero H1) which hurts the outline.
- Tiny utility strip (10-12px text) above the nav is hard to hit on touch.
- The grey footer is the same weight as a content area; the page has no clear end.
- Mobile was not testable in headless mode (anti-bot interstitial).

## Poker lens
- Range charts: two-colour 13x13 images with header meta and a legend of totals (`img/up-charts-02.png`). The app page ("Preflop Prodigy", free for now) promises solver-backed charts, tap-to-switch position and stack, mobile first, and "preflop only".
- Claims (paraphrased): the fastest way to upgrade preflop is free; solver-backed and battle-tested; no download needed; not a multi-street simulator; free "for now".
- Pricing structure: free tools (charts, app), a $7 low-price playbook, and $999 signature courses, plus a membership called Lab. No monthly subscription shown on the home page.
- CTA wording: GET FREE ACCESS, GET FREE ACCESS INSTANTLY, EXPLORE DESTROY LIVE CASH, WATCH A FREE LESSON, GET THE CHARTS, GET THE DETAILS, SEE ALL COURSES, Start Playing For Free Now, Join Our Community.
- Where Preflop could be clearly more modern: almost everywhere visually; this is a direct competitor (free preflop app) that looks dated, so Preflop's page should lead with the product and a calm, single-typeface layout.
