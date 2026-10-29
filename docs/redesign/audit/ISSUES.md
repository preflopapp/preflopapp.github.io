# preflopapp.com: visual and behavioural audit

Audited 2026-10-28 against repo commit `e99a6b7` (clean tree, served as a static snapshot on `localhost:8124`) and against the live site `https://preflopapp.com/`. The two render the same pixels. Every live-only difference is listed under [Live vs repo](#live-vs-repo).

**How it was tested.** Headless Chromium (Playwright). The homepage got a viewport screenshot every 0.4 viewport heights, 600 ms after each mouse-wheel step, at 14 viewports (320x568 to 2560x1440, plus 844x390 landscape), in dark and light: 34 desktop-mode passes and 5 iPhone-emulated passes (isMobile, touch, DPR 3, iPhone UA), about 1,700 frames. On top of that:

- CDP screencasts of a continuous wheel scroll through the story.
- Scripted probes: resize, rotate, reload, anchors, menu, Tab order, theme toggle, reduced motion, no JS, the hero demo played through, chart explorer hover and tap.
- PerformanceObserver runs for CLS, LCP and long tasks, desktop and 4x-CPU / 1.6 Mbps mobile ([METRICS.md](METRICS.md)).
- Text pages at 390 and 1440 in both schemes.

**Limits.** WebKit and Firefox are not installed here, so nothing was run in Safari. "Mobile" means Chromium with iPhone emulation, not iOS Safari: no real GPU, no dynamic address bar, no momentum scrolling. What might differ on iOS is under [Not testable here](#not-testable-here). Animation timing in headless screenshots has about ±300 ms of capture latency, so mid-transition frames were confirmed with screencasts.

Severity: **blocker** (core task fails), **major** (visible to most visitors, or breaks a flow for some), **minor** (visible, limited impact), **polish**. Confidence: **high** = reproduced repeatedly and measured; **medium** = reproduced, cause inferred; **low** = hypothesis.

---

## The ten worst

| # | ID | Sev. | What | Conf. |
|---|----|------|------|-------|
| 1 | [STORY-01](#story-01) | major | Every chapter change in the pinned story double-exposes: two app screenshots crossfade and two piece sets show at once. The translucent pieces sit on top of the phone's own text. | high |
| 2 | [NAV-01](#nav-01) | major | Opening or closing the mobile menu, or Tab-focusing anything in the nav, scrolls the page **up about 430–460 px** each time. Repeated open and close walks you up the page. | high |
| 3 | [RESIZE-01](#resize-01) | major | Growing the window past 1024 px, which includes an **iPad turned from portrait to landscape**, resets the scroll to the top of the page. | high |
| 4 | [STORY-02](#story-02) | major | The "pieces" that pop out of the phone cover the very UI they describe: a Fold/Call/3-Bet chip over the phone's Fold/Call/3-Bet buttons, "The reason" over the reason text, "74%" over the 74% widget. Every viewport. | high |
| 5 | [LIVE-02](#live-02) | major | Live CSS and JS are cached 4 h and images 7 days under unversioned URLs, while the HTML is cached 0 s. After a deploy, visitors can get new HTML with old CSS/JS/screenshots. This is the most likely source of "artifacts on live" that don't reproduce locally. | medium |
| 6 | [STORY-03](#story-03) | major (structural) | The story eats **4.7 screens** of scroll on desktop and **5.9 screens** on a phone (30% of a 19-screen page). Pricing starts 10.6 screens down on desktop and 15 on a phone. | high |
| 7 | [DEMO-01](#demo-01) | major | In the hero demo the verdict card is laid over the hand you just played. At 320 px it covers both cards completely. | high |
| 8 | [LIVE-01](#live-01) | major | Every live page logs two CSP errors: the Cloudflare Web Analytics beacon and the Bot "JS detections" inline script, both injected by the zone and both blocked. The 404 page logs seven. Privacy copy says "no analytics". | high |
| 9 | [STORY-04](#story-04) | minor | After End then Home (or any fast jump), the phone keeps showing chapter 4's screen and pieces while you read chapter 1. | high |
| 10 | [STATEMENT-01](#statement-01) | minor | The big statement is never fully readable at rest unless it is in the top 40% of the screen. Centred, 4 of 13 words stay at 40% opacity, which is about 2.1:1 contrast in light. | high |

---

## Hero

### DEMO-01
**major · high** · Home, every viewport, both schemes, scroll 0 (demo in view). Image: `img/DEMO-01_verdict-covers-hand_320_390_1440.png`

- **What.** After you answer, the verdict card ("Mixed — the chart plays both / Next hand") is drawn over the bottom of the table, on top of the hero's own two cards.
  - 320x568: verdict box y 322–436, cards y 341–395, so the cards are completely hidden.
  - 390x844: verdict 495–602, cards 482–550, so only the card tops show.
  - 1440x900: verdict 542–667, cards 491–571.
- **Also.** At 320 the verdict copy renders at about 8 px (`calc(11px * 0.75)`), while "Next hand" stays a full-size 44 px button.
- **Repro.** Load `/`, tap Raise on hand 1.
- **Cause.** `next/css/demo.css:292-299`: `.phone__result { position:absolute; bottom:100% }` anchors the card above the controls, which is exactly where the hero seat sits. `demo.css:45-49` scales `--s` down to 0.68–0.75 on small phones, so the text shrinks with it.

### DEMO-02
**minor · high** · Home ≥ 960 px (floats are hidden below 60rem). Image: `img/DEMO-02_correct-pill-beside-wrong_1440.png`

- **What.** The decorative floating pill beside the demo always says "● Correct", and the floating cards always show A♥ K♠. After a wrong answer the screen shows "Wrong" inside the phone and "Correct" outside it. The floating cards never match the dealt hand (K5s, AQo, AJo).
- **Cause.** `index.html:77-78`, static decoration.

### HERO-01
**minor · high** · Home, 844x390 landscape phone, both schemes, scroll 0. Image: `img/HERO-01_landscape-844x390.png`

- **What.** The demo phone starts at y 128 and is about 365 px tall, so the Fold/Raise buttons are below the fold. A real landscape iPhone has even less height once Safari's bars are counted.
- **Cause.** `demo.css:53-56` scales by `max-height` only down to `--s: 0.6`, and `.hero` padding (`components.css:362`) adds 4rem on top.

### HERO-02
**polish · high** · Home ≥ 768 px, light. In light the glow is removed (`components.css:353-354`), so the hero is a flat off-white block with a white phone. In dark the amber glow sits behind the phone. Not a bug; noted because the two schemes have noticeably different heroes.

---

## Story (pinned at ≥ 1024 px, stacked below)

### STORY-01
**major · high** · Home, ≥ 1024 px (pinned), both schemes, at each chapter boundary (e.g. 1440x900 scroll 1803, 2451, 3099, …). Images: `img/STORY-01a_switch-midframes_1440_dark.png` (three screencast frames 20 px of scroll apart), `img/STORY-01b_double-exposure_1440_light.png`, `img/STORY-01c_double-exposure_1024_dark.png`.

**What.** When a chapter crosses the 58% line, three things happen at once, and for roughly 0.4–0.8 s:

1. **The screenshots crossfade.** Two different app screens are visible together (the A♥5♥ cards of the practice screen show through the answer screen's text).
2. **The old pieces linger.** The outgoing "Fold / Call / 3-Bet" chip and "Facing an open" card stay fully opaque while the new screen is already in.
3. **The new pieces are translucent.** "The reason" and "How often the chart does it" fade in on top of the phone's own text, so the text collides ("…less likely CO has" printed over the screenshot's "CO has AA or AK").

In light the crossfade also washes the black screenshot out to grey (01b). In 01b, taken 600 ms after a wheel step, the chapter copy is still at reduced opacity too.

**Repro.** 1440x900, scroll slowly with a wheel or trackpad from y 1700 to 1950. Any chapter boundary shows it.

**Cause.**
- `next/css/sections.css:142-146`: both stacked `.story__img` layers animate opacity and translateY together, which is a true crossfade of two opaque images.
- `sections.css:389`: `transition-delay: calc(var(--i)*120ms + 180ms)` applies to the *exit* as well as the entrance, so outgoing pieces wait 180–420 ms before they even start fading.
- Pieces fade through partial opacity over the screenshot (`sections.css:389-390`).
- The switch itself is `home.js:82-91`.

### STORY-02
**major · high** · Home, all viewports, both schemes, all six chapters (most visible in chapters 1, 2 and 4). Images: `img/STORY-02a_piece-over-own-buttons_1440_dark.png`, `img/STORY-02b_pieces-over-screen_390_320_dark.png`, `img/STORY-02c_reason-over-reason_1440_dark.png`.

**What.** Each piece repeats something that is already in the screenshot and is placed on top of it:

| Chapter | Piece | Covers |
|---|---|---|
| 1 | Fold / Call / 3-Bet chip | the screenshot's own Fold / Call / 3-Bet buttons, which show half-hidden next to it: two rows of identical buttons |
| 2 | "The reason" card | the screenshot's reason text |
| 2 | "How often the chart does it" | the Fold button |
| 4 | "Your accuracy 74%" | the screenshot's 74% widget |
| 1 | "Facing an open" | the "Practice" title |

On phones (`--out` is up to 34% of the phone width, `sections.css:326`) the pieces overhang the phone into the gutter and cover a third of the screen.

**Cause.** Piece positions are fixed corners (`sections.css:345-350`) with no knowledge of what is under them. The screenshots are shown so small (16–17.5rem wide, text about 6–7 px) that the pieces exist to restate them.

### STORY-03
**major (structural) · high** · Home, all viewports. Image: `img/STORY-03_story-is-6-screens_390.png` (16 consecutive 390 px frames, all story).

**What.** Measured section height in viewport heights:

| Viewport | Story | Whole page |
|---|---|---|
| 390x844 | 5.89 | 19.3 |
| 768x1024 | 3.76 | 12.7 |
| 1440x900 | 4.70 | 13.7 |
| 1920x1080 | 4.68 | 13.1 |

On a phone the story is six full-height app screenshots one after another, each with its pieces. On desktop each chapter is `min-height: 72svh` (`sections.css:131`).

### STORY-04
**minor · high** · Home, ≥ 1024 px. Image: `img/STORY-04_stale-chapter-after-end-home_1440.png`

- **What.** Press End, then Home (or click "Features" from the footer after being lower down). The active chapter stays 4 (index 3). Scrolling back down towards chapter 1 shows the Home-screen screenshot and "Your accuracy 74%" while chapter 01's copy is on screen. A fresh load shows chapter 1 correctly.
- **Cause.** `home.js:90`: `onToggle` only acts when a chapter becomes active, and nothing resets to chapter 0 on leaving the story upwards (no `onLeaveBack` for the first chapter). A fast jump fires toggles in an order that leaves a middle chapter set.

### STORY-05
**minor · high** · Home, ≥ 1024 px. Images: `img/SPACE-01_gap-above-chapter-1_1440.png`, `img/STORY-05_empty-band-after-story_1440.png`

- **Above chapter 1.** About 250 px of empty panel between the "Play it. Understand it. Fix it." header and chapter 01 at 1440x900.
- **After chapter 6.** The sticky phone scrolls away while chapter 06's copy is still at the top, leaving about 230 px of empty band before the CTA.
- **Cause.** Chapters are vertically centred in `72svh` boxes (`sections.css:130-131`), and the stage is `100svh` tall (`sections.css:136-139`).

### STORY-06
**minor · medium** · Home, ≥ 1024 px.

- **What.** Inactive chapters sit at `opacity: 0.5` (`sections.css:132`) and the next chapter is usually on screen too, so two chapters' copy are visible at once. The inactive body text is #9b9dab at 50% on #191a22, about 2.5:1.
- **Also.** Each `.story__copy` additionally has `data-reveal`, so a chapter's copy can be mid-fade (opacity 0 → 1) on top of the 0.5 dimming (seen in `STORY-01b`).

### STORY-07
**polish · high** · Home, 2560x1440. Image: `img/XL-01_small-phone-2560.png`

- **What.** The pinned phone is capped at `min(17.5rem, …)` (`sections.css:125`). Even with the 125% root font it is about 350 px wide in a 1440 px column, so the screenshot text is unreadable and most of the screen is empty.

### STORY-08
**minor (design) · high** · Home, light scheme. Image: `img/LIGHT-01_dark-shots-on-light-page_1440.png`

- **What.** All app screenshots are dark-mode captures. On the light page they read as black slabs in a light-grey bezel (`--well`). The pieces are light cards with drop shadows over black. The rules file notes the screenshots also predate the app's type and radius refresh.

---

## Statement and marquee

### STATEMENT-01
**minor · high** · Home, all viewports, both schemes, statement on screen. Image: `img/STATEMENT-01_dim-at-rest_1440_light.png`

**What.** Words start at opacity 0.4 and light up as the sentence scrolls from 80% to 45% of the viewport. Measured at rest:

| Statement centre at | Words lit |
|---|---|
| 75% of the viewport | 0–1 of 13 |
| 60% | 6/13 |
| 50% | 9/13 |
| 40% | 12/13 |
| 30% | 13/13 |

So a visitor who stops with the sentence in the middle of the screen reads "Make the first ~~decision the easy one.~~" with the last words faded. At 0.4, light text #3c3d48 on #f4f4f7 gives about 2.1:1; dark gives about 3.8:1.

**Cause.** `home.js:34-37` (`start: "top 80%", end: "bottom 45%"`).

### MARQ-01
**polish · high**

- **What.** The marquee rows end with a hard cut at the viewport edges (no fade). The animation never stops: 4 infinite tracks keep running when off screen.
- **Cause.** `sections.css:61-70`. Hover pauses it on desktop only. Reduced Motion correctly turns it into a static wrapped list.

---

## Chart explorer

### EXPL-01
**minor · high** · Home ≥ 1024 px. Image: `img/EXPL-01_inspector-below-chart_1440.png`

- **What.** The left column (copy, three stacked tabs, inspector) is taller than the chart. The inspector ends about 225 px below the chart's bottom at 1440x900, leaving a dangling card and an empty right column. Scrolling past, the chart disappears under the nav while the inspector is still mid-screen.
- **Cause.** Grid areas `sections.css:405-410`.

### EXPL-02
**minor · high** · Home, desktop with a mouse, any viewport. Image: `img/EXPL-02_scroll-hover-replaced-example_390.png`

- **What 1.** Wheel-scrolling past the chart with the pointer over it re-selects whatever cell passes under the cursor, so the inspector shows "88" or "83o" instead of the example hand A5s and loses its "The hand from the app's example spot" note.
- **What 2.** Hover changes the inspector's height: 249 → 220 px at 1440, because the note goes from 3 lines to 2. Everything below (badges, bento, pricing…) moves 29 px. These count as layout shifts with no recent input, about 0.0105 CLS over 6 hovers.
- **Cause.** `explorer.js:123-127` (`pointerover` with `pointerType === "mouse"`). `sections.css:424`: `min-height: 3.6em` is less than the 3-line note at line-height 1.55 (about 4.65em). The inspector is in the flow beside a shorter chart.

### EXPL-03
**minor · high** · Home, all viewports, on first scroll-in. Image: `img/EXPL-03_chart-blank-mid-wash_390_light.png` (left: settled; right: the same scroll position mid-wash).

- **What.** The 169 squares start at opacity 0, scale 0.4, and wash in over about 1.25 s once 30% of the chart is visible. Scrolling at normal speed you see a half-empty chart.
- **Cause.** `explorer.js:147-157`.

### EXPL-04
**polish · high** · Home, 390. Image: `img/EXPL-04_two-white-rings_390.png`

- **Two identical rings.** The picked hand (`.is-sel`, an outline) and the example hand (`.is-hero`, an inset border) are both 2 px rings in `--text`. With both on screen you can't tell which one the inspector is showing.
- **Small cells.** Cells are 25.7 px (390) and 34.7 px (1024). Labels are 8.95 px at 390.
- **Cause.** `sections.css:448, 451`.

### EXPL-05
**minor · high** · Home, all viewports. Accessibility.

- **What.** The three chart tabs have `role="tab"` inside a `role="tablist"` but no `tabpanel`, no `aria-controls` and no arrow-key roving: each is a separate Tab stop. They wrap onto three lines at 1440, which reads as a list of buttons, not a tab row.
- **Cause.** `explorer.js:107-120`.

---

## Badges, bento, pricing, FAQ, closing

### BENTO-01
**minor · high** · Home, 768–1023 px, both schemes. Image: `img/BENTO-01_hole-in-grid_768.png`

- **What.** The two-column bento leaves an empty cell beside "No account. No tracking.": 5 narrow cards in 2 columns, then two full-width cards.
- **Also.** In "On your Home Screen" the large widget's A and K sit at opposite edges (space-between), and the widgets bottom-align with a gap above.
- **Cause.** `sections.css:169` (no column rule for the odd 5th card); `sections.css:241` (`.widget__row` justify).

### BADGE-01
**polish · high** · Home, 600–1023 px. Image: `img/BADGE-01_orphan-rows_768.png`

- **What.** `repeat(auto-fill, minmax(6.5rem, 1fr))` gives 6 per row at 768: the 8 seats break 6 + 2, the 9 situations 6 + 3, so short orphan rows hang left-aligned under a centred header. At ≥ 1024 the fixed 8 and 9 columns are fine.
- **Also.** Every disc starts grey and fills over about 1 s as you scroll (`sections.css:472-476`), so mid-scroll frames show half-earned badges.
- **Cause.** `sections.css:457-458`.

### SPACE-02
**polish · high** · Home, all viewports.

- **What.** Gaps between sections are large and uneven: about 210 px from the explorer to the badges header, about 250 px above story chapter 1. There are 8 "Join the beta" buttons on one page: nav, hero, CTA band 1, CTA band 2, Free plan, closing, the demo's score screen, plus QR cards three times.

### PRICE-01
**polish · medium** · Home, all viewports. The Pro card ends with a grey "Available at launch" badge where the Free card has a button. At ≥ 768 the two cards are equal height, so the Free card has a large empty area above its button. Not a bug.

### FAQ-01
**polish · high** · `/faq/`, all viewports. The FAQ page's list has no top rule above the first question, unlike the homepage FAQ. The `.faqs__list { border-top }` rule lives in `sections.css:282`, which text pages don't load.

---

## Nav, focus, theme

### NAV-01
**major · high** · All pages with the nav, all viewports. Image: `img/NAV-01_menu-close-scrolls-page_390.png` (before, open, after close).

**What.**

- **390, menu.** Open the menu at scroll 3000 and the page jumps to 2980 (behind the scrim it is visibly a different place). Close it with the button and you land at 2550. Open and close again: 2120, then 1240.
- **1440, keyboard.** Focusing a nav link from mid-page (Shift+Tab back up) moves the page from 3000 to 2542, then 2084.
- **Control test.** With `html { scroll-padding-top: 0 }` the same steps leave the page at 3000. With GSAP blocked it still happens, so GSAP is not involved.

**Cause.** `components.css:7`: `scroll-padding-top: calc(var(--nav-h) + var(--space-2))` on `html`, combined with `element.focus()` on an element inside the `position: sticky` nav. Chromium scrolls to bring the sticky element's static position below the scroll padding. The calls are `site.js:62` (`first.focus()` on open) and `site.js:69` (`toggle.focus()` on close).

**Lesson for the rebuild.** Use `focus({ preventScroll: true })` for anything in a fixed or sticky bar, or scope scroll padding to anchor targets.

### NAV-02
**polish · high** · Text pages. The nav has no current-page state: on `/faq/` the "FAQ" link looks the same as the others and has no `aria-current`.

### FOCUS-01
**minor · high** · Home, 1440, keyboard.

- **Order.** Focus order is logical: skip link → brand → 3 nav links → nav CTA → hero CTA → Fold → Raise → CTA band → 3 explorer tabs → chart grid → CTA band → Free-plan CTA → "full FAQ" → 7 FAQ summaries → closing CTA → footer.
- **Visible focus.** Every stop had a 2 px amber outline.
- **Problem.** Three CTAs were still fading in (opacity 0.61–0.78) when they got focus, because the scroll-reveal runs after focus scrolls them in.
- **Story.** No stop inside the story, which is correct since it has no controls.
- **Mobile menu trap works.** Focus moves to "Features", Tab cycles Features → Pricing → FAQ → Join the beta → Menu → Preflop, Escape closes and returns focus to the toggle, `main` is inert, and the page can't be wheel-scrolled while the menu is open. Apart from NAV-01's scroll jump, this passed.

### THEME-01
**minor · high** · All pages, after using the footer theme toggle.

- **What.** Toggling sets `data-theme` and every token follows; no element kept old colours (checked with screenshots at 4 positions each way, and no inline colour styles). But both `<meta name="theme-color">` tags stay tied to `prefers-color-scheme`. A visitor on a dark iPhone who picks Light gets a dark Safari status bar and toolbar tint over a light page, and the reverse.
- **Reload.** Restored the theme and scroll with no visible flash in Chromium. The rules file warns one frame of the system scheme can show, and that wasn't reproducible here.
- **Cause.** `site.js:97-119` never updates the meta tags.

---

## Behaviour: resize, reload, anchors, reduced motion, no JS

### RESIZE-01
**major · high** · Home. Image: `img/RESIZE-01_rotate-820-to-1180-jumps-to-top.png`

**What.** Any resize that crosses into ≥ 1024 px from below resets scroll to 0:

| From | To | Scroll before → after |
|---|---|---|
| 820x1180 (iPad portrait) | 1180x820 (landscape) | 3000 → 0 |
| 390 | 1440 | 2673 → 0 |
| 1000 | 1440 | 7000 → 0 |

These keep their position: 1440 → 1200, 1200 → 1440, 1440 → 390, 1440 → 1000, 1180 → 820, and height-only changes.

**Bisect** (by substituting `home.js` in the browser, not the repo):
- Blocking GSAP: no jump.
- Disabling only the 64rem pin block: still jumps.
- Disabling only the 60rem parallax block: still jumps.
- Disabling both `gsap.matchMedia` blocks: no jump.
- Removing the extra `ST.refresh()` at `home.js:92`: still jumps.

**Cause.** One of the `mm.add` contexts in `home.js:65` and `home.js:151` *activating* during a resize. ScrollTrigger's refresh-on-matchMedia loses the saved scroll position. Exact mechanism inside GSAP 3.15 not traced. The pin rebuild itself is fine: 6 piece sets after returning to desktop, 0 on mobile, no leftover clones.

### RELOAD-01 (passes)
Reloading at scroll 7400 restored 7400 with no reveal re-hidden or flashing (0 hidden `[data-reveal]` in view at 50, 300, 700 and 1500 ms).

### ANCHOR-01 (passes)
`#features`, `#pricing`, `#faq` and `#chart` at 1440 put the section top 80 px down and its `<h2>` at about 208 px, below the 65 px nav. At 390 the `<h2>` lands at 161 px. Nothing is covered. Tapping "Pricing" in the open mobile menu closes the menu and lands correctly.

### SCROLLUP-01 (passes)
Reveals are `once: true` and do not re-hide or flash on scroll up. The pinned chapters follow scroll-up correctly in normal scrolling (STORY-04 is the fast-jump case).

### RM-01 (passes, with a note)
With `prefers-reduced-motion: reduce` nothing pins, nothing is hidden, the marquee becomes a static wrapped list, and the story is a zig-zag of phones. It is complete and arguably calmer than the animated version. The pieces still cover the phone's buttons (STORY-02). The page is 12,014 px at 1440 vs 12,312 px animated.

### NOJS-01 (passes)
With JavaScript off, every section renders. The explorer shows the static chart screenshot, the demo shows hand 1 with disabled buttons and "Turn on JavaScript to play this demo", the theme toggle is hidden, and the narrow nav shows brand and CTA only. No blank panels.

---

## Text pages

### TEXT-01
**polish · high** · `/press/` 1440 light. Image: `img/TEXT-01_press-tiles_1440_light.png`

- **What.** In the logo row the social-card tile is half the height of its square neighbours, and the captions wrap onto two lines ("App icon · PNG, / 512 × 512").
- **Also.** The press screenshots are a different, older set from the homepage's `app-*.webp`.

### TEXT-02
**polish (design) · high** · `/faq/ /support/ /press/ /privacy/ /terms/`, 1440. A 46rem column of text with nothing else: no visual, no breadcrumb, no table of contents on the long privacy page (4,390 px at 1440, 6,185 px at 390). No rendering defects in either scheme; no console errors locally.

---

## Performance (details in [METRICS.md](METRICS.md))

### PERF-01
**minor · high** · Home, throttled mobile (4x CPU, 1.6 Mbps, 150 ms RTT).

- **Load.** FCP and LCP 1.67 s (the `<h1>`, as intended). Total blocking time at load 650–1,000 ms. The first long task, 300–400 ms, happens even with GSAP, the explorer or the demo blocked, so it is mostly parse, style and layout of the 50 KB HTML and 4 stylesheets.
- **Scroll.** Smooth in emulation: 0–1 long tasks, p95 frame 16.8 ms.
- **CLS.** 0.0015 at load (the nav CTA shifting as fonts swap); 0 while scrolling.

### PERF-02
**minor · high** · GSAP + ScrollTrigger are 118 KB raw (46 KB gzip), about 30% of the page's script and the largest assets after the screenshots. They are used for one scrub, one toggle, reveals, a progress bar and parallax, all of which CSS scroll-driven animations or IntersectionObserver could do. About 20 infinite CSS animations run at all times (13 piece bobs, 4 marquee tracks, 2 floats, the hero glow in dark), plus a `backdrop-filter` nav and a `filter: blur(64–80px)` glow.

---

## Live vs repo

All findings in this section were measured on `https://preflopapp.com/` on 2026-10-28.

**Rendering.** Identical. Same page heights at every tested viewport (390: 16,254 px; 768: 13,028; 1440: 12,312; 1920: 14,110). Frame-by-frame pixel diffs live vs local differ only where animations were at different points: marquee position, chart wash, count-up. All `next/css/*`, `next/js/*`, GSAP and the sampled screenshots are byte-identical to the repo. The HTML differs only by the injections below.

### LIVE-01
**major · high** · All live pages.

The zone injects two scripts into the HTML that browsers get:

1. **Web Analytics beacon.** `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js/vce70…" data-cf-beacon='{"token":"9e465aec…","spa":2}'>`
2. **JS Detections.** An inline `<script>` that would create a hidden 1x1 iframe and load `/cdn-cgi/challenge-platform/scripts/jsd/main.js` (Bot Fight Mode / Bot Management).

The page CSP (`script-src 'self'`, in a `<meta>`) blocks both, so every page logs two console errors and one failed request:

```
Executing inline script violates … 'script-src 'self'' … The action has been blocked.
Loading the script 'https://static.cloudflareinsights.com/beacon.min.js/…' violates … "script-src 'self'" … blocked.
```

Confirmed on `/`, `/faq/`, `/support/`, `/press/`, `/privacy/`, `/terms/`, desktop and iPhone UA. Because both are blocked, there is no visual effect: no iframe is created and nothing is measured. But the zone has analytics switched on while the privacy policy and the homepage say "No tracking… no analytics". A plain `curl`, even with a browser User-Agent, got the inline script but not the beacon; Playwright's Chromium got both. So this is easy to miss with curl.

**404 pages.** These get the site-wide header CSP `script-src 'none'` *and* the page's meta CSP, so `config.js` and `site.js` are blocked too: 7 console errors on every 404 (6 CSP violations plus the 404 status line). `404.html:31-32` includes the two scripts although the rules say 404 runs without JS.

Cloudflare's Email Obfuscation is also on: it strips the repo's `<!--email_off-->` markers, and the address stays a plain link.

### LIVE-02
**major · medium** (cause of real-world artifacts is a hypothesis; the headers are fact).

**What the live headers say:**

| Path | cache-control | Notes |
|---|---|---|
| HTML (`/`, `/faq/`, …) | `public, max-age=0, must-revalidate` | `cf-cache-status: DYNAMIC`, br |
| `/next/css/*.css`, `/next/js/*.js` | `public, max-age=14400, must-revalidate` (4 h) | unversioned names, weak ETag, also get `X-Robots-Tag: noindex` from the `/next/*` rule |
| `/assets/*` (GSAP, fonts, screenshots, QR) | `public, max-age=604800` (7 days) | unversioned names |

**Why it matters.** A returning visitor who loaded the site in the last 4 hours gets the new HTML with the old CSS and JS (no revalidation until max-age expires). Within 7 days they get the old screenshots, fonts and GSAP. The homepage relies on exact pairings: class names and `data-*` hooks in HTML matched by sections.css and home.js, and `app-*.webp` re-exported today at 15:11 under the same names. A mismatched pair produces exactly the "random" artifacts (missing styles, wrong screenshot in the phone, broken pin) that never reproduce for the developer, whose cache is fresh.

**Fix direction.** Fingerprint or `?v=` the asset URLs, or `max-age=0, must-revalidate` for `/next/*`.

### LIVE-03
**minor · high** · Other live configuration.

- **No CSP header on pages.** HTML pages get no `Content-Security-Policy` header (`_headers` detaches it on purpose). The policy is only the `<meta>` tag, which can't carry `frame-ancestors`; `X-Frame-Options: DENY` covers framing.
- **The www host.** `https://www.preflopapp.com/` serves the full site with HTTP 200 instead of redirecting to the apex. The canonical tag points to the apex, but the theme choice in `localStorage` and the TestFlight QR flow are per-origin.
- **Redirects and style guide.** `/landing/` and `/next/` give 301 to `/`; `/faq` and `/index.html` give 308. `/next/styleguide/` is publicly reachable (noindex header).
- **Not checked.** `http://` could not be checked from this sandbox.

---

## Structural problems (design-level, not bugs)

1. **The story is the page, and it is slow.** 4.7–5.9 screens of scroll for six claims. On a phone a visitor must scroll past six near-identical dark phone screenshots before reaching the chart, the badges or the price. Pricing starts about 10.6 screens down on desktop and 15 on a phone. Every chapter change is a crossfade that looks broken mid-scroll (STORY-01).
2. **Screenshots too small to read, so the page adds pieces to restate them, and the pieces cover the screenshots.** The design fights itself. Either show fewer, larger, cropped screen regions (the reason text, the mix bar, the chart) or draw the UI natively as the hero demo does, not both.
3. **Two visual languages.** The hero demo is drawn from site tokens (flat grey table, Hanken). The story, explorer fallback, closing phone and press kit use the app's older dark screenshots (red card backs, Outfit type, old radii). In light mode this splits into a light page with black phone slabs.
4. **Repetition.** Eight "Join the beta" calls to action and three QR cards. "No ads / no tracking / no account" appears in the proof bar, a bento card, the FAQ, the pricing card and the closing line. Spot types are listed in the story copy, the marquee, a bento card and the badges.
5. **Motion as decoration.** About 20 infinite animations (bobbing pieces, marquee, floats, glow), plus a scrubbed statement that is unreadable at rest and a progress bar. The reduced-motion version is cleaner and complete, which suggests the motion isn't carrying the content.
6. **Generic sections.** "Made for the minutes between sessions" bento and "60 badges to earn" are feature-inventory grids that read as a template, and they sit between the product proof (explorer) and the decision (pricing).
7. **Desktop width unused.** The page max-width is 72rem and the pinned phone 17.5rem, so at 1920 and 2560 most of the screen is empty.

## What works and should be kept

- **The chart explorer.** Real app data, hover-stable (6 cells hovered with no flip-flop), keyboard-navigable grid, works under reduced motion. It is the most convincing thing on the page.
- **The hero demo concept.** Three real hands, graded the app's way, and a score screen. Fixed-height frame, so answering never moves the page. Focus moves sensibly through Fold/Raise → Next hand → score actions.
- **Fallbacks are complete.** No-JS and reduced motion both render every section with no blank panels. The no-JS demo has its first hand pre-rendered. The explorer falls back to the screenshot.
- **Core metrics.** LCP is the `<h1>` at 0.25–0.35 s desktop and 1.67 s throttled mobile, and CLS is effectively 0 at load and while scrolling. No console errors locally, no 404s, no horizontal overflow at any of the 14 viewports.
- **Accessibility basics.** Skip link, visible 2 px focus everywhere, logical Tab order, and a mobile menu that traps focus, inerts the page, closes on Escape and returns focus (fix NAV-01's scroll).
- **Anchors and reload.** Scroll-padding clears the sticky nav for `#features`, `#pricing` and `#faq` (the same rule causes NAV-01, so scope it). Reload restores position cleanly.
- **Tokens and theming.** Every colour comes from a token, the theme toggle switches everything with no stale colours, and the choice persists across pages.
- **The facts pipeline** (`facts.json` + checker): prices and counts on every page are consistent.

---

## Not testable here

There was no Safari, no real iOS device, no real GPU, and no address-bar dynamics. These are hypotheses about what could produce artifacts on a real iPhone or iPad, with the code that would cause them:

1. **NAV-01 is probably worse on iPhone.** Safari also honours `scroll-padding` for focus scrolling. `close(true)` calls `toggle.focus()` explicitly (`site.js:69`), so tapping the X likely jumps the page. Also `root.style.overflow = "hidden"` (`site.js:60`) does not reliably stop touch scrolling of the page on iOS, so the page may scroll behind the open menu. The scrim is `height: 100vh` (`components.css:262`); on iOS `100vh` is the large viewport, so its bottom can sit under the toolbar.
2. **iPad rotation resets the page (RESIZE-01).** Portrait 820/834 → landscape 1180/1194 crosses both the 60rem and 64rem `gsap.matchMedia` breakpoints. This was reproduced in Chromium and is JS logic, so it should reproduce on iPadOS.
3. **The sticky nav has `backdrop-filter: blur(16px) saturate(1.4)` and `container-type: inline-size`** (`components.css:181-193`). WebKit re-rasterises a backdrop-filtered sticky layer every frame over moving content: the marquee, the explorer's red and green grid, the pinned story. Expect shimmer or flicker at the nav's bottom edge and higher battery use.
4. **A large blurred glow animates forever.** `.hero__glow` is a 24–32rem disc with `filter: blur(64–80px)`, animating `transform` and `opacity` infinitely (`components.css:344-350`), dark scheme only. Blur filters on animated layers are expensive on iOS GPUs and can band. 13 `.piece__in` bob animations also keep running, including on pieces at opacity 0 (`sections.css:342`).
5. **`overflow: clip`** (`components.css:334`, `sections.css:61`) needs iOS 16+. On iOS 15 it is ignored, so the hero's absolutely positioned 24rem glow (384 px, wider than a 375–390 px screen minus gutters) could cause sideways scroll and a wobbling page.
6. **Pin heights use `svh`** (`sections.css:125, 131, 138`). On iPad Safari with the toolbar collapsed, the stage is shorter than the visible area, so expect a strip below the phone. Chapters are `72svh`, so the chapter switch line (`top 58%` of the *current* viewport) drifts relative to the CSS as the toolbar shows and hides.
7. **Lazy images in the stage.** The six stacked `.story__img` are `loading="lazy" decoding="async"` (`index.html:181`). On a first fast scroll on a slow device, an image may not be decoded when its chapter activates, so the phone could flash empty or show the previous screen.
8. **Newer CSS.** `linear()` easing (`tokens.css:220, 223, 226`) needs iOS 17.2+; older versions drop those transitions, which is harmless. `color-mix()` (nav background, piece shadow) needs iOS 16.2+, so older versions lose the translucent nav. `text-wrap: balance` needs iOS 17.5+, so headlines wrap differently. Container queries need iOS 16+: on iOS 15 the nav's narrow and wide rules both fail, so the menu button never appears and the links wrap under the bar.
9. **GSAP scrub on touch.** The statement (`scrub: 0.4`), progress bar (`scrub: 0.3`) and parallax (`scrub: 0.6`) lag behind momentum scrolling by design. On iOS the statement can still be catching up after the finger stops, which adds to STATEMENT-01.
10. **Live CDN.** See LIVE-02. If the owner's device cached `sections.css`, `home.js` or `app-*.webp` before the last deploy, it will show the older pairing for up to 4 hours (CSS/JS) or 7 days (images). Worth checking first on the device where artifacts were seen: Safari → clear website data for preflopapp.com, then reload.
