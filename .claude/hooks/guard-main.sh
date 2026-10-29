#!/bin/bash
#
# PreToolUse hook (Bash): a push or merge to `main` publishes the site, so
# neither happens by accident.
#
#  - `git push` that names `main`, or runs on the `main` branch: denied.
#    Work goes on a branch and reaches `main` through a PR.
#  - `gh pr merge`: asks Stan first. CLAUDE.md says to merge only when he says
#    so, because a merge deploys.
#
# Wired up in .claude/settings.json. Reads the hook payload on stdin.
# Tested by scripts/test_guard_main.py.
payload=$(cat)
cmd=$(jq -r '.tool_input.command // empty' <<<"$payload")
cwd=$(jq -r '.cwd // empty' <<<"$payload")

# Match the command itself (at a line start or after && ; |), not words inside
# a commit message or heredoc.
is() { grep -qE "(^|[;&|])[[:space:]]*$1" <<<"$cmd"; }

if is "git push"; then
  branch=$(git -C "${cwd:-.}" branch --show-current 2>/dev/null)
  # Look for `main` only in the push itself: from `git push` to the next
  # ; & | or line end. A commit message or heredoc in the same command can
  # say "main" freely. Backslash-newlines are joined first, so a push
  # continued onto the next line is still one segment.
  push=$(grep -oE "(^|[;&|])[[:space:]]*git push[^;&|]*" <<<"${cmd//$'\\\n'/ }")
  if grep -qE '(^|[[:space:]:])(refs/heads/)?main([[:space:]]|$)' <<<"$push" || [ "$branch" = "main" ]; then
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Pushing to main deploys the live site. Push a branch and open a PR; Stan merges."
      }
    }'
    exit 0
  fi
fi

if is "gh pr merge"; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: "A merge to main deploys the live site. Only merge when Stan has said to."
    }
  }'
fi
