# Finch (https://finchcare.com)

`https://www.finchcare.com` redirects to `https://finchcare.com/` (200). Captured 2026-10-28. This is a one-screen landing page: the document is 900 px tall at 1440x900 and 844 px at 390x844, but the page scrolls inside an inner container (`.home-module__...__page`, scrollHeight 1,293 px desktop / 1,447 px mobile) that only adds the footer. So there is no "scroll top to bottom" story to capture; I took the hero twice (0.5 s and 3.5 s after load), and the inner container scrolled to its end. A cookie banner (CookieYes, "We value your privacy", Customize / Reject All / Accept All) covers the bottom right of the hero (desktop) or the lower 45% (mobile) until accepted; my later "clean" shots were taken after clicking Accept All.

Images: `img/finch-d-01.png` (clean hero), `img/finch-d-02.png` (inner scroll end, footer), `img/finch-m-01.png` (clean hero), `img/finch-m-02.png` (inner scroll end).

## Hero
The entire page. A flat illustrated meadow: sky-blue gradient, large white clouds, trees, bushes, a sun glowing behind the mobile layout, and two big pet characters (a pink bird with a yellow hood on the left, an orange tiger-costumed bird on the right; on mobile a red-haired blue bird peeks from behind a wooden sign "Become a Finch Guardian!"). Centre stack: h1 "Your new self-care best friend." in white 52 px / 700 Rubik with a 13 px `#386d84` text stroke and a 2 px offset text-shadow (sticker look), 18 px / 700 teal subhead "Daily self-care is finally fun — take care of your pet by taking care of yourself!", two black store badges (App Store, Google Play) side by side on desktop (stacked on mobile), then a social-proof row: "5.0" in the same outlined type, five smiling star icons and "500k+ ratings" (d-01, m-01).

## Section flow
There is none beyond the hero: header (logo `Finch` with bird mascot at top-left), hero, and a green footer bar (d-02) with © Finch Care PBC, About Finch, Shop, Guardian, Plus Gift, FAQ, Privacy, Terms, Careers, Contact. On mobile the footer stacks links and shows the "Become a Finch Guardian! / Learn More" wooden sign (m-02), the only secondary CTA.

## Showing the product
Not shown. No app screenshot anywhere. The characters are the product; the page sells emotion and trusts store pages for detail.

## Signature moment
The sticker-style outlined headline on a living illustrated landscape: a thick teal stroke around chunky white letters, with the characters standing on the horizon holding the CTA between them. At 3.5 s the frame was identical to 0.5 s in my captures (`document.getAnimations()` returned nothing), so I could not detect any motion; if the clouds or characters animate it is not a Web Animations/CSS animation.

## CTAs
Two store badges (120x?? and 135x?? SVG badges) directly under the subhead and a "Learn More" for Guardians. No sign-up, no pricing. The only repetition is the same badges nowhere else because there is nowhere else.

## Social proof
"5.0 ★★★★★ 500k+ ratings" directly under the badges, typeset as big as a headline. One line carries all the proof.

## Type/space/colour numbers
- Font: Rubik (self-hosted, 1.5 MB of font files, 1.49 MB of the 2.09 MB page weight), weights 700. h1 52 px / 700 / lh 58.5 px desktop, 32 px / lh 36 mobile, white fill, `-webkit-text-stroke` 13 px (8 px mobile) `rgb(56,109,132)` = `#386d84`, `text-shadow: #386d84 0 2px 0`. Sub 18 px / 700 / lh 25.2.
- Colours: sky `#6fc8ff`-ish gradient (eyeballed), teal text `#386d84`, near-black badges, hill greens `#74d97a` / `#18964a` (eyeballed from the render).
- No cards, radii or shadows in the CSS; art is the layout.

## Motion (with real numbers and where found)
No animations detected (`document.getAnimations()` empty at 3.5 s). CSS has 2 `prefers-reduced-motion` rules. No libraries: Next.js + React bundle (512 KB JS) and a cookie script. Motion durations could not be extracted because there are none to read.

## Mobile behaviour
Layout is recomposed rather than shrunk: badges stack vertically at full width (about 220 px), the sun appears behind the characters, and the three characters line up along the bottom edge with the sign overlapping the fold (m-01). h1 drops to 32 px with an 8 px stroke. The page scrolls its inner container, not the window, so iOS address-bar collapse behaviour will differ from normal pages (not tested).

## Tech
Next.js (CSS modules class `home-module__JAggta__page`), CookieYes banner, Rubik font. Total 2.09 MB: fonts 1.50 MB, JS 512 KB, CSS 6 KB, images 48 KB. Illustration is almost free in bytes, so it is not bitmap photography; art assets are tiny (I did not locate the files).

## What to steal
- One-line proof as a visual: a giant rating number next to stars, directly under the store badges. For a TestFlight beta we can use the same slot for a different number (e.g. "20 free hands a day").
- Sticker-outline headline (stroke + 2 px offset shadow) as a single memorable type treatment; careful with the constraint that animation should be transform/opacity only (this is static, so safe).
- Page that is one decision: headline, one sentence, one action.

## What not to copy
- No product visuals at all, which cannot work for a poker training app that must show the frequency mix.
- Inner scroll container that hides the footer from the document height (SEO and iOS behaviour risk).
- 1.5 MB of font for one weight.
- A cookie wall covering the CTA on first load.

## Defects seen
- Cookie banner covers the bottom-right of the desktop hero and 45% of the mobile screen until accepted (my first two captures were before I clicked it).
- On desktop the right-hand character is partly hidden behind the cookie banner and the cropped bush in the 0.5 s frame.
- The tall mobile hero has the wooden sign cut off by the fold ("Become a Finch..." in m-01).
