---
paths:
  - "_headers"
  - "_redirects"
  - "assets/**"
  - ".well-known/**"
  - ".github/workflows/**"
  - "scripts/og-card.html"
  - "scripts/render-og.sh"
---

# Caching, headers and deploy

- **Rename an asset when it changes.** `/assets/*` is cached for 7 days and
  browsers hold favicons longer, so an overwritten file stays stale
  (`og-v2.png` 1539cc3, `og-v3.png` Phase 8, `mark-v2.svg` 31436d3). Update every reference in the
  same commit; the checker finds the broken ones. The card's text is baked into
  the PNG, so no check sees it go stale: it said "50 hands free, then 20 a day"
  after the app became 20 a day. Re-render it (`scripts/og-card.html`) whenever
  `facts.json`'s free-tier numbers change.
- **The site CSP is `script-src 'none'`.** Only `/` (the homepage, `script-src 'self'`),
  the text pages (`/faq`, `/support`, `/press`, `/privacy`, `/terms`), `/next/*`,
  and `/s` replace it, each with its own CSP in its
  `<head>` (see `_headers`; `/` is the exact path, so no other page is affected). An inline
  script anywhere else is silently blocked. Test in a browser, not just the
  checker.
- **Wrap every `mailto:` anchor in `email_off` markers.** The zone's Email
  Address Obfuscation rewrites mailto links to a decoder script our CSP blocks,
  so the address dies. CI can't see it: the smoke test hits `pages.dev`, which
  is outside the zone (e898552). The smoke test does check that each page with
  its own CSP is detached at the edge (Phase 6).
- **`.well-known/apple-app-site-association` must deploy and be served as JSON
  with no redirect**, or Universal Links for `/s/*` stop opening the app. The
  deploy drops dot-entries except `.well-known` (see the comment in
  `deploy.yml`).
- **Never commit `.wrangler/`** and never deploy the repo root: Pages publishes
  every file, dotfiles included.
- **Asset URLs are stamped; run `scripts/stamp-assets.py` after changing any
  asset.** Pages name CSS, JS, fonts, images and icons as `?v=<sha256[:8]>`,
  and `/next/css/*` and `/next/js/*` are served `immutable`, so an unstamped
  or stale URL would be cached for a year. `check-site.py` fails both. CSS is
  stamped before HTML (a font stamp changes `tokens.css`). Not `/next/*`
  immutable: that would freeze the style guide's HTML (redesign Phase 0,
  ISSUES LIVE-02).
