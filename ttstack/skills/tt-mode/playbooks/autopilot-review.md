### Autopilot-review

**You own the queue, never the landing. Build and verify with full autonomy, then hand the operator merge-ready PRs to review and merge.** For "get them merge-ready", "I'll land them", "don't merge". Sibling of **Autopilot-full**. Same owner loop and swarm gate. A clean verdict does not merge.

1. **Run the owner loop from Autopilot-full through mergeable.** One cloud owner per PR builds, opens the PR per **Opening a PR**, proves the change, and babysits to green per **Babysit**. After the PR is open, the owner pushes its branch again after every verifiable unit (hooks on, a WIP commit is fine). No Graphite. Owners keep the `children.tsv` of Autopilot-full step 2.
2. **Audit on the same hourly `/loop 1h` tick, in both local and cloud roots.** Do not use a separate cloud sleeper. Re-read this playbook and the plan file the prompt names. With no plan file, re-read the queue and the done condition from the prompt. Side effects only. Treat an errored lane, or one that outruns its budget with no side effect, as stuck. Probe all subagents and end the tick per Autopilot-full step 6.
3. **Hold the operator gates.** A request to state the plan is not a go. On explicit go, arm `/loop 1h` for the audit tick. The prompt names the plan path, who merges, and the done condition. A run with no plan file names the queue in place of the path. On stop, every owner takes a zero-writes hold.
4. **Verify each round.** The owner reports the code-ready head SHA once the shipped code is final, and MERGE-READY with the exact head SHA when its loop is green. The root swarm-verifies each round per Autopilot-full step 4. Findings go back. Nothing is presented unverified.
5. **Leave the PR open.** No squash-merge, no auto-merge. Independent PRs target `main`. A later PR that depends on this one targets this branch so the host keeps the order. The operator merges bottom-up.
6. **Deliver the queue.** Each PR carries its swarm verdict in the body or a comment.

**Choosing between the autopilots.** Autopilot-full when PRs are independent and landing authority is granted. Autopilot-review when the operator wants to check first, or the work is sequenced.

**Reply:** PR links, a one-line verdict per PR, and anything parked with the reason.
