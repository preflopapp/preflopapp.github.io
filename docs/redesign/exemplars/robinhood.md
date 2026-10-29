# Robinhood (https://robinhood.com)

Redirects to `https://robinhood.com/us/en/` (200). Headless Chromium was not blocked. Captured 2026-10-28. Page is 8,060 px (desktop) and 10,514 px (mobile; the legal footer alone is 4,555 px). Scroll pass covers the first ~7,500 px, which is the whole marketing section plus the start of the footer, plus tail shots to the bottom.

Images: `img/robinhood-d-01..06.png`, `img/robinhood-m-01..03.png`.
- d-01 y0, d-02 y1080, d-03 y2160, d-04 y3240, d-05 y4320, d-06 clean hero captured about 4 s after load (y0).
- m-01 y0, m-02 y2024, m-03 y4048.

## Hero
Black. A lime (`#ccff00`) sweepstakes strip under a 64 px nav, then a 110 px / 400 serif headline "Trade All in One Place" (Martina Plantijn, lh 110, ls -0.5; 60 px on mobile), a one-line subhead ("Manage your portfolio on Robinhood: stocks, ETFs, crypto, options, futures, and prediction markets. Get started with as little as $1.") and a lime pill "Get started". Behind: an animated stock-chart line with a glowing dot and a ticker read-out (TTOF, "Tiger Corp $11.54", green delta rows, timeframe chips 1D 1W 1M 3M YTD 1Y at the bottom on mobile). The hero then changes background: by ~4 s it shows a grey concrete coffered-ceiling photograph (d-06) with lime dots floating across it (the chart's data points). So the hero has at least two states (chart first, then photograph); I did not observe how it switches (time-based or scroll-based).

## Section flow
1. Lime strip + nav + hero (3 states).
2. "Intuitive trading tools / Build your strategy and track market trends, seamlessly": a photo of a monitor with candlestick charts on a desk at dusk, lime h3 label (40 px) and white 52 px head, copy, lime "Learn more" pill (d-02).
3. "Robinhood Crypto / Trade crypto 24/7": a cool grey-blue section with a giant chrome chain-link 3D render, dark text and a black "Learn more" pill; disclosure text in 12-13 px (d-03).
4. "Robinhood Strategies / Your portfolio, handled by the pros": black to blue-grey gradient, a phone on the right showing a purple gauge ("5% > 15%"), lime "Start investing" pill.
5. "Robinhood Protection Guarantee": warm near-black (`#1c180d`) with four line-art icons (cube, orbit, concentric rings, S-curve) and one-line promises ("We work hard to keep your data safe and secure", etc.). A 4-up grid on desktop (d-04), a swipe carousel with dots on mobile (m-03).
6. "Become a better investor on the go, right in the app": full lime section, black pill "Sign up to access Robinhood Learn", then a white card UI "Learn the Basics" (Why invest? / What's the stock market? / What are your goals?) built from HTML (d-05, m-03).
7. "Join a new generation of investors": black with falling vertical grey streak lines (like rain/tick marks), lime "Get started".
8. Lime legal footer, 4 link columns plus 2,000+ words of disclosures, ending in a gigantic cropped "Robinhood" wordmark in black on lime.

## Showing the product
Mostly mood photography and 3D renders (monitor, chrome chain, concrete architecture), with the phone screens as bitmaps in section 4 and a hand-built HTML card UI in section 6. Product UI is not the hero; the brand image is. Dark photography is lit with a single warm or cool colour per section.

## Signature moment
The hero chart-to-photograph transition with glowing lime dots, together with each section switching the whole page's colour world (black, steel-blue, graphite, brown-black, lime, black, lime). Colour blocks change per section, hard-edged, no gradients between them except inside Strategies.

## CTAs
Nav: "Log in" (outline) + "Sign up" (lime pill, 120x44) are always visible (nav is sticky). Mobile nav: "Get app" lime pill + hamburger. Hero "Get started" (146x44 desktop, 137x44 mobile, radius 36 px, bg `#ccff00`, text `#110e08`, 13 px in the hero, 16 px in nav). Each section has its own "Learn more" or "Start investing", the lime section has a black "Sign up to access Robinhood Learn", and "Get started" repeats after "Join a new generation". CTA colour flips between lime-on-dark and black-on-light to keep contrast.

## Social proof
There is none (no ratings, testimonials, logos or counts). The Protection Guarantee block substitutes trust statements, and the legal footer substitutes credibility. Honest observation: this is a brand with its own fame.

## Type/space/colour numbers
- Fonts: `Martina Plantijn` serif (h1 only), `Phonic` grotesk (headings, 400), `Capsule Sans Text` (body 16 px / 13 px), `Nib Pro Display`, `Capsule Sans Display`. h1 110 / 400 / ls -0.5 / lh 110 (desktop), 60 / lh 63 (mobile). h2 52 / 400 / ls -1.5 / lh 62 (desktop), 40 / lh 48 (mobile). h3 40 / 400 / ls -1 / lh 48; mobile 28 / lh 34, ls -0.33. Body 16 px.
- Weights are 400 everywhere; hierarchy comes from size and colour, not boldness.
- Layout: hero content column 825 px (headline box 568 px) centred on 1440; nav 64 px.
- Colours: black `#000`, ink `#110e08`, warm black `#1c180d`, lime `#ccff00`, white, steel `#a2a7b6`-ish (eyeballed), light grey `#d9d9d9`.
- Radii: 36 px (pills) and 3 px (small); no box-shadows at all.

## Motion (with real numbers and where found)
No GSAP, no ScrollTrigger, no Lenis found. The bundle contains `three`/WebGL, lottie and IntersectionObserver strings (React/Next.js app) but `canvas` count at page top is 0, so I cannot confirm what draws the hero chart. Extractable timing: `transition: 0.3s ease` (2 elements), `.15s`, `300ms`; one custom ease string `linearFadeOut`; JS durations `1`, `2`, `100`, `200` appear in a shared bundle (14 hits for `duration:1`). Two `<video>` elements (4.6 MB of media in total). I could not extract scroll-trigger numbers for the section changes; they look like plain section stacking with in-view reveals.

## Mobile behaviour
Hero headline drops 110 to 60 px and the strip text wraps to 3 lines (m-01). The chart ticker stays and timeframe chips become visible. Sections stack (Strategies' phone sits below its copy), the Protection Guarantee becomes a swipeable carousel with 4 dots, the lime Learn card keeps its HTML UI. Nav shows a "Get app" pill. No pinning observed.

## Tech
Next.js + React (`__NEXT_DATA__` present), Emotion-style `css-xxxx` class names, GTM, Reddit, Facebook, Singular. Total 12.7 MB desktop (JS 3.46 MB, images 4.13 MB, media 4.64 MB, fonts 177 KB, CSS 1.8 KB inline) and 10.9 MB mobile. 21 `<img>`, 20 inline SVG, 2 video.

## What to steal
- One loud brand colour (lime `#ccff00`) used for every primary action, switched to black on light sections; the colour block rhythm gives a long page its pacing.
- Big serif display headline with a plain grotesk everywhere else, weight 400 only, tight negative letter-spacing (h2 -1.5 px at 52 px).
- HTML-built mini-UI card ("Learn the Basics") on a flat colour block: crisp, cheap, and shows real content. For us: a chart frequency tile built in HTML.
- Pill CTAs at 44 px tall, radius 36 px, repeated once per section.
- Closing: a giant cropped wordmark at the bottom of the footer.

## What not to copy
- Hero text over a moving chart with a ticker overlay (it collides, see Defects).
- Stock-photo mood without product (we must show the app).
- Disclosure wall; we can keep the legal copy short.
- 12.7 MB page.

## Defects seen
- d-01 and m-01 (first-state hero): the headline "Trade All in One Place" is drawn directly on top of the chart's ticker text ("Tiger Corp $11.54", green delta rows), so both read badly; the overlap is worse on mobile where "Tiger Corp" crosses the first line. By the later state (d-06) the problem disappears, so it is a transitional state, but the first thing a visitor sees is the collision.
- Lime sweepstakes strip pushes the hero down by ~40 px and, on mobile, takes four lines.
- Protection Guarantee carousel on mobile cuts the second icon at the screen edge (m-03), intentionally but easy to miss.
