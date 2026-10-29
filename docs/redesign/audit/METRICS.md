# Metrics

Measured 2026-10-28, headless Chromium (Playwright), homepage `/`, dark scheme, cache disabled.

- **Local.** Repo commit `e99a6b7` served by `python3 -m http.server`, which does no compression, so local byte counts are raw.
- **Live.** `https://preflopapp.com/` (Cloudflare, brotli).

From this sandbox every live request goes through an HTTPS proxy, with a TTFB of about 0.7 s, of which 0.35–0.57 s is the TLS handshake. Live load timings are therefore inflated by the test network. Use them for the shape (LCP element, CLS, long tasks), not for absolute speed.

**Method.**

- **Observers.** `PerformanceObserver` for `layout-shift` (entries with `hadRecentInput` excluded), `largest-contentful-paint` and `longtask`, injected before any page script runs.
- **Load phase.** Navigation, then 4 s idle.
- **Scroll phase.** Scripted to the bottom. Desktop: 300 px wheel steps every 100 ms. Mobile: CDP touch scroll gestures, 0.6 viewport each, at 1600 px/s.
- **Blocking time.** TBT is the sum of (long task − 50 ms) per phase.
- **Frames.** Frame intervals come from a rAF loop during the scroll phase.

## Profiles

| Profile | Viewport | Emulation |
|---|---|---|
| Desktop | 1440x900, DPR 1 | none |
| Mobile (throttled) | 390x844, DPR 3, touch, iPhone UA | CPU 4x slowdown (`Emulation.setCPUThrottlingRate`), 1.6 Mbps down / 750 kbps up / 150 ms RTT (`Network.emulateNetworkConditions`) |

## Core numbers

| Run | FCP | LCP (element) | CLS load | CLS scroll | Long tasks load (TBT) | Long tasks scroll (TBT, max) | Frames p50 / p95 / >50 ms / >100 ms / max | Transfer |
|---|---|---|---|---|---|---|---|---|
| Local desktop #1 | 244 ms | 244 ms (`h1.hero__title`) | 0.0001 | 0.0008 | 2 (56 ms) | 2 (66 ms, 115 ms) | 16.7 / 50 / 9 / 1 / 133 ms | 623 KB raw |
| Local desktop #2 | 348 ms | 348 ms (`h1`) | 0 | 0.0001 | 1 (20 ms) | 1 (62 ms, 112 ms) | 16.7 / 33.4 / 11 / 1 / 133 ms | 623 KB raw |
| Local mobile #1 | 1,668 ms | 1,668 ms (`h1`) | 0.0015 | 0 | 6 (751 ms) | 1 (8 ms, 58 ms) | 16.7 / 16.8 / 5 / 0 / 100 ms | 394 KB raw |
| Local mobile #2 | 1,668 ms | 1,668 ms (`h1`) | 0.0015 | 0 | 4 (1,007 ms) | 0 (0 ms) | 16.7 / 16.8 / 3 / 1 / 167 ms | 394 KB raw |
| Live desktop #1 | 2,124 ms* | 2,124 ms* (`h1`) | 0.0001 | 0.0009 | 2 (65 ms) | 1 (70 ms, 120 ms) | 16.7 / 33.4 / 5 / 2 / 133 ms | 433 KB on the wire |
| Live desktop #2 | 1,392 ms* | 1,392 ms* (`h1`) | 0.0001 | 0.0001 | 4 (105 ms) | 2 (79 ms, 121 ms) | 16.7 / 49.9 / 8 / 1 / 133 ms | 433 KB |
| Live mobile #1 | 2,052 ms* | 2,052 ms* (`h1`) | 0 | 0 | 6 (800 ms) | 1 (2 ms, 52 ms) | 16.7 / 16.8 / 6 / 2 / 150 ms | 199 KB |

\* Includes about 0.7 s of proxy TTFB from this sandbox.

**Reading these numbers.**

- **LCP is the `<h1>` on every run**, as `.claude/rules/next.md` requires. The headline paints at FCP.
- **CLS is effectively zero.**
  - **Load.** The one shift on throttled mobile, 0.0015, is the nav's "Join the beta" button, `[10,10,44,44]`, moving as fonts swap: only Regular and SemiBold are preloaded.
  - **Desktop scroll.** Shifts of 0.0001–0.0009 are text nodes moving 1–4 px (count-up figures and reveal starts).
  - **Hover.** Not in the table because it needs a pointer: hovering cells in the chart explorer produces layout shifts with no recent input, 0.0001–0.0023 each and about 0.0105 for 6 hovers. Hovering resizes the inspector, which moves the page below it 29 px (ISSUES `EXPL-02`).
- **TBT at load on throttled mobile is 650–1,000 ms.** It is spread over 4–6 long tasks. The first task is 300–400 ms whatever is blocked:

  | Blocked | Long tasks (ms) | TBT |
  |---|---|---|
  | nothing | 374, 50, 162, 230, 88 | 654 ms |
  | GSAP + ScrollTrigger + home.js | 402, 221 | 523 ms |
  | explorer.js + app-data.js | 230, 154, 72, 130, 254, 72 | 612 ms |
  | demo.js | 315, 214, 70, 359, 90 | 798 ms |

  So the biggest cost is parsing, style and layout of the 50 KB HTML and four stylesheets (container queries; 1,555 elements at 1440, 1,450 at 390), plus GSAP setup. These were single runs and are noisy.
- **Scrolling is smooth in emulation.** On mobile at most 1 long task and p95 frames of 16.8 ms. On desktop, 1–2 long tasks of about 115–120 ms while scrolling, which coincide with entering the pinned story and explorer, and p95 frames of 33–50 ms. Headless Chromium without a GPU is not a good proxy for iOS compositing (see ISSUES "Not testable here").

## Always-on work

| Thing | Count | Source |
|---|---|---|
| Infinite CSS animations at idle (1440) | 20: 13 `.piece__in` bobs, 4 marquee tracks, 2 `.float__in`, 1 FAQ, plus `.hero__glow` in dark | `sections.css:36, 66, 342`; `components.css:349` |
| Infinite CSS animations at idle (390) | 18 | same |
| Blur layers | 2: `.nav` `backdrop-filter: blur(16px) saturate(1.4)`, `.hero__glow` `filter: blur(64–80px)` | `components.css:187-193, 344-365` |
| ScrollTriggers | 65 at 1440, 56 at 390 (reveals, 12 on story chapters, 17 badges, counts, scrub, progress, parallax) | `site.js`, `home.js` |

## Asset sizes (homepage, 28 requests)

Sorted by raw size. "gzip" is `gzip -9` of the repo file; "live" is the bytes actually downloaded from `preflopapp.com` with `Accept-Encoding: br, gzip`.

| Asset | Raw | gzip -9 | Live (br) | Notes |
|---|---:|---:|---:|---|
| `/assets/vendor/gsap/gsap.min.js` | 72,927 | 28,302 | 29,357 | GSAP 3.15.0 |
| `/assets/screens/app-chart.webp` | 54,060 | 54,018 | 54,060 | Story ch. 3 + explorer no-JS fallback |
| `/` (index.html) | 50,386 | 9,653 | 10,101 | Badge grid repeats long `title`/`aria-label` strings 60 times |
| `/assets/vendor/gsap/ScrollTrigger.min.js` | 44,575 | 17,961 | 18,393 | |
| `/assets/screens/app-history.webp` | 41,294 | 41,327 | n/m | |
| `/assets/screens/app-home.webp` | 40,426 | 40,417 | n/m | |
| `/assets/screens/app-jam-answer.webp` | 34,778 | 34,758 | n/m | |
| `/next/css/sections.css` | 33,083 | 7,458 | 7,915 | |
| `/assets/screens/app-answer.webp` | 32,920 | 32,874 | n/m | |
| `/next/css/components.css` | 23,858 | 6,048 | 6,324 | Includes about 5 KB of style-guide and scaffold-only rules (`.sg-*`, `.hero-stub`, `.stub`) |
| `/assets/screens/play.webp` | 22,330 | 22,081 | n/m | Closing phone; an older screenshot than the `app-*` set |
| `/next/js/demo.js` | 21,492 | 7,058 | 7,261 | |
| `/assets/screens/app-practice.webp` | 21,382 | 21,410 | n/m | |
| `/next/css/demo.css` | 16,572 | 4,384 | 4,538 | |
| `/assets/fonts/HankenGrotesk-Bold.woff2` | 13,844 | | | not preloaded |
| `/assets/fonts/HankenGrotesk-Medium.woff2` | 13,796 | | | not preloaded |
| `/assets/fonts/HankenGrotesk-SemiBold.woff2` | 13,780 | | | preloaded |
| `/assets/fonts/HankenGrotesk-Regular.woff2` | 13,460 | | | preloaded |
| `/next/js/site.js` | 10,220 | 3,685 | 3,820 | |
| `/next/css/tokens.css` | 9,291 | 3,571 | 3,611 | |
| `/next/js/home.js` | 9,247 | 3,077 | 3,123 | |
| `/next/js/explorer.js` | 6,602 | 2,601 | 2,690 | |
| `/assets/suits/heart.svg` | 5,415 | 2,074 | 2,088 | 5.4 KB for one heart shape |
| `/assets/suits/spade.svg` | 5,001 | 1,815 | | 5 KB for one spade shape |
| `/next/js/app-data.js` | 4,035 | 829 | 869 | |
| `/assets/qr/testflight.svg` | 1,589 | 535 | | |
| `/next/js/config.js` | 880 | 491 | | |
| `/assets/mark-v2.svg` | 274 | 144 | | |
| **Total** | **617,517** | **401,543** | **about 433 KB transferred** (desktop) / **199 KB** (mobile, where the 6 pinned-stage images are not loaded) | |

n/m = not measured (WebP doesn't compress further).

**Scripts.** 219 KB raw, 64 KB gzip. GSAP and ScrollTrigger are 54% of the raw script.

### Unused or oversized files in the repo

- **Never referenced by any page, CSS or JS:**
  - `assets/screens/app-jam-chart.webp` (43,334 B)
  - `assets/screens/app-jam.webp` (20,980 B)
  - `assets/fonts/Outfit-Medium.woff2` (8,208 B)
- **Referenced only by `/s/` (shared-hand page):** `Outfit-{Regular,SemiBold,Bold}.woff2`.
- **PNG twins of the screenshots, linked from `/press/` only:** `explain.png` 247,547, `history.png` 297,241, `leaks.png` 266,666, `play.png` 301,421 (about 1.1 MB total).
- **Others:** `assets/icon-512.png` (119,388) is press only; `assets/og-v3.png` (233,352) is the social card, not loaded by the page.
- **Suit SVGs** are 5–7 KB each for single glyphs: `club.svg` 6,939, `diamond.svg` 5,668.

## Console errors and failed requests

| Where | Console errors | Failed requests |
|---|---|---|
| Local, all pages (`/`, `/faq/`, `/support/`, `/press/`, `/privacy/`, `/terms/`), all 39 homepage passes, reduced motion, no JS | **0** | **0** (no 404s) |
| Live `/`, `/faq/`, `/support/`, `/press/`, `/privacy/`, `/terms/` (desktop and iPhone UA) | **2 on every page** | **1** (`static.cloudflareinsights.com/beacon.min.js/vce701823e78c4301a35b7e07294d87301792088814092`, blocked by CSP) |
| Live 404 (any unknown path) | **7** | 3 (`/next/js/config.js`, `/next/js/site.js`, the beacon; all blocked by CSP) |

The two errors on every live page:

```
Executing inline script violates the following Content Security Policy directive 'script-src 'self''. Either the 'unsafe-inline' keyword, a hash ('sha256-…'), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
Loading the script 'https://static.cloudflareinsights.com/beacon.min.js/vce701823e78c4301a35b7e07294d87301792088814092' violates the following Content Security Policy directive: "script-src 'self'". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback. The action has been blocked.
```

The inline script is Cloudflare's JS Detections loader (`/cdn-cgi/challenge-platform/scripts/jsd/main.js`, inserted before `</body>`; its hash changes per request). The beacon is Cloudflare Web Analytics (`data-cf-beacon` token `9e465aec…`). On a 404 the site-wide header CSP (`script-src 'none'`) applies on top of the page's meta CSP, so each script is reported twice and `config.js` / `site.js` are blocked as well.

## Live response headers (2026-10-28)

| Path | Status | cache-control | CSP header | Other |
|---|---|---|---|---|
| `/`, `/faq/`, `/support/`, `/press/`, `/privacy/`, `/terms/` | 200 | `public, max-age=0, must-revalidate` | none (detached in `_headers`; the page's `<meta>` CSP applies) | `x-frame-options: DENY`, `referrer-policy: strict-origin-when-cross-origin`, `x-content-type-options: nosniff`, `content-encoding: br`, `cf-cache-status: DYNAMIC`, NEL/Report-To |
| `/next/css/*.css`, `/next/js/*.js` | 200 | `public, max-age=14400, must-revalidate` | none | `x-robots-tag: noindex, nofollow`, weak ETag, br |
| `/assets/*` (fonts, GSAP, screenshots) | 200 | `public, max-age=604800` | `default-src 'self'; … script-src 'none'; … frame-ancestors 'none'` (site-wide rule) | strong ETag; webp not compressed |
| unknown path (404) | 404 | `no-store` | site-wide `script-src 'none'` | serves `404.html`, which still includes `config.js` and `site.js` |
| `/landing/`, `/next/` | 301 → `/` | | | |
| `/faq`, `/index.html` | 308 → `/faq/`, `/` | | | |
| `https://www.preflopapp.com/` | **200** (full duplicate site, no redirect) | `max-age=0` | | canonical tag points to the apex |
