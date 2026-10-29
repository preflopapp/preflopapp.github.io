# Run It Once (https://www.runitonce.com)

Captured 2026-10-28, desktop 1440x900 and mobile 390x844 @2x (11 steps each). Screenshots: `img/runitonce-d-01.png`, `-03`, `-05`, `-07`, `-09`, `-11` and `img/runitonce-m-01.png`, `-03`, `-05`, `-07`, `-09`, `-11`. Extra: `img/rio-pricing-01.png` (plans page). The cookie notice (a slim black bar with a small "Accept" at bottom) was accepted before these shots.

## Hero
A dark portrait photograph (half the face in shadow) across the full width. H1 "Train with the Best" at 96px/700, line height 105.6px, white, left aligned in a custom face (`nowaymedium`). A single red pill "Get Started For Free" with an arrow and a red glow (`3px 4px 39px #cf0f1b`), a small language selector pill below it, and a "Take a Tour" chevron at the bottom of the viewport. Chrome above the hero is 120px: a 70px promo bar ("GET $10 IN BLACK FRIDAY CREDITS", with a close X) and a 50px nav bar below it. See `img/runitonce-d-01.png`.

## Section flow
1. Hero (70 to 970).
2. "Expert Instruction" on a light band: a dark video frame with stacked 3D "cards" behind it and a red hexagon badge "Watch Sample Video" (`-03`).
3. "186 of the Toughest Pros": a big gold numeral, a carousel of four B&W portraits with name and handle, "See the Full Roster" (`-05`).
4. "An Expansive Library" on black: a huge counter "2 x 5,079 = 10,158" with the last number in red, labelled "Videos Daily / Days Since Launch / Pro Training Videos & Counting" (`-07`).
5. "Vision" on near-black (#070910): a GTO trainer with a play button over the UI, two tick bullets (no extra software, mobile ready).
6. "An Active Community" on white: tilted isometric cards (leaderboard, feed).
7. Closing band with a photo of chips and hands, headline "It only takes seconds to start taking your game seriously." and an angled red button "Get Started for FREE" (`img/runitonce-d-11.png`).
8. Footer. Page height 5,657px desktop, 5,102px mobile: the shortest page of the poker group.

## Showing the product
Video thumbnails with play buttons and isometric illustrations of the feed and leaderboard. The trainer ("Vision") is shown only as a faded screenshot under a play button, so the product itself is hard to read. No real chart is visible on the home page.

## Signature moment
The counter "2 x 5,079 = 10,158" in 100px+ type on black. It turns a vague claim (a big library) into arithmetic and is the only thing on the page that is memorable. Static in my capture; I did not verify whether it counts up.

## CTAs
One red pill style (#cf0f1b, 30px radius, white text 14px). Used in the nav ("SIGN UP FREE"), hero ("Get Started For Free"), and closing band ("Get Started for FREE"). Pricing page buttons say "Choose Plan", "Choose Monthly Plan", "Choose Annual Plan", "Purchase". No sticky bar except the top nav.

## Social proof
A roster of 186 named pros with photos (the proof is who teaches), a stats counter, and a member leaderboard illustration. No ratings, no reviews wall.

## Type/space/colour numbers
Fonts: custom `nowaymedium` and `nowaylight` for headings, Open Sans for body, Poppins for the promo bar. Desktop: H1 96px/700/105.6px; section H2s 38-40px; H3 20px/500/26px; body 12px/400/20.4px (small); nav 14px. Mobile: H1 32px/700/38.4px; H2 34.7px and 39.6px; body 12px. Container 1050px and 1660px. Palette: page #f1f3f5, body text #616262, black #000 / #131313 / #070910, red #cf0f1b, gold numeral (a warm tan), off-white #f6f8f9. The only radius is 30px (pills). Shadow: the red button glow only.

## Motion (with real numbers and where found)
No GSAP, no Lenis. jQuery present. CSS durations: `.2s` x14, `.5s` x9, `.4s` x5, `.6s` x5, `.75s` x4, `2s` x3; no custom cubic-bezier in the CSS (default `ease`). `clip-path` x5 (the angled button and hexagon badge), `will-change` x3, `IntersectionObserver` x4 (lazy-load and reveal). Scroll reveal is minimal: sections have class `in-viewport` when visible.

## Mobile behaviour
No pinning. The nav becomes a burger at left, logo centred, "LOG IN" and a red "SIGN UP FREE" pill at right. Hero shows two buttons side by side ("Get Started For Free" red, "Login" grey), then the language pill. The counter keeps its single line and almost fills the width (`img/runitonce-m-07.png`). Cards stack.

## Tech
jQuery site with a custom module bundle (`module-bundle.*.js` 337 KB). 2.0 MB over 79 requests desktop (JS 947 KB transfer but 2.97 MB raw, mostly gtag, GTM, Facebook and other trackers; images 846 KB; fonts 111 KB; CSS 42 KB). 1.8 MB mobile.

## What to steal
- A single arithmetic-style number block ("big number = what it means") as one memorable proof moment; for Preflop it could be the count of bundled spots by stack depth.
- Alternating light and dark bands so each section has a clear start.
- Light page weight: 2 MB is a fair budget reference for a static site.

## What not to copy
- 120px of stacked promo bar and nav above the hero; on mobile this is almost 15% of the viewport.
- 12px body copy on a 1440 page; the text is too small to read comfortably.
- The faded trainer screenshot under a play icon (you cannot see what the product is).
- 3D stacked-card effects: dated.

## Defects seen
- Pale-grey separator band between hero and "Expert Instruction" with a faint "Take a Tour" chevron that is nearly invisible (`img/runitonce-d-03.png`).
- Plans table lists identical feature rows under Basic, Essential and Elite, so the plans look the same.
- Cookie bar needed an explicit click to clear (it did not match a standard selector).

## Poker lens
- Range charts: none on the home page; the GTO trainer ("Vision") is promoted for PLO only, with tick bullets and no frequency visual.
- Claims (paraphrased): the leading community, instruction by elite pros, new videos every day, no extra solver software needed, mobile ready.
- Pricing structure (plans page, `img/rio-pricing-01.png`): Basic free; Essential (low stakes) $24.99/month; Elite (high stakes) $199.99/month or about $1,400 a year ("save $1,000"); Vision trainer sold separately by game type at $119.99 to $329.99 a month with 1, 3 and 12 month options at 10% and 25% savings; courses with lifetime access.
- CTA wording: Get Started For Free, SIGN UP FREE, Choose Plan, Purchase, No Thanks.
- Where Preflop could be clearly more modern: its price points make a free-with-limits app like Preflop easy to explain; the visual language of this page is a content-library site, not an app.
