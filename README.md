# ttstack

> [!NOTE]
> Fork of [Lauren Tan](https://github.com/poteto)'s [pstack](https://github.com/cursor/plugins/tree/main/pstack). This repository is not upstream.

### Install

In Cursor, open Customize. Click **+ Add**, then **From GitHub Repository**. Paste this repository's URL.

To load a local clone instead, use **From Local Repository** and pick the folder.

### Pick models and project files

Run [`/setup-ttstack`](skills/setup-ttstack/SKILL.md). It detects the models you can use and writes `~/.cursor/rules/ttstack-models.mdc`. That rule maps each role to a model. Skills read it and fall back to their defaults when a line is missing.

Re-run the skill to change a role. Use `inherit-parent` or `auto` to keep a role on the parent chat model.

The same run writes `docs/code-host.md` in the project you work in, if it is missing, from [`skills/tt-mode/references/code-host-template.md`](skills/tt-mode/references/code-host-template.md).

GitHub needs `gh`. Azure DevOps needs the Azure DevOps MCP. Do not run `gh` on Azure DevOps. If `docs/code-host.md` is missing, agents use GitHub and `gh`.

### Ground type-system-discipline

[type-system-discipline](skills/principle-type-system-discipline/SKILL.md) is language-agnostic. It needs a syntax skill for each typed language you work in. That skill maps the principle onto the language's types: unions, brands, exhaustiveness, parse at the boundary.

This plugin ships one: [`typescript-best-practices`](skills/typescript-best-practices/SKILL.md). If you write TypeScript, you already have it.

If you write another typed language, add a skill in that same shape. Apply the principle first, then the syntax for that language. Use [`typescript-best-practices`](skills/typescript-best-practices/SKILL.md) as the template.

## usage

use [`/tt-mode`](./skills/tt-mode/SKILL.md) at the start of a task. it reads your request, picks from a set of playbooks, and runs the other skills as the steps need them.

### just use [`/tt-mode`](./skills/tt-mode/SKILL.md)

this skill is the main shortcut. i use it whenever i need the agent to do rigorous engineering work. it comes with a bunch of playbooks:

```
/tt-mode this pr has a subtle bug where the scroll drifts every 750ms even when idle. repro
first, then fix and verify.
```

```
/tt-mode i'm going to bed. land the stack even if ci flakes. i want everything merged by
morning.
```

when invoked it:

1. opens a todo list. the first item is reading the inline principles index in the skill.
2. matches your task to a [playbook](./skills/tt-mode/playbooks/) and copies the steps in verbatim.
3. routes to the other skills as the steps fire.
4. writes unslopped replies framed for the consumer and the maintainer.

the full rules and playbooks live in [`skills/tt-mode/SKILL.md`](./skills/tt-mode/SKILL.md).

[`/tt-mode`](./skills/tt-mode/SKILL.md) is also a sticky mode: once entered it stays on across turns, applying itself when a playbook matches or the task needs rigor and staying out of the way otherwise. opt out any time by saying so.

[`/tt-mode`](./skills/tt-mode/SKILL.md) works extremely well with cursor's `/loop` command. you can make cursor work for many hours without sacrificing rigor.

## skills

[`/tt-mode`](./skills/tt-mode/SKILL.md) runs most of these for you when a step needs them (`how`, `why`, `architect`, `arena`, `swarm`, `interrogate`, `unslop`, `no-comments`, `technical-writing`, `tdd`, and the principles). the table below is for when you want one directly:

```
/how do we cancel runs? do we have an n+1 when we look up every run to cancel?
```

```
/interrogate review this pr.
```

<details>
<summary>all skills</summary>

| skill                                                                           | use it when                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`/tt-mode`](./skills/tt-mode/SKILL.md)                                         | default entry point for any non-trivial task.                                                                                                                                                                                                                     |
| [`/how`](./skills/how/SKILL.md)                                                 | you want a walkthrough of how a subsystem works.                                                                                                                                                                                                                  |
| [`/why`](./skills/why/SKILL.md)                                                 | you want to know why something was built this way. discovers available MCPs at run time and queries each evidence category in parallel (source control, issue tracker, long-form docs, real-time chat, infra observability, error tracking, analytics warehouse). |
| [`/architect`](./skills/architect/SKILL.md)                                     | you're about to write code that crosses a function boundary and want the caller's usage, types, and module shape settled first.                                                                                                                                   |
| [`/arena`](./skills/arena/SKILL.md)                                             | you want N parallel attempts at the same thing, then to grab the best parts of each.                                                                                                                                                                              |
| [`/swarm`](./skills/swarm/SKILL.md)                                             | you want N parallel workers across different slices or races, then one aggregated report.                                                                                                                                                                         |
| [`/interrogate`](./skills/interrogate/SKILL.md)                                 | you have a diff and want several different models to try to break it, including a strict code-quality lens.                                                                                                                                                       |
| [`/setup-ttstack`](./skills/setup-ttstack/SKILL.md)                             | you want to pick which models ttstack uses per role. detects your models and writes a config rule.                                                                                                                                                                |
| [`/reflect`](./skills/reflect/SKILL.md)                                         | a long task landed and you want the recipe captured as a skill edit.                                                                                                                                                                                              |
| [`/teach`](./skills/teach/SKILL.md)                                             | you want to actually understand a change or subsystem, not just have it summarized. runs how + why and weaves one plain explanation, built up diagram by diagram.                                                                                                 |
| [`/tdd`](./skills/tdd/SKILL.md)                                                 | you're fixing a bug and there's a cheap local test path. write the failing test first, then the fix.                                                                                                                                                              |
| [`/no-comments`](./skills/no-comments/SKILL.md)                                 | strip comments before review; spawns Comment Sicko, fixes accepted findings, offers encodings for claimed constraints.                                                                                                                                            |
| [`/deslop`](./skills/deslop/SKILL.md)                                           | copied from [cursor-team-kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit). strip AI slop from the diff before commit.                                                                                                                            |
| [`/control-cli`](./skills/control-cli/SKILL.md)                                 | copied from [cursor-team-kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit). drive a local CLI or TUI for proof.                                                                                                                                   |
| [`/control-ui`](./skills/control-ui/SKILL.md)                                   | copied from [cursor-team-kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit). drive a local browser, IDE, or Electron UI for proof.                                                                                                                 |
| [`/typescript-best-practices`](./skills/typescript-best-practices/SKILL.md)     | you're reading or editing typescript. grounds the type-system-discipline principle in syntax.                                                                                                                                                                     |
| [`/figure-it-out`](./skills/figure-it-out/SKILL.md)                             | no bundled playbook fits. designs a rigorous, auditable playbook for the task.                                                                                                                                                                                    |
| [`/show-me-your-work`](./skills/show-me-your-work/SKILL.md)                     | you want a reviewable decision trail. logs decisions to a tsv you can commit.                                                                                                                                                                                     |
| [`/create-verification-skill`](./skills/create-verification-skill/SKILL.md)     | your project has no scripted way to prove app behavior. generates a project-local verify skill with a feature map, for any language or platform.                                                                                                                  |
| [`/maintain-verification-skill`](./skills/maintain-verification-skill/SKILL.md) | your verify skill's feature map has drifted from the app. source wave + one live pass, at most one PR of proven corrections.                                                                                                                                      |
| [`/verify-this`](./skills/verify-this/SKILL.md)                                 | you want a claim proven with baseline vs treatment evidence. returns VERIFIED, NOT VERIFIED, or INCONCLUSIVE.                                                                                                                                                     |
| [`/unslop`](./skills/unslop/SKILL.md)                                           | you're cleaning up writing. removes AI tells.                                                                                                                                                                                                                     |
| [`/technical-writing`](./skills/technical-writing/SKILL.md)                     | layered doc standard (Diátaxis + Google developer style + STE + Global English) for docs, RFCs, readmes, PR descriptions, commit messages.                                                                                                                        |

</details>

### examples

mostly i type [`/tt-mode`](./skills/tt-mode/SKILL.md) at the start of a task and let it route to a playbook. the other skills fire as the steps need them. a few i reach for directly.

<details>
<summary>all the examples</summary>

```
bug fix:           /tt-mode this pr has a subtle bug where the scroll drifts every 750ms even
                   when idle. repro first, then fix and verify.
perf:              /tt-mode a big list takes a second or two to load even though we virtualize.
                   run a cpu trace and tell me why.
feature:           /tt-mode build a small feature behind a feature flag. verify it really works.
prototype:         /tt-mode build two prototypes of the markdown renderer so we can compare.
                   spawn an agent for each.
multi-phase:       /tt-mode open source these skills as a plugin. nothing internal leaks, work
                   in a temp dir, show me the dependency graph first.
overnight run:     /tt-mode i'm going to bed. land the stack even if ci flakes. i want
                   everything merged by morning.
babysit:           /tt-mode check on pr 123. anything outstanding?
visual parity:     /tt-mode the row spacing is too tall when this flag is on. the second image
                   is correct. repro and fix until it matches.
figure it out:     /tt-mode i'm stepping away. migrate every caller from the synchronous store
                   to the new async one, keeping behavior identical. i want to trust it was done
                   right when i'm back.
how:               /how do we cancel runs? do we have an n+1 when we look up every run to cancel?
why:               /why is this feature flag not on yet?
architect:         design this instrumentation to be high signal with no false positives. /architect
                   this first.
arena:             /arena take my prompt to the arena verbatim. i want to compare their proposals
                   with yours.
swarm:             /swarm check every package under packages/ against its check.sh. one worker per
                   package. one report.
interrogate:       /interrogate review this pr.
tdd:               /tdd implement
unslop:            can we unslop and tighten the new changes?
reflect:           /reflect that took too long. capture what we learned so the next run doesn't
                   repeat it.
show-me-your-work: /show-me-your-work keep a decision trail i can review when i'm back.
verify-this:       /verify-this the list no longer jumps when a row is added.
```

</details>

## the `poteto-agent` and Comment Sicko subagents

ttstack also ships a subagent that runs my style end to end. spawn it from a parent agent via [`subagent_type: "poteto-agent"`](./agents/poteto-agent.md). it reads `tt-mode` in full, including its inline principles index, before doing any work. substituting `generalPurpose` skips that read and drifts.

[`/tt-mode`](./skills/tt-mode/SKILL.md) and [`subagent_type: "poteto-agent"`](./agents/poteto-agent.md) route through the same wrapper.

ttstack also ships [Comment Sicko](./agents/comment-sicko.md), a read-only comment reviewer available as `subagent_type: "Comment Sicko"`. usually invoke it through [`/no-comments`](./skills/no-comments/SKILL.md), not directly.

## principles

twenty-one short skills, one principle each. `tt-mode` indexes them inline and reads that index at task start. the standalone files are there so other skills can reference a principle by name, and so the index can point at the full rule for each.

<details>
<summary>all twenty-one principles</summary>

| principle                                                                                                        | group        | rule                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [laziness-protocol](./skills/principle-laziness-protocol/SKILL.md)                                               | core         | Bias toward deletion and the smallest change that solves the problem.                                                                                                                                                                                                      |
| [foundational-thinking](./skills/principle-foundational-thinking/SKILL.md)                                       | core         | Apply before writing logic: choosing core types and data structures, sequencing scaffold-vs-feature work, asking what concurrent actors share. Get the data structures right so downstream code becomes obvious.                                                           |
| [redesign-from-first-principles](./skills/principle-redesign-from-first-principles/SKILL.md)                     | core         | Redesign as if the requirement had been a foundational assumption from day one, instead of bolting it on.                                                                                                                                                                  |
| [subtract-before-you-add](./skills/principle-subtract-before-you-add/SKILL.md)                                   | core         | Remove dead weight, redundant validators, and stub references first, then build on the simpler base.                                                                                                                                                                       |
| [minimize-reader-load](./skills/principle-minimize-reader-load/SKILL.md)                                         | core         | Count layers between question and answer, and hidden state in the reader's head; collapse one-caller wrappers and shrink mutable scope.                                                                                                                                    |
| [outcome-oriented-execution](./skills/principle-outcome-oriented-execution/SKILL.md)                             | core         | Apply during planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture; don't preserve smooth intermediate states with throwaway compatibility code.                                                                             |
| [experience-first](./skills/principle-experience-first/SKILL.md)                                                 | core         | Choose user delight over implementation convenience; ship fewer polished features over more rough ones.                                                                                                                                                                    |
| [exhaust-the-design-space](./skills/principle-exhaust-the-design-space/SKILL.md)                                 | core         | Build 2-3 competing prototypes and compare side by side before committing.                                                                                                                                                                                                 |
| [build-the-lever](./skills/principle-build-the-lever/SKILL.md)                                                   | core         | Apply to any non-trivial work, not just bulk work: edits, migrations, analyses, checks. Build the tool that does it or proves it (codemod, script, generator, or a skill your subagents follow) instead of working by hand. The tool is the artifact a reviewer can rerun. |
| [model-the-domain](./skills/principle-model-the-domain/SKILL.md)                                                 | architecture | Encode the domain in a structure instead of scattered conditionals.                                                                                                                                                                                                        |
| [boundary-discipline](./skills/principle-boundary-discipline/SKILL.md)                                           | architecture | Concentrate guards at system boundaries (CLI, config, network, external APIs); trust internal types and keep business logic in pure functions.                                                                                                                             |
| [type-system-discipline](./skills/principle-type-system-discipline/SKILL.md)                                     | architecture | Make illegal states unrepresentable, brand semantic primitives, parse external data at boundaries, refuse to lie to the compiler, exhaust variants, derive from authoritative schemas.                                                                                     |
| [make-operations-idempotent](./skills/principle-make-operations-idempotent/SKILL.md)                             | architecture | Converge to the same end state regardless of partial prior runs.                                                                                                                                                                                                           |
| [migrate-callers-then-delete-legacy-apis](./skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md)   | architecture | Migrate callers and delete the old API in the same wave instead of preserving compatibility layers.                                                                                                                                                                        |
| [separate-before-serializing-shared-state](./skills/principle-separate-before-serializing-shared-state/SKILL.md) | architecture | Eliminate the sharing first; serialize structurally only when one shared writer is a real invariant.                                                                                                                                                                       |
| [prove-it-works](./skills/principle-prove-it-works/SKILL.md)                                                     | verification | Apply after completing a task, before declaring done. Verify against the real artifact (run the feature, read the actual value, inspect the diff), not a proxy, self-report, or 'it compiles.'.                                                                            |
| [fix-root-causes](./skills/principle-fix-root-causes/SKILL.md)                                                   | verification | Trace each symptom to its root cause and fix it there; reproduce first, ask why until you reach it, resist nil-check guards that silence crashes.                                                                                                                          |
| [sequence-verifiable-units](./skills/principle-sequence-verifiable-units/SKILL.md)                               | verification | Apply to multi-step work (sweeps, migrations, runs of similar edits) and to how you stack commits and PRs. Break work into small units that each end in a verifiable state, check each before the next, and order delivery so the sequence proves itself to a reviewer.    |
| [guard-the-context-window](./skills/principle-guard-the-context-window/SKILL.md)                                 | delegation   | Route bulk to subagents; keep summaries in the main thread, not raw payloads.                                                                                                                                                                                              |
| [never-block-on-the-human](./skills/principle-never-block-on-the-human/SKILL.md)                                 | delegation   | Proceed, present the result, let the human course-correct after the fact; reserve confirmation for irreversible actions.                                                                                                                                                   |
| [encode-lessons-in-structure](./skills/principle-encode-lessons-in-structure/SKILL.md)                           | meta         | Encode the rule as a lint, metadata flag, runtime check, or script instead of more text.                                                                                                                                                                                   |

</details>
