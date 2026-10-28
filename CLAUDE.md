# preflopapp.com

The website for the Preflop iOS app. The app's repo is
`preflopapp/PreFlop-App-IOS`, checked out beside this one at
`../PreflopTrainer`; its `CLAUDE.md` and `docs/STATUS.md` are where the
project's state lives.

**Pushing `main` deploys the live site** (Cloudflare Pages, via
`.github/workflows/deploy.yml`). Work on a branch and open a PR; merge only
when the owner says to, because a merge publishes.

# Workflow: auto-commit & PR checking

- When a task in this repo is complete and the working tree has changes,
  commit them yourself — don't ask for confirmation first. Write a real,
  descriptive commit message, and commit on the current branch (never
  directly to `main`).
- After committing, push the current branch to `origin`.
- If the current branch has no open PR yet, open one with `gh pr create`
  (with a real title and summary). If one exists, don't open a duplicate —
  just push.
- If asked to watch a PR, poll its checks and review comments
  (`gh pr checks`, `gh pr view --comments`) and act on them until it's
  mergeable. (This repo's Actions run; the app repo's don't.)
- This is a standing, pre-authorized instruction that overrides the general
  "ask before committing" default for this repo. Merging is not: a merge
  deploys.
- After a merge, delete the branch (`gh pr merge --delete-branch`).
- Sessions share this checkout, and other sessions keep worktrees under
  `.claude/worktrees/`. Before committing, check `git branch --show-current`
  is still yours, then `git status`, and commit only your own files; never
  `git add -A` blind. For a long task, use a `git worktree`.
- A bug-fix PR body says **Root cause** and **Lesson** (what a future session
  should know). The lesson also goes into the repo (see Learning loop).
- A hook asks before `gh pr merge` and blocks pushes to `main`
  (`.claude/hooks/guard-main.sh`). Merging still needs Stan's say-so.

## Prices and the free tier: `facts.json`

`facts.json` states the prices, the trial and the free-tier numbers the app
sells. It's the one place on the site those numbers are written down as data:

- `scripts/check-site.py` fails any page whose dollar amounts or "N hands a
  day" disagree with it, and any `<!-- fact:key -->value<!-- /fact -->` marker
  whose value differs. Wrap a price in a marker when you write one.
- The app repo's `scripts/check_site_facts.py` fetches the live
  `facts.json` and fails when it disagrees with the app's `Preflop.storekit`
  and `FreeTierConfig`.

So a price or free-tier change in the app is: the app, then `facts.json`,
then the pages (the checker lists every one that disagrees), then deploy.
What Pro includes isn't in `facts.json`; keep the pages' Free and Pro lists
in line with the app repo's `docs/AppStorePlan.md` §4a by hand.

## Checks

```sh
python3 -m unittest discover -s scripts -p 'test_*.py' -v
python3 scripts/check-site.py .
```

`/check` runs both with filtered output. Both run before every deploy. The homepage (`/`) is the redesigned
page built on the `next/` assets (Phase 5 cutover); `/landing/` and `/next/` redirect to it. The old landing page
file (`landing/index.html`, built from the app repo's `web/landing/src/`) is kept only as a way back; see
`scripts/README.md`.

## Learning loop

When Stan corrects you, a fix needs a second attempt, or a trap costs time,
run `/retro` before finishing. It files the lesson where the next session will
see it:

- **A trap tied to some files:** a line in `.claude/rules/<area>.md`; rules
  load only when matching files are opened. Areas: `cache-and-headers`,
  `landing`, `next`.
- **Mechanically detectable:** a check in `scripts/check-site.py` (with a test)
  or a hook, not prose.
- **A procedure:** the matching file in `.claude/commands/` or
  `.claude/skills/`.
- **Stan's personal preferences:** auto memory.

Each rule line says what to do, why, and the commit or date it came from.
Replace or delete a line that a new one contradicts. A hook reminds you of
this after `gh pr create`.

## Compact instructions

When summarising this session, keep: the branch, worktree path, PR numbers;
uncommitted or unpushed changes; decisions Stan made and his corrections;
lessons not yet filed by `/retro`; the exact text of any failing check still
open. Drop passed-check output and page dumps.
