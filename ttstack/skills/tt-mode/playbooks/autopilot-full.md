### Autopilot-full

**You own the verdicts, never the PRs. One owner runs each PR from build to merge. Nothing merges without your clean swarm verdict.** For "autopilot this queue", "full autopilot", "merge them yourself". Independent PRs with landing authority granted. Orchestrate is the standing-program shape whose coordinator lands work and whose workers never merge. Here each PR's owner carries the lifecycle through the merge, and the root keeps verification and audits.

1. **Mark the operator's items and wait for go.** Items the operator names stay hers. She reviews and she clicks. When she asks for the protocol or the plan, deliver it and stop. Execution starts only on her explicit go. On that go, arm a `/goal` with the program objective.
2. **Spawn one owner per PR.** One cloud agent per PR builds the change, opens the PR per **Opening a PR**, proves it on the real surface (the **prove-it-works** principle skill), and babysits to green per **Babysit** (`playbooks/babysit.md`). No Graphite. The owner does not merge until step 5.
3. **Run owners in parallel. Never stack.** Self-contained PRs branch off `main`. Overlapping work serializes. Sequenced work is merge-then-branch. One writer per branch (the **separate-before-serializing-shared-state** principle skill).
4. **Swarm-verify every merge-ready head.** At the owner's merge-ready head SHA, fan out per the **swarm** skill. Lanes re-run the gates at that SHA, prove load-bearing behavior live via `control-ui` or `control-cli`, and audit receipts plus the diff while distrusting the PR body. The live lane is the floor. Findings go back to the owner. A new head gets a fresh swarm.
5. **On a clean verdict the owner merges.** Squash-merge with the host's squash-merge command from a head still on current trunk. If trunk moved, rebase, then re-run step 4. The operator's autonomy grant plus the root's clean verdict is the merge authorization. Operator-named items stop at merge-ready. The owner then takes the next self-contained item.
6. **Run the root audit tick.** Roughly every 30 minutes, via `/loop`. Re-read this playbook and the armed `/goal`. Count only side effects as progress (commits, pushes, PR or check deltas). A silent owner gets stood down and replaced in that tick.
7. **Stand down on the operator's stop.** A hold reaches every owner as a zero-writes order at once.

**Reply:** the queue with each PR's owner, state, and head SHA; each verdict; what merged; open operator gates; where the decision trails live.
