# Design — Playwright in the reproduce / verify loop

- **Date:** 2026-07-13
- **Type:** workflow / process change (documentation only, no product code)
- **Status:** approved
- **Affects:** `MYWORKFLOW.md` (source of truth), `.claude/commands/bite-work.md` (mirror)

## Problem

The `/bite-work` loop currently touches Playwright in exactly one place — the
Verify step's "render-and-measure for any UI change." The Analyze step just says
"reproduce it first" with no browser involvement, so bug reproduction is done by
reasoning from source rather than observing the failure. There is no explicit link
from a browser reproduction to the existing TDD red-test mandate, and no explicit
browser-based confirmation that a bug is actually gone.

Goal: make Playwright a first-class tool at **two** points of the loop — reproduce
the issue during Analyze, and confirm it is solved during Verify — while honoring
the existing TDD mandate and not forcing browser tooling onto cases where it does
not fit.

## Scope

- **In scope:** the **bug** path of `/bite-work`, gated on **browser-observable**
  issues. Specifically the Analyze step (bug branch), the failing-test step, and
  the Verify step.
- **Out of scope:**
  - Feature / enhancement items — a feature has nothing to "reproduce"; features
    keep the existing render-and-measure gate for UI changes.
  - Non-browser bugs (util / type / server-logic) — these reproduce at the unit
    level as before.
  - Any product code, npm scripts, or `playwright.config.ts` changes.

## Existing infrastructure (no changes needed)

- `yarn test:e2e` runs committed Playwright specs (`playwright test`).
- `playwright.config.ts` auto-starts `yarn dev` (`webServer`, `reuseExistingServer`),
  runs chromium / firefox / webkit, `baseURL` `http://localhost:3000`.
- Committed-spec pattern already exists: `tests/homepage.spec.ts` (sets its own
  viewports inline via `test.use({ viewport })`, writes portable screenshots via
  `testInfo.outputPath`).
- Playwright MCP tools are available for ad-hoc, interactive browser driving.

Repro specs follow the homepage-spec pattern and set their own viewport inline, so
no config edits (e.g. uncommenting mobile projects) are required.

## The change — three edits to the `/bite-work` loop

### Step 2 — Analyze (bug branch)

Reproduce a **browser-observable** bug **live via the Playwright MCP tools**: start
`yarn dev`, drive the browser to the failing state, and observe the broken behavior
firsthand before proposing a fix. Non-browser bugs (util / type / server logic)
reproduce at the unit level as before. This removes "reason from source" at the
*start* of the loop, not only at the end.

### Step 4 — Failing test first (TDD mandate)

The reproduction becomes the TDD red test:

- **Default:** encode the reproduction as a **committed `tests/*.spec.ts`** that
  fails (red). For a browser-observable bug this *is* the "no implementation before
  a red test" gate, and it remains in the repo as a permanent regression guard.
- **Fallback:** when a clean, deterministic committed spec is not feasible — it
  needs live backend / data, is timing-dependent, or the reproduction is purely
  exploratory — use an **ad-hoc MCP reproduction** with a "before" screenshot as
  evidence, and **note the reason in the session note** so the escape hatch is
  auditable rather than silent.

### Step 7 — Verify

Confirm the fix **in a real browser**, matched to the path taken in Step 4:

- **Committed-spec bug** → `yarn test:e2e`; the previously-red spec now passes
  **green**.
- **Fallback bug** → **re-drive the same reproduction steps** via the Playwright
  MCP tools, confirm the issue is gone, and capture an "after" screenshot.
- **CSS / visual / layout change** → render-and-measure at the reported
  viewport(s) — the existing gate, unchanged.

`yarn type-check` → `yarn lint` → `yarn test:coverage` fast-fail order and the
90/85/95/90 coverage gates are unchanged. "No done without evidence" is unchanged.

### Step 10 — Close the loop (no structural change)

The green `test:e2e` run or the before/after screenshots are the "verification"
evidence already required by `Fixes/BITE-###.md` and the session note. This change
simply makes that evidence concretely browser-based for browser-observable bugs.

## Non-goals (YAGNI)

- No new npm scripts.
- No changes to `playwright.config.ts` (specs set viewports inline).
- No new `/bite-*` command.
- No forcing an e2e spec onto non-browser or infeasible cases — that is exactly
  what the fallback path is for.

## Acceptance criteria

1. `MYWORKFLOW.md` `/bite-work` steps 2, 4, and 7 describe the behavior above, with
   the browser-observable gate explicit and the default-spec / fallback-driving
   split explicit.
2. `.claude/commands/bite-work.md` short-form steps 2, 4, and 7 mirror
   `MYWORKFLOW.md` (kept in sync).
3. Non-browser bugs and feature items are explicitly untouched by the new browser
   requirement.
4. No product code, scripts, or Playwright config are modified.
