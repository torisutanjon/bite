---
description: Session start — read Jira then the BiteVault and list the backlog (list only, never starts work)
---

Follow the `## /bite-start` section of `MYWORKFLOW.md` in the repo root exactly. `MYWORKFLOW.md` is the source of truth; if it is not already in context, read it first.

**Jira is the source of truth for item state** (key, title, type, status, goal). The vault supplies goals, task detail and session continuity. Do ONLY this, then stop:

1. **Health check.** Run `./scripts/jira.sh check`.
   - Non-zero exit → print `⚠ JIRA UNAVAILABLE — vault may be stale`, continue in **degraded mode** from the vault alone, and label the whole report degraded. Never fall back silently.
2. **Read Jira.** Run `./scripts/jira.sh list`. Authoritative TSV: `key, legacy, issuetype, status, goal, state, summary`.
3. **Read the vault** — the most recent note in `/mnt/d/Obsidian/vaults/BiteVault/Sessions/`, plus `Goals.md`, `Progress.md`, `JiraMap.md`, and `Tasks/` for any item needing detail.
4. **Join.** Match Jira rows to vault rows on the legacy marker (`vault-###` ↔ `BITE-###`, see `JiraMap.md`) or the Jira key. **Render each item exactly once.** On any conflict, Jira wins.
5. **Report**, grouped in this order — **In Progress → Ready → Backlog → Done**. Jira has no `Ready` status, so `Ready` vs `Backlog` comes from the `state-ready` / `state-backlog` label while status is `To Do`. Show `KEY (BITE-###) [type] title — G#`.
6. **Drift report.** Print each class, or `none`:
   - `UNFILED` — vault row with no Jira ticket
   - `UNTRACKED` — bite-labelled ticket with no vault row
   - `DESYNCED` — status disagreement between Jira and the vault
   - `NO-GOAL` — item with a missing or `no-goal` goal label
7. Summarize where we left off from the most recent session note — decisions, current state, next steps.
8. **STOP.** Do not auto-pick an item or start work. Wait for me to run `/bite-work`.
