---
name: setup-ttstack
description: Configure which models ttstack uses per role, and write the project's code-host file if it is missing. Detects your available models and writes an always-applied rule that overrides the skill defaults. Use for /setup-ttstack, "configure ttstack models", or changing ttstack's model choices.
---

# Setup ttstack

Write `~/.cursor/rules/ttstack-models.mdc`, an always-applied rule that sets ttstack's model per role. The skills read it and fall back to their inline defaults when a line is absent, so this is an override layer, not a requirement.

## Steps

### 1. Detect available models

Enumerate the model slugs you can pass to a `Task` subagent in this session; that is the dependable source. If Cursor also exposes a models API or CLI that lists the user's entitled models, prefer it for completeness. If you cannot detect any, ask the user to paste the slugs they have access to. Never write a real slug you have not confirmed is available. The aliases `inherit-parent` and `auto` are always valid even though they are not detected slugs.

### 2. Load current state

The default role-to-model mapping is the rule shape shown in step 5 below. If `~/.cursor/rules/ttstack-models.mdc` already exists, read it and treat its values as the current choices. Otherwise start from those defaults.

### 3. Map and confirm

Show every role with its current model, marking any real slug not in the detected set as needing a choice. Ask whether to accept as-is or change specific roles, offering the detected models plus `inherit-parent` and `auto` (both mean: this role runs on the parent chat model, which is how Auto users stay on Auto) as the options. Prefer AskQuestion over free text. For panel roles (`how-critics`, `arena-runners`, `architect-runners`, `interrogate-reviewers`) the value is a list, and one subagent runs per entry, alias entries included, so the list length sets the count. `arena-cross-judge-pool` is also a list, but Arena selects one value from it whose model family differs from the parent's when possible. `swarm-workers` is the default model for every worker unless a race or comparison assigns another model per arm. `maintain-source-readers` is the model for each `/maintain-verification-skill` source-wave child (default `inherit-parent`). They are not `swarm-workers`. `judgment-and-prose` is the model for ad-hoc `/tt-mode` delegates that write prose or need judgment.

### 4. Validate

Every real slug written must be in the detected set; `inherit-parent` and `auto` always pass. If a chosen real slug is not available, stop and ask again. A rule pointing at a model the user cannot use breaks every delegation that reads it.

### 5. Write the rule

Write `~/.cursor/rules/ttstack-models.mdc` with `alwaysApply: true` and one line per role, using the hyphenated labels the skills look up. Overwrite the whole file so re-runs stay idempotent. Shape:

```
---
description: ttstack per-role model choices (overrides skill defaults)
alwaysApply: true
---
# ttstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit Task `model`). Alias entries in a panel list still count toward its fan-out.
feature: grok-4.6-fast-xhigh
refactoring: grok-4.6-fast-xhigh
bug-fix: gpt-5.6-sol-max
perf-issue: gpt-5.6-sol-max
hillclimb: gpt-5.6-sol-max
judgment-and-prose: claude-fable-5-thinking-max
how-explorer: grok-4.6-fast-xhigh
how-explainer: claude-fable-5-thinking-max
how-critics: claude-fable-5-thinking-max, gpt-5.6-sol-max, grok-4.6-fast-xhigh, claude-opus-5-thinking-xhigh
why-investigators: grok-4.6-fast-xhigh
why-synthesizer: claude-fable-5-thinking-max
reflect-tooling: gpt-5.6-sol-max
reflect-judgment: claude-fable-5-thinking-max
arena-runners: claude-fable-5-thinking-max, gpt-5.6-sol-max, grok-4.6-fast-xhigh, claude-opus-5-thinking-xhigh
arena-cross-judge-pool: claude-fable-5-thinking-max, gpt-5.6-sol-max, grok-4.6-fast-xhigh, claude-opus-5-thinking-xhigh
swarm-workers: grok-4.6-fast-xhigh
maintain-source-readers: inherit-parent
architect-runners: claude-fable-5-thinking-max, gpt-5.6-sol-max, grok-4.6-fast-xhigh, claude-opus-5-thinking-xhigh
interrogate-reviewers: claude-fable-5-thinking-max, gpt-5.6-sol-max, grok-4.6-fast-xhigh, claude-opus-5-thinking-xhigh
```

### 6. Confirm models

Tell the user the rule was written and that it applies to new sessions. Re-running this skill updates the rule.

### 7. Project files

In the current workspace (the project the user is working in, not this plugin), create `docs/code-host.md` if it is missing. Do not overwrite a file that already exists. Copy `skills/tt-mode/references/code-host-template.md`, then fill it from this repo. GitHub or Azure DevOps. GitHub needs `gh`. Azure DevOps needs the Azure DevOps MCP. Do not run `gh` on Azure DevOps. Ask only what you cannot observe. If you cannot tell the host, default to GitHub and `gh`.

### 8. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill`. On no, move on without pushing.
