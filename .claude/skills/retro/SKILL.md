---
name: retro
description: Turn what went wrong or was learned in this session into repo rules, tests, hooks or memory, so the next session doesn't repeat it. Use before finishing a session where Stan corrected you, a fix took more than one try, or time went into a trap.
---

# Retro

The goal is fewer repeated mistakes, not more text. A retro that adds nothing
is fine. A retro that adds five vague lines makes every later session worse.

## 1. Gather

Reread the conversation for Stan's corrections ("no", "still broken", "I
meant…"), fixes that needed a second attempt, commands that failed or were
retried, and anything you had to discover that the repo could have told you.

## 2. Decide, for each candidate

Would a future session, reading only the repo, have avoided it or found it
faster? If not (a one-off, or already covered), drop it. If so, pick the
strongest home that works:

| Lesson | Home |
|---|---|
| Must never happen, and a script can detect it | A test or a check in this repo's gate (see CLAUDE.md, Checks), or a hook in `.claude/settings.json` + `.claude/hooks/`. Prose is the last resort for these. |
| A trap or convention tied to some files | One line in `.claude/rules/<area>.md` (check its `paths:` cover the files). A new area gets a new file with `paths:`. |
| A step missing from a procedure | That command or skill in `.claude/commands/` or `.claude/skills/` |
| True for every session in this repo | `CLAUDE.md`, one line |
| Stan's taste or working preference, not specific to this repo | Auto memory, or `~/.claude/CLAUDE.md` if it applies to every project |

## 3. Write

- One line per lesson: **what to do**, then **why**, citing the commit hash or
  date it came from. "Rename the file when the card changes (1539cc3)", not
  "be careful with caches".
- Before adding, grep `.claude/rules/`, `CLAUDE.md` and the skills for the
  topic. Update or delete a line that the new one contradicts or supersedes.
- Keep `CLAUDE.md` under 200 lines and each rule file under about 80. If a file
  goes over, merge or drop its weakest lines.
- Don't write what current models do without being told, and don't shout
  ("IMPORTANT", "MUST").

## 4. Ship

Commit the lessons on the current branch with the work, message
`Retro: <what was learned>`, and push, so they ride along with the PR. If on
`main`, use a `chore/retro-<date>` branch. Tell Stan in two or three lines what
was added, changed and removed.
