# Design draft (throwaway)

Explorer for the post-phase-0 look: fonts, corner radii, a lighter light mode
and the card deck, side by side in dark and light. Open `index.html` through
any static server (fonts and suit sprite load by relative path). State can be
set from the URL hash, e.g. `#font=geist&r=tight&lp=b&deck=four`. Lives in
`scripts/` so it is neither checked nor deployed. Delete once the choices are
folded into `next/css/tokens.css`.

## Chosen so far (the explorer opens on these)

- **Font:** Hanken Grotesk, the whole brand (site and, later, the app).
- **Corners:** tighter, 14 / 10 / 6 (panel / button / card).
- **Light palette:** A (the current one). Dark body text stays `#fff`; the
  "no white text on a panel fill" rule means coloured fills only.
- **Suits:** `assets/suits/`, traced from the owner's suit image (`fill`
  is `currentColor`, so the colour is a token, never baked in). They only ever
  appear on white cards. `suits-sprite.svg` holds all four as `<symbol>`s.
- **Decks:** two-colour (spade and club ink `#15161d`, heart and diamond
  `#c8443c`) and four-colour (spade ink, heart `#c8443c`, diamond `#2a62b8`,
  club `#1b7d46`). Both blues and greens are at least 4.5:1 on white and are
  deliberately a shade off the call blue and raise green, so a card suit never
  reads as an action. Shape, not just colour, identifies the suit.

## Still open

- Dark-mode text amber (dark currently uses one amber for fill and text).
- The third amber in the "Close" chip, and light `--text-3` at 4.3:1.
- Suit paths are traced and heavy (5-7 KB each); redraw with few points for
  the app's asset catalog.
