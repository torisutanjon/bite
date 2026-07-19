---
description: Run the per-item build loop (discuss → TDD → verify → PR → close loop) for a backlog item
argument-hint: BITE-###
---

Follow the `## /bite-work BITE-###` section of `MYWORKFLOW.md` in the repo root exactly, for: **$ARGUMENTS**. `MYWORKFLOW.md` is the source of truth; if it is not already in context, read it first.

The loop, in short:

1. **Pull** the item from `/mnt/d/Obsidian/vaults/BiteVault/Backlog.md` (and `Tasks/$ARGUMENTS.md` if it exists), including its **`Goal` (`G#`) from `Goals.md`**; resolve `no-goal` with me first.
2. **Analyze** — bug → reproduce first (browser-observable bugs: reproduce live via the Playwright MCP tools; non-browser bugs: at the unit level); feature → assess scope. Push back if invalid, done, or underspecified.
3. **Discuss** the approach with me before building. **HARD CHECKPOINT — do not write any code yet.** feat/enhancement → invoke `superpowers:brainstorming`; bug/chore → light discuss.
4. **Failing test first** (TDD). For a browser-observable bug, the red test is a committed Playwright spec in `tests/`; fall back to an ad-hoc Playwright MCP repro (before-screenshot) only when a deterministic spec isn't feasible, noting why in the session note.
5. **Plan** — goal, acceptance criteria, file list.
6. **Branch** off `develop`, named `$ARGUMENTS/<short-description>`. UI-touching work → invoke `frontend-design`; always apply `andrej-karpathy-skills:karpathy-guidelines` (surgical, surface assumptions, no overcomplication).
7. **Verify** — `yarn type-check` → `yarn lint` → `yarn test:coverage` (gates 90/85/95/90). Confirm browser-observable changes in a browser: committed repro spec → `yarn test:e2e` goes green; ad-hoc/fallback → re-drive the steps + after-screenshot; CSS/UI → render-and-measure.
8. **Micro-commit** (`$ARGUMENTS: description`, no AI attribution), push, open a PR to `develop`.
9. **Close the loop in the vault** — mark the item `Done` in `Backlog.md`, update `Progress.md`, write `Fixes/$ARGUMENTS.md` (root cause + fix + verification + a one-line **Goal impact**: which `G#`, what changed for the user), update the **`Goals.md` Rollup** (item ✓ under its goal), write any `Decisions/` record, append what shipped to the session note.
