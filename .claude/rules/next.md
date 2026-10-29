---
paths:
  - "next/**"
---

# The /next/ system and the homepage

Since the Phase 5 cutover the homepage is `index.html` at the root, built on
the `next/` CSS/JS; `next/` keeps the assets and the style guide. `/landing/`
and `/next/` redirect to `/` (`_redirects`). The checker treats a root
`index.html` with no `shared:head` as a /next/-system page that must be
indexable, and takes the shared blocks from the first other page (Phase 5).

- **Nav width rules are container queries, not viewport media queries.** The
  bar collapses by its own width so the style guide can show the narrow form in
  a narrow box. A container (and `backdrop-filter`) is the containing block for
  `position: fixed` children, so the menu's scrim is `absolute` (Phase 1).
- **Menu state is `[data-open]` on `.nav`, never the `hidden` attribute on the
  panel.** `hidden` would also hide the links in the wide layout once JS has
  run. JS may set styles through the CSSOM (CSP only blocks `style=` markup).
- **A script `inert`s every sibling up to `<body>`, not `main`.** The style
  guide's demo navs live inside `main`, so inerting `main` would freeze the page
  that holds them.
- **Scroll reveals hide until scrolled to.** Scroll the whole page before a
  full-page screenshot or the panels shine through as blanks.
- **Ids are unique and `aria-controls` must name one:** the checker fails both
  (the style guide shows several navs, each needs its own menu id).
- **No `style=` in anything JS writes either.** The page CSP is `style-src
  'self'`, which blocks a `style` attribute inside an `innerHTML` string just
  like one in the HTML, and silently (Phase 2). Position with a `data-*` rule in
  CSS; set dynamic values through the CSSOM (`el.style.setProperty`, which is
  allowed). `check-site.py` only sees the HTML, so look at the demo in a browser.
- **The hero's first hand is in the HTML twice:** `demo.js` redraws it, the HTML
  holds a copy for no-JS. After changing `renderTable()` or spot one, run
  `scripts/capture-demo-static.js` and paste the result into
  `#demo-stage` (Phase 2).
- **The LCP element must stay the `<h1>`.** Keep the headline and the hero
  button plain HTML with no `data-reveal`, keep SemiBold preloaded (the display
  weight), and never make the demo a background-image or a big `<img>`. Check
  with a `largest-contentful-paint` observer, not by eye (Phase 2).
- **The demo is drawn from the page's tokens, not the app's table palette.**
  Screen `--panel`, rail `--well`, felt `--bg`, pods `--panel`, card backs
  `--well`. The app's tan felt and red card backs read as a foreign block on the
  page (Stan: "disconnected", Phase 2) and red is spent on fold. Don't bring a
  fixed colour into `demo.css` that isn't a token; only the action-button ink
  needs a scheme switch (`light-dark()` is avoided: an unsupported browser would
  drop the whole token).
- **The mix bar is `scaleX(var(--f))`, not a width** (transform/opacity only).
- **Line the hero up with the grid.** The phone is `justify-self: end` so its
  right edge meets the nav button and the proof bar; centred in its column it
  floated. No glow in light: it bands into rings at 8 bits.
- **Action-button ink is the `--act-ink` token, near-black in both schemes.**
  The light fills (fold `#E5514A`, call `#3A89E4`, raise `#28B064`) fail with
  white labels; `#150F02` clears 4.5:1 on all three. Don't re-add a per-component
  ink override in `demo.css`/`sections.css` (the old ones drifted from the
  tokens; light palette change, 2026-10-28).
- **Headless Chromium defaults to the light scheme.** Set `colorScheme` on the
  context or every "dark" screenshot is light.
- **A narrow nav with no JS shows brand and button only.** A row of links under
  the bar made it taller until JS collapsed it into the menu, shifting the page
  about 32px on load (mobile CLS 0.07). The footer carries the same links
  (Phase 2).
- **`data-pin` goes on the `.story` section, not the inner grid.** The CSS keys
  off the section; set on the child, nothing pins and nothing errors.
- **Sections are `--section-y` apart.** Use `.section` (or `.band` for the one
  panel-coloured break) rather than ad-hoc padding, and `.section--flush` when a
  section follows another with the same background, or the gaps stack to 16rem.
- **The text pages (FAQ, support, press, privacy, terms, 404) are the shared
  head/header/footer plus `next/css/pages.css`.** They run `site.js` under a
  page CSP, so each needs `/x` and `/x/*` detached in `_headers`; the checker
  fails a page with its own CSP and no detach (Phase 6). 404.html is served
  from any path, so it keeps the site-wide header and runs without JS.
- **A page-CSP check that skips on `'none'` must read `script-src` alone.** The
  first version tested the whole string, `default-src 'none'` matched, and every
  real page was skipped; only a test against a page with that exact CSP showed it.
- **The theme choice is stored in `localStorage` (`preflop-theme`)**, read in
  `site.js`, so it carries from `/` to `/faq/`. Reads and writes are in try/catch
  (private windows throw). It applies when the deferred script runs, so a
  visitor who overrode their system scheme may see one frame of it first
  (Phase 8).
- **A hover UI must not move under its own pointer.** The chart explorer froze
  twice in a test: the picked square scaled up and covered its neighbours, then
  the inspector's text changed height and the vertically centred chart shifted,
  so the pointer landed on another square, flip-flopping forever. Mark the pick
  with an outline (no transform), top-align what the pointer is on, and give the
  changing text a `min-height`. A Playwright `hover()` that never becomes
  "stable" is this bug, not a flaky test (Phase 7).
- **`next/js/app-data.js` and the badge grid are generated.** They come from the
  app's own data in `docs/app-handoff/data/` via `scripts/gen-app-data.py`; edit
  the source or the script, not the output. The real screenshots in
  `assets/screens/app-*.webp` predate the app's Hanken refresh (Outfit type, old
  radii): they are illustrations of the layout, not pixel truth.
- **Say when a picture is drawn, not captured.** The widgets and the bankroll
  line are illustrations (no screenshot exists); each says so in a caption. The
  app's own wording and rules win over ours: grades are Correct / Mixed / Wrong,
  a line played 25% of the time is credited, and the spot count is the
  `practiceSpotsShown` fact ("25,000+"), enforced by `check-site.py` in pages and
  in `next/js/*.js` (Phase 7, after the site said 30,000+ for the app's 25,479).
- **A stray `</div>` silently breaks the grid it sits in.** A string-slice edit of
  the homepage left `</div></div>`, closing the bento early: every later card
  went full width with no gap, and no check noticed. `check-site.py` now fails
  an unbalanced or stray end tag (`nesting_problems`). After an edit that
  replaces a block of markup, screenshot the section, not just the checker
  (Phase 8).
- **The per-depth spot counts are `fact:spots100/30/20` markers.** They come from
  `facts.json` `spotsByDepth` (the app's `spot-counts.json`) and must add up to
  `practiceSpots`; show them as exact figures, never with a "+" (Phase 8).
- **Lock the page behind the open menu with `overflow: hidden` on html only,
  plus `touch-action: none` on the open bar and scrim.** Hidden on body as
  well makes body the sticky nav's scroll container, and the open nav leaves
  the screen (the harness's menu probe caught it; SPEC §6.1 now says so,
  redesign Phase 0). The menu probe checks the nav stays on screen.
