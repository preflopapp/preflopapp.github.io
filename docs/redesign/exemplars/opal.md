# Opal (https://www.opal.so, now served at https://opalapp.com)

`opal.so` redirects to `https://opalapp.com/` (200). Captured 2026-10-28. Page is 16,785 px (desktop) and 15,397 px (mobile). Scroll pass covers y0-7,500 plus three tail screens at the end; the middle (about y7,500-14,000: the pinned "impact" stat section, testimonials) was not screenshotted, so those sections are described from DOM headings and measured sticky tracks only.

Images: `img/opal-d-01..08.png`, `img/opal-m-01..06.png`.
- d-01 y0, d-02 y540, d-03 y1620, d-04 y2700, d-05 y3240, d-06 y4320, d-07 y5400, d-08 y6480.
- m-01 y0, m-02 y2024, m-03 y3036, m-04 y4048, m-05 y5060, m-06 y6072.

## Hero
Near-black (`#040404`) with a looping video background of a dark cave opening (grey rock, blue light). A floating glass nav pill (logo, Our Story, Use Cases, Pricing, For Schools, Support, white "Try for free" pill). Centred h1 "Attention on autopilot." (83.7 px / 700 / ls -0.84 px / lh 92 on desktop; 57.7 px on mobile), 19 px subhead at 80% white, a row of three store badges (App Store, Google Play, macOS), then an Apple Design Awards laurel ("Social Impact 2025") beside "4.8 ★★★★½ 150K+ APP RATINGS", then a small "Watch our new launch video" link, and the top of a video frame peeking in from below (d-01, m-01).

## Section flow
1. Hero (above). A fixed 44 px bar sits at the bottom of the viewport the whole time (see Signature moment).
2. Launch video: a rounded video card that grows from ~350 px wide at the bottom of the hero to ~870 px (d-01 to d-02), "WHO WINS THE AI ERA?" thumbnail with play button and controls.
3. Pinned statement "5 to 6 hours. That's the average time you'll spend on your phone today — often without realizing. It's time to fight back." Words light up one by one as you scroll (d-03, d-04, d-05).
4. Core features (`c-core-features`): a pinned phone mock tilted in 3D with a gem on the screen. Three beats alternate text left/right: "Opal Score: Your day in one score", "Focus Rules: Set your Rules", "Focus Timer: Tap into focus" (d-06, d-07). Each has a small pill label with a ® mark above a 28-30 px heading.
5. "Focus Gems: Unlock precious Milestones": a two-row grid/carousel of glossy 3D gems (Balanced, Committed, Determined, Devoted, Summer, Ramadan, Easter, Winter, Spring) (d-08).
6. "Available on iPhone, Mac and Android" with store badges and a phone mock (m-06 on mobile shows the headline in a peach-to-pink gradient).
7. "Average time saved thanks to Opal" (`c-impact`, 3,810 px tall; contains a sticky container; not screenshotted).
8. Testimonials "This app has changed my life" (Swiper), "Opal in the press" logo list (Forbes, Fortune, GQ, The Guardian, The ...), "Stay in the Loop" community, use cases (a row of video cards: schools, brain games, etc.).
9. Full-width CTA "Improve your focus, find your flow." + white "Try Opal for free", then a footer (Product, About, Learn, Community) with a laurel seal.

## Showing the product
A mix of: (a) real app screens placed in a rendered, glossy iPhone frame tilted in perspective with a dark glow, (b) 3D-rendered gems as collectible art, (c) video (launch film, 4 `<video>` elements on desktop). UI is not recreated in HTML; the phone images are bitmaps. The tilted phone is the recurring device and every feature gets one phone with the matching screen.

## Signature moment
Two things. First, the pinned, word-by-word scroll-scrubbed statement: a 2,700 px (300vh) section whose container sticks at top:225 px for 2,250 px of scroll while words go from ~30% to 100% opacity (d-03 → d-05). Second, a fixed bottom counter pill "652,489,614 hours saved with Opal" whose digits roll like an odometer and keep counting on a timer, independent of scroll (consecutive frames 0.8 s apart differ by about +50, i.e. roughly 40-50 per second). The counter is `odometer.js` 0.4.8 loaded from cdnjs and sits in a fixed 44 px container (`c-floating-counter__container`).

## CTAs
White pill "Try for free" in the nav (135x51, radius 999, 18 px / 600, black text on white) on every screen (nav is fixed); store badges in hero and at "Available on iPhone, Mac and Android"; "Join Community Forum"; closing "Try Opal for free"; footer "Free Trial / Download for iOS / Mac / Android". The counter pill is a constant reminder that it works at scale. On mobile the nav shrinks to logo + hamburger and the hero keeps only the App Store badge.

## Social proof
Hero: 4.8 stars and "150K+ APP RATINGS" plus the Apple Design Awards laurel. A live counter of hours saved. Testimonials carousel ("This app has changed my life"). Press logo strip (Forbes, Fortune, GQ, The Guardian...). And an "Opal in the press" video row with a YouTube channel link. Four distinct forms of proof, but in my screenshots the hero version does most of the work.

## Type/space/colour numbers
- Font: `system-ui, -apple-system, ...` for body; "SF Pro Rounded" (labelled `Sf pro rounded`) for display, plus Inter and TT Interphases Pro. h1 83.7 px / 700 / ls -0.837 / lh 92 (desktop); 57.7 / lh 63.4 (mobile). h2 60.9 px / 600 / lh 73 (desktop), 32 px / lh 38.4 (mobile). h3 53.3 px / 600 / lh 71.9 (desktop), 28.8 px / 36 (mobile). Body p 19 px / lh 30.4 (desktop), 15.4 / 22.3 (mobile). Small UI 14 px (1,383 elements).
- Layout: sections full width, inner content 1248 px (hero) with 96 px side padding on desktop and 32 px on mobile; closing CTA padding 128 px top and bottom (64 px mobile).
- Colours: page `#040404`, text `#fff`, secondary `rgba(255,255,255,.8)` and `.5`, surfaces `rgba(255,255,255,.01/.02/.03/.12)`, muted lilac `rgba(173,168,188,.5)`. Accent colour is the imagery (gems), not UI.
- Radii: 50 px, 32 px, 42 px, 24 px, 16 px, 999 px (big, soft). One shadow: `0 0 50px rgba(255,255,255,.1)` (a glow, not a drop shadow).

## Motion (with real numbers and where found)
- Libraries: GSAP 3.15.0 and ScrollTrigger from `cdn.prod.website-files.com/gsap/3.15.0/` (Webflow Interactions 3 uses these), Swiper 11, odometer.js 0.4.8, jQuery 3.5.1, Webflow runtime. No custom scroll code in the page's inline scripts; the interactions are defined inside Webflow's own bundle.
- Webflow bundle durations: `duration:500` (83 uses), `300` (80), `700` (21), `600` (16); eases `power2.out` (5), `none` (3, i.e. linear for scrubbed items), `expo`, `power4`.
- CSS: `0.3s ease` (145 elements), `0.2s cubic-bezier(.77,0,.175,1)` (20, ease-in-out quart), `0.4s ease-out`, `1s ease`; `cubic-bezier(.175,.885,.32,1.275)` (14, back-out) in the CSS.
- Pin tracks measured by sticky parent probe (desktop 900 px tall viewport): statement 300vh section = 2,700 px track, sticky element 450 px at top:225 px, pinned 2,250 px; devices section track 1,324 px, sticky element 703 px at top:180 px, pinned 621 px; use-cases track 3,150 px, sticky 741 px at top:45 px, pinned 2,409 px; video section track 1,350 px, sticky 798 px at top:45 px, pinned 552 px.

## Mobile behaviour
It does not simplify the pinned statement: the 300vh section still exists with a 422 px sticky block at top:211 px for 2,110 px of scroll, words light up the same way (m-01 to m-02). The devices pin shortens to 544 px (sticky 549 px). The fixed counter stays (39 px tall). Phone mocks are centred above their text instead of beside it (m-03, m-04, m-05). The press and use-case rows become 2-3 columns. Mobile page weight is lower (28 MB vs 48 MB, mostly because fewer/lighter assets load).

## Tech
Webflow site with GSAP/ScrollTrigger via Webflow IX3, Swiper, odometer, jQuery. Marketing stack: Hotjar, GTM (several containers), Google Ads, an `identify` script. Measured while scrolling, desktop: 47.6 MB total (images 15.1 MB, media 5.7 MB, JS 2.6 MB, CSS 94 KB, fonts 25 KB; 368 `<img>` elements, 4 `<video>`); mobile 27.9 MB. This is a large number because lazy media loads as you scroll; initial load is far smaller (not separately measured).

## What to steal
- The pinned word-by-word statement: one headline reveals while the section is pinned for about 2.5 viewports. Our equivalent: "A raise-first-in decision from UTG, seen 4 times a day, is learned by..." (one sentence that reveals as you scroll).
- A fixed bottom pill with a live-feeling number; ours could be "hands dealt today" (can be a static number that ticks with CSS only).
- Alternating phone + label + heading + 2-line copy per feature, each phone in perspective with a soft glow, labelled by a small pill.
- Nav pill with backdrop blur and a single white CTA.
- Collectible-gem idea: reward art for streaks.

## What not to copy
- The weight: 28-48 MB while scrolling and 368 images.
- A 300vh pinned section whose only content is two lines of text (cost of 2,250 px of scroll is steep on mobile).
- Fixed counter that overlaps content (see Defects).
- Webflow-generated markup: class soup and dependence on Webflow runtime.

## Defects seen
- The fixed hours-saved pill overlaps content constantly: it covers the "Tap into focus" heading on mobile (m-05 bottom area shows the heading drawn behind the pill), covers cards in the press row and the footer links ("Download for Android" is overprinted) on desktop (tail frames), and sits on top of gem labels (d-08 bottom).
- Odometer digits are caught mid-roll in many frames (stacked digit fragments like `6 5 7` under each other), which looks glitchy in stills.
- Nav pill is transparent with blur; headings passing behind it become unreadable smears (d-06, d-07 top).
- The launch-video thumbnail text "WHO WINS THE AI ERA?" is partly hidden by the play button and clipped by the card edge on mobile (m-01).
