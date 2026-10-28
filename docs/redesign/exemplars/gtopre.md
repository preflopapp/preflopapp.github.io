# GTO Preflop (https://gtopre.com, also www.gtopre.com)

An iOS and Android preflop range viewer and trainer by Peka Software, found by search ("GTO Preflop" app-store listing; its blog is at `gtopreflop.com`, whose schema.org markup names Peka Software and points to `gtopre.com`). Captured 2026-10-28, desktop 1440x900 (9 steps, page 4,243px) and mobile 390x844 @2x (13 steps, 6,230px). Screenshots: `img/gtopre-d-01.png`, `-03`, `-05`, `-07`, `-09`; `img/gtopre-m-01.png`, `-03` ... `-13`.

## Hero
Split white hero, 942px tall. Left: H1 "Master Poker GTO Strategy" (48px/700, #2c3e50), a grey 24px sub ("Access pre-solved poker ranges anywhere and improve your game with GTO Preflop"). No button in the hero. Right: a photo of a hand holding an iPhone that shows a red/green range grid above a poker table. The header has "Download" as a green button (#4a7e67, 8px radius, 36px tall) and links About, Support, Affiliate Program. See `img/gtopre-d-01.png`.

## Section flow
Hero (72 to 1014) -> "Trusted by Thousands of Players" with a "4.9 out of 5, 935 ratings" block and a star distribution bar, then four short review cards with country and date (1015) -> a phone carousel with dots and "Swipe through to see different features of the app" (1774) -> "Key Features" with four cards: Fast Rangeviewer, Advanced Rangeviewer, Preflop Trainer, Statistics Page (2544) -> "Try now!" over a dark photo with a "Download for any device" button (3503) -> navy footer with "Other Apps".

## Showing the product
A hand-held iPhone photograph in the hero, then a carousel of full-phone screenshots on a faded green felt background. The screenshots are readable (grid with colours, a table view, a stats page) but sit in a plain grey band.

## Signature moment
None.

## CTAs
"Download" in the header (green), "Download for any device" in the final band (green, 50px tall). Two CTAs in the whole page and none above the fold in the content.

## Social proof
Strongest part: 4.9 average with a distribution chart, 935 ratings, review cards with country names. It is placed immediately under the hero.

## Type/space/colour numbers
System font stack (`-apple-system, ... Roboto`) with no web fonts. H1 48px/700/57.6px, H2 40px/700/48px, big rating "4.9" 64px/700, sub 24px/400/36px; mobile H1 32px/700/38.4px. Containers 1200px, 1100px, 800px. Section padding 96px (hero), 64px (ratings), 80px (screens), 64px (features), 96px (CTA). Palette: page #f8fafc, text #1e293b, grey #64748b, green #4a7e67 and #3a6351, blue headings #2980b9 and #3498db in the features block (a second brand colour that does not match), navy #0f172a. Radius 8px everywhere; soft Tailwind-like shadows `0 4px 6px -1px rgba(0,0,0,.1)`.

## Motion (with real numbers and where found)
CSS transitions only: `.3s` x10, `.25s` x7, `.2s` x3, `.4s` x2. A `1.5s` keyframe exists (carousel). No cubic-bezier, no scroll effects, no GSAP, no `prefers-reduced-motion` rule. Header is `position: sticky` (72px).

## Mobile behaviour
Header collapses to a "Download" button plus a burger that opens a 250px fixed side drawer. H1 32px. Layout stacks. The phone carousel is touch-swipeable.

## Tech
A React single-bundle build (`static/js/main.*.js`, 829 KB, one file, no code splitting; the `static/js` path looks like Create React App but I did not confirm). The HTML is 3 KB and contains only "You need to enable JavaScript to run this app", so with JavaScript off the page is blank (the target site must not behave that way). 120 MB transferred in my capture: the seven phone-screenshot PNGs are each about 16.8 MB (`Very customizable.png`, `Fun Preflop Trainer.png` and others) and the hero hand mockup is 11.2 MB. I confirmed the sizes from the `content-length` headers.

## What to steal
- Put a rating block (average, count, distribution) directly under the hero; it is the only proof element that is compact and checkable.
- Country names on review cards (global audience, plain text).
- A calm single-colour CTA band at the end with the same button as the header.

## What not to copy
- A blank page without JavaScript.
- 120 MB of PNGs.
- The mismatch between the green brand colour and blue section headings.
- A hero with no CTA in it and generic "Master ... Strategy" copy.

## Defects seen
- The blue horizontal rule under "Try now!" runs through the headline text in the final band (`img/gtopre-d-09.png`, also `img/gtopre-m-13.png`).
- Low contrast in the final band: blue text on a dark photograph.
- Screenshot band has a washed-out green felt background that makes the phones look faded.
- No-JS and the PNG weight as above.

## Poker lens
- Range charts: red/green 13x13 on the phone, readable in the carousel; the text claims "advanced rangeviewer" for multiway and 5-bet spots.
- Claims (paraphrased): the fastest range viewer, 95% of common spots available offline, "the number one preflop trainer".
- Pricing: none on the site. The app-store listing text I saw in search results mentions a 7-day trial and a monthly price of 19.99 USD; unverified.
- CTA wording: Download, Download for any device, Try now!.
- Where Preflop could be clearly more modern: everything about delivery (no-JS, weight, motion). This is the baseline of a "generic app landing page" that the new site should clearly beat.
