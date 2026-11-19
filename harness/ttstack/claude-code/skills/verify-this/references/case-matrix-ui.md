# UI case matrix

A UI claim covers every state a user can reach, not the one path the change was built for. The matrix lists those states as rows. Each row is a falsifiable sub-claim with its own evidence. A text-only copy change skips the matrix.

## Find the rows

Take rows from three sources and merge duplicates.

1. **The change's own branches.** Read the changed components and handlers. Every conditional render, loading flag, error handler, empty-list branch, disabled state, permission check, and guard in the diff becomes a row. These are the edge cases specific to this change.
2. **The project's feature map.** When the repo has a `verify-<app>` skill, each sub-feature and entry point the change touches becomes a row.
3. **The dimensions below.** Each dimension gets at least one row, or one `N/A` row whose note cites the code that rules it out.

| Dimension | Rows to consider |
|---|---|
| `happy` | The primary path the change exists for. Never `N/A`. |
| `entry` | Each way to reach the UI. Click, keyboard shortcut, deep link or URL, context menu, command palette. |
| `data` | Empty, one item, many items or overflow, loading, server error or timeout, permission denied. |
| `input` | Empty, whitespace only, max length, unicode or emoji or RTL, markup characters, paste. |
| `interaction` | Double submit, cancel midway, Escape, undo, back and forward, reload mid-flow. |
| `persistence` | Reload, a second view of the stored value, two tabs at once. |
| `layout` | Narrow viewport, zoom, dark theme, reduced motion. |
| `a11y` | Keyboard-only path, visible focus, accessible names, live-region announcements. |
| `regression` | Each other screen or component that uses the changed code. |

## Write the matrix

Write `matrix.tsv` in the claim's artifact directory. Columns are tab-separated. Tag each row with its dimension, optionally followed by a sub-tag such as `data:error`.

```text
case	dimension	status	artifact	note
save a new note	happy	PASS	treatment/save.png
open via "/" key	entry	PASS	treatment/slash.png
no notes exist	data:empty	PASS	treatment/empty.png
500 from /api/notes	data:error	FAIL	treatment/error.png	spinner never stops
title of 300 chars	input:boundary	PASS	treatment/long.png
double-click Save	interaction:repeat	PASS	treatment/save.har	one POST sent
reload after save	persistence	PASS	treatment/reload.png
375px viewport	layout	N/A		desktop-only panel, src/panel.tsx:12
keyboard-only save	a11y	PASS	treatment/keyboard.aria.txt
note list still renders	regression	PASS	treatment/list.png
```

- **Statuses.** `PASS`, `FAIL`, `N/A`, or `TODO`.
- **Artifacts.** Paths are relative to the matrix file, comma-separated when a row has several. Each artifact shows the resulting state of that row: a screenshot, an accessibility snapshot, a network log, or a stored value read from a second view.
- **`N/A` rows.** One per dimension that the change cannot reach, with a note that cites the file and line that prove it.
- **`TODO` rows.** Write the matrix before implementation with every row `TODO`. The rows are the success criteria.
- **A `FAIL` is a finding.** Fix the cause and drive the row again. Never delete a failing row.

## Drive and check

Drive each row through the matching control skill, one row per app state, and save its artifact. Add a row for every state the implementation revealed that the matrix missed. Then run the check from the `verify-this` skill directory.

```bash
node scripts/check-matrix.mjs <artifact-dir>/matrix.tsv
```

It prints a `coverage:` line and exits non-zero when a dimension has no row, a row is `TODO` or `FAIL`, an artifact is missing, an `N/A` cites no file, or only the happy path was driven. Paste the `coverage:` line into the verdict.
