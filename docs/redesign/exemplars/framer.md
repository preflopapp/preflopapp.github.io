# framer.com (home) teardown

Captured 2026-10-28. Shots: `img/framer-d-01..14.png`, `img/framer-m-01..14.png`. Page height 12,339 px desktop / 12,049 px mobile. The site is built with Framer itself, which shows in the DOM (`data-framer-name`, `framer-xxxx` classes).

## Hero
Pure black. 64 px nav (logo, Platform, Solutions, Resources, Enterprise, Pricing, Log in, white "Sign up"). Left-aligned H1 "Framer is the pro website builder with a world-class design agent" (54 px/500) with a one-line grey sub ("Build your website with agents and make it your own on a fully editable design canvas."). Buttons: white "Get started for free" and ghost "Download app". At the right a small "New: Framer MCP ->" link. Below, a 1,200 px-wide rounded card with a glowing blue "Ask Framer..." prompt box (model chip "Opus 4.8") on a dark blue haze, with a 0:36 video duration badge (it is a looping MP4) (`framer-d-01`, intro frames).

## Section flow
1. Hero + prompt-box video (`d-01`).
2. Logo cloud (Dribbble, Legora, Zapier, Perplexity, Cal.com, Mixpanel, Miro, DoorDash) in a centred 2-row grid (`d-02`).
3. "The website builder for shipping standout sites": a full editor screenshot mock (Pages tree, canvas with "HAUS" site, agent chat) and three step columns: Start with the agent / Refine on the canvas / Publish complete sites instantly (`d-02`, `d-03`).
4. "Build your website together with agents": the **pinned** chapter: left column text steps (Design with an agent, Run your CMS with an agent, Code with an agent, Connect to any agent), right column a fixed 260x640 chat panel, centre canvas visuals swap (`d-04` to `d-07`).
5. "Not just vibes, a full platform": bento grid (Performance LCP/INP/CLS, CMS table, Collaboration, 99.99% uptime, Analytics chart, SEO, Localization, A/B testing, Security, Hosting) (`d-07` to `d-09`).
6. "Shipped with Framer": masonry of real customer sites with a "See Framer sites" link (`d-10`).
7. "Trusted by teams shipping big sites": 4 large logo cards (Perplexity, Legora, Mixpanel) with "Read story" (`d-11`).
8. "Built on a community that isn't going anywhere": a Community window mock with feed, trending templates, "26,132 Resources" (`d-12`, `d-13`).
9. "Your next idea starts here": prompt box + chips (Create personal portfolio, Build startup site, Launch landing page...) and "Start without AI ->" (`d-13`).
10. Footer: 6 link columns (`d-14`).

## Showing the product
Deepest of the group: the **editor itself is rebuilt** as live HTML/video: Pages panel, canvas with a sample site ("Haus Studio"), agent chat panel with "Thinking..." state, CMS table with rows, charts, branch list, locale list. Three MP4s (muted, loop, `autoplay=false` and started by visibility) show the typing/agent runs (1200x674, 380x150 sizes). Each bento tile is its own mini UI.

## Signature moment
The glowing blue prompt box in the hero (a gradient border glow that pulses around a frosted input) and then the pinned chat panel that stays put while the canvas and the explanation change beside it, so the agent conversation feels continuous.

## CTAs
Nav "Sign up" (white, always), hero "Get started for free" + "Download app", per-feature "Start with Agents ->" links, a "Start with agents" pill next to the section H2, final prompt box with a chip row. No sticky bottom bar. Cookie banner is the only persistent bottom element.

## Social proof
Logo cloud right under the hero, a gallery of real shipped sites, a trusted-by card row with read-story links, plus Community resource counts. No quote cards.

## Type/space/colour numbers
- Font: GT Walsheim Medium (display), Inter (UI), Input Mono/JetBrains Mono. H1 54/54 weight 500, -2.16 px (-0.04 em); H2 44/48.4, 500, -1.76 px (-0.04 em); body 18/24.3, 400, rgba(255,255,255,.6); caption 12/16.8.
- Mobile: H1 36/36, -1.44 px; H2 28/30.8, -1.12 px; body 18/24.3.
- Container 1,200 px (120 px side margin) inside 1,440 and 120 px top/bottom section padding (100 px for the logo strip).
- Colour: bg #000; surfaces #111 / #1e1e1e / #242424; borders rgba(255,255,255,.1); text #fff, secondary rgba(255,255,255,.6), #999; accent Framer blue #0099ff (`--token ... #09f`) and #0055ff; lime #cbff00 token (unused in view).
- Radii: 8 px (290 elements), 15, 20, 6, 5, 4. Shadows: `0 2px 6px rgba(0,0,0,.2)`, 1.5 px solid ring, inset white highlight `0 1px 1px rgba(255,255,255,.35) inset` on buttons.
- Button: white bg, 12 px type, 34 px tall in nav/hero, radius 8.

## Motion (with real numbers and where found)
- Entrances use the Framer runtime and WAAPI: opacity+transform 400 ms (294 samples) and 1,000 ms (147 samples) with a **350 ms delay** on the second element in a group; the timing function reads "linear" because springs are baked into keyframes (so the real feel is spring/ease-out, and I could not read the spring constants).
- CSS: one loop `ghostFlow .75s linear infinite` with -0.1875 s steps (four dots), 3 keyframes in total; the page has no CSS easing declarations (stylesheet 1.4 KB), nearly everything is runtime.
- Scroll linking: `ScrollTimeline` strings present (4) and IntersectionObserver (69 constructed on desktop, 10 on mobile); sections text dims (opacity ~0.3) and brightens in turn (see `d-05`, text steps faded) which is scrubbed.
- Sticky/pinned: a DIV `position: sticky; top: 120px`, 640 px tall x 260 px wide, held while scrollY goes from about 3,240 to 4,320 (about 1,100 px) then scrolls away; the header is `position: fixed` 64 px. No GSAP `pin-spacer`.
- Videos: 3 MP4s, `loop`, muted, play when visible.
- 0 reduced-motion rules found in readable CSS (the Framer runtime can handle it inline, not verified).

## Mobile behaviour
The sticky chat panel is dropped (class `hidden-...` on mobile; computed sticky count 0). Steps and visuals stack: heading, visual card, text, link (`m-03`, `m-04`). Bento tiles become a single column. Logo cloud becomes a horizontally marquee-style row (`m-01`: "pier / Dribbble / ElevenLabs" sliding). 7.6 MB transferred on mobile (more than desktop's 3.3 MB at load, in the first-pass counters), because full-width images and videos load.

## Tech
Framer-hosted site: React runtime + Framer Motion-style animation, WAAPI, 3 MP4 loops, 183 images (jpg 52, png 32), 219 inline SVGs. Transfer in my probe 4.57 MB total (JS 1.73 MB, 6.1 MB raw; images 2.02 MB; fonts 0.59 MB), 150 requests; first-pass desktop count 3.3 MB, mobile 7.6 MB. Heaviest page in this group.

## What to steal
- Pinned side panel while the main content changes: CSS sticky, no pin spacer, desktop only.
- Glow-border prompt box as a hero object; for us a glowing card/hand "being dealt".
- Dim/brighten step text (rgba(255,255,255,.6) base, 1.0 for active).
- Stagger via a fixed 350 ms offset for the second element in a group, 400 ms and 1,000 ms durations.
- Bento grid of tiny live mini-UIs where each tile has a label + arrow ("Performance ->").
- Chip row under the final input with suggested actions.

## What not to copy
- 4.6-7.6 MB of payload and 3 MP4 loops; blows a no-build, strict-CSP static site's budget.
- Cookie banner covering the viewport in every frame.
- Long page (12 k px) with 8 chapters for one idea.
- Light-text-on-black dimming that is too faint to read mid-transition.

## Defects seen
- The cookie banner (Reject / Accept) appeared after the 4th scroll step and then sat over the bottom-left of every frame (`framer-d-06` onward, `framer-m-04` onward). My auto-dismiss only looked for a few button labels and missed it; I did not retry.
- Mid-scroll text steps were so dimmed that "Design with an agent" paragraph and the CMS table are nearly invisible (`d-05`).
- Several mock panels showed only "Thinking..." with an empty body (`d-04`, `d-05`), because the demo loops had not advanced.
- A 54 px two-line H1 beside the right-hand "New: Framer MCP ->" link sits close to the hero buttons; at 1440 the left column feels crowded vs the very wide empty right side.
