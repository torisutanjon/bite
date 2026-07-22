# MYWORKFLOW — bite standard loop (personal, local-only)

> Personal working process for the **bite** repo. **This file IS committed** and is
> published with the repo — put no credentials in it, and reference configuration by
> environment-variable name only. Loaded because `AGENTS.md` tells any AI harness to
> read this file when it exists. Anyone without it gets default agent behavior.

Work items live in **Jira** (project `BITE`, via `scripts/jira.sh`) and the **BiteVault**
Obsidian vault at `/mnt/d/Obsidian/vaults/BiteVault/` (Windows `D:\Obsidian\vaults\BiteVault`).

**Jira is the source of truth for item state** — key, title, type, status, description.
**The vault owns what Jira handles poorly** — `Goals.md` (why work happens, the North Star
+ active goals `G#`), `Tasks/` (context and acceptance criteria), `Fixes/`, `Decisions/`,
`Sessions/` (continuity) and `Progress.md` (the living app snapshot). `Backlog.md` is a
**generated mirror** of Jira — regenerate it at `/bite-start`, never hand-edit it.

Jira config lives in `.env.local` (git-ignored): `JIRA_SITE`, `JIRA_EMAIL`, `JIRA_TOKEN`,
`JIRA_CLOUD_ID`, `JIRA_PROJECT_KEY`. The token is **scoped to issue read/write** — it
cannot delete issues, create projects, or read `/myself`. So: every write is gated on my
explicit confirmation, and nothing created can be undone by tooling.

⚠️ **Two numbering systems share the `BITE-` prefix.** `BITE-003` is a legacy *vault id*;
`BITE-3` is a *Jira key* for a different item. `BiteVault/JiraMap.md` is the authoritative
resolver, and `scripts/jira.sh find-legacy` accepts either spelling. New items are
Jira-native and never receive a legacy id.

The commands below are **separate and explicit**. Nothing chains automatically:
`/bite-start` only lists; it never picks an item or starts work. Work begins only when I
invoke `/bite-work` for a specific item.

---

## `/bite-start` — session start (list only, never automatic)

When I begin a session ("start my day", `/bite-start`, etc.), do **only** this:

1. **Health check** — `./scripts/jira.sh check`. On non-zero exit, print
   `⚠ JIRA UNAVAILABLE — vault may be stale`, continue in **degraded mode** from the
   vault alone, and label the whole report degraded. Never fall back silently.
2. **Read Jira** — `./scripts/jira.sh list`. Authoritative for key, legacy id, type,
   status, goal and title.
3. **Read the vault** — the most recent note in `BiteVault/Sessions/`, plus `Goals.md`,
   `Progress.md`, `JiraMap.md`, and `Tasks/` for detail.
4. **Join** on the legacy id or Jira key — **each item rendered exactly once**; Jira wins
   on conflict.
5. **List** grouped in this display order, showing `KEY (BITE-###) [<type>] <title> — G#`,
   and flag bugs:
   1. **In Progress**
   2. **Ready** — `state-ready` label while status is `To Do`
   3. **Backlog** — `state-backlog` label while status is `To Do`
   4. **Done** — list briefly.
6. **Drift report** — `UNFILED` (vault row, no ticket) · `UNTRACKED` (ticket, no vault
   row) · `DESYNCED` (status disagreement) · `NO-GOAL` (missing or `no-goal` goal label).
   Print `none` for empty classes.
7. Summarize where we left off from the session note (decisions, current state, next steps),
   and list the North Star + active goals from `Goals.md`.
8. **Stop.** Do not auto-pick, do not analyze, do not start the loop. Wait for me to
   choose an item and invoke `/bite-work` myself.

---

## `/bite-new "<title>"` — file new work (no code)

Jira is the ID authority, so the ticket is created **first**, then the vault note — a
vault row pointing at a ticket that failed to create is worse than the reverse. New items
are Jira-native and get **no** `BITE-###` legacy id.

1. **Resolve the goal** (`G#` from `Goals.md`). Required — if no live goal fits, do not
   silently file it: stop, tell me, and ask me to pick an existing goal or propose a new one.
2. **Map the type** — `feat → Feature` · `enhancement → Story` · `chore → Task` ·
   `test → Task` · `bug → Bug`.
3. **Draft** the title and a description with these exact sections: `## Context`,
   `## Scope` (with explicit NON-GOALS), `## Expected Result` (one observable end state),
   `## Acceptance Criteria` (checkbox list including the standing gates).
4. **Show me the draft and wait for explicit confirmation** — this writes to a real
   tracker and the token cannot delete what it creates.
5. **Create** via `./scripts/jira.sh create <IssueType> "<title>" <descfile> bite
   type-<type> goal-<G#> state-backlog`; capture the key.
6. **Write the vault** — `Backlog.md` row keyed by the Jira key, plus `Tasks/<KEY>.md`
   from the task template.
7. **Stop.** This only files the item — invoke `/bite-work <KEY>` when ready to build.

---

## `/bite-work BITE-###` — per-item loop

Run only when I invoke it for a specific item. Never triggered by `/bite-start`.

0. **Resolve the id.** The argument may be a Jira key (`BITE-12`) or a legacy vault id
   (`BITE-016`) — same prefix, different systems. Resolve a vault id with
   `./scripts/jira.sh find-legacy <id>` and use the Jira key from then on, including for
   the branch name and commit prefix.
1. **Pull** the item from Jira (`./scripts/jira.sh list`) and its `Tasks/` note if one
   exists — title, type, status, description, **and its `Goal` (`G#`) from `Goals.md`**.
   If it is `no-goal`, resolve the goal with me before proceeding. Transition the ticket
   to **In Progress** and clear its `state-ready` / `state-backlog` label.
2. **Analyze.** Bug → assess **validity** by **reproducing it first**. For a
   **browser-observable** bug, reproduce it live in a real browser via the Playwright
   MCP tools (`yarn dev`, drive to the failing state, observe the break firsthand) —
   don't reason from source. Non-browser bugs (util / type / server logic) reproduce at
   the unit level. Feature/enhancement → assess **feasibility + scope**. Push back if the
   item is invalid, already done, or underspecified.
3. **Discuss** the approach with me before building. **Hard checkpoint.**
   - **feat / enhancement → invoke `superpowers:brainstorming`** (structured design →
     approval) instead of an ad-hoc discussion.
   - **bug / chore → keep the light discussion.**
4. **Write the failing test first** (TDD mandate — no implementation before a red test).
   For a **browser-observable bug**, the red test is a **committed Playwright spec in
   `tests/`** that encodes the reproduction and fails. Fall back to an ad-hoc Playwright
   MCP repro (a "before" screenshot as evidence) only when a deterministic spec isn't
   feasible — it needs live backend/data, is timing-dependent, or the repro is
   exploratory — and note the reason in the session note.
5. **Plan** — clear goal, acceptance criteria, and file list before touching code.
6. **Execute** on a branch off `develop`, named `BITE-###/<short-description>`.
   - **If the item touches UI → invoke `frontend-design`** for the visual/UX work.
   - **Always apply `andrej-karpathy-skills:karpathy-guidelines`** — surgical changes,
     surface assumptions, no overcomplication, verifiable success criteria.
7. **Verify** — fast-fail order: `yarn type-check` → `yarn lint` → `yarn test:coverage`.
   Confirm any **browser-observable** change in a real browser, not from source:
   - **Bug fixed with a committed repro spec** → `yarn test:e2e`; the previously-red spec
     now passes green.
   - **Ad-hoc / fallback bug** → re-drive the same reproduction steps via the Playwright
     MCP tools, confirm the issue is gone, capture an "after" screenshot.
   - **CSS / visual / UI change** → render at the reported viewport and measure in a real
     browser (set up Playwright when first needed).
   No "done" without evidence.
   > ⚠️ Coverage gates are hard (90% statements / 85% branches / 95% functions /
   > 90% lines). A change that drops coverage is not done — add tests until it passes.
8. **Micro-commit** — small, focused commits referencing the item (`BITE-###:
   description`). No AI attribution.
9. **Push and open a PR** targeting `develop`. No attribution in the PR body.
10. **Close the loop:** transition the ticket to **Done**, then update the vault — mark
    the item `Done` in `Backlog.md`, update `Progress.md`, write `Fixes/<KEY>.md` (root
    cause + fix + verification) **plus a one-line `Goal impact` (which `G#`, what changed
    for the user)**, **update the `Goals.md` Rollup** (add the item ✓ under its goal),
    write any `Decisions/` record, and append what shipped (PR/commit) to the current
    session note.

### Jira status writeback

Jira is authoritative for status, so the loop moves the ticket as it advances:

| Loop step | Transition |
| --- | --- |
| 1 — pull the item | `In Progress` |
| 7 — verification passes | `QA Review` |
| 9 — PR opened | `Code Review` |
| 10 — close the loop | `Done` |
| PR review requests changes | `Needs Revision` |

`Ready for Production` is not used by the loop; it stays manual. **A transition failure is
a warning, not a loop abort** — report it and carry on; `/bite-start`'s `DESYNCED` check
catches it next session.

---

## Session end

When wrapping up ("that's it for today", etc.):

1. Generate the session note (`BiteVault/Sessions/YYYY-MM-DD-<topic>.md`) — what we did,
   decisions, current state, next steps, related notes — show it to me and save only on
   approval.
2. That closing pass is the continuity layer for the next session.

---

## Boundaries

- Accelerator with a human gate — the agent reproduces and proposes; I approve the
  approach and review the PR. Not autonomous merging.
- **Jira is the source of truth for item state; the vault owns the why and the detail.**
  Keep `Goals.md`, `Tasks/` and `Progress.md` current — a stale `Goals.md` breaks
  `/bite-start` drift detection. `Backlog.md` is a generated mirror: regenerate it, never
  hand-edit it, or the two systems disagree and `DESYNCED` fires every session.
- **Never hand-edit a ticket's status in the Jira UI mid-loop** — `/bite-work` owns the
  transitions. Editing both ends is how the mirror rots.
- Follow the repo `CLAUDE.md` / `AGENTS.md`: yarn only, Radix-only UI (no native HTML),
  no `/api` routes unless it's an approved exception, TDD (failing test first), no
  hardcoded hex colors.
