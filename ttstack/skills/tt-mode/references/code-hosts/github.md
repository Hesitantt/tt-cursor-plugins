# GitHub recipe

Use this when `docs/code-host.md` names GitHub, or when that file is missing.

CLI is `gh`. Do not switch to the GitHub MCP when `gh` already covers the job.

| Job | Command |
| --- | --- |
| Create a PR, ready, not draft | `gh pr create` with `draft: false` on the creation call |
| Stack onto a parent branch | `gh pr create --base <parent-branch>` |
| Mark a draft ready | `gh pr ready <number>` |
| View mergeability and checks | `gh pr view <number> --json mergeable,mergeStateStatus,statusCheckRollup` |
| List review threads | via `watch-pr`, or `gh api` graphql for review threads |
| Reply on a thread | `gh api` with the body as data (`-f body=@file` or a JSON payload). Never interpolate comment text into a shell string |
| Squash-merge | `gh pr merge --squash` |
| Disable auto-merge on a stacked child | `gh pr merge <n> --disable-auto` |
| List open PRs and target branches | `gh pr list --state open --json number,headRefName,baseRefName,state,headRefOid` |
| PR URL | `https://github.com/<owner>/<repo>/pull/<number>` |

## Watcher

`scripts/watch-pr/watch-pr` in the tt-mode skill directory (the folder that contains that skill's `SKILL.md`).

JSON by default. `--pretty` for humans. `--status-only` for babysit `check` mode. The bare command polls until a terminal verdict (`drive`). Rearm after every push wave. Trust `READY` / blocker class, not a green check list.

## Frontier

`orch frontier set --repo <dir>` from the tt-mode skill directory (`bun scripts/orch/orch.ts frontier set --repo <dir>`). Walks GitHub `--base` chains. Recompute after every merge and retarget.

## Stacks

Retarget with `gh pr edit --base <parent>`. Never enable GitHub auto-merge on a child that targets an unprotected parent branch. That merges the child into the parent at once and collapses the stack.
