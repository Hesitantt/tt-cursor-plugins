# Azure DevOps recipe

Use this when `docs/code-host.md` names Azure DevOps.

PRs are Azure DevOps pull requests. There is no `gh` here. Do not run `watch-pr` or `orch frontier set`. Both speak GitHub.

## Discover the MCP

In this session, inspect the Azure DevOps MCP namespace with `GetDynamicTools` and read each needed tool's schema before calling it. Map the jobs below onto those tools. If a job has no tool, stop and say so. Do not guess `az repos` or a REST URL unless `docs/code-host.md` names that command.

## Operations to map

Fill the mapping in `docs/code-host.md` once, from the tools you actually have.

| Job | What it must do |
| --- | --- |
| Create a PR, ready, not draft | Open a PR targeting trunk or the parent branch. Not a draft. |
| Stack onto a parent branch | Target the parent branch, not trunk, so the host keeps order. |
| Mark a draft ready | Publish a draft PR. |
| View mergeability and checks | Return conflicts, policy status, and build result for the current head. |
| List review threads | Threads still open on that PR. |
| Reply on a thread | Post the body as data. Never interpolate comment text into a shell string. |
| Squash-merge | Complete the PR with squash into the target branch. |
| Disable auto-complete on a stacked child | Auto-complete on a child whose parent is not protected trunk collapses the stack. Leave it off. |
| List open PRs and target branches | Enough to walk parent chains for the frontier. |
| PR URL | The Azure DevOps pull-request URL for this org and project. |

## Watcher

Babysit `drive` and `background` poll the mergeability tool under `/loop`. `check` is one poll and a report. Map the host's "can complete" state to merge-ready. Map conflicts, failing builds, and open threads onto babysit's order: conflicts, then threads, then CI.

## Frontier

Walk open PRs by target branch the same way GitHub walks `--base`. Lowest unmerged PR is the frontier. Recompute after every complete and retarget. The stacker rebases onto the parent branch and changes the PR's target branch through the MCP. Workers still do not rebase or force-push.
