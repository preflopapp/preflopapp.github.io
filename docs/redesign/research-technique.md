# Research: how to build a modern, animated app marketing site that holds up

Prepared 2026-10-28 for the preflopapp.com rebuild. Scope: technique, performance, motion, design principles, anti-patterns. Teardowns of individual exemplar sites are out of scope here (other agents are doing those).

## How to read the evidence labels

Every non-obvious claim carries a tag so you can tell what was actually read.

- **[S]** Source page fetched and read in full text (curl or WebFetch). The URL is given. This includes primary docs (GSAP, MDN release notes, WebKit, web.dev, W3C, NN/g) and the `web-platform-dx/web-features` data on GitHub.
- **[SR]** Reported by a WebSearch result summary only. I did not read the page itself (blocked, anti-bot, JS-rendered, or low value). Treat as a lead, not a fact.
- **[B]** My own background knowledge or inference. No source retrieved. Verify before relying on it.
- **[Repo]** Read from this repo's code or rules.

Where a source is a vendor blog or an agency trend roundup, I say so. Where the search came back thin, I say that too rather than pad.

---

## Key takeaways for our rebuild

1. **Keep the story, change how it is held in place.** Use plain CSS `position: sticky` for the phone stage and an `IntersectionObserver` (or GSAP `ScrollTrigger` with `onToggle`, no `scrub`, no `pin`) to switch the active chapter. Do not scrub or pin on touch. GSAP's own docs say native scroll runs on another thread than JS, so pins and scrubs on iOS visibly lag or jump, and the only cure (`normalizeScroll`) is a hybrid scroll-jack. (Section 1)
2. **Size full-height stages in `svh`, never `vh`, and never in `dvh` for anything a scroll trigger measures.** `svh` is fixed while the address bar moves; `dvh` changes (throttled) and `100vh` overflows on load. If any `ScrollTrigger` remains, set `ScrollTrigger.config({ ignoreMobileResize: true })`. (Section 1)
3. **Check every ancestor of a sticky element for `overflow` other than `visible`.** It is the most common reason sticky "does nothing". Move clipping to an inner element or use `overflow: clip`. (Section 1; the `clip` remedy is [B])
4. **Add CSS scroll-driven animations as the enhancement layer, behind `@supports` and `prefers-reduced-motion: no-preference`.** As of today (2026-10-28) all three engines ship them (Chrome 115, Safari 26.0, Firefox 159 released yesterday), so it is no longer Chrome-only, but Firefox's support is a day old and Baseline is not yet confirmed. Gate on both `animation-timeline` and `animation-range`. (Section 1)
5. **Use scroll-driven CSS for the small, decorative, scrubbed things** (hero parallax of 1 or 2 floating pieces, a progress bar, headline word emphasis). It runs off the main thread, needs no JS, and drops out cleanly. Keep GSAP for the count-up, the demo and anything stateful. Never polyfill it: a polyfill moves the work back to the main thread. (Section 1)
6. **Never animate the headline, the logo or the primary CTA into view, and never hide body copy until it is scrolled to.** NN/g tested this and found it slows people and loses content. The existing rule "the LCP element stays the `<h1>`" is correct and matches this. (Sections 2, 6)
7. **One motion language, written down as tokens:** 100ms for feedback, 200 to 300ms for entrances, nothing over 400ms for text, ease-out for arriving things, ease-in for leaving, stagger capped (about 40ms step, 160ms total, which is what `tokens.css` already has), play once, one element type at a time. (Section 2)
8. **Hidden start states are set by JS, not CSS, and only for content below the fold.** That is already how `site.js` and `home.js` work; keep it. Scroll-triggered layout shift counts toward CLS and Lighthouse does not scroll, so test CLS with a scripted scroll. (Sections 2, 3)
9. **Performance budget:** LCP at most 2.5 s, INP at most 200 ms, CLS at most 0.1, at the 75th percentile. Animate only `transform` and `opacity`; promote only what moves; use `backdrop-filter` on at most the nav, with a solid-colour fallback; ship phone screenshots as AVIF with WebP fallback, `srcset`, explicit `width`/`height`. (Section 3)
10. **Test WebKit in CI with Playwright, but do not trust it for address-bar behaviour.** Playwright WebKit is not Safari. Put one real-iPhone pass and one Android Chrome pass in the release checklist, or use a real-device cloud service. (Section 3)
11. **Make the hero say what it is and what to do, in the first screen, in words that name the outcome.** Use a specific CTA label ("Join the TestFlight beta", not "Get started"), repeat the same CTA after each persuasion block, and keep a small, high-contrast, quiet persistent CTA on mobile. (Section 4)
12. **Without reviews, do not show small counts.** NN/g says the main social-proof risk is a number that reads as unpopular. Prove it with real product facts (the app's own numbers from `facts.json`), real screens, a named maker and honest beta framing. Never fabricate. (Section 4)
13. **Dark default is a brand choice, not a readability win.** NN/g's literature review found light mode reads better for people with normal vision, especially at small sizes. So keep body copy large and high contrast in dark, honour `prefers-color-scheme`, and make sure the light scheme is first-class, not an afterthought. (Section 4)
14. **Cut the effects list, not just polish it.** The sources agree the "modern" look is restraint plus one or two signature moves. Pick one hero move (the playable demo), one scroll move (the sticky phone), one micro move (count-up and press states), and let everything else be static. Marquee, cursor-reactive pieces and parallax each have a documented cost (Sections 5, 6).
15. **Technique is not the main gap.** Reading `next/js/home.js` and `site.js`, the repo already uses sticky + `svh`, JS-only hidden states, `once`, `matchMedia` gating and reduced-motion early return. The "many artifacts, not polished" problem is most likely composition and consistency (too many different effects with different timings), which this research cannot measure. Section 7 lists what it did not settle.

---

## 1. Scroll storytelling that does not break

### 1.1 What goes wrong on mobile browsers

**Viewport units.** `100vh` equals the large viewport (toolbars retracted), so on load it is taller than the visible area; as toolbars retract it becomes "correct". `svh` is sized with toolbars expanded, `lvh` with them retracted, `dvh` follows the toolbar live. `sv*` and `lv*` sizes are fixed unless the viewport is actually resized. `dvh` does not update at 60 fps: updates are throttled and some browsers debounce them entirely depending on the gesture. The on-screen keyboard is not counted. [S] https://web.dev/blog/viewport-units
- Support: the `sv*/lv*/dv*` units are Baseline high, Baseline low 2022-12-05, high 2025-06-05; Chrome 108, Firefox 101, Safari 15.4. [S] https://github.com/web-platform-dx/web-features/blob/main/features/viewport-unit-variants.yml.dist
- The Pudding's responsive scrollytelling guide advised against `vh` for scroll stories and to use pixel heights from `window.innerHeight` instead, because the toolbar resize "will mess with your scroll triggers". That guide predates the small-viewport units, so `svh` is the modern equivalent of its advice. [S] https://pudding.cool/process/responsive-scrollytelling/ (undated; judged older from the content)
- My inference [B]: a stage sized in `svh` does not change size when the toolbar moves, so the geometry a trigger measured stays valid. That is the reason to prefer it over `dvh` for anything scroll-measured.

**Android Chrome changed again.** From Chrome 135 the layout viewport can extend under the gesture bar ("edge-to-edge"); by default a bottom "chin" retracts on scroll and also resizes the viewport. Pages that opt in with `viewport-fit=cover` must use `env(safe-area-inset-bottom)` for anything pinned to the bottom (a sticky mobile CTA bar is exactly that). [S] https://developer.chrome.com/docs/css-ui/edge-to-edge

**iOS Safari bottom bars.** Search results report iOS 26 Safari bugs where fixed or sticky content could not reach the bottom under the floating toolbar, and bottom bars drifting after the keyboard closes; one fix is listed in the Safari 26.1 notes. I could not read the Apple forum threads (anti-bot page). [SR] https://developer.apple.com/forums/thread/800798, https://developer.apple.com/forums/thread/799216
- WebKit's own Safari 27.0 notes (2026-09-17) add scroll anchoring (content no longer jumps when something loads above) and fix an iOS bug where `scrollTo` interrupted momentum scrolling. [S] https://webkit.org/blog/18325/webkit-features-for-safari-27-0/
- Safari 27.1 (2026-10-23) notes that viewport sizes on iPhone Duo range from 382 to 951 CSS px wide and 368 to 902 tall, with the tab bar at the bottom by default. Do not hard-code an assumed phone shape. [S] https://webkit.org/blog/18486/webkit-features-for-safari-27-1/

### 1.2 What GSAP says about its own pins on mobile (primary source)

All [S] from gsap.com docs.

- **Address bar resize causes jumps, by design.** "When the viewport resizes, ScrollTrigger must recalculate the start/end positions and they likely change at the new viewport size (hence the jump). It's logically impossible to keep things accurate in terms of trigger positions AND avoid any changes. This isn't a bug." https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll()
- **`ignoreMobileResize`** (3.10.0): vertical resizes of 25% of viewport height on touch-only devices skip `refresh()`; the trade-off is that start/end positions "may be inaccurate but in many scenarios that's preferable to the visual jumps". Set through `ScrollTrigger.config()`. https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config()
- **Threads:** modern browsers scroll on a different thread, so a pinned element can "appear to jump when it initially pins/unpins" because the browser repainted before JS applied the pin. iOS Safari "misreports scroll position as well as `event.clientX/Y` intermittently, causing jitter", with some bugs "reported back in January 2018 and still haven't been fixed". Momentum differs between Android and iOS. (same page)
- **`normalizeScroll(true)`** moves scrolling onto the JS thread and prevents the address bar from showing/hiding on most devices. But: it "is a hybrid form of scroll-jacking", is called experimental, and on the latest iOS in portrait on phones the browser forces the show/hide anyway. It relinquishes control for multi-touch and pinch-zoom. GSAP does not turn it on by default because "it often isn't needed and we prefer to let the browser handle things natively". (same page)
- **`anticipatePin`**: a small fix for the one-frame flash when pinning large panels while scrolling fast; "in many cases you don't need any". https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- **`pinSpacing`** adds padding to push following content; it silently does nothing useful inside a `display: flex` or `position: absolute` parent, and defaults to `false` in a flex container. **`pinType`**: `fixed` only when the scroller is `<body>`, else transforms. A `transform` or `will-change` on any ancestor breaks `position: fixed`; `pinReparent: true` is the (expensive) escape hatch. https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- **Refresh:** start/end are static positions computed at creation and on resize; call `ScrollTrigger.refresh()` after layout changes. Default `autoRefreshEvents` are `visibilitychange,DOMContentLoaded,load,resize`. `invalidateOnRefresh` flushes recorded start values. `start: "clamp(...)"`/`end: "clamp(...)"` (3.12+) keeps triggers near the page edges from leaking. https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config()
- **`gsap.matchMedia()`** reverts everything created in a condition when it stops matching; GSAP's own pattern is to include `(prefers-reduced-motion: reduce)` as a condition. https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ and https://gsap.com/resources/a11y/
- Forum threads (2020 to 2025) report the same: `ignoreMobileResize` is the first thing to try, `normalizeScroll` helps some cases and breaks fixed navbars in others, "no silver bullet". [SR] e.g. https://gsap.com/community/forums/topic/38690-laggy-and-jittery-transform-animation-on-mobile/ , https://gsap.com/community/forums/topic/39457-persistent-issue-with-gsap-scroll-trigger-on-iphone-in-battery-save-mode/

### 1.3 `position: sticky` pitfalls

Sticky pins to the nearest ancestor that has any `overflow` other than `visible`, even if that ancestor never scrolls; the sticky element can only travel inside its parent's height; it needs an offset (`top`) to engage. Frontend Masters notes other, subtler causes exist. [SR] https://sizzy.co/blog/position-sticky-not-working , https://frontendmasters.com/blog/the-weird-parts-of-position-sticky/ . The `overflow: clip` remedy (clips without creating a scroll container) is [B].

Josh Comeau's scroll-driven animation guide demonstrates a sticky element whose fade is driven by another element's timeline, i.e. sticky plus scroll timelines combine well. [S] https://www.joshwcomeau.com/animation/scroll-driven-animations/

### 1.4 When a pin or scroll-jack is the wrong tool

NN/g (usability testing of scrolljacking, "changing the normal pace or direction of scrolling"): [S] https://www.nngroup.com/articles/scrolljacking-101/
- Most participants were at least mildly disoriented; lengthy scrolljacks were read as bugs; task-oriented users were highly annoyed.
- Worst case: altered scroll rate plus text that changes. "We advise against including important content inside of a scrolljack section."
- "Scrolljacking is worse on mobile"; "In most cases, [the benefit is] not [worth the cost]". Recommends no scrolljack on mobile, only below the fold, short, mixed with normal scrolling, no direction change, and a sticky nav as an escape hatch.
- It is tolerated when it has functional value: step-by-step feature breakdown mapped to a physical device (their Apple Watch Ultra example) and progressive disclosure (BBC).
- Note the distinction: a `position: sticky` stage with chapters scrolling past it does **not** change scroll rate or direction, so it is not scrolljacking in NN/g's sense. A `scrub` that makes content move at a speed unrelated to the finger is. [B, my reading of the definition]

The Pudding on small screens: "keep it scrolly" only if the transitions are meaningful; otherwise stack. A stack is better if performance could suffer, steps stand alone, or time is short. Steppers and swipe/tap override default scrolling and they do not recommend them. [S] https://pudding.cool/process/responsive-scrollytelling/

**What to do instead (ranked for us):**
1. Plain stacked sections on phones: each chapter shows its own screenshot inline (the repo already has `.story__inline` for this). [Repo]
2. Sticky stage plus chapter toggling on wide screens: `position: sticky` in CSS; chapter activation by `IntersectionObserver` (or `ScrollTrigger.create({ onToggle })`, no scrub). Scrollama is a small IntersectionObserver-based library for exactly this and its maintainers moved enter/exit handling to CSS sticky. [SR] https://pudding.cool/process/introducing-scrollama/ (we likely do not need the library; the pattern is 20 lines)
3. CSS scroll-driven animation for scrubbed decoration (below).

### 1.5 CSS scroll-driven animations and View Transitions: support as of 2026-10-28

| Feature | Chrome/Edge | Safari/iOS | Firefox | Source |
|---|---|---|---|---|
| Scroll-driven animations (`animation-timeline: scroll()/view()`, `animation-range`) | 115 (2023) | 26.0 (2025-09-15) | 159, enabled by default, released 2026-10-27 | [S] below |
| Same-document View Transitions | 111 | 18 | 144 | [S] web-features |
| Cross-document View Transitions | 126 | 18.2 | not listed in the data I read | [S] web-features |
| `linear()` easing (spring/bounce curves) | 113 | 17.2 | 112 | [S] web-features |
| `backdrop-filter` | 76 | 18 (unprefixed) | 103 | [S] web-features |
| AVIF | 85 (Edge 121) | 16.4 | 113 | [S] web-features |
| `text-wrap: balance` | 114 | 17.5 | 121 | [S] web-features |
| `@starting-style` | 117 | 17.5 | 129 | [S] web-features |

Evidence for the scroll-driven row:
- WebKit, Safari 26.0 release post (2025-09-15) lists "Scroll-driven animations" and shows `animation-timeline: view()` with `animation-range: 0% 50%`. [S] https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- MDN's Firefox 159 release notes: "Scroll-driven animations are now enabled by default", "Firefox 159 was released on October 27, 2026". [S] https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/159 , and the merged MDN PR (2026-10-22) [S] https://github.com/mdn/content/pull/46199
- `web-platform-dx/web-features` `scroll-driven-animations.yml.dist` (fetched from `main` today) lists Chrome/Chrome Android/Edge 115 and Safari/iOS 26, no Firefox, `baseline: false`. That snapshot predates Firefox 159, so I infer (not verified) that the Baseline "newly available" label follows now that all three ship. [S] https://github.com/web-platform-dx/web-features/blob/main/features/scroll-driven-animations.yml.dist
- Interop 2026 lists both scroll-driven animations and view transitions (now including cross-document) as focus areas, so cross-browser behaviour differences are being actively worked on. [S] https://web.dev/blog/interop-2026
- A secondary source claimed Safari "18.4+" supported it. WebKit's own post says 26.0; trust WebKit. Another (CoreDash article, updated 2026-10-26) still says "Safari still in development", which is stale. [S] https://corewebvitals.io/pagespeed/scroll-triggered-animations-cause-cls

Gotchas:
- Firefox Nightly once shipped a partial implementation (it had `animation-timeline: scroll()` but not `animation-range`), so a bare `@supports (animation-timeline: scroll())` passed and then mistimed. Gate on both. [S] https://www.bram.us/2024/09/24/feature-detecting-scroll-driven-animations-you-want-to-check-for-animation-range-too/
- The `animation` shorthand resets `animation-timeline`, so declare the timeline after it; Firefox reportedly needs a non-zero `animation-duration`. [SR] https://flaviocopes.com/css-scroll-driven-animations/ , https://ics.media/en/entry/230718/
- Chrome says scroll-driven animations can "run off the main thread". [S] https://developer.chrome.com/docs/css-ui/scroll-driven-animations CSS-Tricks adds the corollary: a polyfill "will force the animation to run on the main thread", so skipping the animation on unsupported browsers is the performant choice. [S] https://css-tricks.com/bringing-back-parallax-with-scroll-driven-css-animations/ I could not verify from a source that Safari runs them off-thread (one third-party post claimed threading arrived in 26.4; unconfirmed).
- **Scroll-triggered** animations (time-based, fire at an offset; `animation-trigger`, `timeline-trigger`) are a separate, newer thing: Chrome 145 only, "say goodbye to IntersectionObserver for this type of effect". Not usable cross-browser yet. [S] https://developer.chrome.com/blog/scroll-triggered-animations
- Cross-document view transitions on a static multi-page site need only CSS, and browsers without support just navigate. [SR] https://developer.chrome.com/docs/web-platform/view-transitions/cross-document . Same-document transitions have an Interop wrinkle: Firefox's first implementation lacks view transition types. [S] https://developer.chrome.com/blog/view-transitions-in-2025

**Is `@supports` progressive enhancement sensible?** Yes, and it is the pattern all the primary sources use. The layout must be complete with no animation; the enhancement is wrapped in `@supports (animation-timeline: view()) and (animation-range: entry 0% cover 30%)` and `@media (prefers-reduced-motion: no-preference)`. CSS-Tricks and Smashing both recommend combining the two. [S] https://css-tricks.com/bringing-back-parallax-with-scroll-driven-css-animations/ , https://www.smashingmagazine.com/2021/10/respecting-users-motion-preferences/ . A CSP note [B]: scroll-driven CSS is plain stylesheet rules, so it fits `style-src 'self'` with no change.

Reveal-on-scroll in pure CSS looks like this (pattern from Chrome's docs, adapted) [S pattern, B adaptation]: `animation: reveal linear both; animation-timeline: view(); animation-range: entry 25% cover 50%;` with `@keyframes reveal { from { opacity: 0; translate: 0 12px } }`. Chrome notes the default `cover` range means an element is not complete until it has left; narrow the range. https://developer.chrome.com/docs/css-ui/scroll-driven-animations

---

## 2. Reveal-on-scroll and entrance animation done right

### 2.1 What the usability evidence says

- **Do not make text wait for the scroll.** NN/g observed participants slowed by "a visual effect that caused the main text content to animate into place only after the user had scrolled down to that area". Guidelines: consider context (task-focused visitors get annoyed), use scroll-triggered animation for **secondary** content not body text, and only animate **once**. [S] https://www.nngroup.com/articles/scroll-animations/
- **Scroll fading:** users skip text that fades too slowly; "a scroll-fade animation that takes more than 500ms is perceived as too slow"; test 100 to 400 ms; fade one element type at a time (text or images, not both); persist content after first reveal; beware "false floors": below-fold content that fades in only after you scroll into seemingly empty space was missed entirely because the page looked finished. The only scroll-fade text they praised was short and punchy (Apple Card page). [S] https://www.nngroup.com/articles/scroll-fading-101/
- **Never animate the critical homepage elements** (logo, tagline, main headline) and avoid animation whose only purpose is drawing attention. [SR] https://www.nngroup.com/articles/113-design-guidelines-homepage-usability/ (the 113 guidelines page was not fetched; the claim came via a search summary)
- **Parallax:** some users scrolled "and saw almost nothing on the screen, because the parallax effects hadn't animated yet"; users scan fast and miss content that waits on motion. [S] https://www.nngroup.com/articles/parallax-usability/

### 2.2 Avoiding flashes, never-appearing content and layout shift

- **Hidden state is JS's job.** Start states are applied by script, so with no JS, a blocked script or an error, everything is visible. Several sources describe this (class on `<html>` added by JS; `IntersectionObserver` fallback that reveals all when unsupported). [SR] https://design.verdigris.co/categories/animation/scroll-reveal , https://github.com/phantomstudios/reveal-on-scroll . Our code already does it and states it in the header comment. [Repo] `next/js/home.js:1-7`
- **Skip hiding anything already on screen at load** (so nothing above the fold waits on JS). Already implemented in `site.js`. [Repo]
- **Reduced motion:** wrap the whole enhancement in `no-preference` (older browsers ignore the query and show the static design) [S] https://www.smashingmagazine.com/2021/10/respecting-users-motion-preferences/ ; for JS animation, listen for changes and stop in-flight animations [S] https://web.dev/articles/prefers-reduced-motion ; with GSAP use `gsap.matchMedia()` and either remove or reduce depending on the animation [S] https://gsap.com/resources/a11y/ . "Reduced" is not "none": a short opacity fade is a common substitute for movement. [SR] same Smashing article's discussion.
- **Layout shift:** shifts caused by scrolling are **not** excluded from CLS (only discrete input gets the 500 ms grace period), a `top`/`height`/`margin` animation on scroll counts every frame, and Lighthouse does not scroll so it will not show it. 40% of mobile pages still use non-composited animations per the cited Web Almanac figure. Use `transform`/`opacity`. [S] https://corewebvitals.io/pagespeed/scroll-triggered-animations-cause-cls . Also reserve image space with `width`/`height` or `aspect-ratio`. [S] https://web.dev/articles/optimize-cls

### 2.3 Duration, easing, stagger conventions

- NN/g: most animations 100 to 500 ms; ~100 ms for simple feedback; 200 to 300 ms for large changes like a modal; 400 ms is "very slow", for big movement across large screens; at 500 ms it drags. Entering takes slightly longer than leaving (their example 300 ms in, 200 to 250 ms out). Linear motion "looks weird and unnatural"; ease-out for entrances ("responsive but gives the eye time to focus as it comes to rest"), ease-in for exits. [S] https://www.nngroup.com/articles/animation-duration/
- NN/g on sticky headers: if they must animate, a slide of roughly 300 to 400 ms triggered by a few pixels of upward scroll feels natural. [S] https://www.nngroup.com/articles/sticky-headers/ (the 300 to 400 figure appears in the search summary and the article section on partially persistent headers)
- Material 3 tokens: short 50 to 200 ms, medium 250 to 400 ms, long 450 to 600 ms, extra-long 700 to 1000 ms; emphasized-decelerate `cubic-bezier(0.05, 0.7, 0.1, 1.0)`, standard `cubic-bezier(0.2, 0, 0, 1)`. Google is moving to spring-based tokens. [SR] https://m3.material.io/styles/motion/easing-and-duration/tokens-specs (page is JS-rendered; fetch returned nothing)
- Stagger: the guidance I found is community and "agent skill" documents (about 50 ms per item, capped so the whole stagger is around 500 ms). Weak evidence. [SR] e.g. https://m1.material.io/motion/duration-easing.html is the only official source in that result set, and it does not give numbers. Our `tokens.css` values (240 ms, 12 px rise, 40 ms step, 160 ms cap) sit inside every range above. [Repo]

### 2.4 How much motion is too much

- Val Head (A List Apart): triggers depend on **relative size** of movement, **direction mismatch vs the scroll**, and **distance covered**. Opacity, colour and blur changes are "unlikely to be problematic"; exaggerated parallax and scroll-jacking are "highly likely to be triggering". She names the Apple iPhone page's "parallax-ish background animations and scrolljacking" as a trouble case for a reader with a vestibular disorder, and Apple.com's carousel with no pause. [S] https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/ (an older article; the Apple pages have since changed)
- WCAG 2.3.3 Animation from Interactions (AAA): scrolling itself is essential movement and allowed, but "Only add non-essential animation to the scrolling interaction in a responsible way. Always give users the ability to turn off unnecessary movement." [S] https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- WCAG 2.2.2 Pause, Stop, Hide (Level A): motion that starts automatically, lasts more than five seconds and sits beside other content needs a pause/stop/hide mechanism. This is what a marquee or looping demo falls under. [S] https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide
- Rule of thumb for the rebuild (my synthesis [B]): at any scroll position, one thing should be moving, it should be small relative to the screen, and it should move in the direction of the scroll.

---

## 3. Performance and robustness

### 3.1 Core Web Vitals targets

At the 75th percentile of page loads, segmented by mobile and desktop: **LCP at most 2.5 s, INP at most 200 ms, CLS at most 0.1**; poor is over 4 s, over 500 ms, over 0.25. [S] https://web.dev/articles/vitals and https://github.com/GoogleChrome/web-vitals/blob/main/README.md

LCP breakdown (web.dev): about 40% TTFB, under 10% resource load delay, about 40% resource load duration, under 10% element render delay. Making the file smaller will not help if time just moves to render delay. If the LCP element is text that needs a web font, preload that font. Preload the LCP image with `fetchpriority="high"` if it is not in the HTML. [S] https://web.dev/articles/optimize-lcp , https://web.dev/articles/fetch-priority (Google Flights example: LCP 2.6 s to 1.9 s with high priority). Our rule "LCP element stays the `<h1>`, keep SemiBold preloaded" is consistent. [Repo]

INP: long tasks (over about 50 ms) from script evaluation or fat handlers are the main cause; yield to the main thread; avoid layout thrashing (write then read styles in one task). [S] https://web.dev/articles/optimize-inp

### 3.2 Safe animation properties, layers, will-change

- Only `transform` and `opacity` can be handled by the compositor without layout or paint; promote only what moves; "every layer you create requires memory and management... on devices with limited memory the impact on performance can far outweigh any benefit". Their guideline for compositing time during scroll is about 4 to 5 ms. No numeric layer limit is given. [S] https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count (a 2015 article, but the principle is unchanged and repeated by 2026 sources)
- NN/g notes opacity changes can still be computationally expensive when many elements change at once. [S] https://www.nngroup.com/articles/animation-duration/
- `will-change: transform` on an ancestor breaks `position: fixed` descendants (GSAP docs). [S] https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Remove `will-change` after the animation, add it just before. [SR] https://www.cssportal.com/css-properties/will-change.php

### 3.3 backdrop-filter and blur on iOS

Baseline low from 2024-09-16, unprefixed in Safari 18. [S] https://github.com/web-platform-dx/web-features/blob/main/features/backdrop-filter.yml.dist . MDN's page says nothing about cost. [S] https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
The cost claims are practitioner anecdotes and I found no Apple/WebKit measurement: it re-composites what is behind the element every frame; do not animate the blur radius (reports of about 30 fps on phones; animate opacity instead); keep radius modest on large areas; limit to a few glass surfaces per viewport; ship a solid-colour default with blur as an enhancement because Reduce Transparency cannot be detected from CSS alone. [SR] https://www.buildmvpfast.com/blog/liquid-glass-css-backdrop-filter-recipes-2026 , https://blog.openreplay.com/creating-blurred-backgrounds-css-backdrop-filter/ . Recommendation [B]: nav bar only, static blur, solid fallback, profile on a real iPhone.

### 3.4 Images: phone screenshots

- AVIF is Baseline high (low 2024-01-25, high 2026-07-25): Chrome 85, Firefox 113, Safari 16.4. So AVIF-first with WebP fallback is safe. [S] https://github.com/web-platform-dx/web-features/blob/main/features/avif.yml.dist
- Savings figures vary by source (about 20 to 30% smaller than WebP at similar quality is the common claim; one says up to 50%); treat as direction not number. [SR] https://blog.codercops.com/blog/web-images-avif-webp-lcp-optimization-2026
- `srcset` + `sizes` describe candidates and layout width; the browser picks by DPR; `<picture>` for explicit control. Set `width`/`height` (or `aspect-ratio`) always. Do not lazy-load the LCP image; lazy-load below-fold images. [S] https://web.dev/learn/images/responsive-images , https://web.dev/articles/optimize-cls , https://web.dev/articles/fetch-priority
- For us [B]: the hero's phone is a live demo (not an image), so screenshots are below the fold; give each `width`/`height`, `loading="lazy"`, `decoding="async"`, and size phone shots to their rendered width at 2x (screens are narrow, about 300 to 400 CSS px, so 600 to 800 px source is typical). Screenshots with flat UI colours often compress better as lossless WebP than AVIF; test per image.

### 3.5 Fonts

Self-host, WOFF2 only, subset, preload only the one or two critical files (preload ignores `unicode-range`), `font-display: swap` or `optional`, and reduce swap shift by matching fallback metrics. [S] https://web.dev/articles/font-best-practices . The `size-adjust`/`ascent-override` fallback-matching technique is described by Shopify; I read it only via search. [SR] https://shopify.dev/docs/storefronts/themes/best-practices/performance/reduce-cls-font-swapping . Hanken Grotesk is a variable font on Google Fonts [B]; check the vendored file is subset to Latin and one variable file, not several static weights.

### 3.6 Keeping JS small

Vendored GSAP 3.15.0 is 72.9 KB raw / 28.3 KB gzip, ScrollTrigger 44.6 KB / 18.0 KB gzip: about 46 KB gzip together, parsed and run on every visit. [Repo] measured with `gzip -9`. Ways to cut it: move scrubbed/decorative work to CSS scroll-driven animation (Section 1.5); skip loading GSAP at all when `prefers-reduced-motion: reduce` (a Smashing article shows this pattern) [SR] https://www.smashingmagazine.com/2023/11/creating-accessible-ui-animations/ ; defer, no layout reads inside scroll handlers. GSAP's `ScrollTrigger` itself checks scroll position every 200 ms by default (`syncInterval`). [S] https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config()

### 3.7 Testing on real devices without owning them

- Playwright's WebKit "is derived from the latest WebKit main branch sources, often before these updates are incorporated into Apple Safari"; it "doesn't work with the branded version of Safari"; Linux CI WebKit is cheapest but macOS is closest to Safari. It emulates device viewports. [S] https://playwright.dev/docs/browsers
- It cannot reproduce iOS toolbar collapse, momentum scrolling, memory pressure or backgrounding. [SR] https://www.browserstack.com/guide/playwright-safari , https://www.sizzy.co/blog/test-on-iphone-without-iphone (vendor blogs, but consistent with the above) and [B].
- Real-device clouds (BrowserStack, LambdaTest) run Safari on real iPhones, including Playwright on real iOS devices (vendor press releases). [SR] https://www.browserstack.com/guide/playwright-ios-automation
- Xcode iOS Simulator on a Mac behaves differently from a real device for networking and some APIs. [SR] https://soledadpenades.com/posts/2024/using-simulators-to-test-in-safari
- For scroll-triggered CLS, script a scroll in Playwright and read `layout-shift` entries, since Lighthouse never scrolls. [B], motivated by [S] corewebvitals.io above.
- Suggested checklist [B]: Playwright WebKit + Chromium + Firefox in CI for layout and no-JS/reduced-motion; one real iPhone (Safari, toolbar showing and retracted, portrait and landscape, Low Power Mode, Reduce Motion on) and one mid-range Android with Chrome before each launch.

---

## 4. Design principles of high-performing app landing pages

**Evidence quality warning.** Most "conversion" claims for app landing pages come from vendor blogs and roundups. The only independent, tested guidance I could retrieve is NN/g's. I mark each accordingly.

### 4.1 Above the fold, hero and clarity

- NN/g eyetracking (2018 update): users spent about 57% of viewing time above the fold, 74% in the first two screenfuls, 81% in the first three. Attention drops sharply at the fold, but the fold barrier has moved to roughly the third screenful. "Reserve the top of the page for high-priority content... Keep major CTAs above the fold." Beware **false floors**: minimalist layouts that look finished and stop scrolling; use signifiers such as cut-off content. [S] https://www.nngroup.com/articles/scrolling-and-attention/
- NN/g homepage principles: state who you are and what you do with an explicit, scannable tagline; communicate the value proposition in the hero; speak the user's language, avoid jargon and feature lists; **reveal content through specific examples** rather than umbrella terms; clear visual hierarchy so important tasks stand out; avoid purely decorative images ("users tend to skip over them"); keep it simple. [S] https://www.nngroup.com/articles/homepage-design-principles/
- App-landing roundups (vendor/agency, low weight): realistic device mockup, benefit-driven headline, one primary CTA, early proof, fast load. Named examples reported there: Headspace (illustration + player mockup, user count under the hero), Slack (screenshots and short video), Duolingo (gamified brand). [SR] https://theswiftk.it.com/blog/best-app-landing-page-examples-2026 (a Flutter boilerplate vendor), https://www.uxpin.com/studio/?p=51891 . Raycast: a design-breakdown site describes a dark UI, animated product preview, restrained motion, UI graphics rather than stock photos. [SR] https://www.saasframe.io/examples/raycast-landing-page
- Hero format (device mockup vs interactive demo vs video loop): no independent test found. Userpilot (sells tour tools) reports 24.35% conversion for visitors who engaged an interactive demo vs 3.05% for others, and HowdyGo (sells demo tools) audited pages and found 94% use plain screenshots and 4.3% interactive demos. Both are vendors and the first is a correlation (people who engage are already interested). [SR] https://userpilot.com/blog/interactive-product-demo/ , https://www.howdygo.com/blog/show-your-product . Our playable demo is a defensible bet but the evidence is "directional at best"; measure with beta-join clicks.

### 4.2 CTA repetition and placement for a TestFlight beta

- Label names the outcome. NN/g: a generic "Get Started" "attracts clicks, but also misleads users". Use the exact action ("Join the TestFlight beta") and say what happens next (TestFlight install, iPhone only). [S] https://www.nngroup.com/articles/get-started/
- Repetition: CTA blogs say repeat the same label and style after each persuasion block and consider a sticky bottom button on mobile; none is a controlled test. [SR] https://bitly.com/blog/cta-button-best-practices , https://conversionsciences.com/mobile-call-to-action-buttons-best-guidelines-for-placement-copy-design/2/
- Persistent UI: keep it as small as readable, high contrast, minimally animated, not obscuring content. NN/g also found a sticky bottom action beat a top one for a form submit. [S] https://www.nngroup.com/articles/sticky-headers/ ; [SR] NN/g touch-target guidance, 44 x 44 pt Apple / 48 x 48 dp Google. https://www.nngroup.com/articles/touch-target-size/
- Our case [B]: TestFlight requires iOS, so on desktop the CTA should offer a way to open the link on the phone (QR or "send to my phone") as well as the direct link. No source retrieved on this specific flow.

### 4.3 Social proof when there is none

- NN/g: social proof reduces uncertainty, but "the most significant risk... is the perception that too few people approve"; the second risk is clutter and slow widgets. Test with confidence surveys. [S] https://www.nngroup.com/articles/social-proof-ux/
- So do not show "12 beta testers". Honest, specific, non-numeric proof types suggested by marketing guides: founder/maker credentials stated concretely, real beta tester quotes with names, press/awards, and being transparent that it is a beta. Weak sources, but consistent with NN/g. [SR] https://landingdoctors.com/guides/social-proof-swipe-file-few-customers
- Fabricated testimonials or counts carry legal and trust risk. [SR] same swipe-file result; the site's own rule that illustrations say they are drawn is the right instinct. [Repo]
- Real product facts are proof you already own: the app's own spot count, grades, ranges (`facts.json`). [Repo] NN/g: "Provide specific examples of your site's content... more effective than broad umbrella terms". [S] homepage principles above.

### 4.4 Pricing section

Only generic sources found. For a free-plus-Pro app: show both plans, mark the one you want people to choose, give each plan a distinct CTA label (two identical "Get started" buttons are ambiguous), state the key limit up front; the free tier works as the entry point rather than converting cold traffic. [SR] https://pipelineroad.com/agency/blog/saas-pricing-page-best-practices , https://app.uxcel.com/courses/common-patterns/pricing-best-practices-494/communicate-the-differences--5941 . During beta, the page should say what is free now and what Pro adds later; `facts.json` must stay the only source of numbers. [Repo]

### 4.5 Typography scale, spacing, color systems

- Fluid scale: pick min and max viewport and sizes and interpolate with `clamp()` instead of per-breakpoint sizes; Utopia gives the formula (slope and intercept) and generates modular type and spacing scales. Ratios in the 1.2 to 1.25 range are a typical default. [S] https://utopia.fyi/blog/clamp/ ; [SR] ratio/spacing details https://smithery.ai/skills/matthewharwood/utopia-fluid-scales (secondary)
- Linear's own redesign write-up (primary, 2024): reduce visual noise, increase hierarchy; define the whole theme from **three** variables (base color, accent color, contrast) in the LCH colour space (perceptually uniform, so equal lightness looks equally light) instead of 98 hand-set variables, with contrast as a variable to auto-generate high-contrast themes; limit how much of the chrome colour feeds the neutrals to stay "neutral and timeless"; Inter Display for headings, regular Inter for body. This is app-UI guidance but the token discipline transfers to a site. [S] https://linear.app/now/how-we-redesigned-the-linear-ui
- Third-party analyses of Linear's marketing site (dark-native, hierarchy through white-opacity borders and text, 4px grid, accent used sparingly) are blog opinions with conflicting hex values. [SR] https://www.925studios.co/blog/linear-design-breakdown-saas-ui-2026
- Density vs whitespace: I found no evidence-based source; do not cite one. [B] The practical rule is whitespace between sections, density inside a card (the repo's `--section-y` and `.section--flush` rules already encode this).

### 4.6 Dark-mode-first

NN/g (literature review, no original study): for normal vision, light mode gave better visual-acuity and proofreading performance, and the advantage grows as text gets smaller; dark mode may help people with cataracts and similar; no reliable fatigue difference; graphics must work in both; dark mode is largely preference and aesthetics. [S] https://www.nngroup.com/articles/dark-mode/ . Common design-blog advice is dark grey rather than pure black and off-white rather than pure white to limit halation, with WCAG AA contrast (4.5:1 body, 3:1 large) as the floor; this is convention, not measured. [SR] https://uxcel.com/blog/12-principles-of-dark-mode-design-627 . Implication [B]: dark by default is fine for a poker/"pro tool" brand, but keep body text at least 16 px with generous contrast, respect `prefers-color-scheme`, and check the light scheme with the same care (the repo already notes light-scheme contrast fixes). [Repo]

### 4.7 Mobile-first layout

NN/g found scrolljacking and heavy effects worse on phones. [S] scrolljacking article above. A phone gets the plain stacked version first; enhancements are layered for wide, pointer-fine, no-preference contexts via `matchMedia`. [B, consistent with the repo's `(hover: hover) and (pointer: fine)` gate]

---

## 5. Motion trends that look current rather than gimmicky

The "2026 trends" results are agency roundups (tinyfrog, line25, etc.) that agree mainly on "restraint and balance"; they are opinion. I use them only for what trends exist; the accessibility and performance facts come from primary sources. [SR] https://line25.com/articles/web-design-trends-2026/ , https://tinyfrog.com/web-design-trends-2026/

| Trend | Looks current when | Known trouble | Evidence |
|---|---|---|---|
| **Kinetic type** (words or lines rising in) | Per-word or per-line, short, once, on secondary or supporting text, never on the H1 | Per-letter wrapping makes some screen readers announce letter by letter; headline animation delays reading and may harm LCP | css-irl: wrapping chars can make some readers spell out text, fix with `aria-label` on the parent plus `aria-hidden` on spans, behaviour varies by reader [S] https://css-irl.info/how-to-accessibly-split-text/ . GSAP SplitText (default `aria: "auto"`) adds `aria-label` to the split element and `aria-hidden` to the pieces [S] https://gsap.com/docs/v3/Plugins/SplitText/ . A critique argues label-on-a-generic-div is not reliable and to avoid letter splits [SR] https://adrianroselli.com/2026/02/you-know-what-just-dont-split-words-into-letters.html (host rate-limited, 429) . NN/g on text delays [S] |
| **Number tickers / count-up** | Final value in the HTML; counts once, under about a second, tabular digits | Announcing every frame to a screen reader; ignoring reduced motion | Keep the final number in markup, no `aria-live`, label it, skip animation under reduced motion. [SR] https://docs.tabler.io/ui/plugins/countup . The repo already does this (`data-count`, tabular digits, returns early under Reduce Motion). [Repo] |
| **Marquee / logo strip** | Slow, pauses on hover and focus, stops under reduced motion, only if there is real content to show | WCAG 2.2.2 (Level A) needs a pause mechanism when it runs over 5 s next to other content; cost of an always-running compositor layer | [S] https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide . With no logos or reviews yet, a marquee of anything is filler (judgement [B]) |
| **Bento grids** | Varied tile sizes with one hero tile; each tile is a single idea | Stacking order on phones; every tile animating differently reads as "many artifacts" | Roundups only [SR]. Plan the mobile order first [B] |
| **Cursor-reactive pieces** | Tiny tilt or glow, only with a fine pointer and no reduced-motion preference | Meaningless on touch; hover must not move the target under the pointer (the repo's chart explorer froze on this) | `(hover: hover) and (pointer: fine)` gate; do not rely on cursor change as the only affordance [SR] https://web.dev/learn/css/cursors-and-pointers ; [Repo] `.claude/rules/next.md` |
| **Depth / parallax** | One or two small decorative offsets in the scroll direction | Vestibular triggers when layers move at different speeds or against the scroll; "ignored or missed"; blank screens before it animates | [S] ALA Val Head, NN/g parallax, WCAG 2.3.3, web.dev reduced-motion article. CSS scroll-driven parallax runs off the main thread [S] https://css-tricks.com/bringing-back-parallax-with-scroll-driven-css-animations/ |
| **Microinteractions** | 100 ms feedback on press and toggle; state changes that explain something | Decoration without information | NN/g: ~100 ms for toggle-type feedback [S] https://www.nngroup.com/articles/animation-duration/ |
| **Spring easing** | Small, one-shot settle on entering elements or a toggle; via `linear()` | Overshoot on big movements feels toy-like and can trigger motion sensitivity (judgement [B]) | `linear()` is Baseline high (low 2023-12-11, high 2026-06-11) [S] https://github.com/web-platform-dx/web-features/blob/main/features/linear-easing.yml.dist ; spring/bounce are sampled in JS then pasted as stops [SR] Chrome article; Material moving to springs [SR] |
| **View transitions** | Cross-page fade for a multi-page static site, or a state swap in the demo | Interop gaps (types), snapshots of large pages cost memory (judgement [B]) | [S] web-features and Chrome 2025 update above |
| **Glass / blur** | Nav bar only | Cost and Reduce Transparency | Section 3.3 |
| **WebGL gradients / shader backgrounds** | One decorative hero element | Battery and thermal cost; hard to make static | Forum comments about Stripe-style gradients mention battery drain; anecdotal [SR] https://gsap.com/community/forums/topic/24837-animating-gradients/ |
| **Smooth-scroll libraries (Lenis etc.)** | Not recommended here | Replaces native scroll feel; double-smoothing on trackpads; interacts badly with iOS | GSAP calls its own `normalizeScroll` "a hybrid form of scroll-jacking" [S]. Thoughtworks Radar put Lenis at "Assess" (Oct 2024) [SR] https://www.thoughtworks.com/radar/languages-and-frameworks/lenis ; Lenis issue about macOS trackpad double-smoothing [SR] |

---

## 6. Anti-patterns (what makes animated marketing sites feel janky, generic, over-designed)

1. **Scroll-jacking.** Disorientation, "interpreted as a bug", worse on mobile, worst with text. [S] https://www.nngroup.com/articles/scrolljacking-101/ . Named by NN/g as failures: Crypto.com (whole page), Reachdesk (horizontal scroll-jack with text fading), Therabody (nothing happened on scroll). Short, functional ones (BBC; Apple Watch Ultra feature breakdown) were tolerated.
2. **Text that waits for the scroll.** [S] https://www.nngroup.com/articles/scroll-animations/ and https://www.nngroup.com/articles/scroll-fading-101/ (false floors, too-slow fades, replays on scroll back, text and images fading together).
3. **Parallax-first design.** Content missed; blank screens before animation; vestibular harm. [S] https://www.nngroup.com/articles/parallax-usability/ , https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/ .
4. **Ignoring `prefers-reduced-motion`** and removing native behaviours (text selection, focus outlines, native scrolling, alt text); letter-split headings with no accessible name. [SR] https://girl-code.cydstumpel.nl (a creative developer's accessibility guide, via search summary only; the page was not fetched)
5. **Janky by construction:** animating layout properties (`top`, `height`, `margin`), scroll handlers on the main thread, many composited layers, `backdrop-filter` everywhere, a pin whose geometry changes when the address bar moves. [S] corewebvitals.io, web.dev compositor, GSAP docs above.
6. **Decorative imagery and fake UI.** NN/g: "Avoid purely decorative or unhelpful graphics, as users tend to skip over them"; use informative visuals that show real examples. [S] https://www.nngroup.com/articles/homepage-design-principles/ . Fake or generic phone UI is a specific form of this; I found no source that studies it directly. The repo's rule (captions say when a picture is drawn, not captured; the app's own wording wins) is a sound response. [Repo]
7. **Generic, template look.** Commenters argue templates and AI tools have made scroll-animation sites easy to copy and that fast, restrained sites may be more distinctive. This is a forum opinion, not evidence. [SR] https://yomotherboard.com/?p=525062 . I found no study; treat as a risk to design against (pick a distinct point of view in copy and the demo) rather than a fact.
8. **Generic CTA labels** ("Get started") and **small or fabricated social proof**. [S] NN/g Get Started and social-proof articles above.
9. **Content that is not in the HTML** for search and no-JS visitors. [SR] https://www.gitnexa.com/blogs/scroll-triggered-animations-seo (vendor blog) and [B]; the repo's static-first approach already avoids it.

---

## 7. Blocked or unanswered

**Network status.** At the start of the task most hosts failed with `getaddrinfo ENOTFOUND`. The coordinator then opened the network; I re-tested and `curl` now reaches: developer.mozilla.org, gsap.com, web.dev, caniuse.com, css-tricks.com, www.smashingmagazine.com, developer.chrome.com, webkit.org, corewebvitals.io, cdn.jsdelivr.net, linear.app (all HTTP 200), plus github.com, raw.githubusercontent.com, nngroup.com, playwright.dev, utopia.fyi, joshwcomeau.com, bram.us, pudding.cool, alistapart.com, css-irl.info, w3.org, m3.material.io. The earlier "blocked" notes no longer apply to those hosts.

**Still failed or unusable:**
- adrianroselli.com: HTTP 429 (rate limit) via curl; his split-letters critique is known only from a search summary [SR].
- developer.apple.com forums: returns an anti-bot "Security Verification" page; the iOS 26 Safari bottom-bar reports are [SR] only.
- m3.material.io: JS-rendered, the fetch returns nothing; the Material 3 duration/easing numbers are [SR].
- caniuse.com is reachable but is a JS app; I could not get the scroll-driven or view-transitions tables as text. I used `web-platform-dx/web-features` data on GitHub and MDN/WebKit release notes instead. A guessed Fyrd/caniuse JSON path for scroll timelines returned 404.
- nngroup.com 113 homepage guidelines page and the NN/g touch-target article: not fetched; claims are [SR] via search summary.
- Cloud-only or vendor content (BrowserStack, LambdaTest, Userpilot, HowdyGo, marketing blogs): used only as [SR] leads.

**Could not verify / genuinely thin:**
- Whether `scroll-driven-animations` is now officially labelled Baseline (web-features data predates Firefox 159); whether Safari runs scroll-driven animations off the main thread.
- Any quantitative data on `backdrop-filter` cost on iOS Safari: practitioner anecdotes only.
- Layer-count budgets for will-change: none of the sources gives a number.
- Controlled evidence for hero format (demo vs video vs mockup), CTA repetition counts, sticky mobile CTA lift, or pricing-section layout for a free-plus-Pro app: vendor claims and generic guidance only.
- Density vs whitespace: no evidence-based source found.
- Named exemplar sites: deliberately not covered (other agents). The only named-site observations here are NN/g's usability-test reports and a few design-blog descriptions marked [SR].
- Real-device behaviour of our current pinned story on iOS 26/27 and Android 135+: not tested (no devices, no run of the site in a real mobile browser in this task).
- The note that the repo already follows most of the technique rules (takeaway 15) is from reading `next/js/home.js`, `next/js/site.js` and `.claude/rules/next.md`, not from running the page.
