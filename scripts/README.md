# Scripts and notes

The old independent `/landing/` page, its importer (`import-landing.py`) and
its tests were deleted in Phase 8; `/landing/` redirects to `/`. Pushes to main
run the Cloudflare Pages deployment and its smoke checks.

## Social card (`assets/og-v3.png`)

Every page's link preview uses `/assets/og-v3.png` (1200×630). Its source is
`scripts/og-card.html`, which uses the site's Outfit fonts, the app's dark
tokens and `assets/screens/explain.png`. After editing it, or after a
screenshot or copy change it depends on, re-render and commit the PNG:

```sh
scripts/render-og.sh
```

It needs Google Chrome (set `CHROME` to use another path). Keep the text in
the left 630px so a square crop still reads, and keep claims in line with
the free-tier numbers in `FreeTierConfig`.

**Bump the file name when the card changes** (`og-v3.png`, and so on, in the
shared head, the press kit and this script). `/assets/*` is served with a
7-day `Cache-Control`, so Cloudflare keeps an overwritten file for up to a
week. iMessage, Slack and social sites also cache previews by image URL.
A new name refreshes all of them at once.

## Prices and the free tier (`facts.json`)

`check-site.py` holds every page's dollar amounts and "N hands a day" to
`facts.json`, which the app repo's `scripts/check_site_facts.py` holds to the
app. See `CLAUDE.md` at the root.

## The `/next/` preview (website overhaul)

The redesign is built behind `/next/` (noindex, `X-Robots-Tag`, not in
`sitemap.xml`) and replaces `/` only at the final cutover. Every component is
shown on `/next/styleguide/` (dark and light) before a page uses it. Phase 0 is
the foundation; Phase 1 is the shell, `/next/` itself:

- `next/css/tokens.css`: colour (dark default, light via system or
  `data-theme`), type, shape, spacing and motion. Colour, spacing and motion
  come from the app's `AppTheme.swift` and `PreflopMotion.swift`. The typeface
  (Hanken Grotesk) and radii (14 / 10 / 6) deliberately lead the app: they are
  the new brand-wide design language, decided 2026-10-28, and the app adopts
  them next. Suits are `assets/suits/*-v2.svg` (two-colour deck only on the
  site; simplified to under 600 bytes each in redesign Phase 2, renamed because
  `demo.js` builds their URLs unstamped).
- `next/css/components.css`: button, TestFlight CTA and "Coming soon" badge,
  section header, card, playing card, FAQ item, entrance, nav, footer, CTA
  band, hero, proof strip, range chart (`.cgrid`, `.clegend`) and caption
  (`.figcap`). The style guide's own rules and the old page scaffold are in
  `next/css/styleguide.css`, loaded only on the style guide (redesign Phase 1).
- `next/js/config.js`: the one place the CTA is configured. Set `mode` to
  `"coming-soon"` to turn every `a[data-cta]` into the badge; change
  `testflightUrl` (then the checker lists the `data-cta` hrefs to update) when
  the link changes.
- `next/js/site.js`: CTA slots, nav menu, theme toggle, and the motion
  engine: `window.PreflopMotion` (the motion tokens in ms and CSS easings),
  picture entrances (`[data-enter]`) and the count-up (`[data-count]`), on
  IntersectionObserver and the Web Animations API. Enhancement only.
- `next/js/chart.js`: draws a range chart from `app-data.js` the way the app
  does (`window.PreflopChart`: grid, legend, the live-region summary). The
  demo's Chart view uses it; How it teaches moves onto it in redesign Phase 3.
- `next/js/demo.js`: the hero's playable demo (redesign SPEC §6.2): the three
  generated hands, the app's grading, the answer card, Chart view, the deal,
  the score, the nudge.
- `assets/vendor/gsap/`: GSAP + ScrollTrigger 3.15.0, no longer loaded by any
  page since redesign Phase 1; the files are deleted in Phase 6.

### Phase 1: the shell

- **Nav** (`header.nav[data-nav]`): sticky, solid, a container, so it
  collapses by its own width (under 640px), not the viewport. Logo, Features,
  Pricing, FAQ and the CTA, which stays in the bar at every width. Without JS
  the links are a row under the bar. `site.js` sets `[data-enhanced]` and runs
  the menu: `aria-expanded` / `aria-controls` on `.nav__toggle`, focus into the
  menu, Tab trapped in the bar, every other part of the page `inert`, Escape
  closes and returns focus, and so do a link, a click outside and growing wide.
  State is `[data-open]` on `.nav`.
- **Footer**: brand, link groups, email (inside `email_off` markers), fine
  print, theme toggle (JS only).
- **CTA slots**: the nav, the hero, `.cta-band` mid-page and `.cta-band` at the
  close, all `a[data-cta]` with the same href as `config.js`.
- `/next/` is still placeholders for Features, Pricing and FAQ. The hero is a
  stand-in with the real headline and CTA; the playable demo, proof bar, scroll
  story, bento and the rest are later phases.
- To check by hand: serve the repo root (`python3 -m http.server`) and open
  `/next/` at 375, 768 and 1280 in both schemes, with Reduce Motion on, and
  with JS off. Open the menu with the keyboard (Tab, Shift+Tab, Escape). The
  page `<meta>` CSP applies, so the console shows any blocked script.
  `_headers` and the Cloudflare zone settings only apply on Pages. Since the
  redesign, `scripts/scroll-pass.js` (below) is the way to check a change.

Rules for `/next/` pages, enforced by `check-site.py`: `noindex`; a page CSP
with `script-src 'self'` (the `_headers` rule drops the site-wide one, as for
`/s`), so no inline script, style or event handlers; scripts
use `defer`; no external asset URLs anywhere on the site; JS under 40 KB and
CSS under 26 KB gzipped; every `img` has pixel `width` and `height`; ids are unique and every
`aria-controls` names one.
Motion rules (redesign SPEC §4.7): animate `transform` and `opacity` only;
`[data-enter]` goes on pictures, never on text, prices or buttons; nothing
loops, pins or scrubs; and nothing is hidden until JS runs.

## The text pages (Phase 6)

FAQ, support, press, privacy, terms and 404 share one head, header and footer
(the checker keeps them identical) and `next/css/pages.css`; `style.css` is
gone. Their nav and footer are the homepage's, with absolute links. To change
the shared blocks, edit one page and copy the block to the others. The FAQ's
`<details>` rows are `.faq` / `.faq__q` / `.faq__a`; `site.js` opens the one a
`/faq/#id` link names.

## /next/ QR and demo markup

`assets/qr/testflight.svg` is the hero QR, made offline from the CTA URL in
`next/js/config.js` (`pip install segno`, then `python3 scripts/make-qr.py`).
Re-run it whenever that URL changes; `check-site.py` fails a QR that encodes a
different URL. `scripts/capture-demo-static.js` prints the demo's first-hand
markup for the root `index.html` (see its header): paste it into
`#demo-stage` after changing `renderTable()` or hand 1.

## Real app data on the homepage (Phase 7)

`docs/app-handoff/` holds what a session in the app repo exported: the facts
audit (`FACTS.md`), the app's tokens and motion (`motion-and-design.md`) and
real spots, range charts, badges and widget text (`data/`). `gen-app-data.py`
turns it into `next/js/app-data.js`: the three charts (the explorer and the
demo's Chart view draw them) and the demo's three hands (A5s, J8s, KTs, with
the app's mix and the first sentence of its explanations; redesign Phase 2).
It asserts that each hand's mix matches its chart's cell. It no longer writes
the badge grid, which redesign Phase 4 removes. Re-run it when the data changes. The stats and
home numbers in that folder are MOCK (a dev sample profile) and are labelled
Sample profile wherever the page shows them.

`facts.json` gained `practiceSpots` (what the app bundles), `practiceSpotsShown`
(rounded down, written as "25,000+") and `stackDepths`. `check-site.py` fails
any "N,NNN+" in a page or a `next/js` script that is not the shown figure, and a
shown figure above the bundled count. The app repo's `check_site_facts.py`
ignores these keys (confirmed by the app session).

## Asset stamps (`stamp-assets.py`, redesign Phase 0)

Every local asset URL in the pages carries `?v=` and the first 8 hex
characters of the file's SHA-256: `src`, `srcset`, and stylesheet, preload,
icon and apple-touch-icon links on every page but `/s/`, plus every `url()` in
`next/css/*.css`. `_headers` makes `/next/css/*` and `/next/js/*` immutable,
which is only safe because their URLs change with their bytes (ISSUES LIVE-02:
live CSS and JS were cached for 4 hours under fixed names).

```sh
python3 scripts/stamp-assets.py            # after changing any asset, before committing
python3 scripts/stamp-assets.py --check    # what is stale, without writing
```

`check-site.py` fails a missing or stale stamp. URLs that JavaScript builds
(`/assets/suits/`, for `demo.js`) are never stamped, not even in the HTML's
no-JS copy of the first hand, or the same file would download twice: rename
those files when they change.

## The verification harness (`scroll-pass.js`, redesign SPEC §10)

The redesign is checked the way the last build broke: mid-scroll and after a
resize, not in full-page screenshots. The harness scrolls a page 0.4 viewport
at a time, waits 600 ms, then runs the frame probes (overflow, sticky or fixed
elements, double exposure, half-faded, pending entrances, running animations,
overlapping text) and takes a viewport screenshot at every step. After the
pass it records height, section tops, CLS, LCP, TBT, requests, bytes, console
errors, infinite animations and blur layers, and checks them against
`scroll-pass.budgets.json` (SPEC §4.3 and §4.9). Each budget has a `from`
phase; before it, a miss is reported as "due Phase N" instead of failing.

```sh
NODE_PATH=$(npm root -g) node scripts/scroll-pass.js --out "$TMPDIR/sp"                       # the phase plan (SPEC §10.3)
NODE_PATH=$(npm root -g) node scripts/scroll-pass.js --no-passes --probes menu,keyfocus,anchors,theme,nojs
NODE_PATH=$(npm root -g) node scripts/scroll-pass.js --live --viewports 390x844,1440x900       # the deployed site
```

- It serves the repo itself (`python3 -m http.server 8123`) when nothing
  answers on a localhost `--base`; `--root DIR` serves another checkout, such
  as a `git worktree` of `main` for a before-and-after.
- Modes: `default`, `reduced` (Reduce Motion), `nojs`, `blockedjs` (`/next/js/`
  aborted) and `iphone` (iPhone UA, DPR 3, touch, 4x CPU, 1.6 Mbps). Always set
  a scheme: headless Chromium defaults to light.
- Probes: `menu`, `keyfocus`, `anchors`, `theme`, `nojs`, `resize`, `rotate`,
  `fastjump`, `axe`, `live` and `demo` (every hand x every slab grades as the
  app does, the answer card names the hand and fits, text floors at 320, 390
  and 1440, Chart's 169 cells and one ring, the score CTA, Reduce Motion with
  no animations, and the hero's first-screen numbers); `explorer` arrives with
  Phase 3. `axe` needs axe-core outside the repo:
  `npm install --prefix "$TMPDIR/scroll-pass-axe" axe-core`.
- Output goes to `--out` (default `$TMPDIR/scroll-pass/<stamp>`; it refuses a
  folder inside the repo): `report.md`, `report.json`, every frame, and a
  contact sheet per run with failing frames outlined in red. Copy only the
  chosen evidence into `docs/redesign/shots/phase-N/` (at most 24 PNGs and
  3 MB; quantise the contact sheets, for example with Pillow's
  `Image.quantize(256)`).
- Chromium only. WebKit and iOS Safari can't run here (SPEC §10.4), so every
  report says what wasn't verified.
