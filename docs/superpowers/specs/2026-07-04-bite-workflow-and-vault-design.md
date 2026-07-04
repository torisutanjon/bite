# bite — Workflow + BiteVault design

> Retarget the repo's personal `MYWORKFLOW.md` from the Axentra/Jira project to
> **bite**, and stand up a dedicated Obsidian vault (`BiteVault`) as the single
> source of truth for the app's backlog and progress.

- **Date:** 2026-07-04
- **Repo:** `torisutanjon/bite` (branch `develop` → PRs target `develop`; main is `main`)
- **Vault:** `D:\Obsidian\vaults\BiteVault` — WSL path `/mnt/d/Obsidian/vaults/BiteVault/`
- **Reference vault (conventions source):** `/mnt/d/Obsidian/vaults/ObsidianVault/`

---

## Goal

Two deliverables:

1. **`MYWORKFLOW.md`** (repo root) — rewrite the terse per-session command loop for
   bite. No Jira. Vault-driven. TDD + verification gates preserved. Kept local-only.
2. **BiteVault** — a dedicated, populated Obsidian vault that the AI agent reads and
   writes as the **source of truth for what to work on next (backlog) and current
   app progress**, mirroring the conventions of the existing `ObsidianVault`.

## Non-goals

- No Jira, no `jira-sync.mjs`, no read-only sync layer, no `JIRA:SYNC` block.
- No GitHub Issues integration — the vault backlog is the tracker.
- No changes to app source, CLAUDE.md, or AGENTS.md (AGENTS.md already declares the
  `MYWORKFLOW.md` hook).
- No autonomous merging — human gate on approach + PR review is retained.

---

## What changes vs. the current (Axentra) `MYWORKFLOW.md`

| Axentra (current) | bite (new) |
| --- | --- |
| Jira Cloud = source of truth, **read-only** sync | **BiteVault = source of truth**, agent reads *and* writes it |
| `jira-sync.mjs` pulls tickets into `Tickets/` | No sync — backlog is a vault note |
| Status moves manually in Jira | Status moves in `Backlog.md` |
| `AX-###` (Jira keys) | `BITE-###` (assigned in the vault) |
| PHI / EHR / telemed hotspots | None — public food-delivery practice app |
| `/axentra-*` commands | `/bite-*` commands |
| Branch off `develop` → PR to `develop` | **same** (kept) |
| TDD + verify gates (typecheck → lint → test → Playwright) | **same** (kept) |

---

## Deliverable 1 — `MYWORKFLOW.md` (repo root)

Local-only file, read at session start per `AGENTS.md`. Same four-part shape as the
Axentra version, retargeted. Add `MYWORKFLOW.md` to `.git/info/exclude` so it stays
uncommitted (AGENTS.md says it "is never committed," but it is not ignored yet).

### `/bite-start` — session start (list only, never automatic)

1. Read the most recent note in `Sessions/` and summarize where we left off
   (decisions, current state, next steps).
2. Read `Backlog.md` and list items grouped by status in display order:
   **In Progress → Ready → Backlog → Done (brief)**. Show `BITE-### [<type>] <title>`.
3. Read `Progress.md` for the current app snapshot if useful.
4. **Stop.** Do not auto-pick or start work. Wait for me to invoke `/bite-work`.

### `/bite-new "<title>"` — file new work (no code)

Because the vault is writable, the agent files directly:

1. Append a new `BITE-###` row to `Backlog.md` (next sequential ID) with type,
   status `Backlog`, and a one-line description.
2. If the item needs detail, create `Tasks/BITE-###.md` from the task template.
3. Does **not** start work — invoke `/bite-work BITE-###` when ready.

### `/bite-work BITE-###` — per-item loop

1. **Pull** the item from `Backlog.md` (+ `Tasks/BITE-###.md` if present).
2. **Analyze** — bug → reproduce first (assess validity); feature → assess feasibility
   + scope. Push back if invalid, already done, or underspecified.
3. **Discuss** the approach with me before building. **Hard checkpoint.**
4. **Write the failing test first** (TDD mandate — no implementation before a red test).
5. **Plan** — goal, acceptance criteria, file list before touching code.
6. **Execute** on a branch off `develop`, named `BITE-###/<short-description>`.
7. **Verify** — fast-fail order: `yarn type-check` → `yarn lint` →
   `yarn test --coverage`, then **Playwright** only if those pass. Playwright is
   **required** for any CSS/visual/UI change: render at the reported viewport and
   measure — don't reason from source. No "done" without evidence.
   > ⚠️ Coverage gates are hard (90% statements / 85% branches / 95% functions /
   > 90% lines). A change that drops coverage is not done — add tests until it passes.
8. **Micro-commit** — small, focused commits referencing the item (`BITE-###:
   description`). No AI attribution.
9. **Push and open a PR** targeting `develop`. No attribution in the PR body.
10. **Close the loop in the vault:** mark the item `Done` in `Backlog.md`, update
    `Progress.md`, write `Fixes/BITE-###.md` (root cause + fix + verification) and any
    `Decisions/` record, and append what shipped (PR/commit) to the session note.

### Session end

Generate `Sessions/YYYY-MM-DD-<topic>.md` (template below), show it, save on approval.

### Boundaries

- Accelerator with a human gate — agent reproduces and proposes; I approve the approach
  and review the PR. Not autonomous merging.
- **The vault is the source of truth** — keep `Backlog.md` and `Progress.md` current;
  a stale vault breaks `/bite-start`.
- Follow repo `CLAUDE.md`/`AGENTS.md`: yarn only, Radix-only UI, no `/api` routes,
  correct Supabase client, no `.select('*')`, TDD.

---

## Deliverable 2 — BiteVault

Dedicated vault → everything at top level (no `Projects/<name>/` nesting).

```
BiteVault/
  CLAUDE.md      vault-agent rules (adapted from ObsidianVault/CLAUDE.md)
  README.md      project hub / index
  Workflow.md    "bite Agentic Dev Workflow" prose methodology
  Roadmap.md     phases / milestones
  Backlog.md     ordered BITE-### items + status   ← the tracker
  Progress.md    living app-state snapshot          ← current progress
  Tasks/         BITE-###.md detail notes  + README.md
  Fixes/         root-cause fix logs        + README.md
  Decisions/     decision records          + README.md
  Sessions/      YYYY-MM-DD-<topic>.md
```

Delete the default `Welcome.md` (only after files are in place; agent confirms first
per vault boundaries).

### Shared conventions (from ObsidianVault)

- Frontmatter on every note: `title`, `date`, `tags: []`, `links: []`,
  `status: draft|active|complete`.
- `##`/`###` headers; `[[WikiLinks]]` between notes; a `## Related` section at the
  bottom of each note.
- Each folder has a `README.md` index stating purpose, naming convention, and template.

### `CLAUDE.md` (vault)

Adapted from `ObsidianVault/CLAUDE.md`. Sections: Role & Objective (source of truth for
bite backlog + progress, not a second brain), Environment (vault + repo paths), Session
Startup (read latest `Sessions/` + `Backlog.md` + `Progress.md`), Session Shutdown
(session-note template, save on approval), Note-Writing Standards (frontmatter,
WikiLinks, Related), Boundaries (no deletes/restructures without confirmation; keep
`Backlog.md`/`Progress.md` in sync with reality).

### `Backlog.md` — the tracker (replaces Jira `Tickets/`)

A single note with a status-grouped table. Statuses: **In Progress · Ready · Backlog ·
Done**. Columns: `ID | Type | Title | Status | Notes/link`. IDs are `BITE-###`,
assigned sequentially here. `Tasks/BITE-###.md` holds detail only when needed.

### `Progress.md` — living app snapshot (mirrors Project-Status)

Overview, Tech Stack (from repo: Next.js 15 App Router, TS strict, Supabase, Radix UI +
Tailwind, TanStack Query, Jest + RTL, Playwright, yarn), Feature Areas & Current State,
Known Issues / In-Flight, What's Next. Seeded from real repo state.

### `Roadmap.md`

Phase/milestone view (e.g. Foundations → Auth → Storefront → Cart/Checkout → Orders →
Profile → Realtime/Domain layer), each phase marked done / in-progress / planned.

### Folder READMEs + templates

- **`Tasks/README.md`** — naming `BITE-###.md`; template with frontmatter, `## Summary`,
  `## Details` (type/status/priority), `## Notes`, `## Related`. No sync block.
- **`Fixes/README.md`** — naming `BITE-###.md`; template `## Root Cause`, `## The Fix`,
  `## Verification`, `## Related`.
- **`Decisions/README.md`** — naming `YYYY-MM-DD-<topic>.md`; template `## Context`,
  `## Decision`, `## Reasoning`, `## Consequences`, `## Related`.

### Session-note template

```markdown
---
title: Session - <topic>
date: YYYY-MM-DD
tags: [session]
status: complete
---

## What We Did
## Decisions Made
## Current State
## Next Steps
## Related Notes
```

### Seed content (from real repo state)

From git history and the working tree, current build state to reflect in
`Progress.md` / `Backlog.md` / `Roadmap.md`:

- Radix UI setup (#1), Login/signup pages (#2), Landing page (#3), cart/checkout/orders/
  profile pages + shared icon component (#4).
- In flight (uncommitted): Jest + RTL test suite scaffolding across app routes
  (`jest.config.ts`, `jest.setup.ts`, many `__tests__/`), `__mocks__/`, `lib/`.

`Workflow.md` mirrors `Axentra-Agentic-Dev-Workflow.md`: TL;DR table (vault / agent),
the problem it solves, the loop, how the vault is used, note formats, verification
discipline, why it works, boundaries — retargeted (vault as source of truth, no Jira,
no PHI).

---

## Acceptance criteria

- [ ] `MYWORKFLOW.md` retargeted to bite (`/bite-*`, `BITE-###`, vault-driven, no Jira);
      added to `.git/info/exclude`; still uncommitted.
- [ ] `BiteVault/CLAUDE.md` governs the vault as bite's source of truth.
- [ ] `BiteVault` contains `README.md`, `Workflow.md`, `Roadmap.md`, `Backlog.md`,
      `Progress.md`, and `Tasks/`, `Fixes/`, `Decisions/`, `Sessions/` with folder
      READMEs — all following ObsidianVault frontmatter + WikiLink conventions.
- [ ] `Progress.md`, `Backlog.md`, `Roadmap.md` reflect actual repo state (PRs #1–#4 +
      in-flight test suite), not placeholders.
- [ ] Default `Welcome.md` removed after confirmation.
- [ ] No app source, `CLAUDE.md`, or `AGENTS.md` changes.
```
