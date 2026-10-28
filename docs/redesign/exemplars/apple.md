# Apple iPhone (https://www.apple.com/iphone/ and https://www.apple.com/iphone-18-pro/)

Brief asked for the first two-thirds of `/iphone/` to study how Apple stages a device and its scroll choreography. On 2026-10-28 `/iphone/` is a hub/store page (hero carousel, lineup cards, financing tiles, accessories, footer), not a scrollytelling page, so I captured it and also captured the flagship product page `https://www.apple.com/iphone-18-pro/` (linked from the hub) where the staging and pinned choreography actually live. Both returned 200 on the first try. `/iphone/` is 15,735 px desktop / 30,300 px mobile (the long tail is legal fine print), 14 shots cover the first ~7,500 px (about half, not two-thirds, because of the 14-shot cap; the rest is fine print and footer). `/iphone-18-pro/` is 33,799 px desktop / 36,406 px mobile; 14 shots cover only the first ~7,500 px (the opening four chapters: hero, highlights carousel, "Most wanted", "Design", start of "Pro camera system").

Images: `img/apple-d-01..03.png`, `img/apple-m-01..02.png` (hub); `img/applepro-d-01..06.png`, `img/applepro-m-01..04.png` (product page).
- apple d-01 y0, d-02 y1620, d-03 y2700; m-01 y0, m-02 y1012.
- applepro d-01 y0, d-02 y1080, d-03 y2160, d-04 y3240, d-05 y4320, d-06 y5940; m-01 y0, m-02 y1518, m-03 y2530, m-04 y3542.

## Hero
Hub: white page, global nav (44 px) + a grey "Lease a new iPhone..." ribbon, giant "iPhone" 80 px / 600 title, a row of 10 product thumbnails with names and "New" tags (iPhone Duo, 18 Pro, Air, 17, 17e, 16, Compare, Accessories, Shop, iOS 27), then a card carousel ("iPhone Duo - Hello, hello.", "iPhone 18 Pro - Pro further.") with Buy / Learn more buttons and a pill pager with a pause button (apple-d-01, apple-m-01).
Pro page: black. A chrome "PRO" in giant 3D letters with the maroon phone lying across it, "iPhone 18 Pro" small, "Pro further." 80 px / 600 / ls -1.2 / lh 84, and a rounded price pill at the right: "From $1199 or $49.95/mo for 24 mo. / Lease from $34.99/mo... " with a blue "Buy" button (applepro-d-01). On mobile the headline is 40 px / lh 44 and the price+Buy bar docks to the bottom of the first screen (applepro-m-01).

## Section flow (iPhone 18 Pro, first four chapters)
1. Hero with PRO lettering and price pill (above).
2. "Get the highlights." a horizontal carousel of full-bleed cards ("48MP Fusion Main camera with variable aperture...") with a dark pill pager (1 active bar + 4 dots + pause); "Watch the film" link top right (applepro-d-02).
3. "The ultimate upgrade / Most wanted." 96 px headline, a paragraph with the key phrases in white and the rest grey, a hairline, a "Compare with: iPhone 15 Pro" select, and three stats: "22 more hours", "50% faster", "2.1x faster" (applepro-d-03, m-03).
4. The back of the phone with its camera plate enters from below (bottom of applepro-d-03).
5. "Design / Our finest unibody of work." on a dark-grey band (applepro-d-04), then a left list of chips (Colors, Two sizes, New Main camera, Redesigned Dynamic Island, Durability, Camera Control, Action button) beside a phone (desktop: vertical list; mobile: horizontally scrolling chips, applepro-m-04).
6. "Pro camera system / Eye-opening control." (96 px) over a macro render of the lens that pinned the viewport; then three lens close-ups and a paragraph "Meet our best-ever camera system..." plus a spec table: "48MP rear cameras", "8x optical-quality zoom", lines per lens (applepro-d-05, d-06).
7. Later (not captured, from DOM): "Variable aperture. If you know, you pro.", "Make it cinematic", performance, battery, Apple Intelligence, etc. The DOM lists 24 `data-anim-scroll-group` blocks: Media Hero, Highlights, Intro, Performance, Pro Camera, Pro Video, Product Viewer, Battery, Connectivity, Environment, Accessories, Switch, Upgrader, Values, Siri Ai, etc.

## Showing the product
The device is the content: 3D renders and macro photography staged on pure black, with the product often cropped or rotated in motion. Features are shown as renders of the real object, not UI screenshots, except when a screen is relevant (the lock screen 9:41 in the Design chapter). 13 videos on the Pro page (`<video muted playsinline data-inline-media preload="none">`, with a "video-scrub-container" and a fallback container), plus 1 canvas. The videos are scroll-scrubbed (played by scroll position) rather than looping.

## Signature moment
Scroll-scrubbed video staging: PRO letters and phone in the hero, the camera plate in "Eye-opening control", where (by position) a sticky container (top:0, 901 px tall) holds the viewport for ~1,079 px of scroll while a rendered lens fills the screen and the 96 px headline sits over it (applepro-d-05 shows the entry; the full frame is at y4,860, not saved). I did not step through frames to confirm the lens rotates. Between chapters, background changes from black to dark grey bands (`#1d1d1f`, `#161617`).

## CTAs
Local nav: after the hero a floating dark glass pill appears at the top ("iPhone 18 Pro [Explore] [Buy]"; 1,024x52 on desktop, 370x52 on mobile; background `rgba(18,18,18,.8)`, `backdrop-filter: blur(20px)`, radius 18 px) and stays through the page (applepro-d-02 onward, m-02 onward). It is a persistent CTA bar that costs 52 px. The hero has a price + Buy pill; each carousel slide has Buy and Learn more. Buy button: 73x44 (60x36 on mobile), radius 980 px, `#0071e3` fill, white 17 px text (14 px mobile). Hub cards have both a blue filled "Learn more" and a text "Buy >".

## Social proof
None on either page. Reassurance is price, financing ("Apple Upgrade", trade-in credit tiles) and "Compare with" numbers. Nothing to learn here.

## Type/space/colour numbers
- Fonts: `SF Pro Display` (large) / `SF Pro Text` (small), self-hosted (fonts 811 KB hub, 1.09 MB Pro page). Pro page headings at 1440: hero 80 px / 600 / ls -1.2 / lh 84; chapter heads 96 px / 600 / ls -1.44 / lh 100 ("Most wanted.", "Our finest unibody of work.", "Eye-opening control.", "Make it cinematic"); "Variable aperture. If you know, you pro." 64 px / ls -0.576 / lh 68; section heads 56 px / ls -0.28 / lh 60 and 48 px / ls -0.144 / lh 52; small `h1` eyebrow ("iPhone 18 Pro") 32 px / 600. On mobile every headline is 40 px / lh 44. Body 17 px, fine print 12-14 px, ls -0.374 px at 17 px and -0.224 px at 14 px.
- Layout: content max-width 1260 px (hero marquee), local nav 1044 px; hub sections `padding: 144px 0` desktop (56 px first, 224 px last section) and 112 px on mobile; cards radius 28 px (60 uses), 36 px (8), pills 980 px.
- Colours: black `#000`, near-black `#1d1d1f`, graphite `#161617`, text on dark `#f5f5f7`-ish, hub background `#f5f5f7`, white cards, link/CTA blue `#0071e3` (button) and `#0066cc` / `#2997ff` (text links), secondary grey `#6e6e73`. Shadows: nearly none (hairline inset `0 0 0 1px`).

## Motion (with real numbers and where found)
Extracted from CSS: `0.32s cubic-bezier(0.4, 0, 0.6, 1)` (230 uses, the default), `0.24s ease` (115), `0.344s ease` (105), `0.3s cubic-bezier(0, 0, 0.5, 1)` (30), `0.1s linear` (39), `cubic-bezier(0, 0, 0.2, 1)`, `cubic-bezier(0.42, 0, 0.58, 1)` for 1 s colour animations (`animate-background-f5f5f7-f5f5f7` and friends, used for theme crossfades), `cubic-bezier(0.4, 0, 0.3, 2)` (overshoot, 5 uses), `link-in 0.32s`. Global nav search fade: `0.32s cubic-bezier(0.4,0,0.6,1)`. The scroll choreography is driven by Apple's own framework (`data-anim-scroll-group`, 24 groups; no GSAP/ScrollTrigger/Lenis): keyframes per element and scroll-scrubbed videos. Pin measurement: one sticky container 901 px tall at top:0 inside a 1,980 px track starting at page y4,748 (1,079 px pinned) on desktop; that y matches the "Eye-opening control" screen (frame at y4,860), though I did not tag the element by chapter. Reduced motion: 6 `prefers-reduced-motion` rules on the Pro page, 37 on the hub. The headline fades are subtle: in captures the 96 px headlines are fully visible within one 540 px step.

## Mobile behaviour
All pinned chapters persist on mobile (sticky container 845 px, tracks scale to viewport height). Headlines are 40 px for every chapter. Feature lists become horizontally scrolling chip rows (applepro-m-04). The price+Buy pill docks at the bottom of the first screen. The page grows to 36k px (hub 30k px). Local nav pill spans 370 px and stays on top. Videos keep scrubbing (14 video elements).

## Tech
Apple's custom stack (`main.built.js`, `ac-*` modules, `autofilms.built.js`, `autopricing.built.js`), no framework detected as a global, React strings only in third-party snippets. Hub: 2.57 MB transferred in my pass (JS 612 KB, images 912 KB, fonts 811 KB). Pro page: 25.4 MB desktop / 22.1 MB mobile (JS 1.41 MB, images 3.6-3.8 MB, video 4.1-4.6 MB, fonts 1.09 MB) measured while scrolling the first ~7,500 px only.

## What to steal
- Docked local nav pill: product name left, two actions right, blur 20 px, `rgba(18,18,18,.8)`, radius 18 px, 52 px tall; appears after the hero. It gives us a persistent "Join the beta" without a banner.
- Price/CTA pill in the hero with the trust line next to the button ("From $1199 or $49.95/mo").
- Type scale with tight negative tracking: 96/100, 64/68, 48/52, 40/44 on phones; weight 600 only. Letter-spacing -1.44 px at 96 px = -1.5%.
- Statement with white key phrases and grey remainder (paragraph hierarchy without bold).
- Chapter heads as short imperative sentences with a full stop ("Pro further.", "Most wanted.").
- Stat triplet with "Up to" micro-label above each big number ("22 more hours / 50% faster / 2.1x faster") for our "20 free hands a day" style facts.
- Mobile: chip row instead of an accordion list.

## What not to copy
- Scroll-scrubbed video (needs encoded frames, 4+ MB per chapter; breaks "must work without JS" and motion constraints).
- 33k px page length.
- The hub's four overlapping carousels.
- SF Pro (licensing): we use Hanken Grotesk.

## Defects seen
- `/iphone/` hub: in the first frame the first-slide pager pill overlaps the card bottom on mobile (apple-m-01), and many frames are fine print (the page tail is 6,000+ px of legal text; screenshots 10-14 are walls of 11 px grey text, which I did not save).
- `/iphone-18-pro/` d-02 (y1080): the floating nav pill appears while the "Get the highlights." title is still behind it, so the title is partly covered for a moment (visible as the first characters clipped under the pill).
- Because the first four chapters take 7,500 px at 1440, there is a lot of empty black space between chapters on desktop (e.g. applepro-d-03 lower half).
