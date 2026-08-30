# Azure DevOps work items recipe

Use this when `docs/issue-tracker.md` names Azure DevOps.

Tickets are Azure DevOps work items.

## Discover the MCP

In this session, inspect the Azure DevOps MCP namespace with `GetDynamicTools` and read each needed tool's schema before calling it. Map the jobs below onto those tools. If a job has no tool, stop and say so. Do not guess `az boards` or a REST URL unless `docs/issue-tracker.md` names that command.

## Operations to map

Fill the mapping in `docs/issue-tracker.md` once, from the tools you actually have.

| Job                      | What it must do                                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read an issue            | Return title, description, comments, state, and links for one work item.                                                                           |
| Search issues            | Query by keyword or ID.                                                                                                                            |
| Create an issue          | Create a work item in the named project.                                                                                                           |
| Write a current decision | A short "Current decision" on the work item, or a dated comment. Keep the original request. Never replace the whole description with the override. |
| Add a dated comment      | Post markdown as data. Never interpolate comment text into a shell string.                                                                         |
| Change status            | Set state / board column.                                                                                                                          |
| Link a PR                | Attach the PR as an artifact link.                                                                                                                 |
| Issue URL                | The Azure DevOps work-item URL for this org and project.                                                                                           |
