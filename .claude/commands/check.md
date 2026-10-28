---
description: Run the site's two pre-deploy checks (checker unit tests, then the page checker)
allowed-tools: Bash(python3:*)
---

Run both checks from the repo root (the same two the deploy workflow runs) and
report pass or fail. Show only failures and the final summary line, not every
passing test.

```sh
python3 -m unittest discover -s scripts -p 'test_*.py' 2>&1 | tail -15
python3 scripts/check-site.py . 2>&1 | tail -30
```

If `check-site.py` lists pages whose price or free-tier numbers disagree with
`facts.json`, fix the pages (or `facts.json` first, if the app changed). Don't
loosen the checker to make it pass.
