# Baseline: the homepage before the rebuild

The "before" picture for the rebuild (SPEC §11 Phase 0), recorded on
2026-10-29 by `scripts/scroll-pass.js` (Phase 0, commit `7e43775`) with the
standard plan of SPEC §10.3: 13 viewports in dark, light at 390, 820 and 1440,
Reduce Motion and no JS at 390 and 1440, and the throttled iPhone emulation at
390.

- **Local:** `main` at `e2af939`, the last commit before Phase 0, served by
  `python3 -m http.server`.
- **Live:** `https://www.preflopapp.com/`. This sandbox's network policy
  blocks the apex `preflopapp.com`; the `www` host is the same Cloudflare zone
  and the same Pages deployment (ISSUES LIVE-03: it serves the full site), so
  it carries the zone's injections. Live timings include about 0.7 s of proxy
  TTFB (METRICS), so only their shape counts.

Every run is **expected to FAIL** here: the pinned story, the reveals, the
marquee and the glow are what the rebuild removes. Nothing in this file was
fixed in Phase 0 except the probe failures marked *fixed in Phase 0*.

## The numbers

| | 390×844 | 1440×900 |
|---|---|---|
| Page length | 16,286 px = **19.3 screens** (target 10.5) | 12,312 px = **13.7 screens** (target 8.0) |
| `#pricing` top | 15.1 screens (target 7.0) | 10.7 screens (target 5.4) |
| LCP | `h1#hero-title` 0.26 s; throttled iPhone 1.38 s (live 1.73 s) | `h1#hero-title` 0.27 s |
| CLS load / scroll | 0.0015 / 0.0008 | 0.0000 / 0.0001 |
| TBT, throttled iPhone | 305 ms local, 366 ms live (budget 400) | |
| Infinite animations | 18 | 20 |
| Blur layers | 2 | 2 |
| Font files | 4 (Medium is loaded too) | 4 |
| Requests (before `load`) | 27 (23) | 28 (27) (budget 20) |
| Bytes over a full scroll, local: JS / CSS / images / fonts | 166 KB / 81 KB / 252 KB / 54 KB | 166 KB / 81 KB / 253 KB / 54 KB |
| `index.html` as served | 50,386 B raw, 9,655 B gzip, 905 elements before JS (budgets 40 KB, 9 KB, 900) | live: 51,291 B (with the zone's injections) |

## Every pass, local

| Run | Result | Screens | `#features` / `#pricing` top | CLS load / scroll | LCP (element, time) | TBT | Frame fails (frames) | Infinite anims | Blur |
|---|---|---|---|---|---|---|---|---|---|
| 320x568-dark-default | FAIL | 30.5 | 2.7 / 23.6 | 0.0040 / 0.0017 | `h1#hero-title` 0.27 s | 45 ms | position 75, half-faded 9, pending 8 | 18 | 2 |
| 360x740-dark-default | FAIL | 22.5 | 2.1 / 17.7 | 0.0021 / 0.0011 | `h1#hero-title` 0.20 s | 12 ms | position 55, half-faded 8, pending 7 | 18 | 2 |
| 390x844-dark-default | FAIL | 19.3 | 1.8 / 15.1 | 0.0015 / 0.0008 | `h1#hero-title` 0.26 s | 52 ms | position 47, half-faded 8, pending 6 | 18 | 2 |
| 430x932-dark-default | FAIL | 17.2 | 1.8 / 13.4 | 0.0014 / 0.0007 | `h1#hero-title` 0.15 s | 0 ms | position 42, half-faded 9, pending 6 | 18 | 2 |
| 600x960-dark-default | FAIL | 16.5 | 1.9 / 12.9 | 0.0009 / 0.0009 | `h1#hero-title` 0.18 s | 5 ms | position 40, half-faded 8, pending 10 | 18 | 2 |
| 768x1024-dark-default | FAIL | 12.7 | 1.2 / 9.9 | 0.0039 / 0.0005 | `h1#hero-title` 0.26 s | 14 ms | position 31, half-faded 7, pending 9 | 18 | 2 |
| 820x1180-dark-default | FAIL | 11.0 | 1.1 / 8.6 | 0.0002 / 0.0004 | `p.statement__text` 0.22 s | 7 ms | position 27, half-faded 7, pending 4 | 18 | 2 |
| 1024x768-dark-default | FAIL | 15.0 | 1.7 / 11.6 | 0.0001 / 0.0011 | `h1#hero-title` 0.17 s | 5 ms | position 37, half-faded 17, pending 7 | 20 | 2 |
| 1280x720-dark-default | FAIL | 15.7 | 1.8 / 12.0 | 0.0001 / 0.0011 | `h1#hero-title` 0.20 s | 5 ms | position 38, half-faded 18, pending 3 | 20 | 2 |
| 1440x900-dark-default | FAIL | 13.7 | 1.6 / 10.7 | 0.0000 / 0.0001 | `h1#hero-title` 0.27 s | 8 ms | position 33, half-faded 17, pending 6 | 20 | 2 |
| 1920x1080-dark-default | FAIL | 13.1 | 1.4 / 10.3 | 0.0002 / 0.0004 | `h1#hero-title` 0.27 s | 21 ms | position 32, half-faded 17, pending 7 | 20 | 2 |
| 2560x1440-dark-default | FAIL | 11.6 | 1.1 / 9.2 | 0.0001 / 0.0002 | `p.statement__text` 0.32 s | 18 ms | position 28, half-faded 16, pending 4 | 20 | 2 |
| 844x390-dark-default | FAIL | 33.1 | 3.0 / 25.7 | 0.0004 / 0.0012 | `h1#hero-title` 0.28 s | 4 ms | position 82, half-faded 7, pending 4 | 18 | 2 |
| 390x844-light-default | FAIL | 19.3 | 1.8 / 15.1 | 0.0015 / 0.0009 | `h1#hero-title` 0.12 s | 0 ms | position 47, half-faded 6, pending 6 | 17 | 2 |
| 820x1180-light-default | FAIL | 11.0 | 1.1 / 8.6 | 0.0002 / 0.0004 | `p.statement__text` 0.14 s | 4 ms | position 27, half-faded 7, pending 4 | 17 | 2 |
| 1440x900-light-default | FAIL | 13.7 | 1.6 / 10.7 | 0.0000 / 0.0001 | `h1#hero-title` 0.22 s | 0 ms | position 33, half-faded 17, pending 6 | 19 | 2 |
| 390x844-dark-reduced | FAIL | 19.3 | 1.8 / 15.1 | 0.0000 / 0.0000 | `h1#hero-title` 0.17 s | 0 ms | position 47, half-faded 3 | 0 | 2 |
| 1440x900-dark-reduced | FAIL | 13.3 | 1.6 / 10.4 | 0.0001 / 0.0000 | `h1#hero-title` 0.21 s | 0 ms | position 32, half-faded 2 | 0 | 2 |
| 390x844-dark-nojs | FAIL | 19.0 | 1.8 / 14.8 | n/a | n/a | n/a | position 46, half-faded 3 | 18 | 2 |
| 1440x900-dark-nojs | FAIL | 13.1 | 1.6 / 10.1 | n/a | n/a | n/a | position 32, half-faded 2 | 20 | 2 |
| 390x844-dark-iphone | FAIL | 19.3 | 1.8 / 15.1 | 0.0015 / 0.0003 | `h1#hero-title` 1.38 s | 305 ms | position 49, half-faded 4, pending 7 | 18 | 2 |

## Every pass, live

| Run | Result | Screens | `#features` / `#pricing` top | CLS load / scroll | LCP (element, time) | TBT | Frame fails (frames) | Infinite anims | Blur |
|---|---|---|---|---|---|---|---|---|---|
| 320x568-dark-default | FAIL | 30.5 | 2.7 / 23.6 | 0.0040 / 0.0017 | `h1#hero-title` 1.30 s | 20 ms | position 75, half-faded 9, pending 8 | 18 | 2 |
| 360x740-dark-default | FAIL | 22.5 | 2.1 / 17.7 | 0.0021 / 0.0011 | `h1#hero-title` 1.31 s | 40 ms | position 55, half-faded 8, pending 7 | 18 | 2 |
| 390x844-dark-default | FAIL | 19.3 | 1.8 / 15.1 | 0.0015 / 0.0009 | `h1#hero-title` 1.31 s | 34 ms | position 47, half-faded 8, pending 6 | 18 | 2 |
| 430x932-dark-default | FAIL | 17.2 | 1.8 / 13.4 | 0.0011 / 0.0007 | `h1#hero-title` 0.84 s | 8 ms | position 42, half-faded 9, pending 6 | 18 | 2 |
| 600x960-dark-default | FAIL | 16.5 | 1.9 / 12.9 | 0.0008 / 0.0004 | `h1#hero-title` 0.90 s | 0 ms | position 40, half-faded 8, pending 10 | 18 | 2 |
| 768x1024-dark-default | FAIL | 12.7 | 1.2 / 9.9 | 0.0037 / 0.0005 | `h1#hero-title` 0.89 s | 27 ms | position 31, half-faded 7, pending 9 | 18 | 2 |
| 820x1180-dark-default | FAIL | 11.0 | 1.1 / 8.6 | 0.0002 / 0.0004 | `p.statement__text` 0.92 s | 0 ms | position 27, half-faded 7, pending 4 | 18 | 2 |
| 1024x768-dark-default | FAIL | 15.0 | 1.7 / 11.6 | 0.0001 / 0.0002 | `h1#hero-title` 0.73 s | 0 ms | position 37, half-faded 17, pending 7 | 20 | 2 |
| 1280x720-dark-default | FAIL | 15.7 | 1.8 / 12.0 | 0.0001 / 0.0011 | `h1#hero-title` 0.98 s | 23 ms | position 38, half-faded 18, pending 3 | 20 | 2 |
| 1440x900-dark-default | FAIL | 13.7 | 1.6 / 10.7 | 0.0001 / 0.0001 | `h1#hero-title` 0.77 s | 14 ms | position 33, half-faded 16, pending 6 | 20 | 2 |
| 1920x1080-dark-default | FAIL | 13.1 | 1.4 / 10.3 | 0.0002 / 0.0004 | `h1#hero-title` 1.00 s | 51 ms | position 32, half-faded 16, pending 7 | 20 | 2 |
| 2560x1440-dark-default | FAIL | 11.6 | 1.1 / 9.2 | 0.0022 / 0.0000 | `p.statement__text` 1.11 s | 72 ms | position 28, half-faded 16, double-exposure 1, pending 4 | 20 | 2 |
| 844x390-dark-default | FAIL | 33.1 | 3.0 / 25.7 | 0.0004 / 0.0004 | `h1#hero-title` 0.64 s | 15 ms | position 82, half-faded 7, pending 4 | 18 | 2 |
| 390x844-light-default | FAIL | 19.3 | 1.8 / 15.1 | 0.0015 / 0.0008 | `h1#hero-title` 1.03 s | 8 ms | position 47, half-faded 6, pending 6 | 17 | 2 |
| 820x1180-light-default | FAIL | 11.0 | 1.1 / 8.6 | 0.0002 / 0.0004 | `p.statement__text` 0.74 s | 8 ms | position 27, half-faded 7, pending 4 | 17 | 2 |
| 1440x900-light-default | FAIL | 13.7 | 1.6 / 10.7 | 0.0001 / 0.0007 | `h1#hero-title` 1.02 s | 0 ms | position 33, half-faded 17, pending 6 | 19 | 2 |
| 390x844-dark-reduced | FAIL | 19.3 | 1.8 / 15.1 | 0.0015 / 0.0000 | `h1#hero-title` 0.64 s | 6 ms | position 47, half-faded 3 | 0 | 2 |
| 1440x900-dark-reduced | FAIL | 13.3 | 1.6 / 10.4 | 0.0001 / 0.0000 | `h1#hero-title` 0.90 s | 0 ms | position 32, half-faded 2 | 0 | 2 |
| 390x844-dark-nojs | FAIL | 19.0 | 1.8 / 14.8 | n/a | n/a | n/a | position 46, half-faded 3 | 18 | 2 |
| 1440x900-dark-nojs | FAIL | 13.1 | 1.6 / 10.1 | n/a | n/a | n/a | position 32, half-faded 2 | 20 | 2 |
| 390x844-dark-iphone | FAIL | 19.3 | 1.8 / 15.1 | 0.0000 / 0.0004 | `h1#hero-title` 1.73 s | 366 ms | position 49, half-faded 5, pending 7 | 18 | 2 |

What the frame failures are, in every run:
- **position**: `div.progress` (fixed), the story's sticky stage at ≥ 1024, and
  the sticky FAQ aside at ≥ 1024 (SPEC §4.1 allows only the nav).
- **half-faded**: the hero glow (≈ 0.08), the dimmed story chapters (0.5),
  the scrubbed statement's words (0.4–0.9) and the story pieces mid-fade.
- **pending**: `[data-reveal]` content still hidden while on screen.
- **double exposure**: two story screenshots crossfading (STORY-01), caught
  where a step landed mid-crossfade.

## Probes

Local `main`:

| Probe | Result | Checks passed | Failing checks |
|---|---|---|---|
| menu | FAIL | 14/23 | opening moves the page ≤ 2 px (button run): 3000 → 2550; html locked and nothing on screen pans while open (button run): html hidden, pannable: a.btn btn--primary btn--sm, div.nav__scrim, div.nav__scrim; closing with button moves the page ≤ 2 px: 3000 → 2120; opening moves the page ≤ 2 px (escape run): 3000 → 2550 (+5 more) |
| keyfocus | FAIL | 1/6 | Shift+Tab 1 into the nav moves the page ≤ 2 px: 3000 → 2542 (focus: Join the beta, in nav); Shift+Tab 2 into the nav moves the page ≤ 2 px: 3000 → 2084 (focus: FAQ, in nav); Shift+Tab 3 into the nav moves the page ≤ 2 px: 3000 → 1626 (focus: Pricing, in nav); no focus stop is covered (by the nav or anything else): a “Skip to content” at y=0 (+1 more) |
| anchors | FAIL | 6/7 | on /faq/ the FAQ nav link has aria-current=page (NAV-02): none |
| theme | FAIL | 0/6 | dark → toggle → light: theme set and both theme-color metas = --bg: data-theme light, --bg #f4f4f7, metas #f4f4f7 / #0e0f14; light persists after a reload, metas follow: data-theme light, --bg #f4f4f7, metas #f4f4f7 / #0e0f14; light carries to /faq/, metas follow: data-theme light, --bg #f4f4f7, metas #f4f4f7 / #0e0f14; light → toggle → dark: theme set and both theme-color metas = --bg: data-theme dark, --bg #0e0f14, metas #f4f4f7 / #0e0f14 (+2 more) |
| nojs | PASS | 16/16 | — |
| resize | DUE | 1/4 | 820x1180 → 1180x820 keeps the place (due P1): 5194 → 0, section.section--cta gone; 390x844 → 1440x900 keeps the place (due P1): 6520 → 0, section.section--cta gone; 1000x800 → 1440x900 keeps the place (due P1): 5206 → 0, section.section--cta gone |
| rotate | DUE | 0/2 | rotate to 844x390 keeps the place (due P1): 8151 → 8151, #progress gone; rotate to 390x844 keeps the place (due P1): 8151 → 8151, section gone |
| fastjump | DUE | 2/10 | 1440: home shows nothing pending, half-faded or doubled (due P1): half-faded: div.wrap.hero__grid > div.hero__demo > div.hero__glow @0.08; 1440: down1 shows nothing pending, half-faded or doubled (due P1): half-faded: div.wrap.hero__grid > div.hero__demo > div.hero__glow @0.08; div.wrap > p.stat; 1440: down2 shows nothing pending, half-faded or doubled (due P1): half-faded: div.wrap > p.statement__text > span @0.90; div.wrap > p.statement__text > span; 1440: down3 shows nothing pending, half-faded or doubled (due P1): half-faded: div.story__grid > ol.story__chapters > li.story__chapter @0.50 (+4 more) |
| axe | DUE | 1/4 | dark 1440: no serious or critical axe violations (due P1): color-contrast (serious) ×12: .story__chapter[data-chapter=""]:nth-child(1) > .story__copy; light 390: no serious or critical axe violations (due P1): color-contrast (serious) ×96: .statement__text > span:nth-child(1), .statement__text > spa; light 1440: no serious or critical axe violations (due P1): color-contrast (serious) ×113: .statement__text > span:nth-child(1), .statement__text > sp |
| live | SKIP | 0/0 | — |
| demo | SKIP | 0/0 | — |
| explorer | SKIP | 0/0 | — |

Live:

| Probe | Result | Checks passed | Failing checks |
|---|---|---|---|
| live | DUE | 2/3 | the live homepage references only stamped /next/ CSS and JS (due P1): /next/css/tokens.css, /next/css/components.css, /next/css/demo.css, /next/css/sections.css |
| nojs | PASS | 16/16 | — |
| menu | FAIL | 14/23 | opening moves the page ≤ 2 px (button run): 3000 → 2550; html locked and nothing on screen pans while open (button run): html hidden, pannable: a.btn btn--primary btn--sm, div.nav__scrim, div.nav__scrim; closing with button moves the page ≤ 2 px: 3000 → 2120; opening moves the page ≤ 2 px (escape run): 3000 → 2550 (+5 more) |
| keyfocus | FAIL | 1/6 | Shift+Tab 1 into the nav moves the page ≤ 2 px: 3000 → 2542 (focus: Join the beta, in nav); Shift+Tab 2 into the nav moves the page ≤ 2 px: 3000 → 2084 (focus: FAQ, in nav); Shift+Tab 3 into the nav moves the page ≤ 2 px: 3000 → 1626 (focus: Pricing, in nav); no focus stop is covered (by the nav or anything else): a “Skip to content” at y=0 (+1 more) |
| anchors | FAIL | 6/7 | on /faq/ the FAQ nav link has aria-current=page (NAV-02): none |
| theme | FAIL | 0/6 | dark → toggle → light: theme set and both theme-color metas = --bg: data-theme light, --bg #f4f4f7, metas #f4f4f7 / #0e0f14; light persists after a reload, metas follow: data-theme light, --bg #f4f4f7, metas #f4f4f7 / #0e0f14; light carries to /faq/, metas follow: data-theme light, --bg #f4f4f7, metas #f4f4f7 / #0e0f14; light → toggle → dark: theme set and both theme-color metas = --bg: data-theme dark, --bg #0e0f14, metas #f4f4f7 / #0e0f14 (+2 more) |

- *Fixed in Phase 0:* menu (NAV-01: the page jumped 3000 → 2550 on open and
  to 2120 on close), keyfocus's Shift+Tab (3000 → 2542 → 2084 → 1626) and its
  covered skip link, anchors' `aria-current` (NAV-02), and theme (THEME-01:
  the `theme-color` metas kept the system scheme).
- *Due in Phase 1:* keyfocus's opacity (FOCUS-01: CTAs focused at 0.4–0.8
  mid-fade), resize (RESIZE-01: growing past 1024 px sends the page to the top),
  rotate, fastjump, axe (contrast of the dimmed story text and statement), and
  live (unstamped CSS and JS cached for 4 hours).

## What the harness found that the audit did not

1. **The skip link is hidden under the sticky nav when focused.** Tab 1 on
   any page focuses it at y = 8 px, under the nav's z-index. Fixed in Phase 0.
2. **The LCP element is not always the `<h1>`.** At 820×1180 (dark and light)
   and 2560×1440 it is `p.statement__text`, locally and live. The statement
   paragraph is about as large as the headline at those sizes, so which one
   wins depends on timing (one later run at 820 got the `<h1>`). Phase 1
   deletes the statement.
3. **Rotating a phone mid-page loses the place** (390×844 → 844×390 keeps the
   same `scrollY`, but the section that was on screen is gone). Likely cause,
   not traced: ScrollTrigger's refresh puts back the old pixel offset where
   scroll anchoring would keep the content. Phase 1 removes GSAP; the rotate
   probe is due there.
4. **The narrow nav's button shifts once on load** (CLS 0.0015 at 390) when
   `site.js` shows the menu toggle beside it after the page has already
   painted. It is within the 0.01 budget; reserving the toggle's slot before
   JS runs would remove it (proposed for Phase 1).

## Live only

- **Zone injections (ISSUES LIVE-01):** 2 kinds of console error on
  every page, all from the zone: the Web Analytics beacon blocked by the CSP
  and the Bot Fight Mode "JS Detections" inline script. Other console errors
  on live: 0. Locally: 0.
- **Caching (LIVE-02):** `/next/css` and `/next/js` are served
  `max-age=14400` under fixed names (the live probe's first check).
- **Same rendering:** page heights live and local are the same at every
  viewport.

## Contact sheets

One PNG per pass, every frame in order, failing frames outlined in red
(quantised to 256 colours for the repo):

- [local 390×844 dark](local-390x844-dark.png)
- [local 390×844 light](local-390x844-light.png)
- [local 820×1180 dark](local-820x1180-dark.png)
- [local 1440×900 dark](local-1440x900-dark.png)
- [live 390×844 iPhone, throttled](live-390x844-iphone.png)
- [live 1440×900 dark](live-1440x900-dark.png)

## Reproduce

```sh
git worktree add --detach "$TMPDIR/main-baseline" e2af939
NODE_PATH=$(npm root -g) node scripts/scroll-pass.js --base http://localhost:8124 --root "$TMPDIR/main-baseline" --probes all --out "$TMPDIR/base-local"
NODE_PATH=$(npm root -g) node scripts/scroll-pass.js --live --probes live,nojs,menu,keyfocus,anchors,theme --out "$TMPDIR/base-live"
```

Not verified here: WebKit and iOS Safari (SPEC §10.4).
