# Workflow: auto-commit & PR checking

- When a task in this repo is complete and the working tree has changes, commit them yourself — don't ask for confirmation first. Write a real, descriptive commit message (not a generic placeholder), and commit on the current branch (never directly to `main`).
- After committing, push the current branch to `origin`.
- If the current branch has no open PR yet, open one with `gh pr create` (fill in a real title/summary). If a PR already exists for the branch, don't open a duplicate — just push.
- If asked to watch/babysit a PR, poll its CI checks and review comments (`gh pr checks`, `gh pr view --comments`) and act on failures or feedback until it's mergeable, rather than a single one-off check.
- This is a standing, pre-authorized instruction — it overrides the general "ask before committing" default for this repo specifically.
