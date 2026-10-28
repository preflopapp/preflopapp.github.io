# Mimo (https://mimo.org)

Learn-to-code app. Captured 2026-10-28, desktop 1440x900 and mobile 390x844 @2x, 14 steps each. Screenshots: `img/mimo-d-01.png`, `-03`, `-05` ... `-13`; `img/mimo-m-01.png`, `-03` ... `-13`.

## Hero
Deep indigo page (#252746). Left: H1 in two lines, "Learn Full-Stack" in a lavender-to-white gradient (#b89ced) and "for the age of AI" in white, 56px/500/-2.2px/67.2px in Aeonik Fono. In my first capture the first line read "Learn Pyth": the first line is a typewriter that cycles languages, so what I captured was mid-type. Then an 18px sub (grey-lilac #b9bbd2), then the sign-up form inside the hero: a white "Sign up with Google" button (40px, 12px radius), an "or" rule, email and password fields with an eye toggle, a purple "Start learning for free" (#7e4bde), the Terms line. Under it: 5 stars "750K+ 5-star reviews", Apple Editor's Choice laurel, "Trusted by 35M+ learners", TechCrunch and New York Times logos. Right: a floating 3D-style robot mascot among language badges (HTML5, Python), a phone and a laptop. See `img/mimo-d-01.png`.

## Section flow
1. Hero (65 to 900), dark.
2. "A modern way to learn to code and develop software" (#191b33): a bento with a live lesson mock (a browser preview, a code panel, a cursor and a "Check" button) and cards for "Step by step guidance", "Hands-on practice", "Real-world projects", then three small cards (Interactive, Personalized, Career-oriented) each with a 3D icon (`-03`, `-05`).
3. White section "In-demand skills for modern software development": four career-path cards with certificate shields, then course chips (HTML, CSS, JavaScript, TypeScript, React, Python, SQL, Swift) and a lilac callout "Not sure where to start? Take the quiz" with the mascot (`-07`).
4. Dark "Software development with AI where you stay in control": "84% of software developers use AI in their workflows", a code editor mock with AI explanation popovers and a "Powered by Gemini" note (`-09`).
5. White "Trusted by 35+ million learners around the world": three rating laurels (4.9 App Store, 4.9 Google Play, 4.7 Trustpilot) and a two-row review marquee (`-11`).
6. "Learn to code, anytime, anywhere" photo card with store badges.
7. FAQ accordion of ten questions on white, then footer.
Page height 9,346px desktop, 12,150px mobile. Dark and white sections alternate.

## Showing the product
Interactive-looking recreations of the app in HTML: the lesson with a preview pane, the AI coding tutor with popover explanations, the roadmap with check nodes on mobile (`img/mimo-m-03.png`). Five `<canvas>` elements and WebGL/Rive references drive the mascot and icon animations. One mp4 (`learn_video.mp4`, not autoplaying) is present. Heavy use of inline SVG: 1,945 `<svg>` elements on the page, which is why the HTML is 1.8 MB.

## Signature moment
The hero sign-up form embedded beside a living mascot, plus the typewriter line. Visitors can start without leaving the page.

## CTAs
Purple #7e4bde with white text: nav "Start learning for free" (32px, 10px radius), hero button (40px, 12px radius), the quiz callout "Take the quiz", and a final repeat. On mobile the hero form is replaced by App Store and Google Play badges (`img/mimo-m-01.png`), so the CTA follows the device. No sticky bottom bar; the 65px header is sticky.

## Social proof
Heaviest in the group and well structured: stars, count and store laurel in the hero, press logos in the hero, a dedicated section with three platform ratings and a scrolling review wall, plus a "84% of developers" stat tied to the product story.

## Type/space/colour numbers
Faces: Aeonik, Aeonik Fono and Aeonik Mono (eyebrows in mono, uppercase, tracked). Desktop: H1 56px/500/-2.2px/67.2px (tracking about -0.04em); section H2 40px (32px in later sections); H3 24px/500/32px; hero sub 18px/28px; nav 14px/500. Mobile: H1 25.3px/500 (the typed line makes this vary), H2 32px, H3 24px. Container 1280px, hero text column 680px. Section padding: 160px top and bottom desktop, 80px mobile. Palette: #252746 (hero), #191b33 (dark sections), #333661 (indigo text on white, 669 elements, instead of black), accent #7e4bde, lavender #b89ced and #cebbf3, text grey #b9bbd2, white. Radii: 16px (123 elements), 12px, 10px. No box shadows (3 empty ones).

## Motion (with real numbers and where found)
CSS durations `.1s` x17, `.3s` x14, `1s` x11, `.5s` x11, `.2s` x9, `2s` x3, `4s` x2. Easings include spring/overshoot curves: `cubic-bezier(.34,1.56,.64,1)` x2, `(.175,.885,.32,1.275)` x6, `(.41,.73,.51,1.02)` x8, plus `(.22,1,.36,1)` and Material curves. `view-transition` appears 21 times, `@property` 74, `IntersectionObserver` 20, `prefers-reduced-motion` 7, `clip-path` 8. A GSAP-style `duration:1` appears 5 times but `window.gsap` is not defined. Nothing pinned: sticky header only.

## Mobile behaviour
Burger header; hero form replaced by two store badges; H1 about half size; bento cards become full-width single column; dark sections have 80px padding; the lesson mock stays readable at 358px. The page is 30% taller than desktop. Payload is lower on mobile (8.7 MB vs 10.4 MB) mainly because fewer images load.

## Tech
Next.js / React with Tailwind-style utility classes (`bg-bluegrey-950`, `tablet:py-40`). 10.4 MB over 109 requests desktop: JS 3.4 MB transfer (5.6 MB raw), HTML 1.8 MB, media 2.4 MB, other 1.6 MB, fonts 478 KB, CSS 320 KB, TikTok/GTM pixels.

## What to steal
- A lesson-shaped HTML recreation inside a bento card; it is real enough to read, so no video is needed.
- Device-aware CTA: form on desktop, store badges on mobile (ours: TestFlight / join form on desktop, TestFlight link on iPhone).
- Dark / white section alternation with 160px section padding on desktop and 80px on mobile.
- Mono uppercase eyebrows (HOW IT WORKS, WHAT YOU'LL LEARN) at 11-12px with tracking; it gives a technical feel at almost no cost.
- Rating laurels with numbers per platform in one row.
- Tinted indigo text (#333661) on white instead of black.

## What not to copy
- Putting a password form in the hero; for a beta join it is an email field at most.
- 1,945 inline SVG nodes and 1.8 MB HTML.
- The typewriter H1: it breaks no-JS and reduced-motion and the content is unstable for screen readers and for my own capture.
- A 3D mascot: not in our brand.

## Defects seen
- A large empty white band between the AI section and the reviews (`img/mimo-d-11.png`, about 160px of padding over a short "REVIEWS" label).
- Review marquee rows are cut off at both edges and overlap the next block slightly (`img/mimo-d-11.png`).
- The hero headline changes while you watch (captured as "Learn Pyth" at one point); I did not test what it shows with JavaScript off.
- Heavy page on first load (10.4 MB).

## Learning-app lens (not poker)
Shows by doing: the page's biggest idea is that a visitor can read a lesson, see AI help and sign up without leaving. It is the closest structural model for "play one hand here".
