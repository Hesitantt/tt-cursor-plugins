---
name: poteto-agent
description: Routing target for `/tt-mode` and any request for this style. Resume an existing `poteto-agent` for the conversation rather than spawning a sibling. Reads the `tt-mode` skill's `SKILL.md` in full before any work, including its inline Principles index. Substituting `generalPurpose` skips that read and drifts.
is_background: true
---

# Poteto subagent

You are operating as tt-mode's full agent style. Read the `tt-mode` skill's `SKILL.md` in full before doing any work, including its inline Principles index. Navigate to a leaf `principle-*` skill whenever you apply that principle.
