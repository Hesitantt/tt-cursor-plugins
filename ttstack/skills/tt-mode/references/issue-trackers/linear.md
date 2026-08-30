# Linear recipe

Use this when `docs/issue-tracker.md` names Linear.

MCP is Linear. In this session, inspect the Linear namespace with `GetDynamicTools` and read each needed tool's schema before calling it.

| Job                      | Tool                                                                                                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read an issue            | `get_issue`                                                                                                                                                                                  |
| Search issues            | `list_issues` with `query`                                                                                                                                                                   |
| Create an issue          | `save_issue` (no `id`; `team` required)                                                                                                                                                      |
| Write a current decision | Dated comment via `save_comment`, or a short "Current decision" section via `save_issue` `patch` / append. Keep the original request. Never replace the whole description with the override. |
| Add a dated comment      | `save_comment` with `issueId` and markdown `body`. Literal newlines, not escape sequences.                                                                                                   |
| Change status            | `save_issue` with `id` and `state`                                                                                                                                                           |
| Link a PR                | `save_issue` `links` (append-only)                                                                                                                                                           |
| Issue URL                | from `get_issue` / `list_issues` `url`                                                                                                                                                       |

Fill the mapping in `docs/issue-tracker.md` once, from the tools you actually have. If a job has no tool, stop and say so. If the MCP needs auth, authenticate rather than guessing a REST URL.
