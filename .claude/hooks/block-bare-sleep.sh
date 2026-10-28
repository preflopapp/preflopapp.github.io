#!/bin/bash
#
# PreToolUse hook (Bash): stops a fixed `sleep N` (N >= 10) used to wait for a
# build, test run, push or deploy. Polling loops (`until …; do sleep 5; done`)
# and background commands are allowed.
#
# Stan's global CLAUDE.md says never to `sleep` to wait, and the Preflop repo's
# 2026-10-12 retro still found blind waits in eight sessions in one week. Prose
# didn't stop it; this does.
#
# Wired up in .claude/settings.json. Reads the hook payload on stdin.
payload=$(cat)
[ "$(jq -r '.tool_input.run_in_background // false' <<<"$payload")" = "true" ] && exit 0
cmd=$(jq -r '.tool_input.command // empty' <<<"$payload")

# A polling loop is the right way to wait.
grep -qE '(^|[[:space:];&|])(until|while)[[:space:]]' <<<"$cmd" && exit 0

# A sleep at the start of the command or after ; && || | or a newline.
secs=$(grep -oE '(^|[;&|][[:space:]]*|^[[:space:]]*)(/bin/)?sleep[[:space:]]+[0-9]+' <<<"$cmd" \
    | grep -oE '[0-9]+$' | sort -n | tail -1)
[ -n "$secs" ] && [ "$secs" -ge 10 ] || exit 0

jq -n --arg s "$secs" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: ("A fixed `sleep \($s)` waits blind. Run the long command with run_in_background and get notified, or poll the condition you care about: `until <the thing you wait for>; do sleep 5; done`.")
  }
}'
