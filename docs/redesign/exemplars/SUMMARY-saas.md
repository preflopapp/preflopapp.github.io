# Exemplar teardown: premium SaaS sites (Linear, Stripe, Vercel, Raycast, Arc, Framer)

Source: the "saas" teardown agent's report, saved here by the coordinator (the agent could not write this file). Per-site notes with screenshots are in the sibling files `linear.md`, `stripe.md`, `vercel.md`, `raycast.md`, `arc.md`, `framer.md` and `img/`. Numbers were measured from the live pages in headless Chromium (desktop 1440x900, mobile 390x844).

## Findings across the six

- None of the six uses GSAP, ScrollTrigger or Lenis. Reveals are IntersectionObserver plus CSS or the Web Animations API. Stripe adds a three.js WebGL hero; Framer runs on its own runtime.
- Only Arc and Framer pin anything, both desktop only (Arc: sticky stage 749 px tall for about 1,500 px of scroll; Framer: a 260x640 chat panel for about 1,100 px). Linear, Stripe, Vercel and Raycast pin nothing. **No site pins on mobile.**
- Page weight during a full scroll: Vercel 0.66 MB (121 KB JS), Arc 0.67 MB, Linear 2.37 MB, Raycast 2.38 MB, Stripe 3.24 MB, Framer 4.57 MB (1.73 MB JS).
- Headlines (desktop/mobile, tracking): Linear 64/38 px (-0.022em), Vercel 64/48 (-0.06em), Framer 54/36 (-0.04em), Stripe 48/34 (weight 300), Raycast 64/36, Arc 76/52 serif.
- Recurring easings: `cubic-bezier(.32,.72,0,1)` (Linear, Vercel), `(.16,1,.3,1)` (Arc), `(.25,1,.5,1)` (Stripe), `(.23,1,.32,1)` (Raycast). Raycast cards slide in over 0.7 s with an 80 ms stagger; Stripe reveals over 0.5 s.
- Linear shows the product as real HTML (surface #0f1011 on #08090a), cropped by the fold with edge masks. It has no hero CTA and renders only the nav with JS off: do not copy that.
- arc.net is currently a "farewell to Arc" sunset notice, used only for technique: a fixed bottom download bar (112 px, shown after about 1.4 viewports), the sticky stage, the signature wall, and mobile "Send download link".
- Defects seen in the captures (lower confidence, may be headless artefacts): Raycast's first fold empty black until about 3.5 s; Linear's hero blank at 3.5 s; Vercel bento cards blank in some frames (lazy-load); Framer's cookie banner over every frame. Lesson: content must be visible by default, with JS adding hide-then-reveal.
- Conflicts with our constraints: WebGL and video (Stripe, Framer) cannot run under our CSP/no-build; no pinning on phones.

## Ranked, transferable patterns

1. **Real product UI rebuilt in HTML, edge-masked and cropped by the fold** (Linear, Framer, Raycast, Vercel). Linear: surface #0f1011, 1 px inset border at white 8%, radius 8-12 px, one shadow `0 2px 32px rgba(0,0,0,.25)`. Build: our hand card, range grid and reason as semantic HTML/CSS in a phone frame, `mask-image` edge fade, no JS dependency.
2. **Sticky stage with stepped copy, a swipe carousel on mobile** (Arc, Framer). Arc: top 42 px, 749x497, held about 1,500 px; Framer: top 120 px, 260x640, held about 1,100 px; inactive steps about 0.3 opacity. Build: CSS `position: sticky` (no pin spacer), a script only toggles `.is-active`; below 900 px use `scroll-snap-type: x mandatory`.
3. **Bright-lead, grey-tail sentences and scrubbed dimming** (Linear, Raycast, Arc). Linear 48 px #f7f8f8 then #8a8f98; Raycast 20 px/500, tail #6a6b6c. Build: span opacity .35 to 1 with scrub; the readable state is the default and a `.js-dim` class enables the dimming.
4. **One signature ease and a short duration ladder** (all six): hover 120-200 ms, UI 300-360 ms, reveals 500-700 ms, hero 1,000 ms, stagger 80 ms. Build: CSS tokens, transform and opacity only.
5. **Headline recipe: huge, tight, line-height 1.0.** 54-64 px desktop, 36-48 px mobile, tracking -0.02em to -0.06em, weight 400-510. For Hanken Grotesk: `clamp(2.25rem, 1.2rem + 4.2vw, 4rem)`, `line-height: 1`, `letter-spacing: -0.035em`, weight 500.
6. **A bottom CTA bar that arrives after the hero** (Arc, Raycast). Arc: 112 px after about 1.4 viewports. Build: fixed bar about 64 px plus `env(safe-area-inset-bottom)`, hidden by `translateY(100%)`, toggled by an IntersectionObserver on a hero sentinel; a normal block with no JS. (Note: our nav button already stays visible on phones, so this earns its place only if the nav button is dropped on mobile.)
7. **Closing section echoes the hero with two pills** (Linear, Vercel, Raycast): 32-36 px tall, 13-14 px/500. Build: reuse the hero component for "Join the TestFlight beta" plus "Try 20 free hands".
8. **A physical-object metaphor as the CTA backdrop** (Raycast keyboard, Framer glow box); Raycast keys 1.5 s `cubic-bezier(.23,1,.32,1)`, delays 0 and 0.125 s. Build: five dealt playing-card divs with translateY, rotate and opacity at 0.7 s and an 80 ms stagger; a static fan with no JS or reduced motion.
9. **Phone handoff on desktop** (Arc "Send download link", Vercel copy-command chip): QR plus a "Copy link" chip beside the button on desktop only, a direct button on iPhone.
10. **Restraint: hairlines, three greys, one accent, structured proof** (Linear, Raycast, Stripe). Linear text #f7f8f8 / #8a8f98 / #62666d, accent #5e6ad2 only in tiny UI; Raycast surfaces at white 5% and 10%; Stripe numerals 56 px light, 2x2 on mobile. Proof: real beta quotes only; facts only if true; no invented logos.

## Cautions

Content visible by default (JS adds the hide-then-reveal); no WebGL or video loops; no pinning on phones; no cookie or chat overlays on the first fold.

## Not captured

Stripe's dark-band hex, Raycast's exact accent hex, Framer's spring constants.
