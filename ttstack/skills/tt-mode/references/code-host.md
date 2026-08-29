# Code host

Pull requests are a job. GitHub is one host. Azure DevOps is another. The playbooks name the job. The repo names the host.

Models go in a user-global rule because they follow you. Hosting follows the repo, so it lives in the project.

## What the agent does

Before any create, stack, status, comment, or merge:

1. Read `docs/code-host.md`.
2. Run the commands and MCP tools that file names.
3. If the file is missing, use the GitHub recipe in `code-hosts/github.md`.

Do not invent a third CLI. Do not run `gh` on a repo whose code-host file says Azure DevOps.

## What the plugin ships

| File | Role |
| --- | --- |
| `code-host-template.md` | Copy to `docs/code-host.md` and fill. |
| `code-hosts/github.md` | Concrete GitHub / `gh` recipe. |
| `code-hosts/azure-devops.md` | Azure DevOps via the installed MCP. |

`watch-pr` and `orch frontier set` speak GitHub. They stay GitHub-only. An Azure repo's code-host file must not point at them. Babysit and Orchestrate then poll through the MCP that file names.

Helpers live in the tt-mode skill directory: the folder that contains that skill's `SKILL.md`. After a plugin install that is under `~/.cursor/plugins/`. In this plugin repo it is `skills/tt-mode/`. Run `scripts/watch-pr/watch-pr` and `bun scripts/orch/orch.ts` from that directory. Do not look in the app repo's `.cursor/skills/`.

## Adding a host

Copy the template. Fill every operation. Point `recipe` at a file under `code-hosts/` or write the commands inline. If the host has no MCP yet, say so and stop rather than guessing `az` or a REST URL.
