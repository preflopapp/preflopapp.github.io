# stripe.com (home) teardown

Captured 2026-10-28, Playwright Chromium. Shots: `img/stripe-d-01..14.png`, `img/stripe-m-01..14.png`. Page height 14,803 px desktop / 20,652 px mobile (the mobile page is 40 % taller, everything stacks).

## Hero
White page; a thin top nav (Products, Solutions, Developers, Resources, Pricing; "Sign in" outlined and "Contact sales" purple at right). A small live line "Global GDP running on Stripe: 1.74001109%" (a ticking number) above a long light-weight H1 that is really a paragraph: "Financial infrastructure to grow your revenue." in black, then the rest ("Accept payments, handle business banking, and implement custom revenue models-from your first transaction to your billionth.") in slate (`stripe-d-01`). Two buttons: purple "Get started >" and white "Sign up with Google". A flowing orange/pink/violet ribbon (WebGL canvas) sweeps in from the top right behind the copy, and a logo strip (Coinbase, Google, Shopify, Mindbody, MetLife, Ramp, Marriott) sits at the bottom of the first viewport.

## Section flow
1. Hero + logo strip (`d-01`).
2. "Flexible solutions for every business model" with a bento of product cards: payments, billing, agentic commerce, card issuing, stablecoins, each with a recreated mini-UI (checkout, usage meter, bar chart) on a pastel gradient (`d-02`, `d-03`).
3. Wide "Embed payments in your platform" card with a Connected Accounts table mock (`d-03`).
4. Video/keynote tile "Stripe sessions" and "Building the economic infrastructure for AI" (`d-03`, `d-04`).
5. "The backbone of global commerce": 4 big light numerals 135+ / $1.9T / 99.999% / 200M+ (`d-04`).
6. "Powering businesses of all sizes" with an enterprise case study (Hertz, URBN, Instacart, Le Monde as accordion rows) and an expert/services trio (`d-05`, `d-06`).
7. Startups: horizontally scrolling poster cards (Lovable, Gamma, Runway, Supabase) with arrows, and Stripe Startups/Atlas cards (`d-07`).
8. Platforms: large gradient dashboard mock with a code snippet overlaid (`d-08`).
9. Testimonial with face and role + 4-logo selector (`d-09`).
10. Full-width navy developer section: integration diagram with an animated flow, three "integration path" cards (no-code / platforms / code) (`d-09` to `d-11`).
11. Content: annual letter, book of the week (`d-12`, `d-13`).
12. "Ready to get started?" with Start now + Contact sales and two supporting links; footnote; very large link footer (`d-13`, `d-14`).

## Showing the product
Mix of everything: recreated HTML UI cards (checkout, usage meter, tables), 3-D phone and terminal renders, code snippets, WebGL canvases (`single-wave__canvas` 1392x761, `agentic-graphic`, `issuing-graphic`, 447x728 each), SVG diagrams that animate via the Web Animations API, and photography for customers. Most graphics are interactive: each bento card has an expand icon.

## Signature moment
The WebGL gradient ribbon hero plus the live GDP counter. Second: the navy "developer" band with the animated system diagram (nodes light up in sequence, border colours transition .5 s).

## CTAs
Hero pair (primary purple + Google sign-up), nav pair (Sign in / Contact sales), a purple "Stripe for <audience>" button at the top of each audience section, closing "Start now" + "Contact sales". A fixed "Chat now" button at the bottom right (dark, always on screen) and a "14 sales reps available" toast that overlays the first fold. The header is **not** sticky (only the nav buttons are `sticky` inside their header and scroll away; measured `top: -1064` at scrollY 1080).

## Social proof
Logo strip in the hero, a 4-stat row, named customer case studies with a metric headline ("URBN consolidates $5 billion..."), a face-and-title testimonial, poster-cards for startups, and "50% of Fortune 100".

## Type/space/colour numbers
- Font: sohne-var (light, weight 300 everywhere). H1 48/55.2, -0.96 px (-0.02 em); H2 32/35.2, -0.64 px; stat numerals 56/57.7, -1.4 px; lede paragraphs 32/35.2 (colour #64748d slate); small body 16/22.
- Mobile: H1 34/35, -0.34 px; section heads 22/26.4; body 16/22.4.
- Container 1,232 px inside 1,440 with vertical rule lines drawn at the container edges (a signature "frame" look). Section heights 560-2,300 px with generous internal gaps; no fixed vertical padding values (padding 0 on sections, spacing is in children).
- Colour: white #fff, tint #f8fafd, hairline #e5edf5, navy text #061b31, slate #50617a, brand purple #533afd, secondary purple #7f7dfc, success green rgba(21,190,83,.2). Navy dark band (deep navy; hex not sampled).
- Radii: tiny: 4 px (137 elements), 6 px (116), 1 px. Buttons radius 4 px, 16 px/400 text, 48 px tall (40 px in nav).
- Shadows: layered blue-grey "Stripe" shadow `rgba(50,50,93,.25) 0 30px 45px -30px, rgba(0,0,0,.1) 0 18px 36px -18px` on cards (8 uses).

## Motion (with real numbers and where found)
- `transitionrun` events during scroll: case-study card media `transform .8s cubic-bezier(.165,.84,.44,1)` (24 runs, image zoom on hover); `.lazy-animation` opacity `.5s cubic-bezier(.33,1,.68,1)` (13 runs, section reveals); developer-systems diagram borders/opacity `.5s cubic-bezier(.4,0,.2,1)`; one `transform 2 s cubic-bezier(.9,0,.1,1)` (in-out) on a diagram; button width `.4s cubic-bezier(.3,0,.2,1)`; text colour `.3s cubic-bezier(.25,1,.5,1)`; chat CTA entrance `.3s cubic-bezier(.25,1,.5,1)`.
- Most-used CSS easing: `cubic-bezier(.25,1,.5,1)` (52 declarations, quart-out).
- Graphics use WAAPI keyframes of 1.4 s, 4.5 s and 11.95 s linear with delays (4,000 ms terminal loop), transform+opacity+clipPath only, thousands of samples = continuous loops.
- 94 `prefers-reduced-motion` rules (the most of any site here).
- No scroll-scrubbed pinning; no `pin-spacer`.

## Mobile behaviour
Single column; the ribbon crops to the top-left corner; hero H1 drops to 34 px and loses the grey second sentence emphasis; "Get started" becomes a full-width 48 px purple bar with "Sign up with Google" below (`stripe-m-01`); logo strip becomes a swipe row; bento cards stack with their mini UIs intact; the stats row becomes a 2x2 grid on a navy gradient; case studies stack with images; the dark developer band keeps its diagram at 100 % width. Header collapses to a menu button in a white square top right.

## Tech
Next.js app (hashed chunks), three.js chunk (155 `THREE.` hits across two chunks) driving `getContext("webgl")` canvases, IntersectionObserver (70 constructed) for lazy animation, WAAPI. Transfer 3.24 MB total in my probe (JS 1.6 MB, 6.76 MB raw; images 1.27 MB, fonts 72 KB), 212 requests, 3 iframes (chat/third-party). Desktop `docH` 14,803 px. Renders fully with JS disabled (hero visible, no-JS capture), which is unusual here.

## What to steal
- Layered, blue-tinted card shadow for the "premium paper" look on our light theme.
- A live number in the hero ("Global GDP running on Stripe") as a quiet proof line: for us "hands dealt today" (only if real).
- Expand-icon cards that open the mini-UI larger.
- Single audience button per section ("Stripe for X") = one primary action per chapter.
- Quart-out `cubic-bezier(.25,1,.5,1)` at .3-.5 s for reveals.

## What not to copy
- The page length and link-footer mass (14-20 k px). Too long for a one-app page.
- The fixed "Chat now" + sales-rep toast: wrong for a TestFlight beta, and it covers the first fold.
- WebGL/three.js for the hero: 1.6 MB JS, and our CSP/no-build constraint forbids it.
- Light 300-weight type at 32 px grey lede: low contrast.

## Defects seen
- The ribbon overlaps the H1 text at 1440 px so the right half of the sentence sits on orange/pink (`stripe-d-01`), contrast drops.
- The "14 sales reps available" toast and the "Chat now" button cover the logo strip and bottom-right of every frame.
- My first mobile run crashed the evaluation step at the extract stage (page closed), the rerun worked; the mobile page is 20 k px tall so a scroll capture needs the full 14 frames to cover it.
