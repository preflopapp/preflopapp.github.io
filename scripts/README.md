# Landing page updates

The independent app-style page is served at `/landing/`. The existing homepage
and its shared layout remain separate.

Edit and rebuild the landing page in the iOS project's `web/landing/src/`, then
import its self-contained output into this repository:

```sh
python3 scripts/import-landing.py /path/to/PreflopApp/preflop-landing.html
python3 -m unittest discover -s scripts -p 'test_*.py' -v
python3 scripts/check-site.py .
```

The importer adds canonical/social metadata and a CSP pinned to the exact
inline script hash. Re-import after any JavaScript change; editing the generated
script without updating its hash will cause the browser to block it. The
landing route removes the global script-blocking CSP header and enforces its
own policy in the document; X-Frame-Options preserves frame protection.

Pushes to main run the existing Cloudflare Pages deployment and smoke checks.

## Pending landing-page work (2026-09-20)

- The owner will upload app screenshots later. Use those supplied screenshots
  for the landing-page visuals when they arrive; keep the current demos for now.
- The owner plans to hand-edit the copy later. Keep meaningful supporting
  paragraphs, with each heading and paragraph together in `landing/index.html`.
- The current local update compacts the mobile demo and distinguishes the
  three-hand website demo from the app's 20 daily hands.
  Example grading is outside this update's scope.
- These HTML/CSS edits were made in this repository. Before importing a fresh
  iOS landing build, carry them into `web/landing/src/` to avoid overwriting them.

- The header App Store button intentionally has no URL and is disabled until
  the owner supplies a listing. The demo frame stays fixed through feedback
  and results; the pricing comparison presents Free as daily practice and Pro
  as unlimited, targeted study with detailed accuracy and full history.

## Social card (`assets/og-v2.png`)

Every page's link preview uses `/assets/og-v2.png` (1200×630). Its source is
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

`assets/og.png` is kept as a copy because `/landing/` still points at it:
`import-landing.py` writes that URL. Move the importer to the current name
the next time the landing page is re-imported.

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
  them next. Suits are `assets/suits/*.svg` (two-colour deck only on the site).
- `next/css/components.css`: button, TestFlight CTA and "Coming soon" badge,
  section header, card, playing card, FAQ item, reveal, and (Phase 1) nav,
  footer, CTA band and the page scaffold (hero stand-in, placeholder section).
- `next/js/config.js`: the one place the CTA is configured. Set `mode` to
  `"coming-soon"` to turn every `a[data-cta]` into the badge; change
  `testflightUrl` (then the checker lists the `data-cta` hrefs to update) when
  the link changes.
- `next/js/site.js`: CTA slots, nav menu, theme toggle, scroll reveal.
  Enhancement only.
- `assets/vendor/gsap/`: GSAP + ScrollTrigger 3.15.0 with the licence text.
  Self-hosted, no CDN, no build step. To upgrade, replace both files from one
  npm version and re-read `LICENSE.txt`.

### Phase 1: the shell

- **Nav** (`header.nav[data-nav]`): sticky, translucent, a container, so it
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
  page `<meta>` CSP applies, so the console shows any blocked script. Scroll the
  whole page before a full-page screenshot, since reveals wait for the scroll.
  `_headers` and the Cloudflare zone settings only apply on Pages.

Rules for `/next/` pages, enforced by `check-site.py`: `noindex`; a page CSP
with `script-src 'self'` (the `_headers` rule drops the site-wide one, as for
`/landing` and `/s`), so no inline script, style or event handlers; scripts
use `defer`; no external asset URLs anywhere on the site; JS under 150 KB and
CSS under 30 KB gzipped; every `img` has pixel `width` and `height`; ids are unique and every
`aria-controls` names one.
Reveal rules: animate `transform` and `opacity` only, never put `data-reveal`
on the headline or primary CTA, and nothing is hidden until JS runs.

## /next/ QR and demo markup

`assets/qr/testflight.svg` is the hero QR, made offline from the CTA URL in
`next/js/config.js` (`pip install segno`, then `python3 scripts/make-qr.py`).
Re-run it whenever that URL changes; `check-site.py` fails a QR that encodes a
different URL. `scripts/capture-demo-static.js` prints the demo's first-hand
markup for the root `index.html` (see its header). `scripts/gen-range-chart.py`
prints the 13x13 range-chart cells for the bento card from the landing demo's
range data; paste its output into `.chart__grid` if that data changes.
