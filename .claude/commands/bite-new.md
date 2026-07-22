---
description: File a new backlog item as a Jira ticket (and vault note) — does not start work
argument-hint: "<title>"
---

Follow the `## /bite-new` section of `MYWORKFLOW.md` in the repo root exactly, for a new item titled: **$ARGUMENTS**. `MYWORKFLOW.md` is the source of truth; if it is not already in context, read it first.

**Jira is the ID authority** — the ticket is created first, then the vault note. New items are Jira-native and get **no** `BITE-###` legacy id; their Jira key is their only identifier.

Do ONLY this, then stop:

1. **Resolve the goal.** Pick the `G#` from `/mnt/d/Obsidian/vaults/BiteVault/Goals.md` that this item serves. If no live goal fits, **STOP and ask me** to pick one or propose a new one — never file with `no-goal` silently.
2. **Determine the type** and map it to the Jira issue type:
   `feat → Feature` · `enhancement → Story` · `chore → Task` · `test → Task` · `bug → Bug`
3. **Draft the ticket.** Write the title and a description with these exact sections:
   - `## Context` — why this exists; cite concrete file paths / line numbers / measurements where they exist
   - `## Scope` — what changes, including explicit **NON-GOALS**
   - `## Expected Result` — one observable end state: what is true when this is done
   - `## Acceptance Criteria` — a checkbox list, including the standing gates (Radix UI only, no hardcoded hex, TDD failing test first, coverage 90/85/95/90, browser verification for anything visual)
4. **Show me the full draft and WAIT for explicit confirmation.** This writes to a real tracker and the token **cannot delete** what it creates.
5. **Create it.** Write the description to a temp file, then:
   ```
   ./scripts/jira.sh create <IssueType> "<title>" <descfile> bite type-<type> goal-<G#> state-backlog
   ```
   Capture the returned key (e.g. `BITE-22`).
6. **Write the vault.** Add the row to `Backlog.md` under **Backlog** keyed by the Jira key, and create `Tasks/<KEY>.md` from the template in `Tasks/README.md`.
7. **STOP.** This only files the item — I will run `/bite-work <KEY>` when ready to build.
