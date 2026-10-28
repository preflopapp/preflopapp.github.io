#!/bin/bash
#
# PostToolUse hook: after `gh pr create`, remind Claude to file this
# session's lessons with /retro before it finishes.
#
# Lessons only compound if they're written down while the session still has
# the context, and opening a PR is the one moment every finished task in this
# repo passes through (CLAUDE.md's workflow). Prose in CLAUDE.md alone gets
# skipped at the end of a long session; this makes the prompt arrive on time.
#
# Wired up in .claude/settings.json. Reads the hook payload on stdin. Never
# blocks anything: it only adds context.
command=$(jq -r '.tool_input.command // empty')

# Match the command itself (at a line start or after && ; |), not the words
# inside a commit message or heredoc.
printf "%s\n" "$command" | grep -qE "(^|[;&|])[[:space:]]*gh pr create" || exit 0

jq -n '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: "PR opened. Before you finish: if this branch fixed a bug, Stan corrected you this session, or a fix needed a second attempt, run /retro now. It files the lesson in .claude/rules/, a test, a hook or memory. Commit it to this branch and push, so it rides along with the PR. If none of that happened, carry on without it. For a bug fix, make sure the PR body has Root cause and Lesson."
  }
}'
