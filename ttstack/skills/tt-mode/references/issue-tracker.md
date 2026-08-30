# Issue tracker

Tickets are a job. Linear is one tracker. Azure DevOps work items are another. The playbooks name the job. The repo names the tracker.

## What the agent does

Before any create, update, comment, status change, or close:

1. Read `docs/issue-tracker.md`.
2. Run the MCP tools that file names.
3. If the file is missing, still apply the Conventions in `issue-tracker-template.md` (the tracker does not freeze product chrome). Do not call a tracker MCP until the file names one.

Do not invent a third CLI. Do not call Linear tools on a repo whose issue-tracker file says Azure DevOps.

Recipes: [`issue-trackers/linear.md`](issue-trackers/linear.md), [`issue-trackers/azure-devops.md`](issue-trackers/azure-devops.md).
