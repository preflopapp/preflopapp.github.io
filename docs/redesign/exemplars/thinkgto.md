# ThinkGTO (https://thinkgto.com): stand-in for postflopplus.com

Why this site: `https://postflopplus.com` and `https://www.postflopplus.com` both failed twice (the proxy returned 502 on the CONNECT), so I dropped them as the brief says. ThinkGTO is the studio site that hosts the Postflop+ and Preflop+ product pages (the apps came up in the app-store search; the old studio site craftywheel.com links to the same apps). It is a direct competitor to Preflop: a free-to-download iPhone app with a free tier and a Pro upgrade.

Captured 2026-10-28, desktop 1440x900 and mobile 390x844 @2x, 14 steps each. Screenshots: `img/thinkgto-d-01.png`, `-03`, `-05` ... `-13`; `img/thinkgto-m-01.png`, `-03` ... `-13`; the app page `img/tg-preflop-01.png`; the popup `img/thinkgto-popup-01.png`.

## Hero
Centred on a deep navy page (#0d1b2a). H1 "Think Deeper. Play Sharper." at 60px/700, line-height 75px, second sentence in cyan (#00b4d8). A grey two-line sub. Three white chips under it, each with a coloured dot, a two-line label and an app name (Postflop+, Solver+, GTO Ranges+). Small line: "Free on iPhone, iPad and Android. Compare all 7 apps". A row of four numbers (7 Apps, 100M+ Solves, 4.6+ Stars, 10K+ Reviews). Under that, a fan of five phone screens, the middle one front-lit (Preflop+ with a red/pink Nash chart) and the others blurred behind it, with a pill row of app names (GTO Ranges+, Postflop+, Solver+, Preflop+, PLO+, Battle+, Tracker+) that selects which phone is in front. See `img/thinkgto-d-01.png`, `-03`.

## Section flow
Tops at 1440 wide: hero 0, "Why ThinkGTO?" 1236 (three cards), "7 Apps. One Mission." 2088 (seven app cards in a 3-column grid with a "NEW" tag on the latest), then five alternating per-app deep dives (tournament ranges, train postflop against a bot, full solver, compete, win-rate tracking) from 3542 to 7683, "What Players Are Saying" 7683, "Per-App Pricing. No Bundles Required." 8485 (six pricing cards), "Start Winning in 3 Steps" 9741, a 3,136px long SEO article "What Is GTO Poker Strategy?" 10323, blog 13459, FAQ 14409, "Start Training Free Today" 15323, footer 15930. Total 16,704px desktop; 27,425px mobile.

## Showing the product
Phone frames with real screenshots, one per app, inside the hero fan and each deep dive. The Preflop+ app page (`img/tg-preflop-01.png`) shows a large phone with the red/pink 13x13 Nash chart and the copy "Stop Guessing. Start Printing. No Internet. No Delays. Completely Offline." At that size I could not see partial-fill (mixed) cells; the chart reads as pink = shove/raise, grey = fold. The same page has a QR code panel ("Get Preflop+ on your phone... scan the code or email yourself the link; it opens the right store for your phone") with an email field: a desktop-to-phone hand-off.

## Signature moment
The product switcher: a row of seven pills under the phone fan; selecting one brings that app's screen to the front. Built as static markup plus a small script (page JS is 250 KB transfer total).

## CTAs
Nav: cyan "Download Free" 36px tall, 8px radius, always at top right. Hero: three white chips (each a link to an app). Mid-page: orange (#ff6b35) "Download Free". Per-app cards: "Download free Postflop+" etc. in white. Final band: "Start Training Free Today". App page: "Download on the App Store" and "Download Preflop+ Free". An email-capture modal ("FREE GUIDE: The Solver Vault, 4 Postflop Deep Dives, 63 pages", button "Send me the vault") appears on scroll.

## Social proof
Numbers row in the hero (apps, solves, stars, reviews), a "What Players Are Saying" section, endorsement line ("endorsed by WSOP bracelet winners Lara Eisenberg and Matt Berkey"), and on the app page "4.6 stars, 1,021 reviews".

## Type/space/colour numbers
Inter only. Desktop: H1 60px/700/75px (1.25); H2 48px/700/48px (1.0); H3 20px/600/28px; body 12-16px, muted #8d99ae. Mobile: H1 36px/700/45px; H2 30px/700/36px. Containers: 1280px (75 elements), 896px, 672px, 1024px, 768px. Section padding 112px top and bottom desktop (Tailwind `py-28`), 80px mobile (`py-20`); hero 160px top, 80px bottom desktop, 128px/64px mobile. Palette: page #0d1b2a, surface #1b2838 (at 50%), text #fff, cyan #00b4d8, orange #ff6b35, green #34c77b, teal #06d6a0. Radii: 8px (21 elements), 12px (18), 16px (13), 24px (7), full pills. Shadows: coloured glow `0 4px 12px rgba(52,199,123,.25)` on one pill, nothing else.

## Motion (with real numbers and where found)
Minimal. CSS durations `.15s` x2, `.3s`, `.5s`, `.7s`; easing `cubic-bezier(.4,0,.2,1)` (Tailwind's default). `@property` appears 72 times (Tailwind v4 generated). `prefers-reduced-motion` once. `IntersectionObserver` 4 times. No GSAP, Lenis or ScrollTrigger. `backdrop-filter` 9 times (blurred nav). No pinned or sticky sections: only the nav is fixed (65px).

## Mobile behaviour
Nav becomes logo plus burger. The three hero chips stack as full-width white buttons (59px tall). The stats row wraps to two lines. Cards stack. The page is 27,425px tall, 64% longer than desktop, because the 3k-pixel SEO article becomes 5.6k px. Sections get 80px padding instead of 112px.

## Tech
Server-rendered HTML (framework not identified) with Tailwind (`build/assets/app-*.css` 22 KB transfer, 150 KB raw; `app-*.js` 112 KB), Cloudflare. 1.36 MB over 19 requests: images 777 KB, JS 250 KB, fonts 87 KB. The lightest and fastest of all nine sites.

## What to steal
- "What's free, what's Pro" block: FREE $0 with "Free download on the App Store and Google Play", PRO monthly, yearly with a "save 33%" tag and lifetime, then "Per-app pricing, no bundles required": a 3-line pricing explanation near the CTA.
- QR + email "send me the link" hand-off for desktop visitors (and, for us, a TestFlight link on mobile).
- Product pills that switch the phone shown in the hero.
- A tiny page weight and 19 requests; fast with no framework.

## What not to copy
- Seven apps shown at once; Preflop has one product and one goal.
- An email modal on scroll: it competes with the one goal (join the beta) and blocked scrolling in my first capture.
- The 3,000px SEO article inside the landing page.
- Five CTA colours (cyan, orange, white, green, teal).

## Defects seen
- In my first desktop pass the "Solver Vault" modal opened and scroll stopped at y=540; it covers the page in the middle of the capture (`img/thinkgto-popup-01.png`). On a second pass it did not open, so it is timing-dependent.
- The hero H1 wraps as "Think Deeper. Play / Sharper." on mobile, orphaning the highlighted word.
- The three hero chips look like buttons for apps the visitor has not heard of; it is unclear which is the primary action.

## Poker lens
- Range charts: a pink/red 13x13 Nash grid on a phone, small; no visible frequency mix in the marketing screenshot. The Preflop+ feature list says push/fold charts for every stack depth, equity calculator, range vs range, ICM, custom raise sizes, hand history.
- Claims (paraphrased): a full solver in your pocket, 100M+ solves, works offline, no hardware needed, endorsed by two named pros, 4.6 stars.
- Pricing: per app, each with a free tier. Preflop+ Pro $9.99 a month, $79.99 a year (the page says "save 33%"), $129.99 lifetime. Postflop+, Solver+, GTO Ranges+ are sold separately (the pricing cards list higher prices; search snippets mention $29.99 a month for GTO Ranges+; I did not check those). For comparison, Preflop sells $7.99 / $39.99 / $59.99 (facts.json).
- CTA wording: Download Free, Download Preflop+ Free, Download free {app}, Compare pricing across all ThinkGTO apps, Send me the vault, Start Training Free Today.
- Where Preflop could be clearly more modern: this competitor's page is clean but generic and shows only static phone screenshots. Preflop can demonstrate one real hand (card, chart with mix, reason) in the page.
