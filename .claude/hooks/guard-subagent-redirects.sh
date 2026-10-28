#!/bin/bash
#
# PreToolUse hook (Bash): stops a subagent from writing files with shell
# redirects, except to /dev/null or Claude's temp/scratchpad directories.
#
# In the 2026-10-11 audit, read-only subagents told in their prompts not to
# write files still "discarded" output with `> /tmp/x`, `> .none` and
# `> ~/.nothing`, leaving five stray files (one in the repo root). Prose in the
# prompt didn't stop it; this does. The main session is not affected: the
# check only runs when the payload carries an agent_id.
#
# Wired up in .claude/settings.json. Reads the hook payload on stdin.
payload=$(cat)
[ -n "$(jq -r '.agent_id // empty' <<<"$payload")" ] || exit 0
cmd=$(jq -r '.tool_input.command // empty' <<<"$payload")

# Every `>` / `>>` / `2>` / `&>` target, skipping fd duplications like `2>&1`.
bad=$(grep -oE '(^|[[:space:]])[0-9&]?>>?[[:space:]]*[^[:space:]&;|)<>][^[:space:];|)<>]*' <<<"$cmd" \
    | sed -E 's/^[[:space:]]*[0-9&]?>>?[[:space:]]*//; s/^["'\'']//; s/["'\'']$//' \
    | grep -vE '^(/dev/(null|stdout|stderr)|/private/tmp/claude-|/tmp/claude-)' \
    | head -3 | tr '\n' ' ')
[ -z "$bad" ] && exit 0

jq -n --arg bad "$bad" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: ("Subagents may not write files with shell redirects (target: \($bad)). To discard output, redirect to /dev/null; to keep it, just let it print. Do not create files to work around this.")
  }
}'
