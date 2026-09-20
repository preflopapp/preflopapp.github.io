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
