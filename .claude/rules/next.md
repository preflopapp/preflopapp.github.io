---
paths:
  - "next/**"
---

# The /next/ preview

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
- **Action-button ink is per scheme and per colour.** In light, white on the
  green raise slab is 3.9:1; dark ink clears it, so `--act-ink-raise` differs
  from `--act-ink` (Phase 2).
- **Headless Chromium defaults to the light scheme.** Set `colorScheme` on the
  context or every "dark" screenshot is light.
- **Known, not fixed (Phase 1 shell):** below the nav's container breakpoint
  the no-JS links row collapses into the menu when JS sets `data-enhanced`,
  which moves the page about 32px once (mobile CLS about 0.07). Fixing it means
  changing the nav's no-JS fallback; ask Stan first.
