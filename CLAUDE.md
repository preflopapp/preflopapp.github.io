# preflopapp.com

The website for the Preflop iOS app. The app's repo is
`preflopapp/PreFlop-App-IOS`, checked out beside this one at
`../PreflopTrainer`; its `CLAUDE.md` and `docs/STATUS.md` are where the
project's state lives.

**Pushing `main` deploys the live site** (Cloudflare Pages, via
`.github/workflows/deploy.yml`). Work on a branch and open a PR; merge only
when the owner says to, because a merge publishes.

## Prices and the free tier: `facts.json`

`facts.json` states the prices, the trial and the free-tier numbers the app
sells. It's the one place on the site those numbers are written down as data:

- `scripts/check-site.py` fails any page whose dollar amounts or "N hands a
  day" disagree with it, and any `<!-- fact:key -->value<!-- /fact -->` marker
  whose value differs. Wrap a price in a marker when you write one.
- The app repo's `scripts/check_site_facts.py` fetches the live
  `facts.json` and fails when it disagrees with the app's `Preflop.storekit`
  and `FreeTierConfig`.

So a price or free-tier change in the app is: the app, then `facts.json`,
then the pages (the checker lists every one that disagrees), then deploy.
What Pro includes isn't in `facts.json`; keep the pages' Free and Pro lists
in line with the app repo's `docs/AppStorePlan.md` §4a by hand.

## Checks

```sh
python3 -m unittest discover -s scripts -p 'test_*.py' -v
python3 scripts/check-site.py .
```

Both run before every deploy. The landing page (`/landing/`) is built from
the app repo's `web/landing/src/`; see `scripts/README.md`.
