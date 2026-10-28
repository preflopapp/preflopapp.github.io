---
paths:
  - "s/**"
---

# Shared-hand page

- `/s/` enforces its own hash-pinned CSP in its `<head>` (the page's script is
  inline, unlike the rest of the site); change its script and its hash
  together, and open it in a browser, since a CSP mismatch only shows there.
- The old `/landing/` page, its importer and its tests were deleted in Phase 8
  (Stan, 28 October 2026). `/landing` and `/landing/` stay as redirects to `/`
  in `_redirects` because the app and old links may still use them.
