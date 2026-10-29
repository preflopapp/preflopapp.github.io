# Flighty (https://flighty.com)

Captured 2026-10-28 with Playwright Chromium, 1440x900 and 390x844 @2x. Page is 14,275 px tall on desktop and 17,575 px on mobile. The scroll pass covered the first ~7,500 px plus the last 3-4 viewports; the middle (roughly 7.5k-11k px) was not screenshotted, so the section list for that stretch comes from the DOM headings only. A site cookie banner ("Cookie Settings", Reject/Accept) could not be dismissed by my script and sits in the bottom-right corner (desktop) or covers about a third of the screen (mobile) in many shots.

Images: `img/flighty-d-01..08.png` (desktop), `img/flighty-m-01..06.png` (mobile).
- d-01 y0, d-02 y1080, d-03 y1620, d-04 y2700, d-05 y3780, d-06 y4860, d-07 y11845, d-08 y12655.
- m-01 y0, m-02 y506, m-03 y1012, m-04 y3542, m-05 y5060, m-06 y15296.

## Hero
Light page, white background, a thin indigo announcement bar ("NEW! Flighty Airports / View Live", `#34347f`-ish) with a close X, then a nav. Centered black 65 px / 700 headline "Get the truth when you travel", a three-line grey subhead, and two small award badges (Apple Design Award, App of the Year finalist) instead of a button. Below, a real phone (photo of a hand holding an iPhone showing the app's map and "My Flights" list) with notification cards ("Mom landed in New York", "Check In is now open", "Gate changed") fanned left and right, faded toward the edges. Over the lower edge of the phone sits a pill-shaped chapter control: Preflight / At the airport / After landing / Download. See d-01, m-01. The only hero "button" is the small black "Get the app" pill in the nav (126x32, radius 999). The big CTA arrives later, as the last step of the pinned sequence.

## Section flow
1. Announcement bar + nav (sticky; collapses to a floating rounded pill with blur once you scroll, d-03).
2. Hero stage: headline, badges, phone, notification cards, chapter pill. Phone block is `position: sticky` (see Motion).
3. Background flips white to near-black (`#05010d`) while the pill steps through "At the airport" then "Download" (d-02, d-03). The yellow "Download" state is the CTA.
4. Press-logo wall on dark: CNBC, CNN, Fox News, WSJ, Inc., Business Insider, TechCrunch, The Verge (grey tiles on dark, d-03). On mobile this is a 2-column tile grid.
5. "Everything you've ever wanted to know about your flight and more." A bento of rounded cards (d-04, d-05): "See why you're delayed. Finally!" (large, with phone), "Delay predictions" (plane card), "Direct from the tower" (control tower photo at dusk), "First to know. First to go." (lock-screen phone, orange gradient), "Putting the Pro in approachable" (green-tinted tilted screens).
6. "Import your flights in seconds": a dark band with an animated icon cluster (mail, calendar "SAT 20", network) and a white "Give Flighty a try" pill (d-06).
7. Back to white: "Share your flying with friends and family." with cards for notifications and an Instagram-style story.
8. "Look back on your travels with Flighty Passport" with the "hall of fame" card.
9. "Know what's happening at any airport. Right now." with "Broadcast any airport meltdown live" / "Go Live" (from DOM headings; not screenshotted).
10. "More reasons you'll want to take Flighty on your next trip": family sharing, privacy first (small light cards).
11. Testimonials masonry, "From first-time flyers to million-milers, people love Flighty." (d-07).
12. Closing CTA "Have a nice flight!" with a collage of every device (Vision Pro, iPhone, Watch, MacBook, iPad) and a black "Give Flighty a try" pill (d-08), then footer.

## Showing the product
Mostly real photography of hands holding a real iPhone plus real screenshots composed into tilted, cropped, glowing panels. It also recreates UI as live HTML: the notification cards around the phone are text and icons on rounded white cards, not a flat image. The dark bento uses screenshot crops at an angle with a coloured glow behind them (orange for alerts, green for data). Product shots are always inside a rounded card, never floating on the bare page except the hero phone and the closing device collage.

## Signature moment
The pinned hero phone with the chapter pill. As you scroll, the phone stays put, notification cards cycle around it, the pill's yellow highlight moves from "Preflight" to "At the airport" to "Download", and the page background crossfades from white to near-black. It tells the product story (before, during, after a flight) and ends on a download action without adding a section.

## CTAs
Nav pill "Get the app" (always visible, 32 px tall, radius 999, becomes black fill once the nav floats). Yellow "Download" pill as the final chapter state (`rgb(247,190,0)`, found among computed backgrounds). "Give Flighty a try" (white pill on dark in section 6, black pill on white in section 12, both with a phone glyph). Mobile adds a hamburger. Three of the four CTA instances sit at the end of a narrative beat, not in a repeating bar. No sticky bottom bar on mobile.

## Social proof
Award badges directly under the hero subhead (Apple Design Award winner, App of the Year finalist, 2023). Press logo wall straight after the hero. A testimonials masonry mixing App Store review cards (stars, title, date, author), X/Twitter-style posts (David Pogue, Parker Ortolani), and a video tile. A floating black pill "+3 million users enjoy Flighty / View more" with stacked avatars sits over the grid (d-07).

## Type/space/colour numbers
- Font stack: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI"` (SF on Apple devices); Framer CSS also references Inter, Inter Variable, EB Garamond, IBM Plex Mono, Fragment Mono, Patrick Hand (not obviously visible in captures).
- h1 65 px / 700 / letter-spacing -1 px / line-height 78 px (desktop) and 71.5 px (mobile, still 65 px).
- h2 56 px / 700 / ls -0.28 / lh 56 desktop; 32 px / lh 41.6 mobile. h3 44 px / lh 48.4 desktop, 32 px mobile. Small UI text is 12-15 px.
- Layout: h1 box is 1392 px wide at 1440 (24 px side padding). Bento and cards sit in a ~1000 px centred column (cards at x=220..1220 at 1440). Mobile gutter 24 px.
- Colours: page `#ffffff`, text `#000`, near-black section `#05010d`, light card `#fafafa`, hairline cards `rgba(0,0,0,0.02)`, banner indigo (~`#34347f`), accent amber `rgb(247,190,0)` = `#f7be00`, link blue `#0000ee` (default link colour leaking in Framer).
- Radii: 16 px (36 uses), 999 px (30), 12 px (27), 20 px (18). Shadows are stacked 1-3 px rings at 2-4% black (e.g. `0 0 0 1px rgba(0,0,0,.04), 0 1px 1px .5px rgba(0,0,0,.02), 0 3px 3px 1.5px ...`), i.e. almost no visible shadow, mainly a hairline.

## Motion (with real numbers and where found)
- Pinned stage: `position: sticky; top:180px; height:720px` (desktop) inside a 1322 px track, so ~602 px of scroll is spent on the pinned hero. Mobile: top 168.8 px, height 675, track 1293, ~618 px pinned. Measured with a `getComputedStyle` + parent-rect probe.
- Sticky nav containers: a 43 px bar at top:0 and the chapter pill at top:820 (also sticky).
- Bundle strings: `duration:.2` (21 hits), `.3` (9), `.4` (7), `.8`, `1` in the Framer runtime bundle; no CSS transitions or cubic-beziers appear in the extracted CSS. So easing and exact timings for the scroll scrubbing live inside Framer's runtime and I could not read them. The 0.4s and 600ms values found in CSS are the only literal ones.
- Libraries seen in bundle text: Framer runtime, React, Lenis string, three.js string, lottie/`bodymovin` global present on the page, Rive string, IntersectionObserver. Only `bodymovin` was a live global; the rest are strings inside a 5-6.7 MB script bundle, so treat as "present in bundle", not "used for the hero".
- `prefers-reduced-motion` appears 0 times in the CSS I could read.

## Mobile behaviour
Same pinned-phone sequence still runs on mobile (sticky 675 px phone stage, m-02 and m-03 show the chapter pill stepping to "At the airport" then "Download"). Nav collapses to logo + "Get the app" + hamburger in a floating blurred pill. Bento cards stack to one column with the same glowing borders (m-04). Headline sizes drop: h2 56 to 32 px. The press wall goes from 4x2 to 2-column tiles. The cookie banner blocks about a third of the viewport (m-06).

## Tech
Framer site (Framer runtime, `framerusercontent.com`, class names `framer-xxxx`), React under the hood, Cloudflare Insights, GTM, Amplitude. Transfer measured during my scroll: 9.0 MB desktop (JS 1.31 MB, images 1.59 MB, media 2.23 MB video, fonts 190 KB), 7.3 MB mobile. 5 `<video>`, 6 canvases desktop, 125 inline SVGs. CSS 208 KB. No GSAP, no ScrollTrigger.

## What to steal
- The pinned hero with a chapter pill that doubles as the progress indicator and ends in a download state. It needs roughly 600 px of pinned scroll, not 300 vh.
- Background crossfade white to dark tied to the same scroll progress (one transform/opacity layer, not a colour animation on every element).
- Awards as two small badges under the subhead and no hero button; the single CTA waits until it is earned.
- Bento cards with hairline ring shadows (2-4% black) and 12-20 px radius.
- Notification-style cards fading around the phone: HTML UI beats screenshots, and our poker "reason" bubbles can play this role.

## What not to copy
- 9 MB / 5 MB script bundle; Framer's runtime is unnecessary for what is visible.
- Press-logo wall: we have no press yet.
- Cookie banner that covers a third of a phone screen; we should not need one.
- Mixed type stack with five unused webfonts.

## Defects seen
- Cookie banner overlaps content in nearly every desktop corner shot and covers ~35% of mobile screens.
- Default link blue (`#0000ee`, 108 elements) leaks through the Framer output.
- In d-02 the phone, three fading cards and the pill compete for the same area; the left/right cards are cropped by the pill at the bottom edge.
- Page is long: the tail of the mobile page is 17.5k px of mostly stacked cards.
