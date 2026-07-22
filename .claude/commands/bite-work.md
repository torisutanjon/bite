---
description: Run the per-item build loop (discuss → TDD → verify → PR → close loop) for a backlog item
argument-hint: <jira-key | BITE-###>
---

Run the per-item build loop for **$ARGUMENTS**.

> **Resolve the id first.** `$ARGUMENTS` may be a **Jira key** (`BITE-12`) or a legacy **vault id** (`BITE-016`) — these look alike but are different numbering systems. If it is a vault id, resolve it with `./scripts/jira.sh find-legacy $ARGUMENTS` and use the returned Jira key from then on. `BiteVault/JiraMap.md` is the authoritative mapping. Use the **Jira key** for the branch name and commit prefix.

> **Source of truth:** if a personal `MYWORKFLOW.md` exists in the repo root, follow its `## /bite-work` section exactly (read it first if not already in context) — it may extend or override the steps below. If `MYWORKFLOW.md` is absent (the usual case for anyone but the author), the self-contained loop below is authoritative.

The loop:

1. **Pull** the item from `/mnt/d/Obsidian/vaults/BiteVault/Backlog.md` (and `Tasks/$ARGUMENTS.md` if it exists), including its **`Goal` (`G#`) from `Goals.md`**; resolve `no-goal` with me first.
2. **Analyze** — bug → reproduce first (browser-observable bugs: reproduce live via the Playwright MCP tools; non-browser bugs: at the unit level); feature → assess scope. Push back if invalid, done, or underspecified.
3. **Discuss** the approach with me before building. **HARD CHECKPOINT — do not write any code yet.** feat/enhancement → invoke `superpowers:brainstorming`; bug/chore → light discuss.
4. **Failing test first** (TDD). For a browser-observable bug, the red test is a committed Playwright spec in `tests/`; fall back to an ad-hoc Playwright MCP repro (before-screenshot) only when a deterministic spec isn't feasible, noting why in the session note.
5. **Plan** — goal, acceptance criteria, file list.
6. **Branch** off `develop`, named `$ARGUMENTS/<short-description>`. UI-touching work → invoke `frontend-design`; always apply `andrej-karpathy-skills:karpathy-guidelines` (surgical, surface assumptions, no overcomplication).
7. **Verify** — `yarn type-check` → `yarn lint` → `yarn test:coverage` (gates 90/85/95/90). Confirm browser-observable changes in a browser: committed repro spec → `yarn test:e2e` goes green; ad-hoc/fallback → re-drive the steps + after-screenshot; CSS/UI → render-and-measure.
8. **Micro-commit** (`$ARGUMENTS: description`, no AI attribution), push, open a PR to `develop`.
9. **Close the loop in the vault** — mark the item `Done` in `Backlog.md`, update `Progress.md`, write `Fixes/<KEY>.md` (root cause + fix + verification + a one-line **Goal impact**: which `G#`, what changed for the user), update the **`Goals.md` Rollup** (item ✓ under its goal), write any `Decisions/` record, append what shipped to the session note.

## Jira status writeback

Jira is the source of truth for status, so the loop must move the ticket as it advances. Use the resolved **Jira key**:

| Loop step | Command |
| --- | --- |
| 1 — pull the item | `./scripts/jira.sh transition <KEY> "In Progress"` |
| 7 — verification passes | `./scripts/jira.sh transition <KEY> "QA Review"` |
| 8 — PR opened | `./scripts/jira.sh transition <KEY> "Code Review"` |
| 9 — close the loop | `./scripts/jira.sh transition <KEY> "Done"` |
| PR review requests changes | `./scripts/jira.sh transition <KEY> "Needs Revision"` |

Also at step 1, clear the queue label — it only means something while the status is `To Do`:

```
./scripts/jira.sh label <KEY> remove state-ready      # or state-backlog
```

`Ready for Production` is not used by the loop; leave it for manual promotion. **A transition failure is a warning, not a loop abort** — report it and continue; the work matters more than the bookkeeping, and `/bite-start`'s `DESYNCED` check will surface it next session.
