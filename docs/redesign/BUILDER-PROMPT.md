# First message for the build session (paste everything below the line)

---

You are building the redesign of preflopapp.com, the marketing site of the
Preflop iPhone app (a preflop poker trainer in an external TestFlight beta).
The site's job is to get visitors to **Join the beta**. Its owner, Stan, has
seen too many artifacts on the live site: parts that overlap, fade or jump
mid-scroll and after a resize or rotation. This rebuild has to be calm,
exact, reminiscent of the real app, and verified the way it actually breaks.
The contract is **`docs/redesign/SPEC.md`**. Build it phase by phase. Each phase
is one PR, then stop.

## Read, in this order, before touching anything
1. `CLAUDE.md` (workflow, facts, checks). Follow it.
2. `docs/redesign/SPEC.md`, all of it. It is decisive; where it gives a number,
   that is the target.
3. `.claude/rules/next.md`, `.claude/rules/cache-and-headers.md`,
   `.claude/rules/shared-hand.md`.
4. `facts.json`, `docs/app-handoff/FACTS.md`, `docs/app-handoff/motion-and-design.md`,
   `docs/app-handoff/screens-README.md` and `docs/app-handoff/data/`.
5. `scripts/check-site.py` and `scripts/test_check_site.py`.
6. `docs/redesign/audit/ISSUES.md` and `METRICS.md`. Open the PNGs in
   `audit/img/` with the Read tool to see the defects.
7. The current code: `index.html`, `next/css/*.css`, `next/js/*.js`,
   `faq/index.html`, `404.html`.
8. Only when a decision needs it: `docs/redesign/research-technique.md` and
   `docs/redesign/exemplars/*`. SPEC cites them by file and section.

## Rules you never break (full list: SPEC §9)
- **Never push to `main`. One PR open at a time. Stan merges, because a merge
  deploys.** Work in a `git worktree` on a fresh branch from `origin/main`.
  Commit only your own files.
- Static HTML, CSS and JS with **no build step**. Generators run before you
  commit, and you commit their output.
- **CSP** `script-src 'self'`, `style-src 'self'`: no inline script, no `style=`
  anywhere, including inside `innerHTML` strings. JS sets styles through the
  CSSOM only. No external requests.
- **Animate only `transform` and `opacity`.** Nothing loops. No pin, no scrub,
  no parallax. Content is visible by default: JS adds a hidden start state only
  when it is sure it can reveal it (SPEC §4.7). The h1, text, prices and CTAs
  never animate.
- No gradients and no dashed or dotted lines. Never white text on a panel fill.
  Hanken Grotesk and the tokens in `next/css/tokens.css`, changed only as SPEC
  §4.6 says.
- **Facts**: prices, the free-tier numbers and the spot counts come from
  `facts.json` through `<!-- fact:key -->` markers. $7.99/month and $59.99
  lifetime only (no annual, no trial); 20 free hands a day; "25,000+" spots at
  100/30/20bb; grades Correct / Mixed / Wrong. No "solver" or "GTO" claims, no
  content source, no invented ratings, quotes, logos, user counts or press.
- App screenshots are dark-only, pre-refresh illustrations: they go only in the
  forced-dark gallery. Anything drawn is captioned as drawn. The privacy policy
  is never edited without Stan. The shared head, header and footer stay
  identical across the text pages. The LCP element stays the `<h1>`.
- Every PR passes `python3 -m unittest discover -s scripts -p 'test_*.py'` and
  `python3 scripts/check-site.py .`.

## The phases (SPEC §11)
0 infrastructure and cheap fixes (harness, baseline, asset stamps, nav, theme,
404, FAQ) · 1 calm (delete the artifact sources and GSAP; tokens; motion
engine) · 2 hero, demo, proof strip · 3 how it teaches, coverage · 4 app
gallery, CTA C, free for everyone · 5 pricing, FAQ, closing, footer, text
pages · 6 cleanup and final QA in the audit's own way (`docs/redesign/QA.md`).

## How each phase runs
1. Start only after Stan has merged the previous PR, or told you to go on.
   `git fetch`, then a new worktree and branch `redesign/phase-N-<slug>` from
   `origin/main`.
2. Build exactly that phase's scope. If the spec is wrong or impossible
   somewhere, **stop and say so** with the smallest fix you propose. Don't
   deviate silently. When Stan answers a SPEC §12 decision, record his answer
   in SPEC.md in the same PR.
3. Run both checks. From Phase 0 on, also run `scripts/stamp-assets.py` after
   any asset change.
4. Verify with the harness, `scripts/scroll-pass.js` (SPEC §10). Use viewport
   screenshots every 0.4 viewports while scrolling, never full-page shots, at
   all 13 viewports, in dark and light, with reduced motion, no-JS and the
   throttled iPhone emulation, plus the phase's probes (resize, rotate, menu,
   keyfocus, demo, explorer, axe…). Fix until nothing FAILs (Phase 0 aside:
   there the old design is the baseline). Fix or explain every WARN.
5. **Look at the frames yourself** with the Read tool: mid-scroll and
   after-resize frames in both schemes, not only the report. That is where the
   last build failed.
6. Commit the evidence (≤ 24 PNGs, ≤ 3 MB) to `docs/redesign/shots/phase-N/`.
   Then commit, push and open the PR. Its body: what changed; the phase's
   acceptance list, each ✓ or ✗; the harness summary lines; screenshot links;
   what was not verified; for a bug fix, a **Root cause** and a **Lesson**.
7. **Stop and report to Stan** (format below). Wait. Don't start the next phase.

## Environment
- Playwright: `NODE_PATH=$(npm root -g) node scripts/<file>.js`, **Chromium
  only**. WebKit and real iOS Safari can't run here; don't try to install
  them. Always set `colorScheme` (headless defaults to light).
- Local server: `python3 -m http.server 8123` from the repo root. It doesn't
  apply `_headers`; the pages' meta CSP still applies. Outbound network is
  open for the live checks.
- Harness output goes to a scratch or temp directory, never into the repo,
  except the chosen evidence.

## Learning loop
For every new trap you hit, add one line to `.claude/rules/next.md` (or the
matching rules file): what to do, why, and the phase. If it can be checked
mechanically, add a check with a test to `check-site.py` or the harness
instead. Run `/retro` when Stan corrects you or a fix takes a second try.

## Report format (to Stan, after each PR; under 20 lines)
```
🟢 Phase N ready for review: <PR link>
   (🟡 ready, with open issues listed below; 🔴 blocked, needs you)
What changed: 3-6 short bullets.
Acceptance: X of Y met. Unmet: <item, why>.
Numbers: length 390 / 1440 = a / b screens (targets 10.5 / 8.0);
         CLS c; LCP = h1 at d s (throttled); JS e KB, CSS f KB gzip.
Look at: <2-4 screenshot links: the frames that matter most>.
Not verified here: iOS Safari / WebKit; <anything else>. After merging,
         please run the one-minute iPhone check (SPEC §13).
Needs you: <decisions from SPEC §12 or owner actions, or "nothing">.
```
Be honest about limits. Say "not verified" rather than implying a pass.
