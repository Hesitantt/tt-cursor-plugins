---
name: setup-ttstack
description: Configure which models ttstack uses per role, and write the project's code-host and issue-tracker files if they are missing. Detects your available models and writes an account User Rule that local and cloud agents both read. Use for /setup-ttstack, "configure ttstack models", or changing ttstack's model choices.
---

# Setup ttstack

Write a Cursor User Rule titled `ttstack models` that sets ttstack's model per role. It lives on this Cursor account, so it applies to local Agent and to cloud agents started on the same account. Do not write `~/.cursor/rules/ttstack-models.mdc` or a project `.cursor/rules` file. Home-dir rules stay on the machine. A project rule is shared across the repo and beats User Rules.

The skills look up the hyphenated role labels in that User Rule. The lookup recipe is [`../tt-mode/references/model-config.md`](../tt-mode/references/model-config.md). A missing rule or line means omit Task `model` (inherit the parent chat model). This step is how you get opinionated per-role routing; it is not required.

## Steps

### 1. Detect available models

Enumerate the model slugs you can pass to a `Task` subagent in this session; that is the dependable source. If Cursor also exposes a models API or CLI that lists the user's entitled models, prefer it for completeness. If you cannot detect any, ask the user to paste the slugs they have access to. Never write a real slug you have not confirmed is available. The aliases `inherit-parent` and `auto` are always valid even though they are not detected slugs.

### 2. Load current state

The seed role-to-model mapping is the rule shape shown in step 5 below. Load current choices in this order; stop at the first hit:

1. List User Rules with `cursor_dialog` from the `cursor-app-control` MCP (`item: rule`, `scope: user`, `action: list`). Use the rule titled `ttstack models` (case-insensitive). If none has that title, use a rule whose body is a ttstack role map (`feature:` plus `how-explorer:`).
2. Else if `~/.cursor/rules/ttstack-models.mdc` exists, read it. That path is leftover from older setup.
3. Else start from the seed.

If more than one User Rule matches, keep the titled `ttstack models` rule and ignore the extras. Do not add a second copy.

### 3. Map and confirm

Show every role with its current model, marking any real slug not in the detected set as needing a choice. Ask whether to accept as-is or change specific roles, offering the detected models plus `inherit-parent` and `auto` (both mean: this role runs on the parent chat model, which is how Auto users stay on Auto) as the options. Prefer AskQuestion over free text. For panel roles (`how-critics`, `arena-runners`, `architect-runners`, `interrogate-reviewers`) the value is a list, and one subagent runs per entry, alias entries included, so the list length sets the count. `arena-cross-judge-pool` is also a list, but Arena selects one value from it whose model family differs from the parent's when possible. `swarm-workers` is the default model for every worker unless a race or comparison assigns another model per arm. `maintain-source-readers` is the model for each `/maintain-verification-skill` source-wave child (seed `inherit-parent`). They are not `swarm-workers`. `judgment-and-prose` is the model for ad-hoc `/tt-mode` delegates that write prose or need judgment.

### 4. Validate

Every real slug written must be in the detected set; `inherit-parent` and `auto` always pass. If a chosen real slug is not available, stop and ask again. A rule pointing at a model the user cannot use breaks every delegation that reads it.

### 5. Write the User Rule

Write through `cursor_dialog` from the `cursor-app-control` MCP. `item: rule`, `scope: user`, `title: ttstack models`. If step 2 found an existing User Rule, `action: update` with its `id`. Otherwise `action: add`. Overwrite the whole content so re-runs stay idempotent.

If `cursor_dialog` is not available, do not write a file instead. Show the mapping and tell the user to paste it as a User Rule titled `ttstack models` under Customize → Rules, or to re-run this skill from Cursor Desktop.

Do not write YAML frontmatter. User Rules are free-form text. Shape:

```
# ttstack model configuration. One line per role. Delete a line to inherit the parent chat model (omit Task `model`).
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model. Alias entries in a panel list still count toward its fan-out.
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

After a successful write, delete `~/.cursor/rules/ttstack-models.mdc` if it exists so a leftover file cannot compete.

### 6. Confirm models

Tell the user the User Rule was written, that it lives on this account (Customize → Rules), and that new local and cloud sessions on this account will see it. Re-running this skill updates the same rule.

### 7. Code host

In the current workspace (the project the user is working in, not this plugin), create `docs/code-host.md` if it is missing. Do not overwrite a file that already exists.

If the file is missing, ask which pull-request host this repo uses. Prefer AskQuestion. Offer the recipes this plugin ships: GitHub (`gh`) or Azure DevOps (Azure DevOps MCP). Do not infer. Do not default. If they name a host this plugin does not ship, say so and stop rather than guessing.

Copy `skills/tt-mode/references/code-host-template.md` to `docs/code-host.md`, then fill it for the chosen host. Do not run `gh` on Azure DevOps.

### 8. Issue tracker

In the current workspace (the project the user is working in, not this plugin), create `docs/issue-tracker.md` if it is missing. Do not overwrite a file that already exists.

If the file is missing, ask which issue tracker this repo uses. Prefer AskQuestion. Offer the recipes this plugin ships: Linear (Linear MCP) or Azure DevOps (Azure DevOps MCP). Do not infer. Do not default. Code host and issue tracker are independent: GitHub PRs plus Linear tickets is a valid mix. If they name a tracker this plugin does not ship, say so and stop rather than guessing.

Copy `skills/tt-mode/references/issue-tracker-template.md` to `docs/issue-tracker.md`, then fill it for the chosen tracker. Do not call Linear tools on a repo whose file names Azure DevOps.

### 9. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill`. On no, move on without pushing.
