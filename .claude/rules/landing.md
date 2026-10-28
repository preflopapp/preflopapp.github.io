---
paths:
  - "landing/**"
  - "s/**"
  - "scripts/import-landing.py"
  - "scripts/test_import_landing.py"
---

# Landing page and shared-hand page

- **`/landing/` is generated** from the app repo's `web/landing/src/` by
  `scripts/import-landing.py`. Re-import after any JavaScript change: the
  importer pins the CSP to the exact inline script hash, and a hand-edited
  script without its new hash is blocked by the browser.
- **Carry edits made here back to the app repo** (`web/landing/src/`) before
  the next import, or the import overwrites them (`scripts/README.md`).
- `/s/` has its own hash-pinned CSP too; change its script and its hash
  together.
- After a re-import, run both checks (`/check`) and open `/landing/` in a
  browser: a CSP mismatch only shows there.
