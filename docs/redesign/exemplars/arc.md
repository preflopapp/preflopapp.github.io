# arc.net (home) teardown

Captured 2026-10-28. **Important: on this date arc.net is not a product page. It is "A farewell to Arc", a sunset notice (Arc shuts down 2026-12-22) that funnels people to Dia.** Everything below describes that page. Shots: `img/arc-d-01..11.png`, `img/arc-m-01..12.png`. Page height 6,173 px desktop / 6,303 px mobile.

## Hero
Near-black (#0b0b0b) full-screen. The Arc "A" logo (blue/red overlapped ribbons with a white outline), a serif H1 "A farewell to Arc" (76 px, Exposure VAR, weight 600), two lines "Arc is sunsetting on December 22, 2026. Scroll to read what's happening and see what's next.", and a grey pill "Read more" (`arc-d-01`, `arc-m-01`). Nothing else, no nav.

## Section flow
1. Hero (`d-01`).
2. Open letter on black: "We've decided to sunset Arc on December 22, 2026" + 4 paragraphs and a 3-bullet list; text is scroll-revealed line by line (dim to white) (`d-02`, `d-03`).
3. Handwritten signature "Josh / FOR EVERYONE AT / THE BROWSER COMPANY of New York", then a wall of about 50 handwritten SVG signatures from the team that fills the viewport and ends in a torn-paper edge into white (`d-04`, `d-05`).
4. White "Timeline" with three dated bullet entries on a thin vertical line (`d-06`).
5. "Moving to Dia is easy": serif H2, a left list of four features whose active item is dark and others faded, and on the right a sticky browser mock whose highlighted part changes with the active item (`d-07`, `d-08`).
6. "Questions": 8 accordion rows (`d-09`, `d-10`).
7. Footer: "THE BROWSER COMPANY of New York" wordmark (`d-11`).

## Showing the product
A single Dia browser window mock built from HTML (traffic lights, profile pill, tab sidebar with coloured folder groups). Callouts ("Profiles", "Sidebar Tabs") have a leader line to the relevant part of the mock, and the callout changes with the active list item. Not video.

## Signature moment
The signature wall: ~50 distinct handwritten signatures drawn as SVG, strewn across the black field, finishing in a deckled torn-paper edge that wipes to white. It is the one human, emotional beat, and it is the reason this site is worth looking at. Second: the sticky stage in the "Moving to Dia" chapter.

## CTAs
Hero: single quiet "Read more" pill. After scrolling about 1.4 viewports a **fixed bottom bar** (112 px tall, full width, white) slides in carrying "Moving to Dia is easy" on the left and a black "Download Dia" button (18 px, 60 px tall, radius 12) on the right; it stays for the rest of the page (`d-06` to `d-11`, class `download-bar is-shown`, `top: 788` of 900). The chapter itself has "Download Dia" (outlined) + "Learn more about Dia >". Mobile replaces it with "Send Dia download link" (`m-` carousel frame).

## Social proof
None in the usual sense: the signatures are the proof (real people).

## Type/space/colour numbers
- Fonts: Exposure VAR (serif display), ABC Oracle (body, weight 350), ABC Favorit Mono, Marlin.
- Desktop H1 76/85.9, 600, -2.43 px (-0.032 em). H2 64/68, 600, -1.92 px; letter H2 38/49, weight 350. Body 20-21/28.4-29.8, weight 350, white-on-black.
- Mobile H1 52/52, -1.56 px; H2 42/47.5, -1.26 px; body 18/25.2.
- Colour: bg #0b0b0b, white, grey rgba(255,255,255,.12) pill; light section #fff with #1a1a1a text and #f7f7f7 / rgba(0,0,0,.03) fills; accents only inside the mock (#f47b82 coral, #ff5f57 traffic-light red).
- Radii: 8, 3, 10, 12, 50 %; pill 60 px. Shadows: tiny inset shadows for buttons/keycaps (`0 3px 0 #d2d2d2` style keycap).
- Section padding: 158 px top on chapters, 214 px top before FAQ, 24-79 px bottom.

## Motion (with real numbers and where found)
- Sidebar mock panel: `transform .36s cubic-bezier(.16,1,.3,1)`.
- Feature list rows: `opacity .3s ease`, padding (top/bottom/right) `.3s ease` (the active row expands).
- Keycap box-shadow `.08s`, icon opacity `.12s`, link colour `.2s`, image filter `.2s`.
- One cubic-bezier in the CSS (`.16,1,.3,1`), long ambient loops 2-36 s (`15s`, `26s`, `36s` on the signatures/logo).
- JS: 11 `requestAnimationFrame` references, 2 IntersectionObserver instances, no animation library. Scroll-scrubbed text reveal in the letter (dim to white per paragraph).
- Sticky: `.stage` `position: sticky; top: 42px`, 749 px tall x 497 px wide, held for about 1,500 px of scroll (from scrollY 3,780 on), then released. Download bar: `position: fixed`, toggled by `.is-shown`.
- 1 reduced-motion rule only.

## Mobile behaviour
Sticky stage is **removed** on mobile (computed `sticky` count 0). The list becomes a horizontal slider with round prev/next buttons beneath the Dia mock, plus a full-width "Send Dia download link" outlined button (`m-` frames of the Dia chapter). The signature wall reflows with fewer, larger signatures. FAQ rows go full width at 18 px.

## Tech
Next.js, ~0.67 MB transfer, JS 163 KB (462 KB raw), fonts 247 KB, images 229 KB, 50 requests. No GSAP, no Lenis. Light.

## What to steal
- A fixed bottom bar with one line and one button that appears after the hero, not before. Right for an app.
- Sticky stage with step list: list on the left, a device/window mock on the right whose callout moves with the active step.
- Mobile "Send download link" so desktop-to-phone is a first-class path (for iPhone/TestFlight).
- Serif display + tight tracking for a human tone; the signature wall idea (could be beta-tester names).
- Torn-edge divider between a dark and a light section.

## What not to copy
- A sunset notice is not a template for selling; there is no product pitch here.
- The 112 px bar is tall; ours should be ~64 px plus safe-area on mobile.
- Black hero with almost no CTA.
- 158-214 px chapter padding on a short page.

## Defects seen
- The download bar covers the bottom 112 px of every desktop frame from `d-06` onward, including part of the FAQ, so I cannot judge what is beneath it.
- The FAQ and Timeline have no entrance animation so they feel flat against the animated letter.
- This is a transient page: the real marketing site is gone, so none of the product-page questions (hero product, pricing, social proof) can be answered from arc.net today.
