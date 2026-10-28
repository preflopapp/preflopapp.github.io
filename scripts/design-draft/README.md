# Design draft (throwaway)

Explorer for the post-phase-0 look: fonts, corner radii and a lighter light
mode, side by side in dark and light. Open `index.html` through any static
server (fonts load by relative path). State can be set from the URL hash, e.g.
`#font=geist&r=tight&lp=b`. Lives in `scripts/` so it is neither checked nor
deployed. Delete once a direction is chosen and folded into `next/css/tokens.css`.
