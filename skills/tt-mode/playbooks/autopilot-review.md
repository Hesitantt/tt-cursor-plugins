### Autopilot-review

**You own the queue, never the landing. Build and verify with full autonomy, then hand the operator merge-ready PRs she reviews and merges herself.** For "get them merge-ready", "I'll land them", "don't merge". Sibling of **Autopilot-full**. Same owner loop and swarm gate. A clean verdict does not merge.

1. **Run the owner loop from Autopilot-full through mergeable.** One cloud owner per PR builds, opens the PR per **Opening a PR**, proves the change, and babysits to green per **Babysit**. No Graphite.
2. **Audit on the same 30-minute `/loop` tick.** Re-read this playbook and the armed `/goal`. Side effects only. Replace a silent owner in that tick.
3. **Hold the operator gates.** A request to state the plan is not a go. On explicit go, arm a `/goal`. On stop, every owner takes a zero-writes hold.
4. **Verify at MERGE-READY.** The owner reports MERGE-READY with the exact head SHA. The root swarm-verifies that SHA per the **swarm** skill: gates, live floor via `control-ui` or `control-cli`, receipts-and-diff audit that distrusts the PR body. Findings go back. Nothing is presented unverified.
5. **Leave the PR open.** No squash-merge, no auto-merge. Independent PRs target `main`. A later PR that depends on this one targets this branch so the host keeps the order. The operator merges bottom-up.
6. **Deliver the queue.** Each PR carries its swarm verdict in the body or a comment.

**Choosing between the autopilots.** Autopilot-full when PRs are independent and landing authority is granted. Autopilot-review when the operator wants to check first, or the work is sequenced.

**Reply:** PR links, a one-line verdict per PR, and anything parked with the reason.
