# MYWORKFLOW — bite standard loop (personal, local-only)

> Personal working process for the **bite** repo. Kept local via `.git/info/exclude`
> — never committed. Loaded because `AGENTS.md` tells any AI harness to read this file
> when it exists. Anyone without it gets default agent behavior.

Work items live in the **BiteVault** Obsidian vault at
`/mnt/d/Obsidian/vaults/BiteVault/` (Windows `D:\Obsidian\vaults\BiteVault`). The vault
is the **source of truth** for the backlog and for the current progress of the app —
the agent reads *and* writes it. There is no external issue tracker — no separate
ticketing system, no GitHub Issues; the vault is the tracker. `Goals.md` owns *why*
work happens (the North Star + active goals `G#`); `Backlog.md` owns item state (each
row links to a goal); `Progress.md` is the living app snapshot.

The commands below are **separate and explicit**. Nothing chains automatically:
`/bite-start` only lists; it never picks an item or starts work. Work begins only when I
invoke `/bite-work` for a specific item.

---

## `/bite-start` — session start (list only, never automatic)

When I begin a session ("start my day", `/bite-start`, etc.), do **only** this:

1. Read the most recent note in `BiteVault/Sessions/` and summarize where we left off
   (decisions, current state, next steps).
2. Read `BiteVault/Backlog.md` and list items grouped by status in this display order,
   showing `BITE-### [<type>] <title>` (with its goal `G#`), and flag bugs:
   1. **In Progress**
   2. **Ready**
   3. **Backlog**
   4. **Done** — list briefly.
3. Read `BiteVault/Goals.md`; list the North Star + active goals. **Flag every backlog
   item whose `Goal` cell is empty or `no-goal`** so alignment drift surfaces at session
   start.
4. Read `BiteVault/Progress.md` for the current app snapshot if useful.
5. **Stop.** Do not auto-pick, do not analyze, do not start the loop. Wait for me to
   choose an item and invoke `/bite-work` myself.

---

## `/bite-new "<title>"` — file new work (no code)

Because the vault is writable, the agent files the item directly:

1. Append a new `BITE-###` row to `BiteVault/Backlog.md` (next sequential ID) with type,
   a **`Goal` value** (`G#` from `Goals.md`), status `Backlog`, and a one-line
   description. The goal link is **required** — if no live goal fits, do not silently
   file it: set `no-goal`, tell me, and ask me to pick an existing goal or propose a new
   one.
2. If the item needs detail (acceptance criteria, context), create
   `BiteVault/Tasks/BITE-###.md` from the task template.
3. **Stop.** This only files the item — invoke `/bite-work BITE-###` when ready to build.

---

## `/bite-work BITE-###` — per-item loop

Run only when I invoke it for a specific item. Never triggered by `/bite-start`.

1. **Pull** the item from `Backlog.md` (and `Tasks/BITE-###.md` if it exists) — title,
   type, status, description, **and its `Goal` (`G#`) from `Goals.md`**. If it is
   `no-goal`, resolve the goal with me before proceeding.
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
10. **Close the loop in the vault:** mark the item `Done` in `Backlog.md`, update
    `Progress.md`, write `Fixes/BITE-###.md` (root cause + fix + verification) **plus a
    one-line `Goal impact` (which `G#`, what changed for the user)**, **update the
    `Goals.md` Rollup** (add the item ✓ under its goal), write any `Decisions/` record,
    and append what shipped (PR/commit) to the current session note.

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
- **The vault is the source of truth** — keep `Goals.md`, `Backlog.md`, and `Progress.md`
  current; a stale `Goals.md` breaks `/bite-start` drift detection just as a stale
  `Backlog.md` does.
- Follow the repo `CLAUDE.md` / `AGENTS.md`: yarn only, Radix-only UI (no native HTML),
  no `/api` routes unless it's an approved exception, TDD (failing test first), no
  hardcoded hex colors.
