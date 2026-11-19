# ttstack in Claude Code

ttstack skills use Cursor names. In Claude Code, read this file once per session, then map each Cursor name in a skill with the tables below. `<ttstack>` means the folder that holds `skills/` and `docs/`. If a Cursor field has no row, drop it and say so. Never pass a field or value the tool schema rejects.

Claude Code runs only Claude models. Every role resolves to a Claude model here, even where the Cursor default is Grok.

## Tools

| Cursor | Claude Code |
| --- | --- |
| `Task` | `Agent` |
| `AskQuestion` | `AskUserQuestion`. In `-p` mode it is absent, so ask in plain text. |
| Open a todolist, or copy steps into the todolist tool | Use the session's todo tool (`TodoWrite`, or `TaskCreate` and `TaskUpdate`). Without one, keep the list in your reply and update it at each phase. |
| Run another ttstack skill (`/name` or "the **name** skill") | `Read` `<ttstack>/skills/<name>/SKILL.md` and follow it. The `Skill` tool refuses most ttstack skills because they set `disable-model-invocation`. When you tell the user to type it, write `/ttstack:<name>`. |
| `/loop <interval> <prompt>` | The same command. It is built into Claude Code too. |
| `Grep`, `Glob` | `Bash` with `rg` when the session has no `Grep` or `Glob`. |

## Subagent fields

| Cursor | Claude Code |
| --- | --- |
| `subagent_type: generalPurpose` | `subagent_type: "general-purpose"` |
| `poteto-agent`, `comment-sicko` | `ttstack:poteto-agent`, `ttstack:comment-sicko` |
| `is_background: true` in an agent file | Ignored. Subagents run in the background by default. |
| `readonly: true` | `subagent_type: "Explore"`. It keeps `Bash`, so the brief also says "do not edit files", and you check `git status` afterward. |
| `readonly: false` | `general-purpose`. It keeps the session's MCP servers. |
| `environment: "cloud"` | `isolation: "worktree"`. Name the branch or commit the worker checks out. |
| `environment: "local"` | Omit. |
| `cloud_base_branch: <b>` | Tell the worker to check out `<b>` first. |
| `run_in_background: true` | Omit. Subagents run in the background by default and notify you when they finish. |
| `resume` | Spawn a new agent and paste the earlier result into its brief. |
| `file_attachments` | List the paths in the brief. |

When you spawn `ttstack:poteto-agent`, pass the absolute path of `<ttstack>/skills/tt-mode/SKILL.md` in the brief, and tell it to read this adapter too.

## Models

| Cursor | Claude Code |
| --- | --- |
| `claude-<family>-<version>-<effort>[-fast]`, such as `claude-opus-5-5-high` | `model: "opus"` and `effort: "high"`. `model` takes only `opus`, `sonnet`, `haiku`, `fable`. Drop `-fast`. |
| A `grok-*`, `gpt-*`, or other non-Claude slug as a model value | Use that role's value from the Claude defaults table under setup-ttstack. For a role with no row there, omit `model` and say so. A model name quoted as data, such as in a code example, stays as written. |
| `auto` or `inherit-parent` | Omit `model`. |
| The User Rule titled `ttstack models`, Customize → Rules, and the older `~/.cursor/rules/ttstack-models.mdc` | `~/.claude/rules/ttstack-models.md`. Claude Code loads it into every new session, so its role lines are already in context. If they are not, read the file. If the file or the role's line is missing, omit `model`. |
| A role value `<model> <effort>`, such as `opus high` | `model: "opus"` and `effort: "high"`. |

## setup-ttstack

Claude Code loads every `.md` file in `~/.claude/rules/` into each new session, so `setup-ttstack` writes its rule there instead of a Cursor User Rule. Follow its steps with these changes:

- Detect. The detected models are the `model` values that the `Agent` tool schema lists, each with an effort from its `effort` values. Write a real model as `<model> <effort>`, such as `opus high`.
- Load. Read `~/.claude/rules/ttstack-models.md` if it exists. Skip the `cursor_dialog` and `cursor-app-control` steps and the `.mdc` fallback. Otherwise start from the Claude defaults below, not the Cursor seed.
- Write. Write `~/.claude/rules/ttstack-models.md` with no frontmatter: the two comment lines from step 5, then one line per role. Overwrite the whole file. Never put the role lines in `CLAUDE.md` or `AGENTS.md`. Skip the step that deletes the `.mdc` file.
- Confirm. Tell the user the file is on this machine only. A Claude Code cloud session does not see it, so there every role falls back to the session model unless the user adds the file to that environment.
- Steps 7 to 9, code host, issue tracker, and verification skill, run unchanged.

Claude defaults. Panels mix models so their reviewers do not all share one model's blind spots.

| Role | Claude default |
| --- | --- |
| `feature`, `refactoring`, `bug-fix`, `perf-issue`, `hillclimb` | `opus high` |
| `judgment-and-prose`, `how-explainer`, `why-synthesizer`, `reflect-tooling`, `reflect-judgment` | `opus high` |
| `how-explorer`, `why-investigators`, `swarm-workers`, `comment-sicko` | `sonnet high` |
| `arena-runners`, `architect-runners` | `opus high, sonnet high` |
| `arena-cross-judge-pool`, `interrogate-reviewers` | `opus high, fable high` |
| `maintain-source-readers` | `inherit-parent` |

`arena-cross-judge-pool` prefers a different model family from the parent's. In Claude Code every model is Claude, so pick a model different from the parent's model instead.

## Paths

| Cursor | Claude Code |
| --- | --- |
| `.cursor/skills/`, `~/.cursor/skills/` | `.claude/skills/`, `~/.claude/skills/` |
| `~/.cursor/plugins/`, `.cursor-plugin/plugin.json` | `~/.claude/plugins/`, `.claude-plugin/plugin.json` |
| `.cursor/rules/*.mdc`, always-applied rules | `CLAUDE.md`, or `AGENTS.md` when no `CLAUDE.md` exists. Claude Code never reads `.mdc` files. The model rule is the exception. See Models. |
| `https://github.com/Hesitantt/tt-cursor-plugins/blob/main/ttstack/<path>` | `<ttstack>/<path>` when that file exists. Read the local copy and never fetch it. Give the user the URL when they need a link. |
| Transcripts in `~/.cursor/projects/<slug>/agent-transcripts/` | `~/.claude/projects/<slug>/<session>.jsonl`. The slug is the workspace path with each `/` and `.` changed to `-`, so `/Users/you/proj` is `-Users-you-proj`. The newest `.jsonl` directly in that folder is the current session. Its `<session>/subagents/` folder holds subagent transcripts. Read only this workspace's folder. |

## Cursor-only features

Claude Code has no Cursor Automations, Bugbot, Cursor cloud agents, or built-in PR tool. When a step needs one, put one line in your reply, `Skipped in Claude Code: <step>. <reason>.`, then go on to the next step. Do not stop, ask, or retry. When a later step needs what the skipped step made, such as a URL or a key, leave a placeholder and name it in the line.

| Cursor | Claude Code |
| --- | --- |
| Cursor Automations | Skip with the line. |
| Bugbot | Bugbot comments on a GitHub PR are ordinary review threads, so triage them with the forge command that the step gives. Skip a step that starts, waits for, or configures Bugbot when the PR has no Bugbot check or comment. |
| Cursor cloud agents, and "local and cloud roots" | `environment: "cloud"` maps to a worktree, as in Subagent fields. Run a "both local and cloud roots" step in the local root only. Skip a step that needs the cloud agent itself, such as its dashboard status or its own machine. |
| A built-in PR tool | Use the forge command that the step gives, such as `gh pr create`. That is not a skip, so write no line. |
