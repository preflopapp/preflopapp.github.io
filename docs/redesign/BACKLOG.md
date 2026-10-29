# Redesign backlog

Issues Stan raised that are not in a phase yet. Each says what is wanted,
where it stands, and what it needs. Move an item into a phase's scope in
`SPEC.md` §11 when it is picked up; delete it here when it ships.

## From Stan's review of the live site, 2026-10-29

### 1. Remove the badges section: done, one question open
- **Wanted:** no badges section on the homepage.
- **Status:** the 60-badge grid and its unlock pills were deleted in Phase 4
  (PR #47, live since 2026-10-29).
- **Open:** card 1 of "Free for everyone" still shows one badge (Facing an
  open) in its four tiers beside the streak, and its copy says "XP, levels and
  badges". Keep it, or make card 1 the streak alone?

### 2. "Every seat. Every depth.": spacing and figures: done
- **Wanted:** fix the spacing; show simple figures ("5K+, 8K+"), not exact
  counts.
- **Fixed** in the PR after #47:
  - **Spacing:** the list and the section shared the class `spots`. The list's
    `padding: 0` and top hairline also hit the section, so it lost its
    `--section-y` padding above and below and drew a line across its top.
  - **Figures:** the depth bars read 6K+ · 9K+ · 9K+. The counts are rounded
    down to thousands, and `check-site.py` derives them from `spotsByDepth`.

### 3. Real widget and Live Activity assets
- **Wanted:** screenshots or exported assets of the Home Screen widgets and
  the Live Activity, for the site and the press kit.
- **Status:**
  - The widget card in "Free for everyone" is drawn from the app's
    `widget-layouts.json`, with a caption saying so.
  - The site never mentions the Live Activity.
- **Needs from Stan:** captures from a device or the simulator, in light and
  dark:
  - the small and medium widgets on the Home Screen, plus any Lock Screen
    widget;
  - the Live Activity on the Lock Screen and in the Dynamic Island, both
    compact and expanded.
  - Full-resolution PNGs are best; the site makes its own WebP copies.
- **Then:**
  - swap the drawn widgets for the real ones, or keep the drawing and add the
    capture to the press kit;
  - add a Live Activity mention to "Free for everyone" or to the gallery, if it
    is free;
  - check the Free/Pro split against the app repo's `docs/AppStorePlan.md` §4a.

### 4. Bankroll tracker and bankroll management
- **Wanted:** the site should talk about the bankroll tracker. On the live
  site before Phase 4, it never did.
- **Status:** Phase 4 (live now) added a "A bankroll tracker" card to "Free
  for everyone": a drawn example line captioned "An example line, not real
  results". It also added a bankroll tracker line to the Free list.
- **Open:**
  - Is that enough, or does it want its own section, or a gallery screen,
    showing what the tracker records (sessions, results, graph)?
  - Does the app teach bankroll *management* (rules, stakes advice), or only
    track results? The site must not claim more than the app does.
- **Needs:** a real screenshot of the tracker (it is not among the five
  gallery shots), and the app's own feature description.
