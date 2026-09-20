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
  three-hand website demo from the app's 50 starting hands and 20 daily hands.
  Example grading is outside this update's scope.
- These HTML/CSS edits were made in this repository. Before importing a fresh
  iOS landing build, carry them into `web/landing/src/` to avoid overwriting them.

- The header App Store button intentionally has no URL and is disabled until
  the owner supplies a listing. The demo frame stays fixed through feedback
  and results; the pricing comparison presents Free as daily practice and Pro
  as unlimited, targeted study with detailed accuracy and full history.
