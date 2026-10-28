# From the app repo

Copied verbatim from `preflopapp/PreFlop-App-IOS`, branch `claude/website-handoff`
(commit 936f6f1, app `main` @ 1006e29, 2026-10-28), produced by a session in the
app repo. It is the source of truth for what the app does:

- `FACTS.md`: every claim the site makes, with a verdict and file:line proof.
- `motion-and-design.md`: the app's tokens, motion curves and timings.
- `data/*.json`: real spots, range charts, badges, widget text. `stats-and-home-sample.json` is MOCK.
- `screens-README.md`: what real screenshots exist (all dark, all pre-Hanken) and what does not.

`scripts/gen-app-data.py` turns `data/` into `next/js/app-data.js`, which the
homepage loads. Re-run it when the app repo's data changes. The screenshots
are in `assets/screens/` (re-encoded from the app repo's WebP).
`docs/` is not deployed.
