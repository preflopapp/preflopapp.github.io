# Things (https://culturedcode.com/things/)

Captured 2026-10-28. First attempt at `https://culturedcode.com/things` failed with a DNS error from the sandbox; the same host with a trailing slash (`/things/`) loaded (200) on the second try. Page is 8,227 px (desktop) and 11,399 px (mobile), so my 14-shot pass plus three tail shots covered nearly all of it.

Images: `img/things-d-01..06.png`, `img/things-m-01..04.png`.
- d-01 y0, d-02 y540, d-03 y1620, d-04 y2160, d-05 y3240, d-06 y5797.
- m-01 y0, m-02 y1012, m-03 y2024, m-04 y4048.

## Hero
Pale grey-blue page (`#f2f5f7`), a thin nav (Things logo, Features, Support, Blog) over a hairline, then a centred 250x300 app icon (the `h1` "Things" is visually hidden; the icon image carries the brand), one 24 px paragraph "Things is the award-winning personal task manager that helps you plan your day, manage your projects, and make real progress toward your goals.", and a blue text link with a play glyph, "Watch Introduction Video". No download button in the hero (d-01, m-01). Under it the page shows a large app screenshot tilted in perspective that runs off the right edge (d-02): a Mac window with a sidebar (Inbox, Today, Upcoming, Anytime, Someday) and a task detail "Prepare Presentation". This is the poster image of the intro video (`meettheallnewthings-poster-e.jpg`, a flat JPG with the perspective baked in), not a CSS 3D transform.

## Section flow
1. Nav + hero (above).
2. "Simply Powerful" fancy-section: 64 px icon (overlapping Venn circles) beside a 36 px / 700 heading, 18 px description, "See features >" link, then a single device collage PNG (1000x1000): Mac window, iPhone, iPad, Watch (d-03, d-04).
3. "Get Things, Get Done": four equal cards (Mac, iPhone & Watch, iPad, Vision Pro), each with a line-art device icon, OS requirement, price ("$49.99 (US)", "$9.99", "$19.99", "$29.99"), "view in your currency" link and an App Store badge; the Mac card also has a red "Download Free Trial" button. A cropped giant app icon bleeds off the bottom of the section as a background (d-04, m-03).
4. "What People Are Saying": five social icons, a grid of 8 live X/Bluesky-style post cards (white cards on grey, avatars, "4 days ago"), "Show More Posts" button (d-05, m-04).
5. "Read All About It": two columns of speech-bubble quotes from The Sweet Setup, Wirecutter, Wired, MacStories, iMore, AppAdvice, Beautiful Pixels, Brooks Review, with underlined highlights, laurel award tags ("APPLE DESIGN AWARD WINNER", "BEST NEW FEATURE", "APP STORE EDITORS' CHOICE") and an Apple Design Award image tile (d-06).
6. "Things Newsletter" email field + blue Subscribe button.
7. Footer with four link columns ("Products", "Support", "News", "Company").

## Showing the product
Real screenshots of every platform composed in one flat PNG, plus an intro video behind a lightbox (the `Watch Introduction Video` link opens a "cinema" overlay). No UI re-creation in HTML, no animation. The price cards show the real prices, which is a trust cue.

## Signature moment
The tilted app screenshot at the foot of the hero: an image that looks like it is lying on the page and gets flattened by scrolling into a straight collage. There is no JavaScript behind it; the effect is just two images in sequence (tilted poster, then straight collage). It still reads as a designed transition.

## CTAs
No CTA in the hero (only the video link). The first purchase action is section 3 ("Get Things, Get Done"), roughly y2700 desktop: four App Store badges plus the red free-trial button. A second chance is the newsletter form. The site's sticky header is absent (`position: static`). There is no repetition.

## Social proof
Heavy and varied, and it takes about 45% of the page: a live post grid from social accounts (with real avatars) and 14 pull-quotes from press with outlet logos and award laurels. Quote bubbles have a speech-tail, a name line and underline highlights on the key phrase (`mark { text-decoration-thickness: 5px }` in light blue at 25% alpha).

## Type/space/colour numbers
- Font: `ui-sans-serif, -apple-system, BlinkMacSystemFont, Roboto, sans-serif` only; no webfont bytes at all (font transfer 0).
- Hero paragraph 24 px / lh 30 / `#44474b` (desktop), 20.25 px / lh 25.3 (mobile). Section h2 36 px / 700 / lh 36 / `#2c3138`. h3 20.25 px / 700. Body 18 px (172 elements), card text 15.3 px, meta 13 px. No letter-spacing.
- Layout: `.container` max-width 900 px; text blocks `.fancysection` width 440 px (85% max) centred; cards grid 4 columns from 720 px, 2 from 480 px, list with icon at left below 480 px. Section padding 4.5em = 81 px top and bottom (`slice for-features` etc.), footer top 3em.
- Colours: page `#f2f5f7` (lighter), white sections `#fff`, lightest `#fbfcfe`, light `#eeeff2`, medium `#e6e8ec`, dark `#d5d9de`; text `#303336`, secondary `#44474b`, muted `rgba(0,15,36,.46)`, accent blue `#5c9cf5` (links) / `#2576eb` / `#649fff`, trial button pink-red (eyeballed from the screenshot, not read from CSS), highlight `#92bbfe`.
- Radii: `1em` on cards and quote bubbles (18 px for 17 elements), 3-6 px inputs and small buttons. Shadows: `0 2px 8px rgba(0,0,0,.1), 0 0 2px rgba(0,0,0,.1)` on the tweet cards and device images, `0 2px 10px rgba(0,0,0,.1)` on the Apple-award tile; the cards themselves are flat.

## Motion (with real numbers and where found)
Essentially none. CSS contains `transition: transform .1s ease-out` on the product-card icon (hover `scale(1.05)`), `.2s ease-out` on one element, `.15s` on a link. One `prefers-reduced-motion` rule. jQuery smooth-scroll helper in `shared.min.js`: `SPEED:1600, MAX_DURATION:1e3` with "swing" easing for in-page anchor scrolling (e.g. "See features"). No scroll-triggered reveals, no parallax, no sticky.

## Mobile behaviour
Single column. The tilted poster still shows, cropped (m-01 bottom). Product cards become horizontal rows (icon left 140 px padding, text right) in the CSS rule `@media (max-width:479px)` (m-03). Social cards stay as a 2-column grid. Hero paragraph shrinks to 20.25 px. The page grows from 8.2k to 11.4k px because of stacking.

## Tech
Static HTML + jQuery 3.2.1 (66 KB JS total incl. tweetgrid and mailinglist), Matomo analytics. No framework. CSS 17 KB. Total 647 KB transfer (images 538 KB, 1 video element, 37 images, 10 SVGs). Fastest and lightest site in this group by a factor of 7-70.

## What to steal
- Price cards with real numbers and the OS requirement on each: transparency as a trust signal. Our Free vs Pro cards can follow the same simple grid (`1fr` / `1fr 1fr` / 4 cols breakpoints at 480 / 720).
- Speech-bubble quotes with an underlined highlight on the key phrase; quotes carry the sell without a testimonial slider.
- Heavy restraint: one 900 px column, 81 px section padding, hairlines and flat greys; the whole page is calm.
- A flat device collage as the product shot when you have no marketing video.

## What not to copy
- No hero button at all; the first real CTA is 2,700 px down. For a beta-join goal this is the wrong order.
- Social post grid (needs an audience; ours would be empty).
- Dated jQuery smooth scrolling and a page with no motion; the owner wants "super dynamic and animated".
- Mobile page grows to 11.4k px with long quote stacks.

## Defects seen
- None broken in my capture. Notes: the hero `h1` is clipped out of view (`clip: rect(0,0,0,0)`) and the visible brand is an `<img alt="Things">`, so there is no visible H1; the first real purchase action is ~2,700 px down.
- Consecutive mobile frames overlap by design of my 0.6-viewport step, so tweet cards appear twice across m-04 and its neighbour; that is my capture overlap, not a page bug.
