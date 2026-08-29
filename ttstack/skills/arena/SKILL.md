---
name: arena
description: "Produce N divergent candidates at the same task, pick a base, graft the strongest parts of the losers into it. Sequential in-context by default; parallel subagent fan-out on explicit request. Use for /arena, 'arena this', 'throw it in the arena', or when one attempt at a non-trivial artifact would lock in the wrong shape."
disable-model-invocation: true
---

# Arena

Produce N independent attempts at the same task. Read every candidate end to end. Pick the strongest as the base. Graft the best ideas from the others into it. Verify the synthesized result.

Two modes, both running candidates as subagents so the exploration never pollutes the parent context — each candidate does the work in its own context and reports back the solution, findings, and caveats. **Sequential** (default): one subagent at a time on the inherited model, usually two candidates, with forced divergence between them and no dedicated judge. **Parallel** (opt-in): fan out N subagents on a pool of different models plus a cross-judge. Genuinely independent model families, but N max-effort runners in tokens. Use parallel only when explicitly invoked ("full arena", "parallel arena") or the user granted the budget.

## Start

Open a todolist with one entry per phase before starting. The arena runs autonomously and the list keeps phases from silently disappearing.

1. Frame
2. Candidates
3. Judge
4. Pick
5. Graft
6. Verify

## Phase A: Frame

Every candidate answers the same prompt, so the prompt is the contract. Get it right before writing anything.

1. State the artifact each candidate is producing.
2. Derive the rubric. State what success looks like for *this* task, then turn it into 3-6 concrete gradeable criteria. Concrete: `Adds a --dry-run flag that skips writes`. Vague: `code is correct`. The rubric is the picker's tool in Phase D; candidates only see the task.
3. Pick the runners. Sequential mode: the inherited model for every candidate. Parallel mode: use `arena-runners` from `~/.cursor/rules/ttstack-models.mdc` when present, otherwise default to one each on `claude-fable-5-thinking-max`, `gpt-5.6-sol-max`, `grok-4.6-fast-xhigh`, `claude-opus-5-thinking-xhigh`; spawn more when the arena covers multiple design directions, or the same model N times when the work is generation-bound rather than judgment-sensitive.
4. Assign output paths. Each candidate writes to its own location (a git worktree where possible, otherwise `/tmp/arena-<slug>/candidate-<n>/`). N candidates writing to the same path is shared mutable state and fails the **separate-before-serializing-shared-state** principle skill test.

## Phase B: Candidates

Every candidate subagent gets the task, the path to the shared grounding, its own output path, and instructions to produce the artifact, a short rationale, and a compact report back: the solution's shape, key findings, and caveats. The parent works from the reports and the written packages, not the candidates' exploration.

**Sequential.** Spawn the candidate A subagent and wait for its report. Name A's load-bearing decision — the organizing structure, the owner of the core invariant, the axis the shape hangs on — and forbid it in candidate B's prompt. B must reorganize around a different axis, not vary A's details. Each further candidate forbids all prior organizing decisions. The forbid rule is the anti-anchoring mechanism that replaces model diversity; without it, same-model candidates produce flavors of the same shape and the arena is theater.

**Parallel.** Spawn all N subagents in one message with `run_in_background: true`. If a candidate fails to produce output, proceed with N-1 and note the dropout in the synthesis record.

In both modes the rationale is mandatory. Without it, the picker cannot tell whether a candidate's structure is principled or accidental, which makes Phase E grafting unreliable. Each rationale names the alternatives the candidate considered and what it rejected.

## Phase C: Judge

**Sequential.** Score the candidates against the rubric yourself, criterion by criterion, in Phase D. Spawn a single readonly judge subagent (one cheap/fast model, different family from your own) only when the pick is close or you suspect same-model bias — the judge is the escape hatch, not the default.

**Parallel.** After all Phase B candidates complete, choose one model from the `arena-cross-judge-pool` in `~/.cursor/rules/ttstack-models.mdc` when present. Otherwise use `claude-fable-5-thinking-max`, `gpt-5.6-sol-max`, `grok-4.6-fast-xhigh`, `claude-opus-5-thinking-xhigh`. Prefer a different model family from the parent's. Spawn one readonly judge subagent on that model. It sees the rubric and the candidates by path label, scores each criterion, and recommends a base with rationale. It runs in parallel with the parent's reading in Phase D, not with the candidates themselves. Spawning while candidates are still writing means the judge sees partial or empty outputs and reports them as dropouts.

## Phase D: Pick a base

Read every candidate end to end before picking. Skimming N candidates surfaces only the candidate whose surface looks most familiar.

Score each candidate against the rubric criterion by criterion, not on holistic feel. When a judge ran, compare verdicts. Agreement on the base confirms the pick. Disagreement means one of you is biased or the rubric was ambiguous. Read both rationales before deciding.

Pick the base on which candidate a future maintainer can extend most easily without breaking invariants. Prefer the cleaner boundary or smaller surface area when two feel tied, per the Laziness Protocol.

Record the pick and the reason in a short synthesis note alongside the base artifact, including the judge's verdict when one ran.

## Phase E: Graft

Walk each losing candidate once more and identify what is worth porting into the base. The signal is usually one or two things per candidate, not most of it.

Fold each graft in by hand, per the **redesign-from-first-principles** principle skill. Don't paste mechanically. The result has to remain coherent under one mental model.

Record what was grafted, from which candidate, and what was rejected and why. The rejection notes are the highest-signal part of the record. Future readers learn from what you considered and dropped, not just what you kept.

When parallel candidates converge on the same shape, that is a strong agreement signal. Note the convergence in the record and ship the consensus shape. No graft is needed. Sequential candidates can't converge — the forbid rule prevents it — but a forced-divergent candidate losing on every criterion is the equivalent signal that the base's shape was right. When candidates wildly diverge in parallel mode, Phase A was under-specified. Reframe and re-run rather than averaging the divergence.

## Phase F: Verify

The synthesized artifact has to hold up under the same scrutiny as any other output, per the **prove-it-works** principle skill. The arena does not earn you a pass.

If verification surfaces a problem the arena did not catch, either Phase A was wrong (re-frame and re-run) or one candidate caught it and you missed the graft (go back to Phase E). Don't paper over.

## Outputs

One synthesized artifact. One short synthesis note alongside, naming the base, the grafts (with source candidate), the rejections, the dropouts if any, and the verification result.
