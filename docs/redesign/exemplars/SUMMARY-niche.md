# Summary: niche group (poker competitors and learning/game apps)

Source: the "niche" teardown agent's report, saved here by the coordinator (the agent could not write this file). Captured 2026-10-28 with headless Chromium. Per-site files: gtowizard.md, upswing.md, runitonce.md, thinkgto.md, freebetrange.md, gtopre.md, brilliant.md, chess.md, mimo.md. Screenshots in img/ (about 4.2 MB for this group; every second capture step).

## Coverage and exceptions
- postflopplus.com (and www.) failed twice (proxy 502). Dropped; replaced by ThinkGTO (thinkgto.com), plus Freebetrange and GTO Preflop (gtopre.com), found by search.
- Upswing: desktop only. Mobile hit an anti-bot "Confirm you are human" page twice; not worked around.
- GTO Wizard pricing: the public pricing page is behind a login, so there are no first-hand prices (third-party figure in gtowizard.md, unverified).
- Cookie banners were accepted for the shots. Library-string counts in CSS/JS (e.g. "gsap") are string matches, not proof of use; `window.gsap` was checked where it mattered.
- None of the nine sites pins scroll scenes or uses ScrollTrigger on its home page. Fixed elements are navs and Chess.com's sidebar. Motion is short transitions (.15-.5 s), tile reveals and looping video.
- Page weight: GTO Preflop 120 MB (seven ~16.8 MB PNGs, an 11.2 MB hero mockup; blank with JS off), Brilliant 15.8 MB, Mimo 10.4 MB, GTO Wizard 9.7 MB, Chess.com 9.3 MB, Upswing 5.9 MB, Freebetrange 4.1 MB, Run It Once 2.0 MB, ThinkGTO 1.4 MB.

## Competitor snapshot (poker apps)

| Site | Free tier | Paid | How the chart is shown | Hero CTA |
|---|---|---|---|---|
| GTO Wizard | free game mode; study needs login | tiers by third-party report, unverified | red/green 13x13, mixed cells split proportionally, popover with sizes | Begin Your Journey |
| Upswing Preflop Prodigy | free "for now", no download | $7 playbook, $999 courses | two-colour 13x13 images, header line plus totals legend | GET FREE ACCESS |
| ThinkGTO Preflop+ | free tier per app | $9.99/mo, $79.99/yr, $129.99 lifetime | pink 13x13 on a phone; mix not visible at that size | Download Preflop+ Free |
| Freebetrange | trainer capped at 50 hands / 5 ranges a day; basic 2-colour ranges, no weights | Pro ~$13.2/mo (billed $159/yr), Elite $29/mo ($348/yr) | pink/amber cells with partial fills, legend with % and combos (weights are a paid feature) | Start now |
| GTO Preflop | none stated | not on site | red/green phone screenshots | Download |
| Run It Once | basic plan $0 | $24.99 to $199.99/mo, trainers $119.99+/mo | no chart on home page | Get Started For Free |

Preflop's numbers (facts.json): $7.99/mo, $59.99 lifetime, 20 free hands a day (the $39.99 annual exists only for existing subscribers and is not advertised). Cheaper than the two app competitors with published prices, and the frequency mix is free (Freebetrange paywalls weights). **These are positioning facts for the spec author, not copy to put on pages from this document.**

Where Preflop can be clearly more modern than every poker competitor: (1) one real hand working on the page rather than screenshots or video; (2) one primary action repeated, not five verbs; (3) a light, fast page; (4) mobile-first composition (competitors shrink desktop screenshots); (5) one typeface, one accent, calm spacing. Upswing and GTO Preflop look dated or generic; the best-looking poker pages (GTO Wizard 9.7 MB, ThinkGTO 1.4 MB) are either heavy or generic.

## Ten most transferable patterns, ranked

1. **Play-one-hand-in-the-page demo (HTML recreation, not video).** Mimo (lesson mock in a bento card, img/mimo-d-03.png), Chess.com (hero board plays itself, img/chess-d-01.png), Brilliant (looping UI recording with cursor, img/brilliant-d-01.png; hero card 440x600, 15.1 s loop). Build: hand card plus 13x13 grid as 169 HTML/CSS cells with the mix per cell; one GSAP timeline in an external file, 4-6 s: cards slide in (transform, 0.5 s cubic-bezier(.22,1,.36,1)), a button "tapped", cells fill by opacity with a 12 ms stagger, reason line fades in. No-JS: final state in the HTML. Reduced motion: final state. Zero video bytes.
2. **Mixed-frequency cell as proportional split fill with a legend line.** GTO Wizard (img/gtowizard-d-02.png), Freebetrange (img/freebetrange-d-05.png), Upswing (header with ACTION/POSITION/STACK/RAISE SIZE and legend RAISE 18.5% / FOLD 81.5%, img/up-charts-02.png). Build: each cell a span with a custom property per action and a hard-stop split fill; mono 11 px meta line above, legend with percentages below. Static.
3. **Floating pill nav whose CTA appears after the hero.** Brilliant (nav 1296x58, 24 px from top, radius 9999px, shadow 0 0 15px rgba(0,0,0,.1); "Get started" pill appears after scroll, img/brilliant-d-03.png). Build: CTA in the DOM, visible by default; a script adds a class so it starts hidden until an IntersectionObserver on the hero fires; 0.2 s opacity + translateY(6px to 0). No JS: always visible.
4. **Bevelled primary button with press feedback.** Chess.com (Get Started 400x64, 22 px/800, radius 10, vertical two-tone fill, inset 0 1px light highlight, inset 0 -1px darker edge). Build in our accent with inset box-shadows; :active translateY(1px) scale(.99) at 0.1 s. (Note: our design rule forbids gradients: use a flat fill with inset highlights.)
5. **One primary action, sized by device.** Mimo (form on desktop, store badges on mobile, img/mimo-m-01.png), ThinkGTO (QR plus "email me the link", img/tg-preflop-01.png), Chess.com (64 px desktop button, full width mobile). Mobile hero buttons 56 px, desktop 64 px. Build: desktop shows join-the-beta with QR; iPhone widths show one full-width TestFlight button; both in the HTML, switched by media query.
6. **Proof row directly under the hero.** GTO Preflop (4.9, 935 ratings, img/gtopre-d-03.png), Mimo (stars, count, press logos, img/mimo-d-01.png), ThinkGTO. We have no ratings in beta, so only true numbers: 25,000+ spots (facts.json), three stack depths, 60 badges; four items, 28 px numerals, count-up on view (once), final numbers in the HTML.
7. **"What it is / what it isn't" two-column block** (Upswing's free preflop app page: ticks vs crosses). Two cards, six lines each; handles objections without a long FAQ.
8. **Free / Pro block with the numbers in one place** (ThinkGTO: FREE $0, PRO monthly/yearly/lifetime; Freebetrange: Month/Year toggle). Improve the existing pricing section from facts.json markers; (do not advertise annual: see the app's facts).
9. **Alternating dark/light sections with mono eyebrow and big padding.** Mimo (padding 160 px desktop, 80 px mobile; mono uppercase eyebrows), GTO Wizard (pill labels STUDY/PRACTICE, two-tone H2 44 px/500/-0.5px/1.1, img/gtowizard-d-03.png), ThinkGTO (112/80 px). Build: padding token clamp(80px, 11vw, 160px), eyebrow 11-12 px with +1 px tracking, one accent phrase per H2.
10. **Motion budget.** Brilliant (cubic-bezier(.22,1,.36,1) x12, (.16,1,.3,1) x8; durations .15/.2/.3/.5 s), Mimo (spring (.34,1.56,.64,1) on chips), GTO Wizard (.3 s hover). Numbers: hover 0.15 s; reveals 0.5 s with 24 px travel; large elements 0.8-1.1 s max; nothing pinned; hidden start states added only after the script sets a `.js` class on html; a reduced-motion branch sets final states.

## Patterns to avoid
- Video or 4-16 MB payloads (ThinkGTO shows 1.4 MB is enough).
- Email modals on scroll (ThinkGTO) that block the page.
- A "Start now" button after every block (Freebetrange); five CTA verbs (GTO Wizard).
- Blank without JavaScript (GTO Preflop).
- Cookie panels covering the lower quarter of the first screen (GTO Wizard).
- Eight font families (Upswing).
