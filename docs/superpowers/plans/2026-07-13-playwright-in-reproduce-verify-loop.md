# Playwright in the Reproduce / Verify Loop — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Playwright a first-class tool at two points of the `/bite-work` loop — reproduce a browser-observable bug during Analyze, and confirm it is solved during Verify — by editing the two workflow docs that encode the loop.

**Architecture:** Documentation-only change. The loop is defined in two files that must stay in sync: `MYWORKFLOW.md` (source of truth, full prose) and `.claude/commands/bite-work.md` (short mirror). Each task edits steps 2 (Analyze), 4 (failing test), and 7 (Verify) of one file. No product code, npm scripts, or `playwright.config.ts` changes.

**Tech Stack:** Markdown. Existing Playwright harness (`yarn test:e2e`, committed `tests/*.spec.ts` pattern, Playwright MCP tools) — referenced, not modified.

## Global Constraints

- **Scope:** bug path only, gated on **browser-observable** issues. Features keep the existing render-and-measure gate; non-browser bugs (util / type / server logic) reproduce at the unit level.
- **Default vs fallback:** default = a committed `tests/*.spec.ts` reproduction (red → green); fallback = ad-hoc Playwright MCP driving with before/after screenshots, used only when a deterministic spec isn't feasible (live backend/data, timing-dependent, exploratory), with the reason noted in the session note.
- **No changes** to product code, npm scripts, or `playwright.config.ts`.
- **`MYWORKFLOW.md` is local-only** — it is in `.git/info/exclude`, so its edit will NOT appear in `git status` / commits. Only `.claude/commands/bite-work.md` is tracked and committed.
- Both files must end up describing the same behavior at steps 2, 4, and 7.

---

### Task 1: Update `MYWORKFLOW.md` (source of truth)

**Files:**
- Modify: `MYWORKFLOW.md` (the `## /bite-work BITE-###` section, steps 2, 4, 7)

**Interfaces:**
- Consumes: nothing.
- Produces: the canonical wording that Task 2's short mirror must match.

- [ ] **Step 1: Replace step 2 (Analyze).**

Find this exact block:

```markdown
2. **Analyze.** Bug → assess **validity** (reproduce it first). Feature/enhancement →
   assess **feasibility + scope**. Push back if the item is invalid, already done, or
   underspecified.
```

Replace with:

```markdown
2. **Analyze.** Bug → assess **validity** by **reproducing it first**. For a
   **browser-observable** bug, reproduce it live in a real browser via the Playwright
   MCP tools (`yarn dev`, drive to the failing state, observe the break firsthand) —
   don't reason from source. Non-browser bugs (util / type / server logic) reproduce at
   the unit level. Feature/enhancement → assess **feasibility + scope**. Push back if the
   item is invalid, already done, or underspecified.
```

- [ ] **Step 2: Replace step 4 (failing test first).**

Find this exact block:

```markdown
4. **Write the failing test first** (TDD mandate — no implementation before a red test).
```

Replace with:

```markdown
4. **Write the failing test first** (TDD mandate — no implementation before a red test).
   For a **browser-observable bug**, the red test is a **committed Playwright spec in
   `tests/`** that encodes the reproduction and fails. Fall back to an ad-hoc Playwright
   MCP repro (a "before" screenshot as evidence) only when a deterministic spec isn't
   feasible — it needs live backend/data, is timing-dependent, or the repro is
   exploratory — and note the reason in the session note.
```

- [ ] **Step 3: Replace step 7 (Verify).**

Find this exact block:

```markdown
7. **Verify** — fast-fail order: `yarn type-check` → `yarn lint` → `yarn test:coverage`.
   For any CSS/visual/UI change, render at the reported viewport and measure in a real
   browser — don't reason from source (set up Playwright when first needed). No "done"
   without evidence.
```

Replace with:

```markdown
7. **Verify** — fast-fail order: `yarn type-check` → `yarn lint` → `yarn test:coverage`.
   Confirm any **browser-observable** change in a real browser, not from source:
   - **Bug fixed with a committed repro spec** → `yarn test:e2e`; the previously-red spec
     now passes green.
   - **Ad-hoc / fallback bug** → re-drive the same reproduction steps via the Playwright
     MCP tools, confirm the issue is gone, capture an "after" screenshot.
   - **CSS / visual / UI change** → render at the reported viewport and measure in a real
     browser (set up Playwright when first needed).
   No "done" without evidence.
```

(Leave the `> ⚠️ Coverage gates …` blockquote immediately after step 7 untouched.)

- [ ] **Step 4: Verify the edits landed.**

Run: `grep -nc "Playwright" MYWORKFLOW.md`
Expected: `3` (one mention added in each of steps 2, 4, 7).

Run: `grep -n "browser-observable" MYWORKFLOW.md`
Expected: three matches, in the step 2, 4, and 7 blocks.

- [ ] **Step 5: (No commit.)**

`MYWORKFLOW.md` is in `.git/info/exclude` (local-only), so it will not appear in `git status` and is intentionally not committed. Confirm:

Run: `git status --porcelain MYWORKFLOW.md`
Expected: empty output (git ignores it).

---

### Task 2: Mirror the change in `.claude/commands/bite-work.md`

**Files:**
- Modify: `.claude/commands/bite-work.md` (short-form steps 2, 4, 7)

**Interfaces:**
- Consumes: the canonical wording from Task 1 (must describe the same behavior, condensed).
- Produces: a tracked, committed change.

- [ ] **Step 1: Replace short step 2.**

Find this exact line:

```markdown
2. **Analyze** — bug → reproduce first; feature → assess scope. Push back if invalid, done, or underspecified.
```

Replace with:

```markdown
2. **Analyze** — bug → reproduce first (browser-observable bugs: reproduce live via the Playwright MCP tools; non-browser bugs: at the unit level); feature → assess scope. Push back if invalid, done, or underspecified.
```

- [ ] **Step 2: Replace short step 4.**

Find this exact line:

```markdown
4. **Failing test first** (TDD).
```

Replace with:

```markdown
4. **Failing test first** (TDD). For a browser-observable bug, the red test is a committed Playwright spec in `tests/`; fall back to an ad-hoc Playwright MCP repro (before-screenshot) only when a deterministic spec isn't feasible, noting why in the session note.
```

- [ ] **Step 3: Replace short step 7.**

Find this exact line:

```markdown
7. **Verify** — `yarn type-check` → `yarn lint` → `yarn test:coverage` (gates 90/85/95/90); render-and-measure for any UI change.
```

Replace with:

```markdown
7. **Verify** — `yarn type-check` → `yarn lint` → `yarn test:coverage` (gates 90/85/95/90). Confirm browser-observable changes in a browser: committed repro spec → `yarn test:e2e` goes green; ad-hoc/fallback → re-drive the steps + after-screenshot; CSS/UI → render-and-measure.
```

- [ ] **Step 4: Verify the mirror is consistent.**

Run: `grep -nc "Playwright" .claude/commands/bite-work.md`
Expected: `2` (steps 2 and 4 name Playwright; step 7 references `test:e2e`/render-and-measure).

Run: `grep -n "browser-observable\|test:e2e" .claude/commands/bite-work.md`
Expected: matches present in steps 2, 4, and 7. Read the three lines and confirm they describe the same behavior as `MYWORKFLOW.md` steps 2/4/7.

- [ ] **Step 5: Commit.**

```bash
git add .claude/commands/bite-work.md
git commit -m "docs: wire Playwright into bite-work reproduce/verify steps"
```

(Only `.claude/commands/bite-work.md` is staged — `MYWORKFLOW.md` is git-excluded and the spec was committed in a prior commit.)

---

## Self-Review

**1. Spec coverage:**
- Spec "Step 2 — Analyze (bug branch)" → Task 1 Step 1 + Task 2 Step 1. ✓
- Spec "Step 4 — Failing test first" (default spec / fallback) → Task 1 Step 2 + Task 2 Step 2. ✓
- Spec "Step 7 — Verify" (three matched paths) → Task 1 Step 3 + Task 2 Step 3. ✓
- Spec scope (bug-only, browser-observable gate; features/non-browser untouched) → carried in Global Constraints and the step wording. ✓
- Spec non-goals (no scripts/config/product code, no new command) → Global Constraints + nothing in the plan touches them. ✓
- Spec "Step 10 close-out, no structural change" → correctly no task (nothing to edit). ✓

**2. Placeholder scan:** No TBD/TODO/"handle edge cases"/"similar to Task N". Every edit shows exact old and new text. ✓

**3. Type consistency:** N/A (docs). Terminology is consistent across both files: "browser-observable", "committed Playwright spec in `tests/`", "ad-hoc Playwright MCP repro", `yarn test:e2e`, "render-and-measure". ✓
