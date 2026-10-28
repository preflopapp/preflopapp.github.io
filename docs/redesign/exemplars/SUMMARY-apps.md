# Summary: iOS app marketing pages (Flighty, Halide, Things, Duolingo, Finch, Opal, Apple iPhone, Robinhood)

Source: the "apps" teardown agent's report, saved here by the coordinator (the agent could not write this file). Per-site notes with screenshot mapping: flighty.md, halide.md, things.md, duolingo.md, finch.md, opal.md, apple.md (iPhone hub and the iPhone 18 Pro page), robinhood.md; 88 captures in img/.

## Findings
- **Flighty (Framer):** hero pins a 720 px phone stage for only ~602 px of scroll, with a 4-state chapter pill (Preflight / At the airport / After landing / Download); the page fades white to #05010d; the last state is the yellow #f7be00 download button. It still pins on mobile.
- **Opal (Webflow + GSAP 3.15 + ScrollTrigger):** a 300vh pinned statement lights up word by word, pinned 2,250 px (2,110 px on mobile). A fixed 44 px odometer pill ticks about 40-50 per second. Heaviest page (47.6 MB while scrolling) and the pill overlaps content.
- **Apple iPhone 18 Pro:** a floating nav pill (1024x52, radius 18, rgba(18,18,18,.8), blur 20) holds a persistent Buy button. Type 96/100 px, -1.44 px tracking, weight 600 only; 40/44 px on phones; easing .32 s cubic-bezier(.4,0,.6,1). Choreography is Apple's own `data-anim-scroll-group` framework with scroll-scrubbed video, not GSAP.
- **Halide:** the live address is halide.cam. Hero is 8 fixed layers moving at different speeds via an unthrottled `scroll` handler. 4.4 MB, mostly images.
- **Things:** 647 KB, jQuery, almost no animation; the tilted hero is a baked JPG; real price cards (4/2/1 columns); speech-bubble press quotes take ~45% of the page; no hero CTA.
- **Duolingo:** no product screenshot, no social proof; 330x50 uppercase r12 button; a header CTA that appears after the hero CTA leaves; overshoot beziers (.49,.78,.46,1.34) at .3-.4 s.
- **Finch:** one-screen page scrolling inside an inner container; sticker-outline h1; "5.0 ★★★★★ 500k+ ratings" as the only proof; no app UI shown; 1.5 MB of font.
- **Robinhood:** lime #ccff00 pill CTAs (44 px, r36), colour-block sections, weight 400, h2 52 px / -1.5 px tracking; a 4,555 px mobile legal footer; its first hero state draws the headline over a ticker and collides with it.
- Page weight while scrolling: Things 0.65 MB, Finch 2.1, Apple hub 2.6, Duolingo 3.8, Halide 4.5, Flighty 9.0, Robinhood 12.7, Apple Pro 25.4, Opal 47.6.
- Capture gaps: a 14-shot cap means the longest pages were seen only in their first ~7,500 px plus 3-4 tail screens; the middle sections are from DOM headings and flagged in each file. Tween curves of Framer, Webflow IX and Apple are not extractable. Flighty's cookie card stays in most frames.

## Ranked, transferable patterns (for our constraints)

1. **Pinned phone stage with a chapter pill ending in the CTA (Flighty).** Stage 720 px at top 180 px, ~602 px pinned (618 on mobile), 4 pill states, 43 px pill. Build: a short pin (about 600 px), one timeline swapping card opacity/yPercent, a highlight moved with x, the last state is the TestFlight button; chapters Deal a spot / See the mix / Read the reason / Join the beta. Fallback: stacked blocks with their own phone screenshot with no JS or reduced motion. (Caution from the technique research: pins are fragile on iOS; if used, keep it short and desktop-only, as Arc and Framer do.)
2. **Docked blurred nav pill with a persistent CTA after the hero (Apple, Flighty, Opal).** 1024x52 desktop / 370x52 mobile, r18, rgba(18,18,18,.8), blur 20 px, Buy button 73x44. Enters via translateY(-8px) and opacity over .32 s cubic-bezier(.4,0,.6,1), toggled by an IntersectionObserver on the hero CTA; visible with no JS.
3. **Scrubbed word-by-word statement (Opal).** opacity .3 to 1, pinned 2,250 px: shorten to about 120%. Words pre-wrapped in `<span>` in the HTML, spans full opacity by default, dimmed by JS only when motion is allowed.
4. **Perspective-tilted phone with a soft glow and a pill label per feature (Opal; Things bakes the tilt in a JPG).** Glow 0 0 50px rgba(255,255,255,.1). perspective(1200px) rotateY(-14deg) rotateX(6deg) easing to 0; the rest state is the tilted pose.
5. **UI rebuilt in HTML as proof (Flighty notification cards, Robinhood card).** Hairline ring shadows 0 0 0 1px rgba(0,0,0,.04); Opal's tween is 500/700 ms power2.out. Frequency bars as scaleX with transform-origin left, duration .7, stagger .08, plus a reason bubble; final widths in CSS with no JS.
6. **Apple type scale, weight 600 only.** 96/100/-1.44 px, 80/84, 64/68, 48/52, 40/44 on mobile. `clamp(40px, 6.67vw, 96px)`, letter-spacing -.015em; short imperative headlines ending in a full stop.
7. **Plan cards with real numbers (Things).** 4/2/1 columns at 720/480 px, r18, padding 1em, 81 px section padding; fact markers keep `check-site.py` honest. Hover scale(1.05) over .1 s.
8. **Header CTA that appears when the hero CTA leaves, plus a chunky pressable button (Duolingo).** 330x50, r12, 15 px/700 uppercase, ls .8 px; overshoot cubic-bezier(.49,.78,.46,1.34) at .3-.4 s. Press via translateY(2px) with a static bottom-edge shadow.
9. **Colour-block rhythm with one accent and a 44 px pill CTA (Robinhood).** Lime #ccff00 on #110e08, r36, no shadows, weight 400. 5-6 hard-edged sections, one --accent token for every CTA, an optional once-only fade-up (y 24, .6 s power2.out).
10. **One-line proof slot under the CTA (Finch, Flighty, Opal, Apple).** For a beta with no ratings: a stat triplet with 12 px micro-labels ("20 hands a day, free" / "Frequency mix on every spot" / "TestFlight beta"), numbers in fact markers.

## Avoid
Fixed overlays that cover content (Opal's counter, Flighty's cookie card); a headline over a moving ticker (Robinhood); an unthrottled scroll handler rewriting style (Halide); 2.5-viewport pins for two lines of text on a phone (Opal); product-less pages (Duolingo, Finch, Robinhood hero).

## CTA geometry
Opal 135x51 r999; Robinhood 146x44 r36; Apple Buy 73x44 r980; Duolingo 330x50 r12; Flighty nav pill 126x32 r999.
