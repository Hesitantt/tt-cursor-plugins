# Issue tracker: <Linear | Azure DevOps | other>

Copy this file to `docs/issue-tracker.md` and fill every slot. Agents read that file before they create, update, comment on, or close a ticket.

**Tracker.** <name>
**Recipe.** `references/issue-trackers/<linear|azure-devops>.md` in the tt-mode skill
**MCP.** <namespace, and how to discover tools>

## Conventions

- The issue tracker tracks work. It does not freeze product chrome.
- When placement or UX is overridden in chat or in a prototype verdict, write that override back into the issue (a short "Current decision" section, or a dated comment) so the ticket matches the product.
- Keep the original request. Do not rewrite the whole body after every sketch.

## Operations

Fill each line with the exact MCP tool or command for this repo. Leave none blank.

| Job | This repo |
| --- | --- |
| Read an issue | |
| Search issues | |
| Create an issue | |
| Write a current decision (keep original request) | |
| Add a dated comment | |
| Change status | |
| Link a PR | |
| Issue URL shape | |

## Do not

- Treat the original description as frozen chrome.
- Rewrite the whole PRD after every sketch.
- Call a tracker MCP this file does not name.
- Spam a comment on every tweak.
