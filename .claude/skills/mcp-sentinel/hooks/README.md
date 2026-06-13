# MCP Sentinel — Runtime Protection Hook

This folder contains the runtime protection layer that ships with Sentinel v2.

## What it does

Registers a **PreToolUse hook** with Claude Code. Before every tool call a skill or MCP tries to make, the hook inspects the call against the bundled `references/iocs.json` library (sensitive paths, known-malicious domains, dangerous command patterns, env-var exfiltration). Suspicious calls are blocked or flagged in real time — before execution.

## Cost

Zero LLM tokens in normal operation. The hook is a local Python script that runs in ~30–80ms per call. A blocked or warned call adds a short message to the conversation (negligible tokens, only when triggered).

## Install

From the repo root (or wherever you unpacked the skill):

```bash
bash hooks/install_hooks.sh --user     # globally for your user
bash hooks/install_hooks.sh --project  # for the current project only
```

## Uninstall

```bash
bash hooks/uninstall_hooks.sh --user
# or
bash hooks/uninstall_hooks.sh --project
```

## Allowlist

False positives can be whitelisted in `.security/sentinel-allowlist.json`:

```json
{
  "paths": ["/home/me/project/.env.local"],
  "domains": ["api.mytrustedservice.com"],
  "commands": ["curl -X POST https://api.mytrustedservice.com/webhook"]
}
```

## Files

- `sentinel_preflight.py` — the hook itself. Reads tool call from stdin, returns decision JSON.
- `install_hooks.sh` — registers the hook in Claude Code settings.
- `uninstall_hooks.sh` — removes the hook.
