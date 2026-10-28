# Website facts audit

Source of truth: the app at branch point `1006e29` (main, 2026-10-28), version
`project.yml` **1.2.1**. Read-only audit; no app code changed.

**How the site's claims were gathered.** The live site is not reachable from
this container, so "what the site says" is (a) the claims in the brief and
(b) the landing copy in this repo, `web/landing/src/page.body.html` (which the
README there says is *behind* the live site) and `docs/AppStorePlan.md` §7.1.
Where the live site differs from those, trust this file for the app and
re-check the wording.

Verdicts: **TRUE** / **FALSE** / **REWORD** (true in spirit, wording must change).

## Headline discrepancies (read these first)

1. **"30,000+ practice spots" is FALSE.** The bundle holds **25,479** spots
   (6,431 at 100bb, 19,048 at 20/30bb). Say "25,000+".
2. **Stack depth is NOT only 100bb.** The app also covers **30bb and 20bb**
   (tournament short stacks), including **Facing an all-in** (jam/re-jam)
   and **Blind vs blind** (limp or raise). "100bb deep" undersells it and
   "Established preflop charts for 100bb cash games" is wrong as a boundary.
3. **Grade names are not "Correct / Close / Miss".** The user sees
   **Correct / Mixed / Wrong**. "Close" is only the internal raw value.
4. **The grading rule is more than "within ten points".** An action also
   counts as Mixed if the chart plays it **≥ 25%** of the time, even if it is
   far below the top action. Details below.
5. **Level names do not exist.** Levels are numbers (Level 1, 2, …). Do not
   invent rank names.
6. **Badges: 60 today** (the in-repo doc says 56; it is stale). Tiers are
   Bronze / Silver / Gold / Diamond, per seat and per situation.
7. **Trial:** no free trial is offered to anyone new. An annual plan with a
   7-day trial still *exists* in App Store Connect and `Preflop.storekit`
   (kept for existing subscribers) but the paywall cannot show it.
   `docs/AppStorePlan.md` §7.1/review notes still describe the trial and
   annual as sold; they are stale. STATUS.md wins.
8. **"Raise first in from every seat" is slightly off.** RFI is dealt from
   UTG, UTG+1 (8-max), LJ (8-max), HJ, CO, BTN. The **small blind's** first-in
   decision lives under **Blind vs blind** (SB: fold/limp/raise). The big blind
   never opens first.
9. **"No network calls except feedback" is not exactly true.** Three network
   uses exist: feedback (user-sent), the **paywall lineup** file
   (`preflopapp.com/paywall.json`, anonymous GET, no user data) and
   **bankroll exchange rates** (Frankfurter/ECB, sends only two currency codes,
   only when the user logs a foreign-currency session). Plus StoreKit talking
   to Apple. "No analytics, no ads, no account" is TRUE.
10. **Features the site may not mention:** Blind vs blind, Facing an all-in,
    20/30bb tournament depths, bankroll tracker (free, with Live Activity),
    shared-hand links, widget, colour-blind pattern mode, glossary ("Poker
    Terms"), light mode, card face/back/deck options, Simple Home (Pro).

## Claims table

| # | Claim | Verdict | Corrected wording (use this) | Proof |
|---|---|---|---|---|
| 1 | 30,000+ practice spots | **FALSE** | "25,000+ practice spots" (exact: 25,479; 100bb alone: 6,431). Definition: one spot = one hand class (e.g. `ATo`) in one chart (a seat × situation × table size × stack depth). 424 charts, 25,479 unique spot ids across 5 bundled files. Counted with a script over `ContentPipeline/Normalized/spots_*.json` (see `data/spot-counts.json`). The app's own App Store screenshot copy says "11,500+" (stale, from before BvB/all-in/vs-3bet growth). | `ContentPipeline/Normalized/spots_*.json`; loader `ContentPipeline/ContentLoader.swift:177-180`; `data/spot-counts.json` |
| 2 | 20 free hands a day, free forever | **TRUE** | "20 hands a day, free forever. No account, no card." Resets at local midnight ("Your next 20 free hands unlock at midnight"). | `Models/FreeTierConfig.swift:16`; `Views/Paywall/HandLimitView.swift:70-73` |
| 3 | What is free | **TRUE** | Free = the game: 20 hands/day; after every hand the verdict, the frequency mix, the explanation, the range chart and glossary; streak, XP, levels, badges; level-unlocked situations; stack depth and table size choice; your last **5** hands in Hand History (+5 per hand shared, up to +25, so max 30); bankroll tracker; widget; reminders; themes/card options; sharing. Free Profile shows session score, not overall accuracy. | `.claude/rules/monetization.md:13-22`; `docs/STATUS.md` "Free vs Pro is built"; `Models/FreeTierConfig.swift:24-39`; `Views/Bankroll/*` has no Pro gate (grep `isPro` finds none) |
| 4 | What is Pro | **TRUE** | In the app's own words (paywall list): "Unlimited hands, no daily cap" · "Your stats and leaks, by situation and seat" · "Practice Filters: drill any spot" · "Every hand saved, with filters" / "All N of your hands, with filters". Also Pro: Home's dashboard (accuracy and trend, spot to fix next, hands to revisit), Practice Filters' seats/situations/presets/focus drills, daily goal (5-200 hands), Simple Home switch. | `Models/PaywallPitch.swift:46-72`; `.claude/rules/monetization.md:13-22`; `Models/UserProgress.swift:678`; `Views/Settings/AppearanceSettingsView.swift:82` |
| 5 | Monthly price | **TRUE** | **$7.99 / month**. Source of truth is App Store Connect; mirrored in StoreKit file. Never hard-code in markup; read `facts.json`. | `Preflop.storekit` (`preflop_pro_monthly`, displayPrice 7.99); `docs/STATUS.md` pricing bullet |
| 6 | Lifetime price | **TRUE** | **$59.99 once**, yours for good (non-consumable, Family Sharing on). Preselected on the paywall. | `Preflop.storekit` (`preflop_pro_lifetime`, 59.99); `Monetization/PaywallLineup.swift:37` |
| 7 | Annual price | **REWORD** | Do **not** advertise annual. $39.99/yr exists only for existing subscribers; the paywall has no annual case. | `Preflop.storekit` (`preflop_pro_annual`, 39.99); `CLAUDE.md` Prices; `.claude/rules/monetization.md` ("PaywallLineup.Plan has no annual case") |
| 8 | Free trial | **FALSE if advertised** | "No free trial anywhere" (Stan, 2026-10-28, #551): the free plan is the trial. The StoreKit file still carries a 7-day intro offer on **annual only**, unreachable from the paywall. Monthly and lifetime never had one. | `Preflop.storekit` (annual `introductoryOffer` P1W); `docs/STATUS.md` "No free trial anywhere"; `Monetization/PaywallLineup.swift:37` |
| 9 | Covers: raise-first-in | **REWORD** | "Opening (raise first in) from UTG, UTG+1, LJ, HJ, CO and the button; the small blind's first-in (fold/limp/raise) under Blind vs blind." 6-max seats: UTG/HJ/CO/BTN (RFI), SB/BB under BvB. 8-max adds UTG+1 and LJ. | spot files: seat sets per (table, type) in `data/spot-counts.json` |
| 10 | Covers: facing an open | **TRUE** | "Facing an open, from every seat that can face one, against every opener." 6-max: HJ, CO, BTN, SB, BB; 8-max adds UTG+1, LJ. Options are fold / call / 3-bet. | `data/spot-counts.json`; sample `spots_facing_open.json` |
| 11 | Covers: facing a 3-bet after you opened | **TRUE** | Fold / call / 4-bet. Hero is the opener (UTG…SB), villain the 3-bettor. | `spots_vs_3bet.json` |
| 12 | 6-max and 8-max | **TRUE** | Both, at every depth. | all spot files carry `tableSize` |
| 13 | "100bb deep" (only) | **FALSE** | "100bb, 30bb and 20bb". 100bb: 6,431 spots · 30bb: 9,552 · 20bb: 9,496. | `data/spot-counts.json`; `docs/AppStorePlan.md:482` |
| 14 | Facing an all-in | **missing from site** | New situation, 20bb and 30bb only (jam, re-jam; fold / call). Unlocks at **Level 6**. 4,122 spots. Not at 100bb. | `Models/PuzzleCategory.swift:88-89,111-113`; `spots_facing_all_in.json` |
| 15 | Blind vs blind | **missing from site** | SB first in (fold/limp/raise/all-in) and BB facing a limp, at 20/30/100bb. 1,992 spots. Unlocks at **Level 3** with Facing an open. | `Models/PuzzleCategory.swift:90-94,95-99` |
| 16 | NOT covered | **info** | Facing a **4-bet** (open issue #257), **squeeze** (#258), every-hand-class completeness (#256), postflop, equity/EV, ICM, ante (20/30bb draw no ante; app says "No ante shown"), stacks other than 20/30/100bb, 3-max/9-max/heads-up, straddles. Limp-first in other than BvB. Also: content source is PokerCoaching's tournament preflop charts, **unlicensed so far** (STATUS "Not done" 1): do not say "solver", "GTO-optimal" or name the source. `#249` is open for the same reason. | `docs/STATUS.md` Roadmap §4 and Not done §1 |
| 17 | Grading label names | **FALSE as written** | Three grades shown to users: **Correct**, **Mixed**, **Wrong**. Mixed headline: "Mixed — the chart plays both" (or "all three"/"all four"). Never "Close" / "Miss" on screen. | `Models/ActionMix.swift:497-501` (displayName), `:314-327` (mixedHeadline) |
| 18 | Grading rule | **REWORD** | Correct = the most frequent action. **Mixed** = any other action within **10 percentage points** of the top (compared on the displayed whole percents), or any action the chart takes **at least 25%** of the time; also if the top two are within 10 points, either is Mixed. **Wrong** = the rest. Mixed counts as correct for streak, XP and accuracy. Misses on a line the chart plays rarely say "the chart plays the line, just rarely". | `Models/ActionMix.swift:449` (10), `:477` (25), `:510-522` (`grade`), `:495-496` (`countsAsCorrect`) |
| 19 | Explanation after every answer | **TRUE** | Yes (never gated). Collapsed behind a "Why" row after a Correct, open after Mixed/Wrong (decided in `docs/superpowers/specs/2026-10-28-motion-and-delight-design.md` 3a; a "Why" button exists at `Views/Shared/Controls/PreflopPeekButton.swift:68`, I did not verify the collapse shipped, so say only "explanation after every answer"). | `CLAUDE`/monetization rule "never gate the teaching"; `docs/superpowers/specs/2026-10-28-motion-and-delight-design.md` |
| 20 | Frequency mix, range chart | **TRUE** | Mix bar under the buttons plus full 13x13 chart for the spot ("peek"). Free. | `Views/Puzzle/DecisionBarView.swift`, `Views/Puzzle/RangeChartView.swift` |
| 21 | Accuracy by seat and situation, named leaks | **TRUE (Pro)** | Statistics screen; leaks named by seat/situation/hand type; "Drill this seat". | `Views/Profile/StatisticsView.swift`, `LeakRow.swift`; `Views/Home/FocusSpotCard.swift:115-121,274` |
| 22 | Home dashboard | **TRUE (Pro)** | Accuracy card with weekly trend, the spot to fix next ("Fix next"/"One seat is costing you most here"), hands to revisit (misses with "Replay"), skill pills grid, streak week row, goal ring. Free Home is a hero with the next hand. | `Views/Home/*`; `Models/FreeHome.swift` |
| 23 | Practice Filters | **TRUE** | Situations (incl. "Limped pots"), hand types (Blind defense, Suited Ax, Broadway, Pocket pairs), seats, stack depth, table size. Seats/situations/hand-type drills are **Pro**; **stack depth and table size are free**. | `Models/PuzzleCategory.swift:84-128`; `.claude/rules/monetization.md:20-22` |
| 24 | Full hand history | **TRUE (Pro)** | Free: last 5 (+ share bonus up to 30). Pro: all, filterable. A second tap on the tab scrolls to top. | `Models/FreeTierConfig.swift:24-39`; `docs/STATUS.md` Simple Home bullet |
| 25 | Daily goal | **TRUE (Pro)** | 5-200 hands a day, in steps of 5, presets 10/25/50. | `Models/UserProgress.swift:678`; `Views/Settings/PracticeSettingsView.swift:16,29` |
| 26 | Streak | **TRUE (free)** | A day counts with **1** answered hand (a wrong answer counts: it measures showing up). Local-midnight days. | `Models/FreeTierConfig.swift:61-73` |
| 27 | XP and levels | **TRUE (free); no names** | **15 XP per correct (incl. Mixed) hand**. Level n→n+1 costs `round5(100 × 1.15^(n-1))` XP (100, 115, 130, 150, 175…). Levels are numbers only; **no level names exist**. Situations unlock by level: Opening 1, Facing an open 3, Blind vs blind 3, Facing a 3-bet 5, Facing an all-in 6. | `ViewModels/PuzzleViewModel.swift:836`; `Models/LevelCurve.swift:15-19`; `Models/PuzzleCategory.swift:84-95` |
| 28 | Badges | **TRUE; 60 badges** | Two families. **Seat badges**: 8 seats × Bronze 25 / Silver 100 / Gold 500 correct answers = 24. **Situation/hand-type badges**: 9 categories × Bronze 25 / Silver 100 / Gold 500 / Diamond 1,000 = 36. Full list: `data/levels-and-badges.json`. | `Models/BadgeCatalog.swift:19-36`; `Models/PuzzleCategory.swift:84-95` |
| 29 | Widget | **TRUE** | Home Screen widget, **small, medium, large**. Small: flame + streak number + "day streak". Medium: streak strip ("N days", hands left today) + the hand of the day (cards, seat pill, situation, Fold/action buttons stand-in). Large: seat pill + streak, hands left, big cards, hand title/context, action path, decision row. Tap opens that exact hand. Falls back to a streak-only layout without a spot. Pro: "Unlimited hands today". Details in `data/widget-layouts.json`. | `PreflopWidgets/PreflopWidgetView.swift:21-23`; `PreflopWidgets/PreflopWidgetContent.swift` |
| 30 | Practice reminders | **TRUE** | Evening (20:00) nudge when the streak is at risk; opt-in; Settings › Notifications. | `Views/Settings/NotificationSettingsView.swift:28-60`; `.claude/rules/widget-and-notifications.md` |
| 31 | Bankroll tracker | **TRUE, missing from site** | Free, opened from a card on Profile. Live and logged sessions, **cash or tournament**, venue, game, multiple buy-ins/rebuys, breaks, cash-out, optional mood (Sharp/Solid/Card dead/Tilted/Tired) and note, home currency with foreign-session exchange rates, history, insights (balance vs goal ring, bankroll health in buy-ins, "Where you win", "By day", per hour). Lock-screen **Live Activity** for a session in progress. Stored on-device in its own store. Not yet tried on a real device (STATUS). | `Models/Bankroll/BankrollSession.swift`; `Views/Bankroll/BankrollInsightsView.swift`; `PreflopWidgets/BankrollLiveActivityWidget.swift`; `docs/STATUS.md` Bankroll bullet |
| 32 | Reset Progress | **TRUE** | Settings › Restore & Reset › Reset Progress: deletes hand history, XP, level, streak and badges; plan and purchases are kept. Same screen: Restore Purchases, Replay Tutorial. | `Views/Settings/RestoreAndResetSettingsView.swift:30-83` |
| 33 | Shared-hand links | **TRUE** | `https://preflopapp.com/s/<spotId>?p=<payload>&a=<answer>`; opens the app (Universal Link) or the website's `/s/` page. The website reads only the payload `p` (the whole spot) and `a` (the sender's pick). Share = the quiz card; hold a Hand History row to share. | `Models/SharedSpotLink.swift:1-25` |
| 34 | Themes | **REWORD** | There are **no themes** to pick: one look, **dark by default with a Light Mode switch**. One table skin. Optional **Colour-Blind Patterns** for charts. | `Views/Settings/AppearanceSettingsView.swift:70-80,100-107`; `Views/Shared/TableSkinPalette.swift:413-414` |
| 35 | Card faces / backs | **TRUE** | Card Face layout: **Stacked, Jumbo, Tinted**. Deck: **Two-colour, Four-colour**. Card Back: **Flat, Lattice, Noir**. (Back colour swatches too.) | `Rendering/CardStyle.swift:10-28,41-54,65-82`; `AppearanceSettingsView.swift:109-140` |
| 36 | Haptics / sound / animation speed | **TRUE** | Settings › Sound & Motion: Sound Effects, Haptics (on/off, nothing on a wrong answer), Ambient Background, **Animation Speed: Slow ×1.6 / Normal ×1 / Fast ×0.35 / Instant (skip deal)**. Before the 10th answered hand a new player gets full-length deals. | `Views/Settings/SoundAndMotionSettingsView.swift:25-72`; `Views/Shared/AnimationSpeed.swift:9-62` |
| 37 | iPhone only | **TRUE** | iPhone only (`TARGETED_DEVICE_FAMILY "1"`). | `project.yml:103,174,270` |
| 38 | iOS 17+ | **TRUE** | Minimum iOS 17.0. | `project.yml:4,17,118` |
| 39 | No account | **TRUE** | None. | `docs/WebsiteHandoff.md` Part A |
| 40 | No analytics / ads | **TRUE** | Public build has no analytics (`AnalyticsClient.swift:42` real client is `#if DEV_BUILD` only; STATUS says none in public); no ads. | `docs/STATUS.md` "Open decisions" (measuring launch); `Analytics/*` |
| 41 | No network except feedback | **FALSE (REWORD)** | "Practice works offline. The app goes online only to check your subscription with Apple, to read the paywall plan list (nothing about you is sent), to send feedback you choose to send, and (bankroll) to fetch a currency rate." | `Models/FeedbackClient.swift:43`; `Monetization/PaywallLineup.swift:132`; `Models/Bankroll/ExchangeRates.swift:1-13` |
| 42 | App state | **info** | 1.2.0 in **external TestFlight beta**, **not submitted**; site must say "Coming soon", not "Available". "Available at launch" on the Pro card is OK. | `CLAUDE.md` header; `docs/STATUS.md` |
| 43 | Typeface | **info for redesign** | The app already moved to **Hanken Grotesk**; landing source still says Outfit. See `motion-and-design.md`. | `Views/Shared/AppFont.swift:4-22`; `Resources/Fonts` |

## Things the site says that the app does not do

- "30,000+ practice spots" (25,479).
- "100bb deep" as the whole coverage; "100bb cash games" as the source.
- "Close"/"Miss" grade names.
- Level names, if any are drawn.
- A free trial, annual price.
- "No network calls".
- "Themes" (there is Light Mode only).
- "Solved" (footer tagline "One street. Every hand. Solved.") conflicts with
  `#249`/STATUS: the app must not claim solver output until the content-rights
  question is settled. Suggest dropping "Solved" and "GTO".

## Things the app does that the site doesn't mention

Blind vs blind; Facing an all-in and 20/30bb; bankroll tracker and Live
Activity; widget (3 sizes); colour-blind patterns; Poker Terms glossary;
tap-to-share hands; Replay Tutorial; Simple Home; hand-of-the-day deep links.

## Needs Stan / not verifiable here

- Whether the 20/30bb spots are fair to advertise under the content-rights
  question (STATUS Not done 1).
- Live site wording (container cannot reach it).
