# Freebetrange (https://freebetrange.com/en)

A browser-based preflop chart builder, viewer and trainer. Chosen as a "preflop trainer" competitor. Captured 2026-10-28, desktop 1440x900 and mobile 390x844 @2x, 14 steps each. The landing page scrolls inside a custom element (`FBR-LANDING`), not the document: `document.scrollHeight` equals the viewport, so my first pass produced three identical shots; I re-ran with the inner scroller. Screenshots: `img/freebetrange-d-01.png`, `-03` ... `-13`; `img/freebetrange-m-01.png`, `-03` ... `-13`; the charts hub `img/fbr-charts-01.png`.

## Hero
Magenta-to-charcoal vertical gradient. Left: H1 "Your complete preflop strategy platform" (three lines, 70px/500/78px, Rubik), a 16px paragraph, one purple "Start now" button with an arrow. Right: a composite of a phone (trainer: a table with the hero cards and Fold / Call / Raise buttons) overlapping a desktop browser frame (the range viewer with a 13x13 grid and a legend), bleeding off the right edge of the viewport. See `img/freebetrange-d-01.png`.

## Section flow
Hero (0 to 703) -> testimonial carousel built from forum and chat-app screenshots in bubbles, with flags (803 to 1603) -> a full-width gradient strip "Join 50,000+ players using Freebetrange" -> "Explore GTO and MDA preflop ranges" (1908) -> "Learn and apply your strategy" (2638) -> "Manage your poker ranges" (3368) -> endorsement with a cut-out photo of a named coach (4098, "WSOP bracelet winner", "$1.5M total live earnings") -> "Other features" six icons (4779) -> Pricing (5589, 1,158px tall) -> FAQ (7072) -> partners (7908). 8,747px desktop, 8,458px mobile. Feature rows alternate text and screenshot, each 580px tall.

## Showing the product
Real product screenshots in a gradient frame, one per feature, with a small tab switcher (GTO / MDA, Train / View, Create / Import). The range grid is the star: cells in pink (call) and amber (raise), with mixed cells partly filled, a legend at the bottom (Call, Raise 13, Fold with percentages and combo counts such as 33.3% and 441.1 / 1326). The trainer shows a poker table with the dealt hand.

## Signature moment
The purple gradient plus the oversized composite of phone + browser in the hero. It is the only element that looks like a deliberate brand choice; there is no scroll effect.

## CTAs
"Start now" with an arrow, #9c2da6 purple, 8px radius (4px on mobile), 47px tall, 16px, repeated after every feature section (four times in the first 3,800px). Header "Sign up" and "Sign in" text links. Pricing buttons: "Sign up", "Get Pro", "Upgrade to Elite".

## Social proof
Prominent: a testimonial carousel of real forum screenshots, a strip with "50,000+ players", a full-bleed photo of a pro coach with credentials. The scroll-snap carousel is the only motion.

## Type/space/colour numbers
Fonts: Rubik (H1), Roboto (body and H2), Red Hat Display, Lato, Material Icons. Desktop: H1 70px/500/78px; H2 50px/500/59px; body 16px/400/28.8px; nav 18px. Mobile: H1 34px/500/40px; H2 34px/500/37.4px. Container 1096px; text columns 508px and 625px; H1 left edge x=172. Palette: page #24262b, surface #292b30, text #e9e9e9, link lilac #e086ff, CTA #9c2da6. Radii 22px (22 elements), 10px, 8px. No box shadows at all.

## Motion (with real numbers and where found)
Almost none. CSS `cubic-bezier(.4,0,.2,1)` x29 (Material's standard curve), durations `75ms` x16, `.2s` x8, `150ms` x5, `225ms`, `280ms`. `scroll-snap` x16 (carousel). `IntersectionObserver` created 8 times. `prefers-reduced-motion` twice. No pinned or sticky: the nav scrolls away.

## Mobile behaviour
Burger nav. The composite becomes a 358px-wide picture where the interface text is unreadable (`img/freebetrange-m-01.png`). Every feature row is stacked: heading, tabs, tiny screenshot, paragraph, "Start now". No sticky CTA.

## Tech
Custom single-page app (framework not identified; `main-*.js` 413 KB plus chunks, a `FBR-LANDING` custom element), 4.1 MB over 114 requests desktop: JS 2.3 MB transfer (3.2 MB raw), images 887 KB, fonts 338 KB, CSS 120 KB, HTML 427 KB. The body does not scroll, the app does.

## What to steal
- A stacked free / Pro / Elite table with a monthly-yearly toggle and a "-30%" tag on the plan card.
- The legend that gives numbers for the mix under each chart (percent and combos).
- The tab chips (GTO / MDA, Train / View) over a screenshot to show two states of the same product in one place.

## What not to copy
- A "Start now" button after every section; on mobile that is a 47px button every 600px.
- The application scrolling inside a custom element (anchor links, find-in-page and reduced-motion handling are all weaker).
- Phone-in-desktop composites shrunk to 358px: unreadable.
- A forum-screenshot testimonial carousel; it reads as cut and paste.

## Defects seen
- Initial 'Accept' cookie dialog needed to be cleared.
- Hero composite overlaps itself and crops at the right edge on 1440 (the desktop frame runs off the page).
- Nav does not stay on screen.

## Poker lens
- Range charts: 13x13 coloured cells, mixed cells partially filled, legend with percentages and combos; free users get "basic ranges (2 colours, no weights)", Pro gets up to 40 colours and weights. So showing the frequency mix is a paid feature here.
- Claims (paraphrased): a complete preflop platform; study GTO ranges and pool tendencies; practice until decisions are automatic; library of 100,000+ ranges (Pro); import from 15+ apps.
- Pricing structure (pricing section, desktop): Free $0: basic ranges, limited GTO spot selection, trainer up to 50 hands and 5 ranges per day; Pro about $13.2 a month billed as $159 a year ("-30%"); Elite $29 a month billed $348 a year ("-41%") with hand-history upload and MDA; Teams by enquiry. Free has a daily hand cap like Preflop's 20 hands a day.
- CTA wording: Start now, Sign up, Get Pro, Upgrade to Elite, Join 50,000+ players using Freebetrange.
- Where Preflop could be clearly more modern: motion and mobile. This site is desktop-first with no scroll choreography; and Preflop gives the frequency mix to free users, which this competitor paywalls.
