# Duolingo (https://www.duolingo.com)

Captured 2026-10-28 (logged-out, US English). Page is 7,803 px (desktop) and 8,828 px (mobile). Scroll pass covers about the first 7,500 px, so almost the whole page; plus tail shots. A OneTrust consent stub is present (`otSDKStub.js`) but no banner showed in my captures.

Images: `img/duolingo-d-01..07.png`, `img/duolingo-m-01..05.png`.
- d-01 y0, d-02 y540, d-03 y1080, d-04 y2160, d-05 y3780, d-06 y4860, d-07 y5940.
- m-01 y0, m-02 y1012, m-03 y3036, m-04 y4048, m-05 y5566.

## Hero
White page. Centred 480 px column: an animated cluster of illustrated characters (Duo the owl plus a crowd on a floating phone/coin tile, left of the text on desktop, above the text on mobile), h1 "The most fun way to learn languages, chess, and more!" (32 px / 700 / `#4b4b4b`), then two stacked 330x50 buttons: solid green "GET STARTED" and outlined "I ALREADY HAVE AN ACCOUNT" in blue. A horizontal language strip with flag/icon chips (English, Chess, Math, Spanish, French, German, Italian, Portuguese) sits across the bottom of the first screen (d-01, m-01). The first captured frame and the later "clean hero" capture show different character poses, so the hero art is animated (not able to say which engine: the bundle contains both lottie and rive strings).

## Section flow
1. Hero (above). Top bar shows only the logo and "SITE LANGUAGE: ENGLISH" at first; after scrolling past the hero buttons a white 70 px bar appears with a green "GET STARTED" in the right corner (d-02, d-03, mobile m-02+).
2. Four alternating text+illustration rows, each ~530 px tall with green headings in all lowercase: "free. fun. effective.", "backed by science", "stay motivated", "personalized learning" (d-03, d-04). Illustration side alternates left and right. Body 17 px grey.
3. "learn anytime, anywhere" on pale blue (`#ddf4ff`): navy heading, App Store / Google Play badges, floating 3D phones, flames, crowns and letter tiles scattered around (d-05, m-04).
4. Super Duolingo: full-bleed dark navy (`#100f3e`-ish) with a holographic owl, italic gradient wordmark "SUPER DUOLINGO" and a white "TRY 1 WEEK FREE" button (d-06, m-03 top).
5. "duolingo english test": white row with a green-blob illustration and an outlined "CERTIFY YOUR ENGLISH" button.
6. Closing: "learn a language with duolingo" on a green wave with an owl in a jar surrounded by coins, gems, a flame and a check disc, plus a green "GET STARTED" button (d-07, m-05).
7. Green footer with link columns and a language list.

## Showing the product
Not at all: there is no screenshot of the app in the whole page. The product is shown through characters and illustration (phone-shaped tiles, progress bar, "#1" podium, a lesson card with four options in the first row). The brand is the product shot.

## Signature moment
The character-driven hero and the bouncy green buttons: each CTA is a chunky, pressable 3D button (bottom edge in a darker green) and the illustrations feel alive. There is no scroll choreography; the delight comes from art and overshoot easing.

## CTAs
Green "GET STARTED" in the hero, again in the header once the hero scrolls away (so a CTA is always on screen below the fold), another in the closing section; store badges appear once; "TRY 1 WEEK FREE" in the Super band. Button spec: 330x50 (desktop and mobile, so full-width-ish on phone), radius 12 px, uppercase, 15 px / 700, letter-spacing 0.8 px, green `#58cc02` fill with a darker bottom edge, white text.

## Social proof
Effectively none on the page: no ratings, no testimonials, no press. The only proof is a link inside body copy ("research shows that it works!") and the "backed by science" row. It relies on brand fame, which we cannot.

## Type/space/colour numbers
- Fonts: `duolingo-sans` (h1, body) and `feather` (section headings, rounded, lowercase). h1 32 px / 700 normal lh; h2 48 px desktop, 36 px mobile, `#58cc02`, 700; body 17 px / lh 24 / `#777777`; link/small caps 15 px / 700 / ls 0.8 px.
- Layout: hero column 480 px (345 px on a phone with 23 px gutter); header content 988-1090 px wide; sections `padding: 96px 0` (rows 530 px tall, 611 px on mobile).
- Colours: white `#fff`, text `#3c3c3c` / `#4b4b4b` / `#777`, Duolingo green `#58cc02`, sky `#1cb0f6` for secondary buttons, pale blue `#ddf4ff`, navy `#100f3e`-ish.
- Radii: 12 px on buttons; shadows: none in computed style (the 3D edge is a solid border/pseudo-element).

## Motion (with real numbers and where found)
CSS: `cubic-bezier(.49,.78,.46,1.34)` (2 uses, overshoot), `cubic-bezier(.35,1.8,.35,.83)` (strong overshoot), `cubic-bezier(.22,1,.36,1)` (ease-out-quint style) on a `0.3s, 0.4s` transition; most common durations `.3s` (66 uses), `.4s` (18), `.2s` (15), `.5s` (13), `1s` (13), `1.2s` (6). `0.5s ease-in-out` on one element. No `prefers-reduced-motion` rules found in the CSS I could read. Scroll reveals are not animated on the text rows (they were already in place in every capture).

## Mobile behaviour
Hero art moves above the heading; both hero buttons are full-width (330 px of 390). Header becomes logo-only plus the green "GET STARTED". Rows stack illustration under heading; the footer grows to 2,014 px tall (the whole page is 8.8k px mobile vs 7.8k desktop). Floating tile art in "learn anytime" stays but is cropped. No pinning at any size.

## Tech
React app (SSR) with hashed class names, Lottie/Rive strings in a 2.3 MB JS payload, GTM, Facebook, Google Ads, reCAPTCHA. Total 3.75 MB desktop / 3.84 MB mobile: JS 2.31 MB, images 0.38-0.47 MB, fonts 211 KB, CSS 82 KB; 54 `<img>`, 16 SVGs, 2 iframes.

## What to steal
- Header CTA that appears only after the hero CTA leaves the screen (one always-reachable button without a permanent bar).
- Chunky 12 px-radius, uppercase, 700 weight CTA with a darker bottom edge: reads as a button even on a non-interactive screenshot.
- Alternating text/illustration rows at 530 px with 96 px padding; lowercase friendly headings.
- Overshoot easing `cubic-bezier(.49,.78,.46,1.34)` for small pop-ins (pill, badge) at 0.3-0.4 s.
- Language/category chip strip: ours could be a chip strip of hand types or positions.

## What not to copy
- Zero product visuals; our product (frequency mix + reason) must be shown.
- Zero social proof.
- Cartoon characters (not our brand).
- 2.3 MB of JS for what is mostly static.

## Defects seen
- No site cookie banner appeared, but `onetrust-pc-dark-filter` is a fixed overlay element in the DOM; invisible in captures.
- The top ~140 px of d-02 is blank white: the hero art has left the viewport and the language strip has not yet landed, so a scrolling visitor sees a brief empty band.
- Hero art differs between the y0 capture and the later clean-hero capture, so a still frame of the hero is not representative.
