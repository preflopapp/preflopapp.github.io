# Motion and design, as in the app's code

Source: `main` @ 1006e29 (2026-10-28). Every number below is read from Swift;
the file is cited. SwiftUI springs are given as `response` (≈ time to settle,
seconds) and `dampingFraction` (1 = no overshoot). CSS equivalent for a spring
is approximate: use `linear()` easing or a JS spring; for `response r, damping d`
the angular frequency is ω = 2π / r, and it overshoots when d < 1.

## Colour tokens (`Views/Shared/AppTheme.swift`)

Dark is the app's default look; Light is a switch in Settings › Appearance.
Surfaces carry a slight violet cast (blue channel a couple of points high); do
not desaturate them to neutral grey.

| Token | Dark | Light | Use |
|---|---|---|---|
| background | `#0E0F14` | `#F4F4F7` | behind every screen |
| panel | `#191A22` | `#FFFFFF` | cards, rows, seat pods |
| well | `#24252F` | `#E6E6EC` | recessed: tracks, chips, empty chart cells |
| border | `#2A2B33` | black @ 13% | 1px hairline |
| textPrimary | `#FFFFFF` | `#3C3D48` | |
| textSecondary | `#9B9DAB` | `#62636F` | |
| textTertiary | `#787B8A` | `#787985` | |
| accent (amber, text/strokes/bars) | `#F5B942` | `#946200` | the one brand colour |
| accentInk | `#150F02` | `#FFFFFF` | ink on `accent` |
| accentFill (buttons, selected) | `#F5B942` | `#F0A50F` | ink `#150F02` in both |
| accentEdge / accentFillEdge (slab lip) | `#B4841F` | `#4F3400` / `#B87808` | onboarding slabs only |
| celebration (violet) | `#9B8CFF` | `#4F3DBB` | level-up, badge, best-run banners only; ink `#140B33` / `#FFFFFF` |
| chosenFill / chosenInk | `#F4F4F7` / `#0B0B10` | `#DDD9F3` / `#3C3D48` | a picked answer slab |
| slabEdge | `#07080B` | `#D4D4DE` | |
| resultGood (correct) | `#3FBF7A` | `#177644` | semantic only, never chrome |
| resultMid (Mixed) | `#E0A93F` | `#9E7112` | |
| resultBad (Wrong) | `#E0574F` | `#B93830` | |
| actionFold | `#E0574F` | `#E5514A` | practice buttons + chart cells |
| actionCall | `#4F93E0` | `#3A89E4` | |
| actionRaise (raise/3-bet/4-bet, RFI "open") | `#3FBF7A` | `#28B064` | |
| actionAllIn | `#A97BE8` | `#9A6EDE` | |
| actionInk | `#FFFFFF` | `#150F02` | |
| badge bronze / silver / gold / diamond | `#B87333` `#B8BCC0` `#D4A02C` `#8FD4E0` | `#A2602A` `#6E747B` `#A37100` `#1F8CA3` | unearned: `#6C6E7C` / `#8A8C99` |
| backdrop glow warm / cool | amber @ 11% / violet `#9B8CFF` @ 12% | `#FFF1D6` / `#EEEBFF` @ 90% | the one sanctioned gradient |
| Pop-up dim between stacked screens | black @ 15% | | |

Rules worth copying: **flat fills, no gradients** except the ambient backdrop
(two soft amber/violet glows, 20–30 s drift cycles, never behind the practice
table); **green and red are "spent"** (correct / wrong / heat only, never
decoration); amber *filled* = the action, amber *outlined* = you (hero).
Accuracy heat ramp: red below 65.5%, blends to amber, green from 89.5%.

**Table** (`TableSkinPalette.monochrome`, the only skin): rail `#20212B` /
`#BFB8AD`, felt `#15161E` / `#D2CCC2`, felt edge `#0B0C10`, bet pill fill
`#2A2B36` / `#FFFFFF`, seat tab `#EDEDF2` / `#FFFFFF`, folded seat fill
`#17181F` / `#E6E2DB`, acting glow amber @ 13%, dealer button white with
ink `#15161D`.

**Playing cards** (the app adopted these on 2026-10-28): face `#FFFFFF` in
both schemes, red `#C8443C`, black `#15161D`; four-colour deck: spades
`#2A2D36`, hearts `#C9302C`, diamonds `#2F6FD0`/`#2F72BE`, clubs
`#1E8A4C`/`#177644`. Widget cards: same face/ink. Card-back colour options:
red `#C0392B`, blue `#2F72BE`, green `#1F7A4D`, purple `#6A4C9C`, black
`#1C1E20` (styles Flat / Lattice / Noir). Face layouts: Stacked / Jumbo /
Tinted.

## Type (`Views/Shared/AppFont.swift`, `Resources/Fonts`)

**Hanken Grotesk** (SIL OFL), static 400/500/600/700, adopted 2026-10-28. It
replaced Outfit (the old landing page and the marketing clips still use Outfit).
The widget uses the system font.

| Role | Size(s) | Weight | Tracking |
|---|---|---|---|
| display (hero figure) | 62 | 600 | −0.035 em |
| title | 23 screen, 21 panel (18 section, 15 wordmark) | 600 | −0.03 em |
| figure (numbers, tabular) | 24 | 700 | −0.04 em |
| body: button | 16 | 600 | 0 |
| body: row title | 14.5 | 500 | 0 |
| body | 13.5 | 400 | 0 |
| meta / meta secondary | 12 / 11 | 400 | 0 |
| label (UPPERCASE eyebrow) | 10 | 600 | +0.14 em |

Everything scales with Dynamic Type. Nothing heavier than 600 except a figure.
Wordmark: "Preflop" set in the title role (25pt on the launch screen).

## Geometry

Radii: **panel 14, button 10, card 6, pill 999**, screen corner 44. Range-chart
cells 2. Spacing: gutter 16, inset 14, row 14, section 20, tight 6, snug 8,
micro 2. Strokes: hairline 1, emphasis 2. Hit target 44, row height 52, icon
button 38. Bar heights: session 16, category 10, inline 7. (`AppTheme`)

## Motion

Named curves (`Views/Shared/PreflopMotion.swift`), the whole vocabulary:

| Name | Definition | Use |
|---|---|---|
| snappy | `.snappy(duration: 0.2)` | segment thumb, toggle |
| settle | easeOut 0.3 s | bars, meters, pot amount, arriving values; no overshoot |
| emphasis | spring r 0.34 / d 0.68 | the one springy curve: seats dealt, panel arrival, banners, glyph pop |
| press | spring r 0.22 / d 0.70 | button press scale + dim |
| count | easeOut 0.9 s | XP counting up in the session summary |
| slide | spring r 0.33 / d 0.86 | practice sliding over Home, welcome steps |
| entrance | easeOut 0.24 s | rise 12 pt + fade, stagger 0.04 s per item, max delay 0.16 s, whole entrance budget 0.4 s |
| sheen | easeInOut 0.9 s, plays once | a band of light (white @ 32% dark / 40% light) across a primary button (paywall Subscribe, end of onboarding) |
| breath | easeInOut 1.5 s each way, looping (3 s cycle) | idle Play button on the tab bar; stops under Reduce Motion / while pressed |
| reveal | easeOut 0.55 s | launch and welcome title beats |
| card cross-fade (Reduce Motion) | easeInOut 0.22 s | |

**Reduce Motion:** every piece lands in its final state at once; card turns
become a 0.22 s cross-fade; sequences keep order but don't travel.

### The practice loop

- **Deal** (`Views/Puzzle/PokerTableView.swift:652-710`), at Normal speed (×1.0):
  each seat is dealt 110 ms after the previous (`emphasis` pop, plus a deal
  sound); then a 250 ms pause; then each prior action reveals 500 ms apart
  (`settle`, chip clink unless a fold); then 350 ms before the decision. A
  facing-3-bet hand therefore takes about 5 s at Normal. Speed setting
  multiplies every delay: **Slow ×1.6, Normal ×1, Fast ×0.35, Instant = skip
  the deal** (`AnimationSpeed`). A user who never touched the setting gets Normal
  for their first 10 answered hands, then ×0.6. Tap skips.
- **Card turn** (`Views/Shared/CardFlipStyle.swift`): spring, default **Snap**
  r 0.26 / d 0.88, stagger 0.045 s; Spring r 0.38 / d 0.62 / 0.07 s; Weighted
  r 0.54 / d 0.85 / 0.09 s. (Dev-only Flip Lab; not a user setting in the public
  build — verify before listing as a feature.)
- **Answer reveal:** one event. Phase change is animated with `emphasis`; the
  feedback panel rises into place, then the verdict line follows after **240 ms**
  (`verdictLead`) and the explanation lines rise on `entrance`. Every action
  button **fills to its frequency, leading edge first**, inside that same
  transition (no separate fill timer: it rides the panel arrival, so it is the
  `emphasis` spring). The chosen button's ring flashes the verdict colour at
  once, holds **250 ms**, then fades on `settle` (0.3 s).
- **Correct feedback** (`Views/Puzzle/FeedbackView.swift:235-252`, `VerdictBurst`):
  the check glyph pops from scale 0.6 → 1.12 on `emphasis`, then settles to 1 on
  `settle`; a glow lights and decays over **0.6 s easeOut**; a **16-particle burst**
  (radii 2–4 pt, travel 40–90 pt, every 4th a "spark" in the second colour)
  flies out with cubic ease-out, fading and shrinking to 40% over **0.6 s**.
  **Mixed** keeps the tick and its own styling with **no burst**. **Wrong**: no
  hue at all (neutral ink), no burst: red never means both "wrong" and "fold".
  Focus moves to the verdict for VoiceOver 450 ms after arrival.
- **Banners** (level-up, new best run, daily goal reached, badge): top-edge
  move + opacity transition on spring r 0.4 / d 0.7; held about **3 s**
  (`PuzzleView+Moments.swift:60`). Violet (celebration) is used for level-up,
  badge and best-run banners (`AppTheme.celebration` doc); the goal banner's colour was not checked.
- **Pot figure** counts on `settle`. **Session XP** counts on `count` (0.9 s).
- **Streak:** week row of seven circles, today's fills with `emphasis` and one
  soft success haptic (spec `2026-10-28-motion-and-delight-design.md` §B;
  `StreakWeekRow` is on main, check the build before showing a calendar).

### Launch (`Views/Launch/LaunchView.swift`, shipped #646)

Six amber dots (a 3×3 grid, descending staircase 3-2-1, no tile) drift in
from 80% of their offset and 0.7 scale to place, each landing on `reveal`
(0.55 s easeOut) staggered **0.11 s** per dot. At **750 ms** the wordmark rises
6 pt and fades in (`reveal`); at **+350 ms** the last dot pulses to 1.22 scale
on `emphasis` for 160 ms. Ambient backdrop fades up behind. Minimum display
**1.5 s**, ceiling 2 s, never waits longer than real loading; no progress
bar, no looping pulse. Reduce Motion shows the final frame.

### Haptics (`Views/Shared/PressFeedback.swift`)

One helper, one Settings switch (default on). **Correct (and Mixed) answer:
light impact. A wrong answer is silent by decision** (Stan, 2026-10-28:
`Haptics.signalsIncorrectAnswers = false`). Milestones (level-up, badge, streak
day): `UINotificationFeedbackGenerator .success`, skipped under Reduce Motion.
Selection change on pickers; light impacts on buttons.

### Sound

Nine `.wav` files in `Resources/Sounds` (deal flip, chip clink, button tap, …).
**Licence of these files is unrecorded: do not redistribute or reuse on the
site** (STATUS "Not done" 1).

## Brand notes

- **Name:** "Preflop" (display name). Store name currently drafted
  "Preflop – GTO Poker Trainer", subtitle "Hold'em range charts & drills";
  the "GTO"/"solver" wording is under review (#249).
- **App icon** (final, do not change): an **8×8 grid of amber dots drawn as a
  range chart** (top rows full, a staircase of dim dots below) with **two
  white cards on top**, one behind and tilted, on a near-black violet ground.
  Files: `app-icon-512.webp`, `app-icon-dark-512.webp` in `screens/`; 1024 PNG
  sources in `Assets.xcassets/AppIcon.appiconset/` (light, dark, tinted).
- **In-app mark:** six amber dots on a 3×3 grid, staircase 3-2-1 (`PreflopMark`).
  Launch screen, welcome intro and the header lockup draw this; the icon is
  not animated.
- **Voice:** plain facts, few words, no hype, no "cancel anytime" lines, no
  confetti; "Coming soon" until the App Store listing is live.
- Dark-first, near-black, a single amber accent, flat panels with 1 px hairlines,
  high-contrast white body text. Light mode is a deliberate second look (slate ink,
  darker gold text amber, brighter gold fills).
