# Chess.com home (https://www.chess.com, logged-out landing)

Captured 2026-10-28, desktop 1440x900 (10 steps, page 4,743px) and mobile 390x844 @2x (11 steps, 5,127px). Only the home/learn marketing page was loaded. Screenshots: `img/chess-d-01.png`, `-03`, `-05`, `-07`, `-09`; `img/chess-m-01.png`, `-03` ... `-11`. No cookie banner appeared in the shots (OneTrust scripts are loaded, but nothing blocked the view).

## Hero
Dark charcoal page (#302e2b) with a fixed 170px left sidebar (Play, Puzzles, Learn, Train, Watch, Community, Other, Search, green "Sign Up", "Log In", Help, language). The content column is 1084px wide. Left: a chessboard that plays a looping muted webm (one `<video>` element, autoplay, loop). Right: H1 "Play Chess Online on the #1 Site!" (42px/800/48px in the custom face "Chess Sans"), a line "Join 250+ million players in the world's largest chess community", and a huge green button "Get Started" (400px wide, 64px tall, 22px/800, 10px radius). See `img/chess-d-01.png`.

## Section flow
Hero, then five "pair" rows, each exactly 563px tall with image and text alternating sides: "Improve Your Game with Lessons" (isometric glossy tiles with a graduation cap), "Play Chess Bots" (a grid of ten avatar faces with the selected one crowned), "Level Up With Chess Puzzles" (a board with rating counter, a house and numbered coins), "Watch the Best in the World Compete" (a stream screenshot), "FIDE World Chess Championship 2026" (two player photos with black/white geometric shapes). Then "Latest Chess News" (three cards), "Play Anywhere with the Chess.com App" (store badges beside a phone with a board), and a closing "Learn, Play, and Have Fun!" with a second "Get Started". Rows are separated by space, not borders.

## Showing the product
Three kinds: a live looping board (hero), glossy 3D-style illustrations that stand for each feature (lessons, bots, puzzles) and cropped UI (the stream window, the phone). The puzzle illustration includes the real rating counter and progress bar from the app, so it doubles as a product screenshot.

## Signature moment
The hero board playing itself, next to a 64px bevelled green button. The button is the strongest "press me" object in the whole group: a vertical gradient (#81b64c to #5d9948), a 1px light inset highlight at the top, and a darker bottom edge (`inset 0 -1px 0 #45753c`, plus a soft inner glow) that reads as a physical key.

## CTAs
Green bevelled "Get Started" at top and bottom of the page; the left sidebar and mobile header carry "Sign Up" (green) and "Log In" (grey). Each of the five rows has one secondary grey button with an icon: "Start a Lesson", "Challenge a Bot", "Solve a Puzzle", "Watch Chess", "Watch" (48px tall, 300px wide on desktop, translucent white gradient). The app row has App Store and Google Play badges.

## Social proof
One line in the hero (250+ million players). Nothing else on the page: no logos, ratings or quotes.

## Type/space/colour numbers
Faces: Chess Sans (headings) and system sans (body). Desktop: H1 42px/800/48px; section H2 36px/800/40px; body 14-17px; buttons 14-22px at 600-800. Mobile: H1 28px/800/32px; H3 22px/800/28px. Content column 1084px; row height 563px (524px on mobile). Palette: page #302e2b, text white at 85% and 50%, green #81b64c / #5d9948, translucent white surfaces (rgba(255,255,255,.02), buttons at about 10%). Radii: 10px (21 elements), 5px (13). Shadows are all inset highlights (`inset 0 1px 0 rgba(255,255,255,.08)` plus `0 1px 2px rgba(0,0,0,.14)` on grey buttons).

## Motion (with real numbers and where found)
Very restrained. Transitions `.3s` x11, `.1s` x9, `.2s`, `.25s`; easing set includes `cubic-bezier(.2,1,.3,1)`, `(0,0,.2,1)`, `(.4,0,1,1)`. `prefers-reduced-motion` x10, `clip-path` x9, `IntersectionObserver` x7, Rive referenced 4 times. No scroll choreography, no pinned sections, only the sidebar (fixed) on desktop.

## Mobile behaviour
The sidebar becomes a 48px sticky header: burger, logo, green "Sign Up", grey "Log In". The hero stacks: board (video) first, then H1 and a full-width green "Get Started". Rows become image above text with the grey button full width. Page height changes little (5,127px vs 4,743px). The app row keeps the store badges.

## Tech
Custom stack with its own navigation package (`navigation-logged-out.js` 694 KB). 9.3 MB over 226 requests desktop: JS 6.4 MB transfer (6.8 MB raw), images 961 KB, CSS 547 KB, fonts 205 KB, media 439 KB (the hero webm). Mobile 9.4 MB.

## What to steal
- A bevelled primary button with a light top inset and a darker bottom edge: strong tap affordance, pure CSS (`box-shadow` inset values above), animates with `transform` on press.
- A live, looping, silent hero demo of the real thing (here a board playing itself); for us, the actual chart cells filling as a hand resolves.
- Row rhythm: a fixed 560px row height, image and text alternating, one grey secondary button per row.
- Device-aware ending: store badges beside a phone picture; we would show "TestFlight beta" instead.

## What not to copy
- A fixed left sidebar: it suits a logged-in app, not a one-goal page.
- 6.4 MB of JavaScript and 226 requests.
- Five grey secondary buttons with five different verbs; they dilute the primary action.
- Glossy 3D illustrations and a content-heavy news block.

## Defects seen
- Grey placeholder pawn images in "Latest Chess News" (shots `-07`, `-09`) where lazy images had not yet loaded after an 800ms wait.
- The hero board sits tight against the 170px sidebar at 1440 with almost no left margin.
- Body copy under row headings is 14px at 72% white: small for a dark page.
- The page defines no social proof beyond the single line.

## Learning-app lens (not poker)
The home page proves the product with a demonstration and one number, then gets out of the way. The CTA hierarchy (one big green, many small grey) is the clearest in the group.
