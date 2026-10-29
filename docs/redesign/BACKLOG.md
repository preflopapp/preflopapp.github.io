# Redesign backlog

Issues Stan raised that are not in a phase yet. Each says what is wanted,
where it stands, and what it needs. Move an item into a phase's scope in
`SPEC.md` §11 when it is picked up; delete it here when it ships.

## From Stan's review of the live site, 2026-10-29

Done and removed from this list:
- **The badges section** went in Phase 4. Stan: "just remove the badges. Big
  section, the rest is fine", so card 1's badge tiers stay.
- **The spacing and figures in "Every seat. Every depth."** were fixed in
  PR #48.

### 1. Real widget and Live Activity assets
- **Wanted:** screenshots or exported assets of the Home Screen widgets and
  the Live Activity, for the site and the press kit.
- **Status:**
  - The widget card in "Free for everyone" is drawn from the app's
    `widget-layouts.json`, with a caption saying so.
  - The site never mentions the Live Activity.
- **Captured (2026-10-29):** real PNGs, light and dark, in
  `docs/app-handoff/captures/` (its README lists each file):
  - Home Screen with the small and medium widgets, crops of each, and the
    Add Widget sheet for small, medium and large;
  - the Live Activity on the Lock Screen and in the Dynamic Island, compact
    and expanded, full frame and cropped.
  - There is no Lock Screen widget in the app (system sizes only).
  - The Home Screen and gallery shots carry the Dev build's "PT Dev" label;
    the crops don't.
- **Free or Pro:** the Live Activity and the widget are both free
  (`docs/AppStorePlan.md` §4a lists neither; no entitlement check in code).
- **Then:**
  - swap the drawn widgets for the real ones, or keep the drawing and add the
    capture to the press kit;
  - add a Live Activity mention to "Free for everyone" or to the gallery (it
    is free).

### 2. Bankroll tracker and bankroll management
- **Wanted:** the site should talk about the bankroll tracker. On the live
  site before Phase 4, it never did.
- **Status:** Phase 4 (live now) added a "A bankroll tracker" card to "Free
  for everyone": a drawn example line captioned "An example line, not real
  results". It also added a bankroll tracker line to the Free list.
- **Answered (2026-10-29):** the app **tracks** results; it doesn't teach
  bankroll management. No lessons or stakes advice. Its one rule of thumb is
  the Insights "Bankroll health" gauge: the roll in buy-ins, labelled "Under
  15: step down", "Holding", "30+: take shots". It also has a goal with a
  pace. Free, with its Live Activity. Details in
  `docs/app-handoff/captures/README.md`.
- **Captured (2026-10-29):** the tracker's overview, history, insights and
  live session screens over the app's sample data, light and dark, in
  `docs/app-handoff/captures/bankroll-*.png`.
- **Open:** is the "Free for everyone" card enough, or does it want its own
  section or a gallery screen, using those captures? The site may say it
  tracks results and shows how many buy-ins you have, not that it teaches
  bankroll management.
