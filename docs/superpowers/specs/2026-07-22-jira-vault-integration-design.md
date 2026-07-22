# Jira ⇄ BiteVault Integration — Design

**Date:** 2026-07-22
**Status:** Approved (design), pending implementation plan
**Affects:** `.claude/commands/bite-{start,new,work}.md`, `MYWORKFLOW.md`, `scripts/jira.sh`, `BiteVault/`

---

## 1. Problem

The BiteVault Obsidian vault is currently the sole tracker for `bite`. There is no
external issue tracker. The author wants Jira to become the system of record for
backlog item state, while the vault keeps the context Jira handles poorly (goals,
acceptance criteria, fix write-ups, session continuity).

Three deliverables:

1. Backfill Jira with tickets for all existing vault items.
2. `/bite-start` reads Jira first, then the vault, presenting each item exactly once.
3. `/bite-new` creates the Jira ticket (title, description, expected result).

A fourth requirement emerged during design: without status writeback, Jira cannot
be authoritative for status. `/bite-work` must therefore drive transitions.

---

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | **Jira is primary; the vault enriches** | One writer per field. Jira owns id/title/status/type/description. Vault owns `Goals.md`, `Tasks/`, `Fixes/`, `Sessions/`, `Progress.md`, `Decisions/`. |
| D2 | **`Backlog.md` becomes a generated mirror** | Regenerated from Jira on `/bite-start`; never hand-edited. Eliminates two-writer drift. |
| D3 | **Jira key is the canonical ID going forward** | Legacy `BITE-###` is preserved only as a label + mapping table, never minted again. |
| D4 | **Project key is `KAN`** (pre-existing) | No visual collision with `BITE-###`, so the original collision risk is moot. |
| D5 | **Auth = scoped API token, basic auth** | Verified empirically. See §3. |
| D6 | **Writes use REST v2; reads use v3** | v3 requires ADF (nested JSON) for `description`; v2 accepts plain text. Avoids hand-building ADF. |
| D7 | **`bite` label scopes every query** | Pre-existing `KAN-1..3` placeholders stay invisible without being mutated. Token has no delete scope regardless. |
| D8 | **`/bite-work` drives status transitions** | Otherwise Jira status is wrong the moment work starts, breaking D1. |

---

## 3. Authentication (empirically verified 2026-07-22)

The token is an Atlassian **scoped** API token, not a classic one. This has a
non-obvious consequence that produces a silent `401`:

- ❌ `https://{site}.atlassian.net/rest/api/3/...` → `401 Client must be authenticated`
- ✅ `https://api.atlassian.com/ex/jira/{cloudId}/rest/api/3/...` → `200`

Scope is limited to issue read/write. Confirmed **out of scope**:

- `/rest/api/3/myself` → `401 Unauthorized; scope does not match` (needs `read:me`)
- project creation (needs admin) — the project must pre-exist
- issue deletion — **created tickets cannot be removed by this tooling**

Config lives in `.env.local` (matched by `.gitignore`'s `.env*`). Only variable
*names* appear in committed files:

```
JIRA_SITE, JIRA_EMAIL, JIRA_TOKEN, JIRA_CLOUD_ID, JIRA_PROJECT_KEY
```

Because unprefixed vars are not exposed to the browser by Next.js
(only `NEXT_PUBLIC_*` are), colocating these in `.env.local` is safe.

---

## 4. Discovered Jira configuration

Not a default project — discovered via `createmeta` and `project/{key}/statuses`.

**Issue types:** Epic, Subtask, Task, Story, Feature, Request, Bug

**Statuses:** To Do, In Progress, Code Review, QA Review, Needs Revision,
Ready for Production, Done

**Transitions are fully connected** — every status reaches every other, so
transition IDs are global and need no per-issue lookup:

| ID | Target |
|---|---|
| 11 | To Do |
| 21 | In Progress |
| 31 | Code Review |
| 41 | QA Review |
| 3 | Needs Revision |
| 2 | Ready for Production |
| 51 | Done |

---

## 5. Mappings

### 5.1 Type

| Vault type | Jira issue type | Label |
|---|---|---|
| feat | Feature | `type-feat` |
| enhancement | Story | `type-enhancement` |
| chore | Task | `type-chore` |
| test | Task | `type-test` |
| bug | Bug | `type-bug` |

### 5.2 Status

| Vault status | Jira status | Distinguishing label |
|---|---|---|
| Backlog | To Do | `state-backlog` |
| Ready | To Do | `state-ready` |
| In Progress | In Progress | — |
| Done | Done | — |

Jira has no `Ready` status. The Backlog/Ready split is preserved as a label so
`/bite-start` can still render four groups.

### 5.3 Labels applied to every bite ticket

```
bite                     ← scopes all queries (D7)
type-<vault type>        ← exact original type
goal-G1 | goal-G2 | goal-G3
state-backlog | state-ready   ← only while status is To Do
legacy-BITE-###          ← backfilled items only
```

---

## 6. Components

### 6.1 `scripts/jira.sh`

A single committed shell script — no secrets, sources `.env.local`. Shell rather
than TypeScript so it stays outside the Jest coverage gate (95% functions), which
it would otherwise pollute for no benefit.

| Subcommand | Purpose |
|---|---|
| `check` | Connectivity + scope smoke test. Probes an **in-scope** endpoint (`project/{key}`), *not* `/myself`. |
| `list` | JQL query scoped to `labels = bite`; emits TSV: key, legacy, type, status, labels, summary |
| `create` | Creates an issue via v2; echoes the new key |
| `transition` | Moves an issue to a named status via the fixed ID table |
| `label` | Adds/removes a label (used for `state-ready` ↔ `state-backlog`) |

Contract:
- Never echoes `JIRA_TOKEN`; auth passed via `--user`.
- Missing env var → names the exact missing key, exit 2. Never dumps a raw 401.
- Non-2xx → prints status + response body, exit 1.

### 6.2 `BiteVault/JiraMap.md`

Mapping table for the 18 backfilled items so existing `[[Tasks/BITE-###]]`
wikilinks stay resolvable permanently.

```
| Jira | Legacy | Title |
|------|--------|-------|
| KAN-4 | BITE-000 | Radix UI + landing + auth + dashboard UI scaffold |
```

---

## 7. Ticket content template

Jira has no native "expected result" field, and creating a custom field requires
admin scope the token lacks. It is therefore a description section.

```
Summary:  [BITE-003] Supabase foundation — install, clients, schema, RLS, seed
          └─ legacy prefix on backfilled items only; new items use plain title

Description:
  ## Context
  <why this exists — from Tasks/BITE-###.md plus the Goals.md objective text>

  ## Scope
  <what changes; explicit non-goals>

  ## Expected Result
  <observable end state: what is true when this is done>

  ## Acceptance Criteria
  - [ ] …

  ---
  Goal: G1 — Make it real
  Vault: [[Tasks/BITE-003]]
```

---

## 8. Flows

### 8.1 `/bite-start`

```
1. jira.sh check
     ├─ ok      → continue
     └─ fail    → print "⚠ JIRA UNAVAILABLE — vault may be stale", fall back
                  to vault-only, and label the whole report as degraded
2. jira.sh list                  → authoritative state
3. read vault                    → Goals, Progress, Sessions, Tasks
4. join on legacy label / key    → each item rendered ONCE (Jira wins on conflict)
5. render four groups            → In Progress → Ready → Backlog → Done
6. drift report                  → see below
7. STOP — never auto-pick
```

Drift classes (strictly stronger than today's empty-goal check):

| Class | Meaning |
|---|---|
| `UNFILED` | vault row with no Jira ticket |
| `UNTRACKED` | bite-labelled ticket with no vault row |
| `DESYNCED` | status disagreement between systems |
| `NO-GOAL` | missing/`no-goal` goal label — preserved from current behaviour |

### 8.2 `/bite-new "<title>"`

Jira is written **first** — it is the ID authority, and a vault row pointing at a
ticket that failed to create is worse than the reverse.

```
1. resolve Goal (G#) — hard gate, `no-goal` still blocks and asks
2. draft title / description / expected result
3. SHOW the draft, wait for explicit confirmation      ← write gate
4. jira.sh create → new key (e.g. KAN-22)
5. write vault: Backlog.md row + Tasks/KAN-22.md
6. STOP — does not start work
```

### 8.3 `/bite-work <id>`

Accepts **either** a Jira key (`KAN-7`) or a legacy id (`BITE-016`); a legacy id is
resolved to its Jira key via the `legacy-BITE-###` label before anything else runs.
This keeps muscle memory and existing vault links working after cutover.

Adds transitions to the existing loop; all other steps unchanged.

| Loop step | Transition |
|---|---|
| 1 — pull item | → In Progress (21) |
| 7 — verification passes | → QA Review (41) |
| 9 — PR opened | → Code Review (31) |
| 10 — close loop | → Done (51) |
| PR review requests changes | → Needs Revision (3) |

`Ready for Production` (2) is left for manual use; nothing in the loop maps to it.

---

## 9. Backfill (one-time)

18 tickets: 14 open + 4 Done. Creates `KAN-4` … `KAN-21`.

| Vault | Type → Jira | Target status |
|---|---|---|
| BITE-003, BITE-002 | Feature | To Do + `state-ready` |
| BITE-016, 017, 005, 007, 008, 009 | Feature | To Do + `state-backlog` |
| BITE-010, 011, 012, 013, 014, 015 | Story | To Do + `state-backlog` |
| BITE-000 | Task | Done |
| BITE-001 | Task | Done |
| BITE-004 | Task | Done |
| BITE-006 | Feature | Done |

Done items need a second call each (create → transition 51).

Expected totals, to be asserted after the run — a mismatch means the backfill is wrong:

| Issue type | Count |
|---|---|
| Feature | 9 |
| Story | 6 |
| Task | 3 |
| **Total** | **18** |

**Idempotency:** every create is preceded by
`jql=labels="legacy-BITE-###"`; a hit means skip. Re-running cannot produce
duplicates. The script reports created/skipped/failed per item and is resumable
after partial failure.

**Irreversibility:** the token cannot delete issues. A botched backfill can only be
transitioned or relabelled, not removed. Therefore the backfill runs in two phases:
a `--dry-run` that prints every payload, then execution only after explicit approval.

**Open question deferred to implementation:** BITE-008's goal is ambiguous (G2 vs G1,
flagged in `Backlog.md`). It gets `goal-G2` per the current vault row; revisit
separately rather than blocking backfill.

---

## 10. Correction to `MYWORKFLOW.md`

The file's header asserts it is *"Kept local via `.git/info/exclude` — never
committed."* This is false: `.git/info/exclude` is empty and `git ls-files` shows
`MYWORKFLOW.md` and all three `.claude/commands/*.md` are tracked against
`git@github.com:torisutanjon/bite.git`.

Left uncorrected, that sentence invites putting credentials in a file that is
published. The header will be corrected to state that the file **is** committed,
and that configuration belongs in `.env.local` with only variable names referenced
in committed docs.

---

## 11. Testing

Shell tooling, so no Jest involvement and no impact on coverage gates.

| Level | Test |
|---|---|
| Connectivity | `jira.sh check` returns 0 against the real project |
| Scope | in-scope endpoints 200; `/myself` expected to 401 (asserted, not incidental) |
| Idempotency | backfill run twice → second run reports 18 skipped, 0 created |
| Dedupe | an item present in both systems appears exactly once in `/bite-start` |
| Degraded mode | unset `JIRA_TOKEN` → `/bite-start` still renders from vault, marked degraded |
| Drift | hand-desync one status → `DESYNCED` is reported |

---

## 12. Out of scope

- Migrating `Fixes/`, `Sessions/`, `Decisions/` into Jira — they stay vault-only.
- Jira Epics for goals G1–G3 (possible later; not needed now).
- Sprints/boards/estimates.
- Deleting or editing the `KAN-1..3` placeholders.
- Two-way sync of `Tasks/` note bodies — the vault remains authoritative there.
