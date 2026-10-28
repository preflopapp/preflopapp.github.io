# vercel.com (home) teardown

Captured 2026-10-28. Shots: `img/vercel-d-01..10.png`, `img/vercel-m-01..10.png`. Page height 5,333 px desktop / 4,981 px mobile: the shortest and lightest page in this group.

## Hero
Off-white (#fafafa) page with a 64 px sticky header. Three columns at the same baseline: left a two-line H1 "Agentic Infrastructure" with two buttons below (black "Deploy now", white "Talk to sales"); centre a big black triangle (the logo as the hero object); right a short list of three lines ("For coding agents / To ship apps and agents / Automated by agents") (`vercel-d-01`). A logo row (Meta, DoorDash, OpenAI, SpaceX, The Weather Company, Polymarket) fills the bottom of the first fold. With JS disabled the triangle sits on a dark framed panel with a grey noise surround (`nojs` capture), the animated version is clean black on off-white. The mobile hero stacks: triangle, H1, one line, two full-width buttons (`vercel-m-01`), and the right-hand list shows one line at a time, so it appears to be a text cycler (I saw "To ship apps and agents" and "Automated by agents" in different frames).

## Section flow
1. Hero + logo row (`d-01`).
2. "Build agents on infrastructure that thinks like them": a Notion AI chat mock ("How can I help you today?") + "Notion powers millions of agent conversations daily on Vercel." + a mono "Features" list (Durable Orchestration, Sandboxed Environments, AI Model Gateway, Fluid Compute) (`d-02`, `d-03`).
3. "Ship apps that scale from zero to millions instantly": Zapier site screenshot inside a browser frame + caption + features list (`d-04`, `d-05`).
4. "Host platforms that serve every customer": Mintlify docs mock + caption + features (`d-06`).
5. "Recently shipped": a bento of cards (Agents with a chat mock, Backends with a blue folded-corner graphic, Sandbox with stacked windows) (`d-07`, `d-08`).
6. Closing: "Built by you, or your agents" with "Deploy now" and a pill "Onboard your agent" with a copy-to-clipboard icon (`d-09`).
7. Footer: six columns (Agent Stack, Core Platform, Security, Tools, Frameworks, SDKs) (`d-09`, `d-10`).

## Showing the product
Customer sites as the demo: each chapter embeds a real customer's UI (Notion, Zapier, Mintlify) in a bordered frame on a grey grid, with the claim in one sentence next to it. UI is HTML/images, partly faded at the bottom edge. No video.

## Signature moment
The black triangle as the page's only hero art, and the very short page. Restraint is the moment: black on white, no gradient, no glow. The "Onboard your agent" copy chip in the closing CTA is the memorable small interaction.

## CTAs
Header: "Get a Demo" (outlined), "Log In" (outlined), "Sign Up" (black), always visible on a sticky 64 px header. Hero: "Deploy now" + "Talk to sales". Closing: the same pair, with a command-copy chip. No sticky bottom bar. Mobile hides the header buttons behind a menu icon (`m-01`).

## Social proof
Logo row in the first fold, then one named customer claim with a number per chapter ("Zapier serves over 100 million monthly website visits on Vercel", "Mintlify powers documentation for over 20,000 companies"), with the customer name set bold and the number in the same line. No testimonial cards.

## Type/space/colour numbers
- Font: Geist Sans + Geist Mono. H1 64/64, weight 400, letter-spacing -3.84 px (-0.06 em). H2 56/56, weight 450, -3.36 px (-0.06 em). Lede 24/32, 450, #4d4d4d.
- Mobile H1 48/56, -2.88 px; H2 32/40, -1.6 px; body 16/24.
- Container 1,392 px in 1,440 (24 px gutters). Sections have no built-in padding; heights come from the content (836, 2,362 px etc).
- Colour: bg #fafafa, white #fff cards, text #171717, secondary #4d4d4d, tertiary #8f8f8f, border #ebebeb, black CTA #171717. One oklab green/teal accent on a tiny element. Dark #171717 used for the black pill buttons.
- Radii: 6 px (54 elements), full pill 3.3e7 px (21), 8, 12, 20. Shadows: effectively none (all 26 box-shadow hits are transparent ring placeholders from Tailwind).
- Class names are Tailwind (`sticky top-0 z-(--header-zindex)`), theme class `light-theme`.

## Motion (with real numbers and where found)
- Barely any: `fade-in .2s ease-out` once (a span), no transitions caught by `transitionrun` during a full-page scroll, no WAAPI loops. The CSS carries 73 keyframes (menu, tooltips) and easings `cubic-bezier(.4,0,.2,1)` (8), `(.32,.72,0,1)` (4), `(.455,.03,.515,.955)`, `(.25,.57,.45,.94)`, `(.4,.04,.04,1)`.
- Section reveals are not animated in my capture; mocks are just present, some lazy images appear late.
- 28 `prefers-reduced-motion` rules.
- One sticky element: the header (`position: sticky; top: 0`). No pinned sections. Mobile: same.

## Mobile behaviour
All three-column rows collapse to one column: heading, then mock, then claim, then feature list (`m-03`, `m-05`). Mock frames shrink to the screen width and crop on the left. Hero buttons stack full width. Footer link grid becomes two columns. No behaviour is lost because nothing is scroll-driven.

## Tech
Next.js + Tailwind, Geist fonts. **0.66 MB total transfer, 121 KB JS** (358 KB raw), 24 requests in my full-scroll probe (the desktop first-pass counter said 392 KB total). IntersectionObserver is used (10 constructed) but only for lazy loading. No animation library.

## What to steal
- Page weight discipline: a polished page in about 0.5 MB with almost no JS.
- Three-column hero with the mark as the object, buttons under the H1.
- Mono "Features" list as a quiet specification block under each claim.
- A copy chip next to the primary button (for us: "Join TestFlight" button + copy-link chip for desktop visitors).
- Very tight negative tracking on large headlines (-0.06 em) at weight 400-450.

## What not to copy
- The motionless page: the owner asked for "super dynamic and animated".
- Long text cycler on mobile with no static fallback.
- Agent/infra vocabulary; also the empty grey space around mocks makes weak first impressions.

## Defects seen
- Several mocks were blank in my capture because they lazy-load on view: the "Recently shipped" first card is an empty bordered rectangle (`vercel-d-07`) and the Agents card is half empty (`vercel-d-08`).
- Ghost "Strategy doc" text appears half-faded in the Notion mock (`vercel-d-02`, `d-03`), unclear whether intentional.
- Big empty off-white bands between chapters (`d-04`, `d-07`) make the page look unfinished at 1440 wide.
