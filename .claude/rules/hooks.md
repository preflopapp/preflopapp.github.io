---
paths:
  - ".claude/hooks/**"
  - "scripts/test_guard_main.py"
---

# Claude Code hooks

- **Hooks run under macOS `/bin/bash` 3.2, not bash 5.** Cloud sessions run
  Linux bash 5, so a 3.2-only bug passes there: an unquoted `$'\\\n'` pattern
  in `${var//…}` was ignored on the Mac, and a two-line `git push … main`
  slipped past `guard-main.sh`. Put such patterns in a quoted variable, and
  run `test_guard_main.py` on the Mac after changing a hook (Phase 6, 2026-10-29).
