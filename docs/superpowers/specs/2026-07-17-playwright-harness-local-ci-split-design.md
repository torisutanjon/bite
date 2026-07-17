# Design — Playwright harness: local chromium gate, cross-browser CI

- **Date:** 2026-07-17
- **Type:** tooling / CI change (no product code)
- **Status:** approved
- **Affects:** `playwright.config.ts`, `.github/workflows/playwright.yml`

## Problem

The 2026-07-13 workflow change made `yarn test:e2e` the verify gate for
browser-observable bugs in the `/bite-work` loop — but the harness behind that
gate does not actually work end-to-end:

1. **Local:** `yarn test:e2e` runs chromium, firefox, and webkit. Firefox and
   webkit cannot launch on the WSL2 dev box — their system libraries (libgtk-4,
   etc.) are not installable without passwordless sudo — so the gate can never
   go green locally, even when the code is correct.
2. **CI:** `.github/workflows/playwright.yml` triggers only on pushes/PRs to
   `main`/`master`. The `/bite-work` loop opens PRs against **`develop`**, so
   cross-browser coverage never runs on the PRs that matter. (`master` does not
   exist in this repo.)
3. **CI fidelity:** the Playwright `webServer` runs `yarn dev` everywhere. In
   CI, e2e against a Turbopack dev server misses build-only breakage and does
   not exercise what actually ships.

Goal: make the verify gate real — chromium-only and green locally, full
3-browser suite in CI against a production build, triggered on the PRs the
loop actually opens.

## Approach (chosen: single config, `process.env.CI` conditionals)

One `playwright.config.ts` with CI-conditional behavior, matching the idiom the
scaffold already uses (`forbidOnly`, `retries`, `workers` are all already
`process.env.CI`-conditional). Rejected alternatives:

- **CLI project selection** (`test:e2e: playwright test --project=chromium`):
  hides the "why chromium-only locally" knowledge in an opaque package.json
  flag; a bare `yarn playwright test` locally still fails on missing libs.
- **Separate `playwright.ci.config.ts`:** two files to keep in sync for a
  5-line difference.

## The change

### 1. `playwright.config.ts`

- **`projects`:** chromium always; firefox + webkit only when `process.env.CI`
  is set. A comment explains why (WSL2 system-library constraint, CI installs
  deps via `playwright install --with-deps`).
- **`webServer.command`:** `process.env.CI ? 'yarn start' : 'yarn dev'`.
  Locally unchanged — starts (or reuses, via `reuseExistingServer`) the dev
  server. In CI it serves the production build; the build itself happens in a
  separate workflow step, so the 120s `webServer` timeout covers server
  startup only.
- Everything else untouched.

### 2. `.github/workflows/playwright.yml`

- **Triggers:** `push` and `pull_request` on `[main, develop]` (replaces
  `[main, master]`).
- **New step** before the test run: `NODE_ENV=production yarn build`.
- **Test step:** `yarn test:e2e` (the same command the workflow docs name)
  instead of raw `yarn playwright test`.
- **Keep:** yarn install, `playwright install --with-deps`, HTML report
  artifact upload.

## Risks / error handling

- **Env vars:** none needed — no middleware, no Supabase imports under `app/`,
  no `.env` files; the app builds and serves bare. If that ever changes, CI
  fails loudly at the build step, which is the correct failure mode.
- **Local ≠ CI behavior** is inherent to the conditional config — mitigated by
  proving both paths in verification (below).

## Verification (evidence before "done")

1. `yarn type-check` → `yarn lint` pass.
2. Local gate: `yarn test:e2e` runs **chromium only** and the existing
   `tests/homepage.spec.ts` passes green.
3. CI branch of the config proven locally: `NODE_ENV=production yarn build`,
   then `CI=1 yarn test:e2e --project=chromium` — exercises the `yarn start`
   webServer path without needing firefox/webkit system libs.
4. Real CI proof lands when the branch is pushed / PR'd (push requires
   explicit approval per user policy).

## Non-goals (YAGNI)

- No product code changes.
- No new npm scripts.
- No workflow-doc edits — `MYWORKFLOW.md` / `.claude/commands/bite-work.md`
  already describe this behavior; this change makes them true.
- No mobile/branded browser projects (stay commented out).
- No CI caching/matrix optimizations.

## Acceptance criteria

1. `yarn test:e2e` on the local WSL2 box runs chromium only and passes.
2. With `CI` set, the config resolves to chromium + firefox + webkit and a
   `yarn start` webServer.
3. The workflow triggers on pushes and PRs to both `main` and `develop`,
   builds the app for production, and runs `yarn test:e2e`.
4. No product code, npm scripts, or workflow docs are modified.
