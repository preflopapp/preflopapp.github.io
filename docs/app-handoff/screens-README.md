# Real in-app screens: what exists, what does not

**No iOS simulator in the cloud, so nothing new was captured.** Everything here
is a real simulator capture already in the repo (iPhone 17 Pro Max, 1320×2868,
Dev build, sample "regular" user data, motion off), re-encoded **losslessly** to
WebP at native size. All are **dark mode**. Raw sources:
`web/appstore-screenshots/captures/` (the App Store v3 set's inputs, 2026-10-13,
build ≈1.2.0) and `docs/screenshots/2026-09-19/`. They were first committed
here at `368de05` (2026-10-22).

**Every capture predates the 2026-10-28 design-language refresh** (Outfit→Hanken
Grotesk, radii 20/16/10/9→14/10/6, white card faces, light palette). Colours
and layout are close; type and corner radii are not. Treat them as
illustrations, not pixel truth. Use `../motion-and-design.md` for current tokens.

| File | Screen | State |
|---|---|---|
| `practice-table-dark.webp` | Practice: dealt spot | 6-max 100bb, BTN holds A♥5♥, facing a CO open; buttons Fold/Call/3-Bet |
| `answer-explanation-dark.webp` | Answer + explanation | Same hand, graded Correct; mix bar under buttons shows Fold 0% / Call 35% / 3-Bet 65% (**the frequency mix**); Table / Chart buttons |
| `range-chart-dark.webp` | Range chart for the spot | "BTN vs CO open", 100bb 6-max; hero cell A5s ringed |
| `home-dashboard-dark.webp` | Home dashboard (Pro) | Accuracy 74%, Fix next (CO facing a 3-bet, 30%), Revisit, skill pills. Sample profile = MOCK numbers |
| `hand-history-dark.webp` | Hand History (Pro) | 560 hands, rows graded Mixed/Correct/Wrong (colour-washed rows) |
| `jam-table-20bb-dark.webp` | Facing an all-in at 20bb | CO KTs facing BB re-jam; "No ante shown" |
| `jam-answer-with-mix-bar-dark.webp` | Answer with a mixed strategy | Fold 33% / Call 67%, Correct, explanation |
| `jam-range-chart-dark.webp` | 20bb jam chart | purple = all-in cells; legend Fold/Call/Not opened |
| `glossary-sheet-dark.webp` | Poker Terms sheet from the first-hand screen | "Button" definition |
| `paywall-SUPERSEDED-dark.webp` | Paywall | **Old**: shows Monthly + Annual and "Start Free Trial". The live paywall is Monthly $7.99 + Lifetime $59.99, no trial. Do not use. |
| `statistics-OUTDATED-2026-09-19-dark.webp` | Statistics (leaks) | **Old** (2026-09-19, previous tab bar, "Close"/"Not quite" wording). Layout idea only. |
| `app-icon-512.webp`, `app-icon-dark-512.webp` | App icon (final) | downscaled from 1024 sources in `Assets.xcassets/AppIcon.appiconset` (a tinted variant also exists there) |

Also in the repo, **composited marketing art, not raw screens** (3D phones with
headlines; ~1 MB each, not copied): `docs/screenshots/2026-10-13-appstore/`
(v3 set, 8 default + 7 mtt + 7 beginners panels at 1206×2622 and 1320×2868,
plus 5244×2950 header assets), the 2026-10-09 sets (superseded). The
compositor source is `web/appstore-screenshots/` (HTML/JS). Note v3 panel 4 says
"11,500+ spots" and the mtt page "8,300+": **both stale** (see FACTS.md #1).

## Does NOT exist anywhere (say so on the site, don't fake it)

- **Light-mode** screenshots of anything (no capture; `/screen` can produce them on a Mac).
- Home Screen **widget** (any size): no screenshot, no mock. Layout text is in `data/widget-layouts.json`.
- **Bankroll tracker**, **Settings / Appearance** (card faces, backs), **badge / level** screens, a current **Statistics** and **paywall**, share card, onboarding.
- **Preview video** of the real app. `preflopapp/preflop-marketing` (private, read-only checked) holds only
  `clips/`: an **HTML/CSS/JS re-creation** ("scene") rendered to 12-second vertical
  "Your move?" quiz clips, with 3 sample MP4s (`clips/samples/`: `bb-defend-100bb-J8s`,
  `facing-jam-20bb-T9s`, `rfi-utg-30bb-98s`). They use **Outfit** and draw the
  table in HTML, so they are an approximation of the app, not recordings. Spots
  in them come from the app's content.
- UI-test screenshot automation: `PreflopUITests/` asserts, it does not save images.
  The tooling that does exist: `scripts/screen.sh` (build + launch + screenshot,
  needs macOS/Xcode), `scripts/capture-appstore-screenshot.sh`, `scripts/record-motion.sh`
  (screen recording + `scripts/frame-strip.swift`). Run on a Mac to get the missing
  screens, e.g. `scripts/screen.sh stats -PreflopProfile regular -PreflopStatus lifetime`.
