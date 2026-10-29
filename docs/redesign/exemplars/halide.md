# Halide (https://halide.cam)

`https://lux.camera/halide` returned 404 (first try) and a redirect to `www.lux.camera/halide/` also 404 (second try). The live address is `https://halide.cam/` (200). Captured 2026-10-28. Page is 9,580 px (desktop) and 7,732 px (mobile). Scroll pass: first ~7.5k px of desktop is the whole page except the footer, plus tail shots at y7150, 7960, 8770.

Images: `img/halide-d-01..06.png`, `img/halide-m-01..04.png`.
- d-01 y0, d-02 y540, d-03 y1620, d-04 y4860, d-05 y5940, d-06 y8770.
- m-01 y0, m-02 y506, m-03 y2530, m-04 y5566.

## Hero
Black (`#020507`) screen filled by a depth-parallax scene: eight absolutely/fixed 100vh PNG layers of dark, out-of-focus cameras and gear, plus the Lux ring logo in yellow-white, "HALIDE MARK III" (word MARK III in `#ff0`), and a hero image of an iPad and iPhone with a portrait photo. The h2 sits right under: "UNLOCK YOUR IPHONE CAMERA", 48 px / 400 / uppercase / letter-spacing 1.17 px (custom `HalideRouterNeue` face, looks like etched camera lettering), then "The #1 App for Natural Photos." (24/32, ls 0.585) and a grey paragraph ending "zero AI." (d-01, d-02).

## Section flow
1. Parallax hero (above).
2. Awards: two laurel badges, "Editors' Choice" and "Apple Design Award Winner" (d-02).
3. Yellow "Get it on the App Store" button (`#fffe4f`, black text, radius 12 px).
4. "Process Zero" proof: a side-by-side portrait (iPhone default vs Halide) with a caption, then three full-width photographs with short captions (a Montana-style landscape; the Oculus architecture shot in black and white). The photos are the argument (d-03).
5. "Bring Your Own RAWs": centred title and two lines.
6. A dark pink-lit pegboard of cameras with a phone showing the Looks editor; the pegboard moves at 15% scroll speed relative to the page (`parallax-item data-speed=15`).
7. "Designed like a real camera": three short paragraphs and a phone in orange outline (d-04).
8. Feature grid on a slightly lighter band (`#151518`): Manual Mode, Focus Assist, Learn As You Go, Private By Design, each with a 3D-ish app-style icon (d-05).
9. "And lots more": four small icon labels (Technical Readout, DCI-P3 Color, Metadata View, Custom White Balance).
10. "GET HALIDE NOW": app icon, "Now on the App Store - with a free 1 week trial at signup:", yellow button, press-kit line.
11. "MADE BY LUX": company blurb and a cross-promo for Kino with a tilted phone image (d-06), then a footer nav (Halide, Kino, Spectre, Support, Blog, About).

## Showing the product
Photography taken with the app (the sample images are the demo) plus clean device renders: iPad+iPhone hero image, a flat phone on a pegboard, a phone with a coloured outline. No video and no interactive demo. The claim "natural photos, zero AI" is proven by before/after pairs, not by UI.

## Signature moment
The hero parallax: 8 stacked PNG layers moving at different speeds (data-speed 2, 45, 12, 25, 49, 77, 100, 100) as you scroll out of the screen, so gear drifts at several depths behind the logo. It is the only moving thing on the page and it makes a text-light hero feel like a physical shelf.

## CTAs
Two seen: the yellow App Store button right after the awards (d-02, page y≈870) and the one under "GET HALIDE NOW" (page y≈7907). The hero has none. Always the same yellow pill (`#fffe4f` bg, black 14 px / 700 text, 12 px radius). The trial note ("free 1 week trial at signup") sits just above the final button.

## Social proof
Two award laurels only: Editors' Choice, Apple Design Award Winner (d-02). "#1 App for Natural Photos" in the subhead. "MADE BY LUX" paragraph: "won iPhone App of the Year twice, for Kino and Spectre, and an Apple Design Award for Halide." No testimonials, no counts.

## Type/space/colour numbers
- Headings: `HalideRouterNeue` (custom), h2 48 / 400 / ls 1.17 px / lh 64 px, uppercase; section titles ~36 px sentence-case in a grotesk ("Bring Your Own RAWs"). Body: HK Grotesk / Inter-like, 16 px (105 uses), 18, 24, 14; feature subhead 24 / lh 32 / ls 0.585 / `#bebebe`.
- Widths: hero section `max-width: 1397px`; text columns `max-width` 656, 673, 800; image blocks 1392 px; on screen the photo column is ~840 px wide centred on 1440.
- Colours: body `#020507`, band `rgb(21,21,24)`, deep band `rgb(14,17,19)`, text `#fff`, secondary `#bebebe` / `#959595`, accent yellow `#fffe4f` (button) and `#ff0` (word accents).
- Radii: 12 px on buttons, otherwise square images (hard edges, no rounding on photos). Shadows: none.

## Motion (with real numbers and where found)
From the site's own `script.js` (913 bytes): on `scroll`, for every element with class `parallax` or `parallax-item` set `style="transform: translate3d(0, -(scrollY * data-speed / 100)px, 0)"`. Layers are `position: fixed; height: 100vh` (`.parallax.parallax__layer`). No `requestAnimationFrame`, no throttling, and the handler rewrites the `style` attribute each event. CSS has one transition (0.25s ease). No gsap, no library, no IntersectionObserver, no `prefers-reduced-motion` rule.

## Mobile behaviour
Same parallax (layers become 390x500). Headline and paragraph go edge to edge with almost no gutter (m-01: "between the default iPhone look" touches both screen edges). Award badges are clipped by the screen edge (m-02: "tors' ... Apple Design Aw"). Feature grid becomes a single column; "And lots more" becomes 2x2 (m-04). Photos go full width.

## Tech
Create React App-style bundle (`/static/css/main.*.chunk.css`) plus hand-written `style.css` (31 KB) and `script.js` (0.9 KB). Plausible analytics. Total 4.45 MB, of which images 4.38 MB, JS 3.4 KB, CSS 32 KB, fonts 32 KB; 18 `<img>`, zero video, zero SVG.

## What to steal
- Tiny-JS depth parallax idea (but implemented with rAF and transform-only on 3-4 layers).
- Proof-by-photograph: show output, not UI. For us the equivalent is a real preflop chart frequency mix beside the app screen.
- Etched/engraved display type that carries the brand (one custom face used only for headings and the CTA zone).
- One accent (yellow `#fffe4f`) used for every button and the key words, nothing else coloured.
- Plain feature-grid with an icon, a two-word title and a 3-line description: lowest-risk pattern for the "what Pro includes" list.

## What not to copy
- Unthrottled scroll handler that rewrites `style` on 8+ layers (layout thrash).
- Hero that stacks logo, device image, h2, tag line and paragraph so tightly the headline lands on top of the image's bottom edge (d-01).
- Small 14 px body text in a 420 px column on a 1440 px wide screen (d-03/d-04): lots of empty black, hard to read.
- Icons with visible dark square background (see Defects).

## Defects seen
- App icon in "GET HALIDE NOW" has a visible slightly-lighter square behind it (non-transparent PNG on a black page); visible in the tail screenshots around "GET HALIDE NOW" (not in the saved subset).
- Mobile: award laurels clipped (m-02), hero text with no side gutter (m-01).
- Page is mostly photographs: 4.4 MB of images for a 9.5k px page.
