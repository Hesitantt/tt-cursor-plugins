# Code host

Pull requests are a job. GitHub is one host. Azure DevOps is another. The playbooks name the job. The repo names the host.

## What the agent does

Before any create, stack, status, comment, or merge:

1. Read `docs/code-host.md`.
2. Run the commands and MCP tools that file names.
3. If the file is missing, use the GitHub recipe in `code-hosts/github.md`.

Do not invent a third CLI. Do not run `gh` on a repo whose code-host file says Azure DevOps.

Recipes: [`code-hosts/github.md`](code-hosts/github.md), [`code-hosts/azure-devops.md`](code-hosts/azure-devops.md).
