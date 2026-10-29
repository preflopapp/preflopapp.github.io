# preflopapp.com redesign: final QA (Phase 6)

Run 2026-10-29 on branch `claude/redesign-phase-6` (`main` at `56fd48b`, Phase 5
merged, plus this phase's deletions), served locally on `localhost:8123`.
Laid out like [audit/ISSUES.md](audit/ISSUES.md): severity (**blocker**,
**major**, **minor**, **polish**) and confidence (**high** = reproduced and
measured, **medium** = reproduced with the cause inferred, **low** = seen once).

**How it was tested.** Headless Chromium 156 (Playwright), on Stan's Mac
rather than a cloud sandbox:

- The full plan on `/`: all 13 viewports × dark and light × default, reduced,
  nojs and iphone (throttled), 104 passes.
- Then the SPEC §10.3 phase plan on the tightened budgets: 21 passes, 19 PASS
  and 2 WARN.
- Every probe: menu 23/23, keyfocus 6/6, anchors 7/7, theme 6/6, nojs 18/18,
  resize 4/4, rotate 2/2, fastjump 10/10, axe 4/4, demo 55/55, explorer 16/16,
  gallery 13/13, perks 32/32.
- Text pages (faq, support, press, privacy, terms, 404) at 390 and 1440, dark
  and light, default and nojs, plus anchors, theme, nojs and axe: 53/53 PASS.
- `check-site.py` (8 pages, 0 problems) and the checker's unit tests (82).

**Limits.** No WebKit and no real iOS Safari (SPEC §10.4); that is Stan's §13
check. The live pass runs after the merge, because the merge is what deploys.

---

## Open defects

| ID | Sev. | Conf. | What |
|---|---|---|---|
| [QA-01](#qa-01) | minor | high | The zone still injects the Bot Fight Mode "JS Detections" script, which our CSP blocks: one console error per live page |
| [QA-02](#qa-02) | polish | high | At 320 the homepage is 16.5 screens against a target of 16 (ceiling 17 met) |
| [QA-03](#qa-03) | polish | medium | The footer is 396 px at 390 against the SPEC's 360 (budget 400, accepted with Phase 5) |
| [QA-04](#qa-04) | polish | medium | Under a throttled CPU an entrance can still be running at the harness's 600 ms check |
| [QA-05](#qa-05) | polish | high | Two old shots and one font stay for the social card's source |

### QA-01
**minor · high** · every live page · owner action (SPEC §12 #5)

- **What.** `curl` of `https://preflopapp.com/` on 2026-10-29 still finds
  `/cdn-cgi/challenge-platform/scripts/jsd/main.js`. Our CSP blocks it, so each
  page logs one console error. Visitors see nothing.
- **Cause.** Bot Fight Mode is off, but "JavaScript detections" is its own
  switch (Cloudflare → Security → Bots).
- **Fix.** Stan switches it off. No code change.

### QA-02
**polish · high** · `/` at 320×568, every scheme and mode

- **What.** 16.5 screens (9,356 px) against a target of 16. The ceiling of 17
  passes. It was 16.7 before Phase 5 put the footer's groups in three columns.
- **Cause.** At 320 every section's copy wraps more; no one section is over
  its budget.
- **Fix.** None planned. 320 is the smallest supported width, and 390 (10.3
  against 10.5) and 1440 (7.5 against 8.0) are within target.

### QA-03
**polish · medium** · `/` footer at 390

- **What.** 396 px against the SPEC's 360.
- **Cause.** Three link groups at the 44 px tap-target floor are 160 px
  before the brand row, the address-and-toggle row and the fine print.
- **Fix.** Accepted at 400 when Phase 5 merged. Reaching 360 needs shorter
  targets or less footer copy.

### QA-04
**polish · medium** · throttled iphone mode (4× CPU)

- **What.**
  - In the 104-pass run, 4 of 26 iphone passes caught one entrance at 0.77–0.87
    opacity: the streak days, the widget card and a gallery frame.
  - Re-run on their own, all eight passes were clean (5 PASS, 3 "running"
    WARN).
  - In the final run, the hero button's hover fade at 320 and the closing
    deal at 390 iphone were still running at 600 ms (WARN, as in Phases 2–5).
- **Cause.** Three passes shared one CPU under 4× throttling, so a 450 ms
  entrance could slip past 600 ms. The fades end on their own: none was
  stuck in two frames.
- **Fix.** None. Check that nothing is left faded on a real phone (§13 step 2).

### QA-05
**polish · high** · `assets/`

- **What.** `assets/screens/explain.png` and
  `assets/fonts/Outfit-Medium.woff2` are kept, though no page loads them.
- **Cause.** `scripts/og-card.html`, the source of the social card
  `og-v3.png`, draws both. The SPEC's "only `/s/` uses Outfit" missed it.
- **Fix.** Keep them until the card is redrawn. A redraw with an `app-*` shot
  can delete both.

## Fixed in this phase

- **Harness: false failures on macOS.** Requests failed with
  `ERR_CONNECTION_RESET`, which showed up as failed requests, console
  errors, unstyled frames and demo, explorer and gallery probe timeouts.
  `python3 -m http.server` has a listen backlog of 5, and Chromium's bursts
  overflow it on macOS. `scroll-pass.js` now serves through a
  `ThreadingHTTPServer` with a backlog of 128. Re-run, all of them pass.
- **guard-main hook on macOS.** `/bin/bash` 3.2 ignored the unquoted
  `$'\\\n'` pattern, so `git push \` followed by `origin main` on the next
  line was allowed, and `test_guard_main` failed on the Mac. The pattern is
  now a quoted variable.

## Phase 6 scope

- **Deleted:**
  - GSAP and ScrollTrigger (`assets/vendor/gsap/`);
  - the style guide (`next/styleguide/`, `next/css/styleguide.css`);
  - `app-jam.webp`, `app-jam-answer.webp`, `explain.webp`, and the `play`,
    `history` and `leaks` shots.
  - Kept: QA-05.
- **Budgets:**
  - Each one is now the measured maximum plus 10%, where that is lower than
    before.
    - The length ceilings are 11.4 at 390, 8.2 at 1440, 6.7 at 820 and 7.8 at
      1920.
    - At 1440: #pricing top 5.3, proof strip 230 px, closing 545 px.
    - HTML: 33,280 B raw, 8,600 B gzipped, 590 elements.
    - Images: 260,000 B. Throttled LCP: 1,400 ms.
  - Desktop LCP, TBT and CLS keep the SPEC's limits: a busy machine moves
    local timings more than 10%.

## SPEC §8 audit checklist

| Audit ID | State |
|---|---|
| HERO-01, HERO-02 | done |
| STORY-01…08, STATEMENT-01, MARQ-01 | done (sections removed; harness: no sticky or fixed but the nav, no double exposure) |
| EXPL-01…05 | done (explorer probe 16/16) |
| BENTO-01, BADGE-01 | done |
| SPACE-02 | done; footer is QA-03 |
| PRICE-01, FAQ-01, NAV-01, NAV-02, FOCUS-01, THEME-01 | done (probes) |
| RESIZE-01 | done in Chromium (resize 4/4, rotate 2/2); iPad needs §13 step 5 |
| RELOAD-01, ANCHOR-01, SCROLLUP-01, RM-01, NOJS-01 | done (regression probes pass) |
| TEXT-01 | done; TEXT-02 accepted |
| PERF-01 | done: 528 elements before JS, TBT 0 ms throttled |
| PERF-02 | done: GSAP deleted, 0 loops, 0 blur layers |
| LIVE-01 | **open**: QA-01 (owner switch) |
| LIVE-02 | done; re-check the headers in the live pass after the merge |
| LIVE-03 | done: `www` answers 301 to the apex; the style guide is deleted |
| Not testable here 1–10 | addressed in code; 1, 2 and 6 still need the §13 device check |
