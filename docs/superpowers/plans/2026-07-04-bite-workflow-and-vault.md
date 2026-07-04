# bite Workflow + BiteVault Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retarget the repo's personal `MYWORKFLOW.md` to the **bite** project and stand up a dedicated `BiteVault` Obsidian vault as the single source of truth for the app's backlog and progress.

**Architecture:** Pure documentation/content work — no app code changes. Deliverable 1 is a local-only `MYWORKFLOW.md` in the repo root (a terse `/bite-*` command loop). Deliverable 2 is the `BiteVault` file tree, seeded from real repo state, following the conventions of the existing `ObsidianVault`.

**Tech Stack:** Markdown only. Verification uses shell (`grep`, `ls`, `git check-ignore`) — there is no runtime to test.

## Global Constraints

- Vault path (WSL): `/mnt/d/Obsidian/vaults/BiteVault/` (Windows: `D:\Obsidian\vaults\BiteVault`).
- Reference vault (conventions to mirror): `/mnt/d/Obsidian/vaults/ObsidianVault/`.
- Repo root: `/home/clarisfanhere/Practices/bite`.
- Branch model: work off `develop`; PRs target `develop`; main branch is `main`.
- Command prefix `/bite-*`; work-item IDs `BITE-###` (assigned in the vault, sequential).
- Repo scripts are exactly: `yarn type-check`, `yarn lint`, `yarn test`, `yarn test:coverage`. There is **no** `typecheck` or `playwright` script.
- **Actual installed stack** (reflect this, not CLAUDE.md's aspirational architecture): Next.js (App Router), React, `@radix-ui/themes`, `@radix-ui/react-icons`, Tailwind CSS, TypeScript (strict); Jest + `jest-environment-jsdom` + React Testing Library; ESLint (`eslint-config-next`) + Prettier. **NOT yet installed:** Supabase, TanStack Query, Kafka, Playwright.
- Every vault note uses frontmatter (`title`, `date`, `tags: []`, `links: []`, `status:`), `##`/`###` headers (never `#`), `[[WikiLinks]]`, and a `## Related` section at the bottom.
- Do not touch app source, `CLAUDE.md`, or `AGENTS.md`.
- Do not delete `BiteVault/Welcome.md` until all other vault files exist (Task 7).
- No AI attribution in any commit or file.

---

## File Structure

Repo (deliverable 1):
- `MYWORKFLOW.md` — rewrite (currently Axentra/Jira content).
- `.git/info/exclude` — add `MYWORKFLOW.md` so it stays uncommitted.

Vault (deliverable 2), all under `/mnt/d/Obsidian/vaults/BiteVault/`:
- `CLAUDE.md` — vault-agent governing rules.
- `README.md` — project hub / index.
- `Workflow.md` — prose methodology ("bite Agentic Dev Workflow").
- `Roadmap.md` — phases / milestones.
- `Backlog.md` — the tracker (status-grouped `BITE-###` table).
- `Progress.md` — living app-state snapshot.
- `Tasks/README.md`, `Fixes/README.md`, `Decisions/README.md` — folder indexes + templates.
- `Sessions/2026-07-04-bite-vault-setup.md` — first continuity note.

Note on granularity: because these are prose files, each "test" step is a shell assertion that required markers/frontmatter exist. Commits apply only to repo files (Task 1 and the spec); vault files live outside the repo and are not committed — the vault is saved by writing to disk.

---

### Task 1: Repo `MYWORKFLOW.md` rewrite + keep it local

**Files:**
- Modify: `MYWORKFLOW.md` (full rewrite)
- Modify: `.git/info/exclude`

**Interfaces:**
- Produces: the `/bite-start`, `/bite-new`, `/bite-work BITE-###` command contract that `Workflow.md` (Task 3) describes in prose and that references the vault paths from the Global Constraints.

- [ ] **Step 1: Write the full new `MYWORKFLOW.md`**

Replace the entire file contents with:

```markdown
# MYWORKFLOW — bite standard loop (personal, local-only)

> Personal working process for the **bite** repo. Kept local via `.git/info/exclude`
> — never committed. Loaded because `AGENTS.md` tells any AI harness to read this file
> when it exists. Anyone without it gets default agent behavior.

Work items live in the **BiteVault** Obsidian vault at
`/mnt/d/Obsidian/vaults/BiteVault/` (Windows `D:\Obsidian\vaults\BiteVault`). The vault
is the **source of truth** for the backlog and for the current progress of the app —
the agent reads *and* writes it. There is no external tracker (no Jira, no GitHub
Issues). `Backlog.md` owns item state; `Progress.md` is the living app snapshot.

The commands below are **separate and explicit**. Nothing chains automatically:
`/bite-start` only lists; it never picks an item or starts work. Work begins only when I
invoke `/bite-work` for a specific item.

---

## `/bite-start` — session start (list only, never automatic)

When I begin a session ("start my day", `/bite-start`, etc.), do **only** this:

1. Read the most recent note in `BiteVault/Sessions/` and summarize where we left off
   (decisions, current state, next steps).
2. Read `BiteVault/Backlog.md` and list items grouped by status in this display order,
   showing `BITE-### [<type>] <title>`, and flag bugs:
   1. **In Progress**
   2. **Ready**
   3. **Backlog**
   4. **Done** — list briefly.
3. Read `BiteVault/Progress.md` for the current app snapshot if useful.
4. **Stop.** Do not auto-pick, do not analyze, do not start the loop. Wait for me to
   choose an item and invoke `/bite-work` myself.

---

## `/bite-new "<title>"` — file new work (no code)

Because the vault is writable, the agent files the item directly:

1. Append a new `BITE-###` row to `BiteVault/Backlog.md` (next sequential ID) with type,
   status `Backlog`, and a one-line description.
2. If the item needs detail (acceptance criteria, context), create
   `BiteVault/Tasks/BITE-###.md` from the task template.
3. **Stop.** This only files the item — invoke `/bite-work BITE-###` when ready to build.

---

## `/bite-work BITE-###` — per-item loop

Run only when I invoke it for a specific item. Never triggered by `/bite-start`.

1. **Pull** the item from `Backlog.md` (and `Tasks/BITE-###.md` if it exists) — title,
   type, status, description.
2. **Analyze.** Bug → assess **validity** (reproduce it first). Feature/enhancement →
   assess **feasibility + scope**. Push back if the item is invalid, already done, or
   underspecified.
3. **Discuss** the approach with me before building. **Hard checkpoint.**
4. **Write the failing test first** (TDD mandate — no implementation before a red test).
5. **Plan** — clear goal, acceptance criteria, and file list before touching code.
6. **Execute** on a branch off `develop`, named `BITE-###/<short-description>`.
7. **Verify** — fast-fail order: `yarn type-check` → `yarn lint` → `yarn test:coverage`.
   For any CSS/visual/UI change, render at the reported viewport and measure in a real
   browser — don't reason from source (set up Playwright when first needed). No "done"
   without evidence.
   > ⚠️ Coverage gates are hard (90% statements / 85% branches / 95% functions /
   > 90% lines). A change that drops coverage is not done — add tests until it passes.
8. **Micro-commit** — small, focused commits referencing the item (`BITE-###:
   description`). No AI attribution.
9. **Push and open a PR** targeting `develop`. No attribution in the PR body.
10. **Close the loop in the vault:** mark the item `Done` in `Backlog.md`, update
    `Progress.md`, write `Fixes/BITE-###.md` (root cause + fix + verification) and any
    `Decisions/` record, and append what shipped (PR/commit) to the current session note.

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
- **The vault is the source of truth** — keep `Backlog.md` and `Progress.md` current; a
  stale vault breaks `/bite-start`.
- Follow the repo `CLAUDE.md` / `AGENTS.md`: yarn only, Radix-only UI (no native HTML),
  no `/api` routes unless it's an approved exception, TDD (failing test first), no
  hardcoded hex colors.
```

- [ ] **Step 2: Add `MYWORKFLOW.md` to `.git/info/exclude`**

Append the line `MYWORKFLOW.md` to `.git/info/exclude`:

```bash
cd /home/clarisfanhere/Practices/bite
printf '\n# Personal workflow file — never committed (see AGENTS.md)\nMYWORKFLOW.md\n' >> .git/info/exclude
```

- [ ] **Step 3: Verify the rewrite and the ignore both took**

```bash
cd /home/clarisfanhere/Practices/bite
grep -c "/bite-start\|/bite-work\|BITE-###" MYWORKFLOW.md   # expect >= 3
grep -ci "jira\|AX-\|axentra\|PHI\|EHR" MYWORKFLOW.md        # expect 0
git check-ignore MYWORKFLOW.md                               # expect: MYWORKFLOW.md
git status --short MYWORKFLOW.md                             # expect: no output (ignored)
```
Expected: first count ≥ 3, second count 0, `git check-ignore` prints `MYWORKFLOW.md`, `git status` shows nothing for it.

- [ ] **Step 4: Commit the design spec (only repo artifact still pending)**

The spec from brainstorming may be uncommitted. Commit it (do **not** commit `MYWORKFLOW.md` — it is ignored):

```bash
cd /home/clarisfanhere/Practices/bite
git add docs/superpowers/specs/2026-07-04-bite-workflow-and-vault-design.md docs/superpowers/plans/2026-07-04-bite-workflow-and-vault.md
git commit -m "docs: add bite workflow + BiteVault design spec and plan"
```
Expected: one commit created. (Skip if the user has said they want these left uncommitted.)

---

### Task 2: BiteVault scaffold + governing `CLAUDE.md`

**Files:**
- Create: `BiteVault/Tasks/`, `BiteVault/Fixes/`, `BiteVault/Decisions/`, `BiteVault/Sessions/` (directories)
- Create: `/mnt/d/Obsidian/vaults/BiteVault/CLAUDE.md`

**Interfaces:**
- Produces: the vault directory tree that Tasks 3–7 write into, and the governing rules that make the agent treat this vault as bite's source of truth.

- [ ] **Step 1: Create the folder tree**

```bash
mkdir -p /mnt/d/Obsidian/vaults/BiteVault/Tasks \
         /mnt/d/Obsidian/vaults/BiteVault/Fixes \
         /mnt/d/Obsidian/vaults/BiteVault/Decisions \
         /mnt/d/Obsidian/vaults/BiteVault/Sessions
```

- [ ] **Step 2: Write `BiteVault/CLAUDE.md`**

Adapt from `ObsidianVault/CLAUDE.md` but retarget the Role to "source of truth for bite's backlog + progress" (not a general second brain). Write this content:

```markdown
# Role & Objective

You are the AI dev-workflow agent for the **bite** food-delivery app, operating inside
this dedicated Obsidian vault. This vault is the **single source of truth** for what to
build next (the backlog) and for the current progress of the app. You read it at the
start of every session and keep it current as work ships.

---

# Environment & Vault Context

- **Vault path (WSL2):** `/mnt/d/Obsidian/vaults/BiteVault/`
- **Repo path (WSL2):** `/home/clarisfanhere/Practices/bite`
- **OS:** WSL2 — Windows `D:` drive vault accessed via `/mnt/d/`
- **Note format:** Markdown with `[[WikiLinks]]`
- The per-session command loop (`/bite-start`, `/bite-new`, `/bite-work`) lives in the
  repo's `MYWORKFLOW.md`; the prose methodology lives in `[[Workflow]]`.
- Do not change the file structure or delete notes without explicit confirmation.

---

# Session Startup

At the start of every session:
1. Read the most recent file in `Sessions/` and summarize where we left off.
2. Read `[[Backlog]]` and list items grouped by status (In Progress → Ready → Backlog → Done).
3. Read `[[Progress]]` for the current app snapshot.
4. Stop and wait — do not auto-pick an item or start work.

If no session notes exist yet, say so and ask what we are working on.

---

# Session Shutdown

At the end of every session, before wrapping up:
1. Generate a session note using the template below.
2. Show it and ask: "Ready to save session note — approve?"
3. Save only after confirmation.

Save location: `Sessions/YYYY-MM-DD-<topic>.md`

Session note template:

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

---

# Keeping the Vault True

The vault only works as source of truth if it matches reality:
- When an item ships, mark it `Done` in `[[Backlog]]` and update `[[Progress]]`.
- New work gets a `BITE-###` row in `[[Backlog]]` before it is built.
- Root-cause notes go in `Fixes/`; non-obvious choices go in `Decisions/`.

---

# Note-Writing Standards

Frontmatter at the top of every note:

    title:
    date: YYYY-MM-DD
    tags: []
    links: []
    status: draft

- Use `##`/`###` headers — never `#` (the title is in frontmatter).
- Use `[[WikiLinks]]` to connect related notes.
- Add a `## Related` section at the bottom with relevant links.
- Do not hallucinate note titles — only link notes that exist.

---

# Boundaries

- Never delete or rename files without explicit confirmation.
- Never restructure folders without explicit confirmation.
- Search before creating a new note to avoid duplicates.
- This is a personal practice/portfolio project — no PHI, no regulated-data rules apply.
```

- [ ] **Step 3: Verify scaffold + CLAUDE.md**

```bash
ls -d /mnt/d/Obsidian/vaults/BiteVault/{Tasks,Fixes,Decisions,Sessions}   # all 4 exist
grep -c "source of truth\|Session Startup\|BITE-###" /mnt/d/Obsidian/vaults/BiteVault/CLAUDE.md  # expect >= 2
```
Expected: 4 directories listed, grep count ≥ 2.

---

### Task 3: Project hub `README.md` + prose `Workflow.md`

**Files:**
- Create: `/mnt/d/Obsidian/vaults/BiteVault/README.md`
- Create: `/mnt/d/Obsidian/vaults/BiteVault/Workflow.md`

**Interfaces:**
- Consumes: the `/bite-*` loop defined in Task 1's `MYWORKFLOW.md`.
- Produces: the index (`README.md`) that links every other vault note via `[[WikiLinks]]`.

- [ ] **Step 1: Write `README.md` (project hub)**

Mirror `ObsidianVault/Projects/Axentra/README.md`. Include frontmatter (`title: bite — Project Hub`, `tags: [bite, project, index]`, `status: active`), a one-line repo pointer (`Repo: /home/clarisfanhere/Practices/bite · GitHub torisutanjon/bite`), and a **Contents** table linking: `[[Workflow]]`, `[[Progress]]`, `[[Roadmap]]`, `[[Backlog]]`, and the `Tasks/`, `Fixes/`, `Decisions/` folders with one-line purposes each. Add a **Quick links** list (Backlog, Progress) and a `## Related` section linking `[[Progress]]`.

- [ ] **Step 2: Write `Workflow.md` (prose methodology)**

Mirror `ObsidianVault/Projects/Axentra/Axentra-Agentic-Dev-Workflow.md`, retargeted. Frontmatter `title: bite Agentic Dev Workflow`, `tags: [workflow, bite, agentic, process]`, `status: active`. Required sections:
- **TL;DR** table with two tools (drop Jira): `BiteVault` = source of truth (backlog + durable knowledge) · `AI agent` = executor running the per-item loop, TDD throughout.
- **The problem this solves** — no source-of-truth discipline, "done" without proof, lost context, no traceability.
- **The loop** — `/bite-start` (list only), then the 10-step `/bite-work` loop from `MYWORKFLOW.md` in prose. State the hard coverage gates (90/85/95/90).
- **How I use the vault** — `Backlog.md` (tracker), `Progress.md` (living snapshot), `Tasks/`, `Fixes/`, `Decisions/`, `Sessions/`. Emphasize: the vault is writable and *is* the tracker (contrast with an external system).
- **Verification discipline** — TDD non-negotiable; fast-fail order `yarn type-check` → `yarn lint` → `yarn test:coverage`; render-and-measure for UI (Playwright when set up).
- **Why it's a good workflow**, **Boundaries** — accelerator with a human gate, vault can drift if not kept current, no autonomous merging.
- `## Related` linking `[[README]]`, `[[Progress]]`.

- [ ] **Step 3: Verify**

```bash
V=/mnt/d/Obsidian/vaults/BiteVault
grep -c "\[\[Backlog\]\]\|\[\[Progress\]\]" "$V/README.md"     # expect >= 2
grep -ci "jira\|axentra\|PHI" "$V/README.md" "$V/Workflow.md"  # expect 0 total
grep -c "TL;DR\|/bite-work\|type-check" "$V/Workflow.md"       # expect >= 2
```
Expected: README links present, no Jira/Axentra/PHI leakage, Workflow has the loop.

---

### Task 4: `Progress.md` — living app snapshot (seeded from real state)

**Files:**
- Create: `/mnt/d/Obsidian/vaults/BiteVault/Progress.md`

**Interfaces:**
- Consumes: real repo facts gathered in Step 1.
- Produces: the snapshot `[[Progress]]` referenced by `README.md`, `Workflow.md`, and `/bite-start`.

- [ ] **Step 1: Gather current repo state (do not invent — read it)**

```bash
cd /home/clarisfanhere/Practices/bite
git log --oneline -6
find app -maxdepth 4 \( -name page.tsx -o -name layout.tsx \) | sort
node -e "const p=require('./package.json');console.log(Object.keys(p.dependencies).join(', '));console.log('DEV:',Object.keys(p.devDependencies).join(', '))"
git status --short | head -40
```

- [ ] **Step 2: Write `Progress.md`**

Mirror `ObsidianVault/Projects/my-project-status.md` structure but reflect the **actual** minimal state. Frontmatter `title: bite — Project Progress`, `tags: [progress, bite, nextjs, radix, food-delivery]`, `status: active`. Sections:

- **Overview** — bite is a food-delivery platform (FoodPanda/GrabFood-style) practice/portfolio app. **Current stage: UI scaffold.** Pages are built with Radix UI; the backend (Supabase), server state (TanStack Query), event layer (Kafka), and domain architecture described in `CLAUDE.md` are **aspirational — not yet wired**. A Jest + RTL test suite is being established across the existing pages.
- **Tech Stack** — table of what is *actually installed*: Next.js (App Router), React, `@radix-ui/themes`, `@radix-ui/react-icons`, Tailwind CSS, TypeScript (strict); Jest + `jest-environment-jsdom` + RTL; ESLint (`eslint-config-next`) + Prettier; yarn. Add a note: "CLAUDE.md documents the target architecture (Supabase, Kafka, DDD, agents) — none of that is installed yet."
- **Feature Areas & Current State** — one line per built area, marked `UI only`:
  - Landing page (`app/page.tsx`) — shipped (#3).
  - Auth: login + sign-up (`app/auth/login`, `app/auth/sign-up`) — UI shipped (#2), not wired to a backend.
  - Dashboard shell (`app/(dashboard)/layout.tsx`).
  - Stores list + detail (`stores`, `stores/[id]`) — UI.
  - Cart, Checkout — UI (#4).
  - Orders list + detail (`orders`, `orders/[id]`) — UI (#4).
  - Profile (`profile`) — UI (#4).
  - Radix UI + Theme setup (#1).
- **In-Flight Work** — Jest + RTL test suite: `jest.config.ts`, `jest.setup.ts`, `__mocks__/`, `lib/test-utils`, and ~26 `__tests__/` folders across the app routes (uncommitted on `develop`). Coverage gates (90/85/95/90) are the target.
- **Known Gaps** — no data layer (Supabase clients absent); no real auth; static/placeholder data; no Playwright yet.
- **What's Next** — pull from `[[Roadmap]]` / `[[Backlog]]`; e.g. land the test suite, then wire Supabase auth + data.
- **Conventions & References** — repo `CLAUDE.md` (Radix-only, TDD, yarn), `AGENTS.md`.
- `## Related` — `[[README]]`, `[[Roadmap]]`, `[[Backlog]]`.

- [ ] **Step 3: Verify**

```bash
V=/mnt/d/Obsidian/vaults/BiteVault
grep -c "UI scaffold\|not yet wired\|aspirational" "$V/Progress.md"   # expect >= 1
grep -ci "supabase.*shipped\|kafka.*stable" "$V/Progress.md"          # expect 0 (no false claims)
grep -c "jest\|__tests__\|type-check\|Radix" "$V/Progress.md"          # expect >= 2
```
Expected: reflects scaffold stage honestly; no claims that unbuilt backend is done.

---

### Task 5: `Backlog.md` (tracker) + `Roadmap.md` (phases)

**Files:**
- Create: `/mnt/d/Obsidian/vaults/BiteVault/Backlog.md`
- Create: `/mnt/d/Obsidian/vaults/BiteVault/Roadmap.md`

**Interfaces:**
- Consumes: real state from Task 4.
- Produces: `[[Backlog]]` (status-grouped `BITE-###` table read by `/bite-start`) and `[[Roadmap]]` (phase view).

- [ ] **Step 1: Write `Roadmap.md`**

Frontmatter `title: bite — Roadmap`, `tags: [roadmap, bite]`, `status: active`. A phase list, each marked `done` / `in progress` / `planned`:
1. **Foundations** — Next.js + Radix + Tailwind + TS setup — `done` (#1).
2. **Marketing** — landing page — `done` (#3).
3. **Auth UI** — login/sign-up screens — `done` (#2), backend `planned`.
4. **Dashboard UI** — stores, cart, checkout, orders, profile — `done` (#4).
5. **Test suite** — Jest + RTL coverage to gates — `in progress`.
6. **Data layer** — wire Supabase (auth + DB + RLS) — `planned`.
7. **Server state** — TanStack Query hooks — `planned`.
8. **Realtime / domain layer** — orders realtime, DDD/events per `CLAUDE.md` — `planned`.
End with `## Related` → `[[Progress]]`, `[[Backlog]]`.

- [ ] **Step 2: Write `Backlog.md` (the tracker)**

Frontmatter `title: bite — Backlog`, `tags: [backlog, bite, tracker]`, `status: active`. A short intro line: "The tracker. `BITE-###` IDs assigned here, sequential. Statuses: In Progress · Ready · Backlog · Done." Then one markdown table per status group with columns `ID | Type | Title | Notes`. Seed it from real state:
- **In Progress**
  - `BITE-001 | test | Establish Jest + RTL test suite across pages | 26 __tests__ dirs, target 90/85/95/90`
- **Ready** (next up, well-defined)
  - `BITE-002 | feat | Wire Supabase auth to login/sign-up UI | needs @supabase/ssr install`
- **Backlog**
  - `BITE-003 | feat | Wire Supabase data layer for stores/menu`
  - `BITE-004 | chore | Add Playwright for UI render-and-measure`
  - `BITE-005 | feat | TanStack Query hooks for server state`
- **Done**
  - `BITE-000 | chore | Radix UI + landing + auth + dashboard UI scaffold | PRs #1–#4`

(IDs are examples seeded from current reality; the executor may adjust wording but must keep the status groups and the `BITE-###` scheme.)

- [ ] **Step 3: Verify**

```bash
V=/mnt/d/Obsidian/vaults/BiteVault
grep -c "In Progress\|Ready\|Backlog\|Done" "$V/Backlog.md"   # expect >= 4
grep -c "BITE-0" "$V/Backlog.md"                              # expect >= 4
grep -c "done\|in progress\|planned" "$V/Roadmap.md"          # expect >= 4
```
Expected: four status groups, several `BITE-###` rows, phased roadmap.

---

### Task 6: Folder READMEs + templates (`Tasks/`, `Fixes/`, `Decisions/`)

**Files:**
- Create: `/mnt/d/Obsidian/vaults/BiteVault/Tasks/README.md`
- Create: `/mnt/d/Obsidian/vaults/BiteVault/Fixes/README.md`
- Create: `/mnt/d/Obsidian/vaults/BiteVault/Decisions/README.md`

**Interfaces:**
- Produces: the naming conventions + note templates the `/bite-new` and `/bite-work` loops use when creating `Tasks/BITE-###.md`, `Fixes/BITE-###.md`, and `Decisions/YYYY-MM-DD-*.md`.

- [ ] **Step 1: Write `Tasks/README.md`**

Mirror `ObsidianVault/Projects/Axentra/Tickets/README.md` but **without** any Jira/sync block. Frontmatter `title: bite — Tasks`, `tags: [bite, tasks, index]`. State: one note per work item that needs detail beyond its `Backlog.md` row; naming `BITE-###.md`; link with `[[Tasks/BITE-###]]`. Include the template:

```markdown
---
title: "BITE-### — <title>"
date: YYYY-MM-DD
tags: [task, bite]
status: backlog
---

## Summary
## Details
- **Type:** feat | bug | chore · **Status:** Backlog · **Priority:** —

## Acceptance Criteria
## Notes
## Related
- [[Backlog]]
```
End with `## Related` → `[[README]]`, `[[Backlog]]`.

- [ ] **Step 2: Write `Fixes/README.md`**

Mirror the Axentra `Fixes/README.md`. Frontmatter `title: bite — Fix Logs`, `tags: [bite, fixes, index]`. Naming `BITE-###.md`. Template:

```markdown
---
title: "Fix — BITE-###: <short description>"
date: YYYY-MM-DD
tags: [fix, bite]
item: BITE-###
pr: "#"
commit:
---

## Root Cause
## The Fix
## Verification
- type-check ✅ · lint ✅ · N tests passed ✅ (coverage gates met)
- [Screenshot or measurement if visual]

## Related
- [[Tasks/BITE-###]]
```
End with `## Related` → `[[README]]`.

- [ ] **Step 3: Write `Decisions/README.md`**

Mirror the Axentra `Decisions/README.md`. Frontmatter `title: bite — Decision Records`, `tags: [bite, decisions, index]`. Naming `YYYY-MM-DD-<topic>.md`. Template:

```markdown
---
title: "Decision — <topic>"
date: YYYY-MM-DD
tags: [decision, bite]
status: active
---

## Context
## Decision
## Reasoning
## Consequences
## Related
```
Include a starter "Existing decisions (to document)" list: "Vault is the source of truth (no Jira/GitHub Issues)"; "Radix-only UI, no native HTML"; "TDD with 90/85/95/90 coverage gates". End with `## Related` → `[[README]]`.

- [ ] **Step 4: Verify**

```bash
V=/mnt/d/Obsidian/vaults/BiteVault
for d in Tasks Fixes Decisions; do
  grep -c "Related\|BITE-###\|template\|Template\|##" "$V/$d/README.md" >/dev/null && echo "$d ok" || echo "$d MISSING"
done
grep -ci "jira\|JIRA:SYNC" "$V/Tasks/README.md"   # expect 0
```
Expected: three `ok` lines, no Jira/sync-block leakage in Tasks README.

---

### Task 7: First session note + remove default `Welcome.md`

**Files:**
- Create: `/mnt/d/Obsidian/vaults/BiteVault/Sessions/2026-07-04-bite-vault-setup.md`
- Delete: `/mnt/d/Obsidian/vaults/BiteVault/Welcome.md`

**Interfaces:**
- Consumes: everything created in Tasks 1–6 (this note records the setup and gives `/bite-start` a continuity anchor).

- [ ] **Step 1: Write the setup session note**

Use the session template. Frontmatter `title: Session - BiteVault setup`, `date: 2026-07-04`, `tags: [session]`, `status: complete`. Fill:
- **What We Did** — retargeted repo `MYWORKFLOW.md` to bite (`/bite-*`, `BITE-###`, vault-driven); created BiteVault (`CLAUDE.md`, `README`, `Workflow`, `Roadmap`, `Backlog`, `Progress`, folder READMEs); seeded from real repo state (UI scaffold + in-flight test suite).
- **Decisions Made** — vault is the single source of truth (no Jira/GitHub Issues); top-level structure (dedicated vault); `MYWORKFLOW.md` kept local via `.git/info/exclude`.
- **Current State** — vault operational and governs the agent; app is at UI-scaffold stage with a test suite in progress.
- **Next Steps** — land `BITE-001` (test suite), then `BITE-002` (Supabase auth wiring).
- **Related Notes** — `[[README]]`, `[[Progress]]`, `[[Backlog]]`, `[[Workflow]]`.

- [ ] **Step 2: Confirm, then remove `Welcome.md`**

Per vault boundaries, confirm with the user before deleting, then:

```bash
rm /mnt/d/Obsidian/vaults/BiteVault/Welcome.md
```

- [ ] **Step 3: Final verification of the whole vault**

```bash
V=/mnt/d/Obsidian/vaults/BiteVault
ls "$V"                      # CLAUDE.md README.md Workflow.md Roadmap.md Backlog.md Progress.md + folders
ls "$V"/{Tasks,Fixes,Decisions}/README.md
ls "$V"/Sessions/
test ! -e "$V/Welcome.md" && echo "Welcome.md removed" || echo "Welcome.md still present"
grep -rli "jira\|axentra" "$V" || echo "no Jira/Axentra leakage — clean"
```
Expected: all core files + folder READMEs present, one session note, `Welcome.md` removed, no Jira/Axentra references anywhere.

---

## Self-Review

**Spec coverage:**
- `MYWORKFLOW.md` retarget (`/bite-*`, `BITE-###`, vault-driven, no Jira) → Task 1. ✅
- `.git/info/exclude` → Task 1 Step 2. ✅
- `BiteVault/CLAUDE.md` → Task 2. ✅
- `README.md`, `Workflow.md` → Task 3. ✅
- `Progress.md` seeded from real state → Task 4. ✅
- `Backlog.md`, `Roadmap.md` seeded → Task 5. ✅
- Folder READMEs + templates → Task 6. ✅
- First session note + remove `Welcome.md` → Task 7. ✅
- No app/`CLAUDE.md`/`AGENTS.md` changes → enforced by Global Constraints; no task touches them. ✅

**Placeholder scan:** Prose files give explicit section lists + exact seed facts rather than "TBD". The `BITE-###` seed rows use real current state. No "implement later" markers.

**Type/name consistency:** Commands `/bite-start`, `/bite-new`, `/bite-work` and IDs `BITE-###` are identical across Tasks 1, 2, 3, 6, 7. Status set (In Progress · Ready · Backlog · Done) is identical in `MYWORKFLOW.md` (Task 1), `CLAUDE.md` (Task 2), and `Backlog.md` (Task 5). Verify script uses `yarn type-check` / `yarn test:coverage` — the repo's real script names — everywhere.

**Correction applied during review:** the spec's `/bite-work` verify step said `yarn test --coverage`; the repo exposes this as the `test:coverage` script. Plan uses `yarn test:coverage` consistently (both forms work, but the named script matches `package.json`).
