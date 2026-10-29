# Real app captures: widgets, Live Activity, bankroll tracker, badges

Captured 2026-10-29 from app `main` @ 8b760fa, `Preflop Dev` build, on an
iPhone 17 Pro Max simulator (iOS 26.5), 1320×2868, status bar overridden to
9:41. Every shot exists in `-light` and `-dark` (the system appearance; the
app followed it). None of these is on a page yet: wiring them in is Stan's
call (BACKLOG items 1 and 2).

## Files

| File | What it shows |
|---|---|
| `widgets-home-*.png` | Home Screen with the medium widget (streak, hands left, the hand of the day with Fold / 3-Bet) and the small widget (streak) |
| `widget-medium-crop-*.png`, `widget-small-crop-*.png` | The two widgets cut from that frame (wallpaper in the corners, no transparency) |
| `widget-gallery-{small,medium,large}-*.png` | iOS's Add Widget sheet on each size; the only capture of the large widget |
| `live-activity-lockscreen-*.png` (+ `-crop`) | The bankroll Live Activity on the Lock Screen: venue, game, clock, money in, Break / +$500 / Cash out |
| `live-activity-island-compact-*.png` (+ `-crop`) | Dynamic Island, compact: spade and the session clock |
| `live-activity-island-expanded-*.png` (+ `-crop`) | Dynamic Island, expanded (long press): venue, clock, the three controls, buy-ins |
| `bankroll-overview-*.png` | The tracker's overview: total, past-month change, chart, range picker, Log session / History, Insights card, Start live session, recent sessions |
| `bankroll-history-*.png` | History: calendar of winning/losing days, sessions, win share, best day |
| `bankroll-insights-*.png` | Insights: per hour, won %, hours, goal ring, Bankroll health, Where you win |
| `bankroll-live-session-*.png` | A session in progress: clock, money in, add-on buttons, buy-ins, Break / Cash out |

Data is the app's own Dev sample (`BankrollSample`, `-PreflopBankroll sample`/`live`,
in USD): a regular's few months at Bellagio, Aria, a home game and Wynn, a
$6,000 start and a "Move up to 5/10" goal. Widgets use the `regular` profile:
4-day streak, free user with 12 hands left.

## Badges and progress (added 2026-10-29, app `main` @ 622eda0)

Same device, size, status bar and light/dark pairs. In-app screens only, so
no "PT Dev" label in frame.

| File | What it shows |
|---|---|
| `progress-profile-*.png` | Profile: level ring (level 20), 45-day streak, 600 hands played, the badge bar (60 of 60), Bankroll row, free Plan card |
| `badges-all-tiers-*.png` | Badges gallery with every tier earned: each ladder's bronze (25), silver (100) and gold (500) side by side |
| `badges-in-progress-*.png` | The same gallery part-way: 19 of 60, bronze earned, silver and gold locked, progress bars ("48 / 100") |
| `badge-earned-banner-*.png` (+ `-crop`) | A single badge: the "Badge earned · Bronze · Blind Defense" banner over the answer panel after a correct hand |

Data: the Dev `veteran` profile (`-PreflopProfile veteran`, with
`-PreflopBadges all` for the full gallery) and `regular` with the badges its
history earns for the in-progress gallery. The banner is
`-PreflopBadges armed` and a correct Fold on 72o.

- There is no badge detail screen: gallery rows aren't tappable. The banner
  is the only single-badge view.
- Profile's "0 best run" is the sample profile's value, not a bug in the
  shot; the free Plan card with Go Pro is in frame.
- The gallery scrolls on past Positions to the category ladders; only the
  top is captured.

## Caveats

- **Dev build names**: the widget gallery and Home Screen label say "PT Dev"
  and the icon has a DEV badge. The public app is "Preflop". Use the crops, or
  retake on the public build, for anything that shows the label.
- The Lock Screen shots are Notification Center pulled down over the Lock
  Screen (a simulator can't be locked from a script). The date reads
  "Sat 1 Jan": `simctl status_bar` overrides only the clock.
- The Live Activity card is dark on the Lock Screen in both appearances; light
  and dark differ only in the wallpaper.
- The live session screen says "Started 5:15 AM" under a 9:41 clock: the
  session is seeded relative to the real time.
- The tracker's chart and figures are sample data, not anyone's results.

## Facts for the copy

**Free or Pro:** both the bankroll tracker and its Live Activity are **free**.
`docs/AppStorePlan.md` §4a lists neither under Pro; `Views/Bankroll`,
`Models/Bankroll` and `PreflopWidgets` have no entitlement check; the public
target sets `NSSupportsLiveActivities`. The Home Screen widget is free too.
The widget has small, medium and large sizes and **no Lock Screen widget**
(`supportedFamilies` is system sizes only).

**Teaching or tracking:** it **tracks**; it doesn't teach bankroll management.
There is no lesson, article or stakes advice. What it records: live and logged
sessions (cash or tournament, venue, game, buy-ins and rebuys, breaks,
cash-out, mood and note, foreign currency). What it works out: total and
chart, history calendar, per hour, win share, hours, a goal with a pace
("About 10 months at your pace"), and where you win by venue or stakes. The
one rule of thumb it shows is the **Bankroll health** gauge: your roll in
buy-ins of your standard buy-in, labelled "Under 15: step down", "Holding",
"30+: take shots" (`Views/Bankroll/BankrollInsightsView.swift`). So the site
can say it tracks results and shows how many buy-ins you have, not that it
teaches bankroll management.

**Not yet tried on a device:** the app repo's `docs/STATUS.md` says the Live
Activity is only covered by simulator tests.

## How they were made

`scripts/screen.sh` in the app repo for the tracker screens, and a throwaway
XCUITest (not committed) for SpringBoard: adding widgets, the Dynamic Island
and Notification Center. That test needed an ad-hoc signed build
(`CODE_SIGN_IDENTITY=-`); with `CODE_SIGNING_ALLOWED=NO` the App Group is
missing and the widget shows an empty "0 day streak".
