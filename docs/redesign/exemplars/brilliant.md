# Brilliant (https://brilliant.org)

Learning app, home page. Captured 2026-10-28, desktop 1440x900 and mobile 390x844 @2x, 14 steps each. Screenshots: `img/brilliant-d-01.png`, `-03`, `-05` ... `-13`; `img/brilliant-m-01.png`, `-03` ... `-13`. The cookie notice was dismissed on mobile ("Got it") but not detected on desktop; no banner is visible in the desktop shots.

## Hero
Warm grey page (#f5f3f1) with a faint isometric grid. A floating white pill nav, 1296px wide and 58px tall, 24px from the top (radius 9999px, soft halo shadow). Left: H1 "Your personal tutor for math and coding" in a serif display face (CoFo Robert), 76px/500/-1.4px tracking/79.8px line height, three lines; a 20px grey sub at 40% black ("A world-class tutor for every home. Built by top learning experts from MIT and Harvard."); two stacked pill buttons, green "I'm a learner" (#29cc57, 60px tall) and white "I'm a parent or teacher"; two award laurels (Editors' Choice, Featured App). Right: a 440x600 white rounded card that plays a looping muted video (880x1200, 15.1 seconds, webm) of a geometry puzzle being solved with a mouse cursor and a green-glow crosshair. See `img/brilliant-d-01.png`.

## Section flow
1. Hero (88 to 848).
2. Trust strip: three outlined cards "Fully accredited (by ACS WASC)", "100,000+ 5-star app store reviews", "10 million+ learners" (`-01` bottom).
3. "Meet Koji, your personal tutor" with a Math / Coding toggle chip and a green mascot blob (`-03`).
4. Three alternating feature rows, each a text block and a tinted card (peach, sage, grey) holding a video: "A visual, interactive tutor, not a cheating machine", "Adapts to exactly where you are", "Real-time progress tracking & analysis" (`-03` to `-05`).
5. "Effective and trusted": three small cards (lesson interventions, mastery assessments, kidSAFE badge) (`-07`).
6. "From grade 5 to college and beyond" on an oat panel: four tabs (Math, Computer Science, Science, Data Analysis), topic list left, video right (`-07`, `-09`).
7. "Always on your schedule", "Built by top learning experts", "Trusted by thousands of schools": photo rows.
8. "Students, parents, and teachers love us" review rows.
9. Black closing band "The best tutor you'll ever have is already here" with a white pill "Get started" (68px tall).
Total 8,431px desktop, 10,399px mobile.

## Showing the product
Short looping screen recordings of the real interactive lesson UI, each inside a pastel rounded card, with the mascot floating beside them. Eight `<video>` elements are on the page (webm, autoplay, loop, muted) and one `<canvas>` of 340x446 (a Rive-driven mascot or lesson piece: Rive is referenced 35 times in the JS). The videos show the cursor moving and tiles being dragged, so a visitor understands the interaction without reading.

## Signature moment
The hero card: a looped geometry construction with an on-screen cursor and glowing dashed crosshair. It shows "you do things here" in four seconds and sets the tone of calm and craft. The mascot "Koji" (a green blob with a square eye) repeats in every feature card, so the page has a character through-line.

## CTAs
Two roles shown at the very start ("I'm a learner" green, "I'm a parent or teacher" white): it segments the visitor and sets the goal in one move. The nav pill starts with only "Sign in" and gains a black "Get started" pill after scrolling (visible in `-03` onwards). Closing band repeats "Get started". No sticky bottom bar on mobile: the floating nav pill is the persistent action.

## Social proof
Three headline numbers directly below the hero (accreditation, 100,000+ five-star reviews, 10 million learners); badges in the hero; a school-trust row; a review wall near the end. Proof comes at hero, after the first feature and before the final CTA.

## Type/space/colour numbers
Faces: CoFo Robert (display serif for H1 and H2) and CoFo Brilliant (UI sans for everything else). Desktop: H1 76px/500/-1.4px/79.8px (1.05); H2 60px/500/-1.2px/66px (1.1), later H2s 50px; H3 30px/400/-0.3px/37.5px; body 20px/400/30px (1.5) in the hero, 16px/24px elsewhere; buttons 20px/500. Mobile: H1 30px/500/33px; H2 40px/500/-0.4px/44px then 36px; body 16px/24px. Tracking is tight on display sizes (about -0.018em). Widths: outer 1440px, content 1216px, text 1055px and 443px; mobile gutter 16px (nav) and 20px (hero). Section padding: hero 80px top / 56px bottom; trust strip 40/24; feature rows 0 (the rows carry their own spacing); "Effective" 80/80; oat panel 56/70; reviews 64/72. Palette: white #fff, oat #f5f3f1, black #000, text at 60% and 40% black (#999 for tertiary), green CTA #29cc57, teal #279b8d, tints peach #ffede0, sage #e7eee2, pale blue #f0f8fa. Radii: 9999px (26 elements: pills and buttons), 17px (15), 20px (13), 24px, 44px. Shadows: `0 0 15px rgba(0,0,0,.1)` on 15 elements (a soft halo, no offset), `0 4px 7px rgba(0,0,0,.05)` on buttons.

## Motion (with real numbers and where found)
CSS: `.2s` x51, `.15s` x47, `.1s` x31, `.3s` x26, `.5s` x16, `.4s` x9, `.35s` x7. Easings: `cubic-bezier(.22,1,.36,1)` x12 (ease-out-quint), `(.4,0,.2,1)` x12, `(.16,1,.3,1)` x8 (ease-out-expo), `(0,0,0,1)` x6, `(.5,0,.5,1)` x6. One `animation-timeline: scroll(self)` rule (for a scrollable strip, not a page reveal). `IntersectionObserver` x30 (most likely video play/pause and reveals; I did not trace them), `will-change` x26, `prefers-reduced-motion` x10, `backdrop-filter` x35, `scroll-snap` x12, `@property` x9. No GSAP or Lenis. Nothing is pinned; only the nav pill is fixed.

## Mobile behaviour
The pill nav keeps its shape (350px wide, 16px from the edges). The H1 is 30px, buttons are full width stacked (56px tall), the hero video sits above the headline in a smaller card, feature rows stack with the video card first. Page is 23% taller (10,399px). Weight barely falls (14.0 MB vs 15.8 MB), so mobile receives nearly the same payload.

## Tech
Next.js / React; Stripe.js (1.1 MB raw) and OneTrust loaded on the home page. 15.8 MB over 226 requests desktop: JS 4.7 MB transfer (8.2 MB raw), video 4.9 MB, "other" 3.1 MB (probably Rive/riv binaries and wasm), images 0.9 MB, fonts 0.7 MB, CSS 1.2 MB (Panda CSS atomic classes `panda-...`).

## What to steal
- Role split in the hero ("I'm a learner / I'm a parent or teacher"): for us, "Join the beta" plus a quiet "How it works" is the equivalent; or iPhone / no iPhone.
- A looping muted screen recording of the real UI with a visible cursor, framed in a rounded white card on a quiet background.
- Floating pill nav with the primary CTA that appears only after the hero.
- Tight tracking at large sizes (-0.018em) and 1.05 line height on a display face; 1.5 line height on 20px body.
- Pastel tints (peach, sage, pale blue) as card backgrounds so one product looks like a set.
- Easing `cubic-bezier(.22,1,.36,1)` at 0.2 to 0.5s for reveals; hover at 0.15s.

## What not to copy
- A 15.8 MB page and 4.7 MB of JS.
- Eight autoplaying videos; ours need to be CSS/SVG recreations of UI because a static site should stay light.
- A mascot: Preflop has no character, and inventing one would look borrowed.
- The serif display face plus sans pairing: our brand face is Hanken Grotesk.

## Defects seen
- The mascot sometimes sits behind a heading ("Meet Koji" at `img/brilliant-m-03.png`), clipping its top edge.
- The sticky pill nav covers the top of content on mobile: in `-05` and `-07` headings are cut off by it as they scroll under.
- Hero buttons are at 60% opacity grey for the secondary action, which is low contrast.

## Learning-app lens (not poker)
Shows a product you cannot use before signing up by letting you watch it being used. The honest limit: videos carry the weight; static HTML needs a different way (see SUMMARY item 1).
