---
description: File a new backlog item (BITE-###) in the vault — does not start work
argument-hint: "<title>"
---

Follow the `## /bite-new` section of `MYWORKFLOW.md` in the repo root exactly, for a new item titled: **$ARGUMENTS**. `MYWORKFLOW.md` is the source of truth; if it is not already in context, read it first.

In short, do ONLY this, then stop:

1. Append a new `BITE-###` row (next sequential ID) to `/mnt/d/Obsidian/vaults/BiteVault/Backlog.md` under **Backlog**, with a type (feat/bug/chore), a **required `Goal` value** (`G#` from `Goals.md`), status `Backlog`, and a one-line description derived from the title above. If no live goal fits, set `no-goal`, tell me, and ask me to pick or propose a goal — never silently filed.
2. If the item needs detail (acceptance criteria, context), create `/mnt/d/Obsidian/vaults/BiteVault/Tasks/BITE-###.md` from the task template in `Tasks/README.md`.
3. **STOP.** This only files the item — I will run `/bite-work BITE-###` when ready to build.
