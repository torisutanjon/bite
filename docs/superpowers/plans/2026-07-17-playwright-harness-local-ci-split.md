# Playwright Harness Local/CI Split — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `yarn test:e2e` verify gate real end-to-end — chromium-only and green on the local WSL2 box, full 3-browser suite in CI against a production build, triggered on PRs to `develop` and `main`.

**Architecture:** Single `playwright.config.ts` with `process.env.CI` conditionals (the idiom the scaffold already uses for `forbidOnly`/`retries`/`workers`): chromium always, firefox/webkit CI-only; `webServer` runs `yarn dev` locally and `yarn start` in CI. The GitHub Actions workflow gains a production-build step and triggers on `[main, develop]`.

**Tech Stack:** Playwright 1.61 (`@playwright/test`), Next.js 15, GitHub Actions, yarn.

## Global Constraints

- **yarn only** — never npm for project commands (`yarn build`, `yarn test:e2e`, …).
- **No product code changes** — only `playwright.config.ts` and `.github/workflows/playwright.yml`.
- **No new npm scripts** — `test:e2e` already exists (`playwright test`).
- **No workflow-doc edits** — `MYWORKFLOW.md` / `.claude/commands/bite-work.md` already describe this behavior.
- **No AI attribution in commit messages** (per MYWORKFLOW).
- **Working-tree note:** `playwright.config.ts` already contains an uncommitted `projects` conditional (chromium always, firefox/webkit CI-only, with an explanatory comment). Task 1 keeps it, adds the `webServer` conditional, and commits both together.

---

### Task 1: CI-conditional `playwright.config.ts` (projects + webServer)

**Files:**
- Modify: `playwright.config.ts:84-90` (the `webServer` block; the `projects` conditional at lines 35-61 is already in the working tree — keep it as-is)

**Interfaces:**
- Consumes: nothing.
- Produces: a config where `process.env.CI` unset ⇒ projects = `[chromium]`, webServer command = `yarn dev`; `process.env.CI` set ⇒ projects = `[chromium, firefox, webkit]`, webServer command = `yarn start`. Task 2's workflow relies on the CI branch (it builds with `yarn build`, then `yarn test:e2e` serves via `yarn start`).

- [ ] **Step 1: Make the `webServer` command CI-conditional**

In `playwright.config.ts`, find this exact block at the bottom of the file:

```ts
  /* Start the Next.js dev server before the tests (reused if already running). */
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
```

Replace with:

```ts
  /*
   * Start the app before the tests. Locally: the Next.js dev server (reused if
   * already running). In CI: `yarn start` serving the production build — the
   * workflow runs `yarn build` in a prior step, so the timeout below covers
   * server startup only.
   */
  webServer: {
    command: process.env.CI ? 'yarn start' : 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
```

Do NOT touch the `projects` conditional (lines 35-61) — it is already correct in the working tree.

- [ ] **Step 2: Quality gates**

Run: `yarn type-check`
Expected: exits 0, no errors.

Run: `yarn lint`
Expected: exits 0, no errors.

- [ ] **Step 3: Verify the local branch resolves to chromium only**

Run: `yarn playwright test --list`
Expected: every listed test is prefixed `[chromium]`; no `[firefox]` or `[webkit]` lines appear.

- [ ] **Step 4: Verify the CI branch resolves to all three browsers (list only — no launch)**

Run: `CI=1 yarn playwright test --list`
Expected: listed tests include `[chromium]`, `[firefox]`, and `[webkit]` prefixes. (`--list` doesn't launch browsers, so the missing WSL2 system libs don't matter here.)

- [ ] **Step 5: Run the local gate green**

Run: `yarn test:e2e`
Expected: PASS — all tests green, chromium only (this is `tests/homepage.spec.ts` today). The dev server auto-starts via `webServer` (or reuses one already running on :3000).

- [ ] **Step 6: Prove the CI webServer path locally (chromium only)**

First free port 3000 — `yarn start` cannot reuse a dev server (`reuseExistingServer` is false when `CI` is set):

Run: `fuser -k 3000/tcp || true`
Expected: kills any dev server on :3000 (or no-op).

Run: `NODE_ENV=production yarn build`
Expected: exits 0, production build written to `.next/`.

Run: `CI=1 yarn test:e2e --project=chromium`
Expected: PASS — Playwright starts `yarn start` (prod server), runs the chromium suite green, and shuts the server down. Firefox/webkit are excluded by `--project=chromium`, so missing WSL2 libs are not hit.

- [ ] **Step 7: Commit**

```bash
git add playwright.config.ts
git commit -m "chore(e2e): chromium-only local gate, cross-browser + prod server in CI"
```

---

### Task 2: Trigger CI on `develop` and build for production

**Files:**
- Modify: `.github/workflows/playwright.yml`

**Interfaces:**
- Consumes: Task 1's config CI branch — `yarn test:e2e` with `CI` set expects a production build to exist (the Actions runner sets `CI=true` automatically) and serves it via `yarn start`.
- Produces: a workflow that runs the 3-browser suite on pushes/PRs to `main` and `develop`.

- [ ] **Step 1: Rewrite the workflow**

Replace the full contents of `.github/workflows/playwright.yml` with:

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm install -g yarn && yarn
    - name: Install Playwright Browsers
      run: yarn playwright install --with-deps
    - name: Build production bundle
      run: NODE_ENV=production yarn build
    - name: Run Playwright tests
      run: yarn test:e2e
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

This is the existing scaffold with exactly three deltas: `master` → `develop` in both trigger lists, the new "Build production bundle" step, and `yarn playwright test` → `yarn test:e2e`. (`npm install -g yarn` installs the package manager itself on the bare runner — it is not a project command, so the yarn-only rule is not violated.)

- [ ] **Step 2: Verify the deltas**

Run: `grep -c "develop" .github/workflows/playwright.yml`
Expected: `2`

Run: `grep -c "master" .github/workflows/playwright.yml`
Expected: `0` (grep exits 1 — no matches)

Run: `grep -n "yarn build\|yarn test:e2e" .github/workflows/playwright.yml`
Expected: one `NODE_ENV=production yarn build` line and one `yarn test:e2e` line, build before test.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/playwright.yml
git commit -m "ci: run Playwright on develop, test against production build"
```

Real CI proof (3-browser run on ubuntu) lands when the branch is pushed / PR'd — push requires the user's explicit approval; ask before pushing.

---

## Self-Review

**1. Spec coverage:**
- Spec §1 config `projects` conditional → Task 1 (kept from working tree, verified in Steps 3-4, committed Step 7). ✓
- Spec §1 config `webServer` conditional → Task 1 Step 1. ✓
- Spec §2 triggers `[main, develop]` → Task 2 Step 1. ✓
- Spec §2 `NODE_ENV=production yarn build` step → Task 2 Step 1. ✓
- Spec §2 `yarn test:e2e` as the CI test command → Task 2 Step 1. ✓
- Spec §2 keep install/`--with-deps`/artifact upload → Task 2 Step 1 (unchanged lines). ✓
- Spec verification 1-3 (type-check/lint, local gate green, CI branch proven via build + `CI=1 --project=chromium`) → Task 1 Steps 2, 5, 6. ✓
- Spec verification 4 (real CI on push, push needs approval) → Task 2 Step 3 note. ✓
- Spec non-goals (no product code / scripts / doc edits / mobile projects / CI caching) → Global Constraints; no task touches them. ✓

**2. Placeholder scan:** No TBD/TODO/"handle edge cases"/"similar to Task N". Every edit shows exact old and new content; every command has expected output. ✓

**3. Type consistency:** N/A (config + YAML). Command names consistent across tasks: `yarn test:e2e`, `yarn start`, `NODE_ENV=production yarn build`, `CI=1`. ✓
