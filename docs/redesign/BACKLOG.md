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

### 1 and 2. Widgets, Live Activity and the bankroll tracker: shipped
Shipped on branch `claude/app-section-real-shots` (Stan, 2026-10-29: "we have
no real showing of the bankroll tracker"):
- the "On your Home Screen" card shows the captured medium and small widgets
  instead of the drawing;
- a new section, `#bankroll` ("Know where you win."), shows the four tracker
  screens and the Live Activity on the Lock Screen;
- the Free list says "A bankroll tracker, with a Live Activity".
- The copy says the tracker tracks results and shows your buy-ins; it never
  claims to teach bankroll management (`docs/app-handoff/captures/README.md`).

### 3. Real badge captures
- **Wanted:** the "Streak, levels and 60 badges" card shows drawn discs; Stan
  wants the app's real badges.
- **Status:** asked the capture session for the badges and progress screens
  (2026-10-29).
