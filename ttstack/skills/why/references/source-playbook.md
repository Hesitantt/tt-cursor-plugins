# Source playbooks

The why skill spawns one investigator per available evidence category, each reading a single source-specific playbook below. The playbooks are concrete examples for common MCPs; adapt them for a different MCP in the same category.

| Category               | Playbook                                               | Example MCP it documents                                |
| ---------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| Source control history | [`code-archaeology.md`](./sources/code-archaeology.md) | git, `gh`                                               |
| Issue / ticket tracker | [`issue-tracker.md`](./sources/issue-tracker.md)       | Named by `docs/issue-tracker.md` in the working repo. |

Cross-cutting:

- [`incident-postmortem.md`](./sources/incident-postmortem.md). Add this if the target code looks defensive (null checks, retry, timeout, rate limit, feature flag, egress guard, OOM handler).
