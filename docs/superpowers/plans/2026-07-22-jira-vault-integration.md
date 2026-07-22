# Jira ⇄ BiteVault Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Jira the system of record for `bite` backlog item state, while the BiteVault Obsidian vault keeps goals, task detail, fixes and session continuity.

**Architecture:** A single committed shell adapter (`scripts/jira.sh`) wraps the Jira Cloud REST API and is the only thing that talks to Jira. A JSON manifest drives a one-time, idempotent backfill of 18 existing vault items. The three `/bite-*` slash commands are then rewritten to call the adapter instead of reading `Backlog.md` as truth.

**Tech Stack:** POSIX shell, `curl`, `jq` (all present — no new dependencies, no `yarn add`). Jira Cloud REST v2 (writes) and v3 (reads).

**Spec:** `docs/superpowers/specs/2026-07-22-jira-vault-integration-design.md`

## Global Constraints

- **Package manager is yarn.** This plan adds **no** packages. Never run `npm`.
- **Never print `JIRA_TOKEN`.** Auth is passed via `curl --user` only. No `echo`, no `set -x` in committed code.
- **Committed files carry variable *names* only** — never a token, site URL, cloudId or email literal. `MYWORKFLOW.md`, `.claude/commands/*.md` and `scripts/` are all tracked against `git@github.com:torisutanjon/bite.git`.
- **Base URL is `https://api.atlassian.com/ex/jira/${JIRA_CLOUD_ID}`.** The site URL (`https://…atlassian.net/rest/…`) returns 401 for this scoped token. Never use it.
- **The token cannot delete issues.** Anything created is permanent. Every write path is gated behind an explicit confirmation.
- **`/rest/api/3/myself` is out of scope and returns 401 by design.** Never use it as a health check.
- **Transition IDs are global** (workflow is fully connected): `11` To Do · `21` In Progress · `31` Code Review · `41` QA Review · `3` Needs Revision · `2` Ready for Production · `51` Done.
- **Every JQL query is scoped with `AND labels = bite`** so pre-existing `KAN-1`, `KAN-2`, `KAN-3` are never touched or reported.
- **Project key is read from `$JIRA_PROJECT_KEY`** — never hardcoded. It is `KAN` until the author renames it to `BITE` in the Jira UI; the adapter is unaffected either way. Task 5 must not run before the rename, because created keys are permanent.
- Tests are plain shell (`bats` is not installed). Keep them out of any `__tests__/` directory so Jest never sees them.

## File Structure

| File | Responsibility |
|---|---|
| `scripts/jira.sh` | The only Jira API client. Subcommands: `check`, `list`, `create`, `transition`, `label`, `find-legacy`. |
| `scripts/test-jira.sh` | Plain-shell test suite for the adapter. Read-only against live Jira plus offline arg/error tests. |
| `scripts/jira-backfill.json` | Authored manifest: 18 items with type, goal, status, title, description, expected result. |
| `scripts/jira-backfill.sh` | One-time idempotent backfill driver. `--dry-run` by default; `--execute` requires explicit opt-in. |
| `.claude/commands/bite-start.md` | Rewritten: Jira-first read, join, drift report. |
| `.claude/commands/bite-new.md` | Rewritten: Jira create first, then vault. |
| `.claude/commands/bite-work.md` | Modified: status transitions at loop steps 1/7/9/10. |
| `MYWORKFLOW.md` | Corrected header + Jira integration section. |
| `/mnt/d/Obsidian/vaults/BiteVault/JiraMap.md` | Generated legacy `BITE-###` → Jira key mapping. |

**Ordering constraint:** Tasks 1–4 create and prove tooling with zero writes to Jira. Task 5 is the only irreversible task and is explicitly gated. Tasks 6–9 are documentation-only and cannot break Jira.

---

### Task 1: Adapter core — env loading, auth, `check`

**Files:**
- Create: `scripts/jira.sh`
- Test: `scripts/test-jira.sh`

**Interfaces:**
- Consumes: `.env.local` (`JIRA_SITE`, `JIRA_EMAIL`, `JIRA_TOKEN`, `JIRA_CLOUD_ID`, `JIRA_PROJECT_KEY`)
- Produces: `jira.sh check` → exit 0 + `OK <PROJECT_KEY> reachable`; exit 2 on missing env naming the exact key; exit 1 on HTTP failure. Internal helper `_api METHOD PATH [BODY]` reused by all later tasks.

- [ ] **Step 1: Write the failing test**

Create `scripts/test-jira.sh`:

```bash
#!/usr/bin/env bash
# Plain-shell tests for scripts/jira.sh. No bats dependency.
set -uo pipefail
cd "$(dirname "$0")/.."

PASS=0; FAIL=0
ok()   { printf '  \033[32mPASS\033[0m %s\n' "$1"; PASS=$((PASS+1)); }
bad()  { printf '  \033[31mFAIL\033[0m %s\n     %s\n' "$1" "$2"; FAIL=$((FAIL+1)); }
check(){ # check <desc> <expected> <actual>
  [ "$2" = "$3" ] && ok "$1" || bad "$1" "expected [$2] got [$3]"
}

echo "== env guard =="
out=$(JIRA_TOKEN= ENV_FILE=/dev/null ./scripts/jira.sh check 2>&1); rc=$?
check "missing env exits 2" "2" "$rc"
case "$out" in *JIRA_TOKEN*) ok "names the missing var";; *) bad "names the missing var" "$out";; esac
case "$out" in *"$JIRA_TOKEN"*) bad "token not leaked" "token appeared in output";; *) ok "token not leaked";; esac

echo "== connectivity =="
out=$(./scripts/jira.sh check 2>&1); rc=$?
check "check exits 0" "0" "$rc"
case "$out" in *OK*) ok "reports OK";; *) bad "reports OK" "$out";; esac

echo
echo "passed=$PASS failed=$FAIL"
[ "$FAIL" -eq 0 ]
```

Make both executable:

```bash
chmod +x scripts/test-jira.sh
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./scripts/test-jira.sh`
Expected: FAIL — `./scripts/jira.sh: No such file or directory`

- [ ] **Step 3: Write minimal implementation**

Create `scripts/jira.sh`:

```bash
#!/usr/bin/env bash
# Jira Cloud adapter for the bite workflow.
# Config comes from .env.local — never hardcode credentials here.
set -uo pipefail

ENV_FILE="${ENV_FILE:-$(dirname "$0")/../.env.local}"
# shellcheck disable=SC1090
[ -f "$ENV_FILE" ] && { set -a; . "$ENV_FILE"; set +a; }

die() { printf 'jira.sh: %s\n' "$1" >&2; exit "${2:-1}"; }

require_env() {
  local missing=""
  for v in JIRA_EMAIL JIRA_TOKEN JIRA_CLOUD_ID JIRA_PROJECT_KEY; do
    eval "val=\${$v:-}"
    [ -z "$val" ] && missing="$missing $v"
  done
  [ -n "$missing" ] && die "missing required env:$missing (set them in .env.local)" 2
  BASE="https://api.atlassian.com/ex/jira/${JIRA_CLOUD_ID}"
}

# _api METHOD PATH [BODY] -> body on stdout; non-2xx dies with status + body
_api() {
  local method="$1" path="$2" body="${3:-}" out code
  out=$(mktemp)
  if [ -n "$body" ]; then
    code=$(curl -s -o "$out" -w '%{http_code}' -X "$method" \
      -u "$JIRA_EMAIL:$JIRA_TOKEN" \
      -H 'Accept: application/json' -H 'Content-Type: application/json' \
      --data "$body" "${BASE}${path}")
  else
    code=$(curl -s -o "$out" -w '%{http_code}' -X "$method" \
      -u "$JIRA_EMAIL:$JIRA_TOKEN" -H 'Accept: application/json' "${BASE}${path}")
  fi
  case "$code" in
    2*) cat "$out"; rm -f "$out"; return 0 ;;
    *)  printf 'jira.sh: HTTP %s on %s %s\n%s\n' "$code" "$method" "$path" "$(cat "$out")" >&2
        rm -f "$out"; return 1 ;;
  esac
}

cmd_check() {
  require_env
  # NOTE: /myself is deliberately NOT used — it needs read:me, which this
  # ticket-scoped token does not have and never will.
  _api GET "/rest/api/3/project/${JIRA_PROJECT_KEY}" >/dev/null || return 1
  printf 'OK %s reachable\n' "$JIRA_PROJECT_KEY"
}

case "${1:-}" in
  check) shift; cmd_check "$@" ;;
  *) die "usage: jira.sh {check}" 64 ;;
esac
```

```bash
chmod +x scripts/jira.sh
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./scripts/test-jira.sh`
Expected: `passed=4 failed=0`, exit 0

- [ ] **Step 5: Commit**

```bash
git add scripts/jira.sh scripts/test-jira.sh
git commit -m "feat(jira): adapter core with env guard and scope-safe health check"
```

---

### Task 2: `list` — read Jira as authoritative state

**Files:**
- Modify: `scripts/jira.sh`
- Test: `scripts/test-jira.sh`

**Interfaces:**
- Consumes: `_api`, `require_env` from Task 1
- Produces: `jira.sh list` → TSV on stdout, one row per issue, columns exactly:
  `key \t legacy \t issuetype \t status \t goal \t state \t summary`
  `legacy`/`goal`/`state` are `-` when absent. Also `jira.sh find-legacy BITE-###` → prints the Jira key or empty, exit 0 either way.

- [ ] **Step 1: Write the failing test**

Append to `scripts/test-jira.sh` before the final summary block:

```bash
echo "== list =="
out=$(./scripts/jira.sh list 2>&1); rc=$?
check "list exits 0" "0" "$rc"
cols=$(printf '%s\n' "$out" | head -1 | awk -F'\t' '{print NF}')
[ -z "$out" ] && cols=7   # empty project is a valid state pre-backfill
check "list emits 7 tab-separated columns" "7" "$cols"
case "$out" in
  *KAN-1[[:space:]]*|*"Task 1"*) bad "excludes unlabelled placeholders" "KAN-1..3 leaked into list";;
  *) ok "excludes unlabelled placeholders";;
esac

echo "== find-legacy =="
out=$(./scripts/jira.sh find-legacy BITE-999 2>&1); rc=$?
check "unknown legacy id exits 0" "0" "$rc"
check "unknown legacy id prints nothing" "" "$out"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./scripts/test-jira.sh`
Expected: FAIL — `usage: jira.sh {check}` and `list exits 0` reports got `[64]`

- [ ] **Step 3: Write minimal implementation**

In `scripts/jira.sh`, add before the `case` dispatcher:

```bash
# Every query is scoped to labels = bite so the pre-existing KAN-1..3
# placeholders are never read or reported.
JQL_SCOPE='project = "%s" AND labels = bite'

cmd_list() {
  require_env
  local jql; jql=$(printf "$JQL_SCOPE ORDER BY created ASC" "$JIRA_PROJECT_KEY")
  local q; q=$(jq -rn --arg j "$jql" '$j|@uri')
  _api GET "/rest/api/3/search/jql?jql=${q}&maxResults=200&fields=summary,status,issuetype,labels" \
  | jq -r '.issues[] |
      (.fields.labels // []) as $l |
      [ .key,
        (($l[] | select(startswith("legacy-"))       | sub("^legacy-";"")) // "-"),
        .fields.issuetype.name,
        .fields.status.name,
        (($l[] | select(startswith("goal-"))         | sub("^goal-";""))   // "-"),
        (($l[] | select(startswith("state-"))        | sub("^state-";""))  // "-"),
        .fields.summary
      ] | @tsv'
}

cmd_find_legacy() {
  require_env
  [ -z "${1:-}" ] && die "usage: jira.sh find-legacy BITE-###" 64
  local jql; jql=$(printf "$JQL_SCOPE AND labels = \"legacy-%s\"" "$JIRA_PROJECT_KEY" "$1")
  local q; q=$(jq -rn --arg j "$jql" '$j|@uri')
  _api GET "/rest/api/3/search/jql?jql=${q}&maxResults=1&fields=summary" \
  | jq -r '.issues[0].key // empty'
}
```

Extend the dispatcher:

```bash
case "${1:-}" in
  check)       shift; cmd_check "$@" ;;
  list)        shift; cmd_list "$@" ;;
  find-legacy) shift; cmd_find_legacy "$@" ;;
  *) die "usage: jira.sh {check|list|find-legacy}" 64 ;;
esac
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./scripts/test-jira.sh`
Expected: `passed=9 failed=0`

Also verify by hand that the placeholders are excluded:

Run: `./scripts/jira.sh list | wc -l`
Expected: `0` (nothing is labelled `bite` yet — this proves the scope filter works)

- [ ] **Step 5: Commit**

```bash
git add scripts/jira.sh scripts/test-jira.sh
git commit -m "feat(jira): label-scoped list and legacy-id lookup"
```

---

### Task 3: Write operations — `create`, `transition`, `label`

**Files:**
- Modify: `scripts/jira.sh`
- Test: `scripts/test-jira.sh`

**Interfaces:**
- Consumes: `_api`, `require_env`, `cmd_find_legacy`
- Produces:
  - `jira.sh create <issuetype> <summary> <description-file> <label>...` → prints new key
  - `jira.sh transition <key> <status-name>` → exit 0
  - `jira.sh label <key> add|remove <label>` → exit 0

Writes use **REST v2** (`/rest/api/2/issue`) because v3 requires ADF JSON for `description`; v2 accepts plain text.

- [ ] **Step 1: Write the failing test**

Append to `scripts/test-jira.sh` before the summary block. These are **offline argument-validation tests only** — they must not create anything:

```bash
echo "== write guards (no network mutation) =="
out=$(./scripts/jira.sh create 2>&1); rc=$?
check "create with no args exits 64" "64" "$rc"

out=$(./scripts/jira.sh transition FAKE-1 2>&1); rc=$?
check "transition with no status exits 64" "64" "$rc"

out=$(./scripts/jira.sh transition FAKE-1 "Nonexistent Status" 2>&1); rc=$?
check "unknown status exits 64" "64" "$rc"
case "$out" in *"Nonexistent Status"*) ok "unknown status is named";; *) bad "unknown status is named" "$out";; esac

out=$(./scripts/jira.sh label FAKE-1 sideways foo 2>&1); rc=$?
check "bad label action exits 64" "64" "$rc"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./scripts/test-jira.sh`

Expected: FAIL on `unknown status is named` — the output will be the generic
`usage: jira.sh {check|list|find-legacy}` and will not contain `Nonexistent Status`.

⚠️ **Note the honest TDD caveat here:** the four `exits 64` assertions will pass
*before* implementation, because the unimplemented dispatcher already exits 64 via its
`*)` fallback. They are regression guards, not red tests. `unknown status is named` is
the one genuinely-red assertion that proves the new code ran. Do not treat the other
four passing as evidence the feature exists.

- [ ] **Step 3: Write minimal implementation**

Add to `scripts/jira.sh` before the dispatcher:

```bash
# Workflow is fully connected, so transition ids are global and need no
# per-issue lookup. Verified 2026-07-22 against project KAN.
transition_id() {
  case "$1" in
    "To Do")                echo 11 ;;
    "In Progress")          echo 21 ;;
    "Code Review")          echo 31 ;;
    "QA Review")            echo 41 ;;
    "Needs Revision")       echo 3  ;;
    "Ready for Production") echo 2  ;;
    "Done")                 echo 51 ;;
    *) return 1 ;;
  esac
}

cmd_create() {
  require_env
  local itype="${1:-}" summary="${2:-}" descfile="${3:-}"; shift 3 2>/dev/null || true
  [ -z "$itype" ] || [ -z "$summary" ] || [ -z "$descfile" ] &&
    die "usage: jira.sh create <issuetype> <summary> <description-file> [label...]" 64
  [ -f "$descfile" ] || die "description file not found: $descfile" 64

  local labels; labels=$(printf '%s\n' "$@" | jq -R . | jq -s .)
  local body; body=$(jq -n \
    --arg p "$JIRA_PROJECT_KEY" --arg s "$summary" \
    --rawfile d "$descfile" --arg t "$itype" --argjson l "$labels" \
    '{fields:{project:{key:$p},summary:$s,description:$d,issuetype:{name:$t},labels:$l}}')

  _api POST "/rest/api/2/issue" "$body" | jq -r '.key'
}

cmd_transition() {
  require_env
  local key="${1:-}" status="${2:-}"
  [ -z "$key" ] || [ -z "$status" ] && die "usage: jira.sh transition <key> <status>" 64
  local tid; tid=$(transition_id "$status") ||
    die "unknown status: $status (valid: To Do, In Progress, Code Review, QA Review, Needs Revision, Ready for Production, Done)" 64
  _api POST "/rest/api/3/issue/${key}/transitions" \
    "$(jq -n --arg id "$tid" '{transition:{id:$id}}')" >/dev/null
}

cmd_label() {
  require_env
  local key="${1:-}" action="${2:-}" label="${3:-}"
  [ -z "$key" ] || [ -z "$label" ] && die "usage: jira.sh label <key> add|remove <label>" 64
  case "$action" in add|remove) ;; *) die "label action must be add or remove, got: $action" 64 ;; esac
  _api PUT "/rest/api/2/issue/${key}" \
    "$(jq -n --arg a "$action" --arg l "$label" '{update:{labels:[{($a):$l}]}}')" >/dev/null
}
```

Extend the dispatcher:

```bash
case "${1:-}" in
  check)       shift; cmd_check "$@" ;;
  list)        shift; cmd_list "$@" ;;
  find-legacy) shift; cmd_find_legacy "$@" ;;
  create)      shift; cmd_create "$@" ;;
  transition)  shift; cmd_transition "$@" ;;
  label)       shift; cmd_label "$@" ;;
  *) die "usage: jira.sh {check|list|find-legacy|create|transition|label}" 64 ;;
esac
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./scripts/test-jira.sh`
Expected: `passed=14 failed=0`

Confirm nothing was created:

Run: `./scripts/jira.sh list | wc -l`
Expected: `0`

- [ ] **Step 5: Commit**

```bash
git add scripts/jira.sh scripts/test-jira.sh
git commit -m "feat(jira): create, transition and label write operations"
```

---

### Task 4: Backfill manifest + dry-run driver

**Files:**
- Create: `scripts/jira-backfill.json`
- Create: `scripts/jira-backfill.sh`

**Interfaces:**
- Consumes: `jira.sh create`, `jira.sh transition`, `jira.sh find-legacy`
- Produces: `jira-backfill.sh` (dry-run default) printing one planned line per item; `--execute` performs writes and appends `legacy<TAB>key` rows to `scripts/.jira-backfill-results.tsv`.

**Manifest schema** — array of objects:

```json
{ "legacy":"BITE-003", "type":"feat", "goal":"G1", "status":"Ready",
  "title":"Supabase foundation — install, clients, schema, RLS, seed",
  "context":"…", "scope":"…", "expected":"…", "criteria":["…","…"] }
```

**The 18 items** (source: `BiteVault/Backlog.md`; detail: `BiteVault/Tasks/BITE-###.md`):

| legacy | type | → issuetype | goal | status |
|---|---|---|---|---|
| BITE-000 | chore | Task | G2 | Done |
| BITE-001 | test | Task | G3 | Done |
| BITE-004 | chore | Task | G3 | Done |
| BITE-006 | feat | Feature | G2 | Done |
| BITE-003 | feat | Feature | G1 | Ready |
| BITE-002 | feat | Feature | G1 | Ready |
| BITE-016 | feat | Feature | G1 | Backlog |
| BITE-017 | feat | Feature | G1 | Backlog |
| BITE-005 | feat | Feature | G1 | Backlog |
| BITE-007 | feat | Feature | G2 | Backlog |
| BITE-008 | feat | Feature | G2 | Backlog |
| BITE-009 | feat | Feature | G2 | Backlog |
| BITE-010 | enhancement | Story | G2 | Backlog |
| BITE-011 | enhancement | Story | G2 | Backlog |
| BITE-012 | enhancement | Story | G2 | Backlog |
| BITE-013 | enhancement | Story | G2 | Backlog |
| BITE-014 | enhancement | Story | G2 | Backlog |
| BITE-015 | enhancement | Story | G2 | Backlog |

Assertion after generation: `Feature 9 · Story 6 · Task 3 · total 18`.

- [ ] **Step 1: Author the manifest**

Write `scripts/jira-backfill.json` with all 18 objects. For each, read `BiteVault/Tasks/BITE-###.md` when it exists (13 do: 003, 006, 007–017) and derive `context`/`scope`/`criteria` from it; for the 5 without a task note (000, 001, 002, 004, 005) derive from the `Backlog.md` Notes column and `Fixes/BITE-###.md` where present.

`expected` is authored fresh — a single observable end state, present tense.

Fully worked example (`BITE-003`):

```json
{
  "legacy": "BITE-003",
  "type": "feat",
  "goal": "G1",
  "status": "Ready",
  "title": "Supabase foundation — install, clients, schema, RLS, seed",
  "context": "Every screen in bite renders static placeholder data. Nothing talks to a backend: lib/supabase/ does not exist, there are no database types and no RLS policies. This item is the foundation the rest of G1 stands on — BITE-002, BITE-016 and BITE-017 are all blocked by it.",
  "scope": "Install @supabase/ssr and @supabase/supabase-js. Add the four clients (server, client, service, middleware) under lib/supabase/. Create the initial schema migration under supabase/migrations/ with RLS policies on every table. Add a seed script. NON-GOALS: no changes under app/ — no page, component or route is rewired in this item.",
  "expected": "A developer can run the local Supabase stack, apply migrations, seed it, and import any of the four typed clients from lib/supabase/ in the correct context. Every table has an RLS policy. No app/ route reads from Supabase yet — that is BITE-016 and BITE-017.",
  "criteria": [
    "@supabase/ssr and @supabase/supabase-js installed via yarn",
    "lib/supabase/{server,client,service,middleware}.ts exist and type-check",
    "@supabase/auth-helpers-nextjs is NOT introduced (forbidden by CLAUDE.md)",
    "supabase/migrations/ contains the initial schema",
    "RLS enabled on all tables with auth.uid() wrapped as (select auth.uid())",
    "lib/types/supabase.ts generated and committed",
    "yarn type-check and yarn lint pass",
    "no files under app/ are modified"
  ]
}
```

Second worked example (`BITE-012`, an enhancement with a measured defect):

```json
{
  "legacy": "BITE-012",
  "type": "enhancement",
  "goal": "G2",
  "status": "Backlog",
  "title": "Shopping Cart summary column width (/cart)",
  "context": "Found during the Figma gap run against node 2:2035. The cart summary column renders at Tailwind w-72 (288px) where the design specifies 352px — a 64px shortfall that makes the summary card visibly narrow against the item list. /checkout likely shares the defect.",
  "scope": "Widen the summary column on /cart to 352px using an existing Tailwind scale value. Audit /checkout for the same discrepancy and fix it in the same pass if present. NON-GOALS: no layout restructure, no new breakpoints.",
  "expected": "At 1440px the /cart summary column measures 352px wide in a real browser, matching Figma 2:2035, and /checkout matches its own design width. Nothing else on either page shifts.",
  "criteria": [
    "/cart summary column measures 352px at 1440px viewport",
    "/checkout audited and corrected if it shares the defect",
    "measurement captured via Playwright, not read from source",
    "no new Tailwind breakpoints added",
    "existing tests still pass and coverage gates hold"
  ]
}
```

- [ ] **Step 2: Validate the manifest before writing any driver**

Run:

```bash
jq -e 'length == 18' scripts/jira-backfill.json >/dev/null && echo "count OK"
jq -r 'map(.type) | group_by(.) | map({(.[0]): length}) | add' scripts/jira-backfill.json
jq -e 'all(.[]; has("legacy") and has("type") and has("goal") and has("status")
        and has("title") and has("context") and has("scope") and has("expected")
        and (.criteria | length > 0))' scripts/jira-backfill.json >/dev/null \
  && echo "fields OK"
jq -r '[.[].legacy] | (length - (unique | length)) as $d | "duplicate legacy ids: \($d)"' scripts/jira-backfill.json
```

Expected:
```
count OK
{"chore":2,"enhancement":6,"feat":9,"test":1}
fields OK
duplicate legacy ids: 0
```

- [ ] **Step 3: Write the backfill driver**

Create `scripts/jira-backfill.sh`:

```bash
#!/usr/bin/env bash
# One-time backfill of BiteVault items into Jira. Idempotent: an item whose
# legacy-vault-### label already exists in Jira is skipped, so re-running
# cannot create duplicates.
#
# Dry-run is the DEFAULT. --execute performs irreversible writes: this token
# cannot delete issues.
set -uo pipefail
cd "$(dirname "$0")/.."

MANIFEST=scripts/jira-backfill.json
RESULTS=scripts/.jira-backfill-results.tsv
MODE=dry
[ "${1:-}" = "--execute" ] && MODE=exec

itype_for() {
  case "$1" in
    feat) echo Feature ;; enhancement) echo Story ;;
    chore|test) echo Task ;; bug) echo Bug ;;
    *) return 1 ;;
  esac
}

created=0; skipped=0; failed=0
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

count=$(jq 'length' "$MANIFEST")
echo "mode=$MODE  items=$count"
echo

for i in $(seq 0 $((count-1))); do
  item=$(jq -c ".[$i]" "$MANIFEST")
  legacy=$(printf '%s' "$item" | jq -r .legacy)
  type=$(printf  '%s' "$item" | jq -r .type)
  goal=$(printf  '%s' "$item" | jq -r .goal)
  status=$(printf '%s' "$item" | jq -r .status)
  title=$(printf '%s' "$item" | jq -r .title)
  itype=$(itype_for "$type") || { echo "FAIL $legacy unknown type $type"; failed=$((failed+1)); continue; }

  existing=$(./scripts/jira.sh find-legacy "$legacy" 2>/dev/null)
  if [ -n "$existing" ]; then
    echo "SKIP $legacy already exists as $existing"
    skipped=$((skipped+1)); continue
  fi

  desc="$tmp/$legacy.txt"
  printf '%s' "$item" | jq -r '
    "## Context\n" + .context +
    "\n\n## Scope\n" + .scope +
    "\n\n## Expected Result\n" + .expected +
    "\n\n## Acceptance Criteria\n" + ([.criteria[] | "- [ ] " + .] | join("\n")) +
    "\n\n---\nGoal: " + .goal +
    "\nVault: [[Tasks/" + .legacy + "]]"' > "$desc"

  summary="[$legacy] $title"
  labels="bite type-$type goal-$goal"
  case "$status" in
    Ready)   labels="$labels state-ready" ;;
    Backlog) labels="$labels state-backlog" ;;
  esac

  if [ "$MODE" = dry ]; then
    echo "PLAN $legacy -> $itype | $status | labels: $labels"
    echo "     summary: $summary"
    echo "     description: $(wc -l < "$desc") lines, $(wc -c < "$desc") bytes"
    created=$((created+1)); continue
  fi

  # shellcheck disable=SC2086
  key=$(./scripts/jira.sh create "$itype" "$summary" "$desc" $labels) || {
    echo "FAIL $legacy create failed"; failed=$((failed+1)); continue; }
  printf '%s\t%s\n' "$legacy" "$key" >> "$RESULTS"

  if [ "$status" = "Done" ]; then
    ./scripts/jira.sh transition "$key" "Done" || {
      echo "WARN $legacy created as $key but transition to Done failed"; }
  fi
  echo "CREATED $legacy -> $key ($itype, $status)"
  created=$((created+1))
done

echo
echo "planned/created=$created skipped=$skipped failed=$failed"
[ "$failed" -eq 0 ]
```

```bash
chmod +x scripts/jira-backfill.sh
```

- [ ] **Step 4: Run the dry-run and verify**

Run: `./scripts/jira-backfill.sh`

Expected: 18 `PLAN` lines, `planned/created=18 skipped=0 failed=0`, exit 0.

Verify nothing reached Jira:

Run: `./scripts/jira.sh list | wc -l`
Expected: `0`

- [ ] **Step 5: Commit**

```bash
echo "scripts/.jira-backfill-results.tsv" >> .gitignore
git add scripts/jira-backfill.json scripts/jira-backfill.sh .gitignore
git commit -m "feat(jira): backfill manifest and idempotent dry-run driver"
```

---

### Task 5: Execute the backfill ⚠️ IRREVERSIBLE

**Files:**
- Create: `/mnt/d/Obsidian/vaults/BiteVault/JiraMap.md`
- Reads: `scripts/.jira-backfill-results.tsv`

> **STOP GATE.** This task creates 18 permanent tickets. The token has no delete
> scope. Do not run `--execute` until the dry-run output from Task 4 has been
> shown to the author and explicitly approved in this session.

- [ ] **Step 1: Re-run the dry-run and present it for approval**

Run: `./scripts/jira-backfill.sh`
Show the full output. **Wait for explicit approval.** Do not proceed otherwise.

- [ ] **Step 2: Execute**

Run: `./scripts/jira-backfill.sh --execute`
Expected: 18 `CREATED` lines, `planned/created=18 skipped=0 failed=0`

- [ ] **Step 3: Verify against the spec's assertion table**

```bash
./scripts/jira.sh list | wc -l                      # expect 18
./scripts/jira.sh list | cut -f3 | sort | uniq -c   # expect Feature 9, Story 6, Task 3
./scripts/jira.sh list | cut -f4 | sort | uniq -c   # expect Done 4, To Do 14
./scripts/jira.sh list | cut -f2 | sort | uniq -d   # expect EMPTY (no duplicate legacy ids)
```

- [ ] **Step 4: Prove idempotency**

Run: `./scripts/jira-backfill.sh --execute`
Expected: 18 `SKIP` lines, `planned/created=0 skipped=18 failed=0`

Run: `./scripts/jira.sh list | wc -l`
Expected: still `18` — re-running created nothing.

- [ ] **Step 5: Generate `JiraMap.md`**

```bash
{
  printf -- '---\ntitle: bite — Jira Map\ndate: 2026-07-22\ntags: [jira, bite, mapping]\nstatus: active\n---\n\n'
  printf 'Legacy `BITE-###` → Jira key. Kept so existing `[[Tasks/BITE-###]]` wikilinks,\n'
  printf 'branch names and commit prefixes stay resolvable after cutover. New items are\n'
  printf 'Jira-native and never receive a legacy id.\n\n'
  printf '| Jira | Legacy | Title |\n|---|---|---|\n'
  ./scripts/jira.sh list | awk -F'\t' '$2!="-"{printf "| %s | %s | %s |\n",$1,$2,$7}'
  printf '\n## Related\n- [[Backlog]]\n- [[Goals]]\n- [[Progress]]\n'
} > /mnt/d/Obsidian/vaults/BiteVault/JiraMap.md

wc -l < /mnt/d/Obsidian/vaults/BiteVault/JiraMap.md
```

Expected: the table has 18 data rows.

- [ ] **Step 6: Commit**

```bash
git add -A scripts/
git commit -m "chore(jira): backfill 18 vault items and generate JiraMap"
```

---

### Task 6: Rewrite `/bite-start`

**Files:**
- Modify: `.claude/commands/bite-start.md`

- [ ] **Step 1: Replace the file body**

Keep the frontmatter `description:` line unchanged. Replace steps 1–5 with:

```markdown
Follow the `## /bite-start` section of `MYWORKFLOW.md`. Jira is the source of truth
for item state; the vault supplies goals, task detail and session continuity.

Do ONLY this, then stop:

1. **Health check.** Run `./scripts/jira.sh check`.
   - Non-zero exit → print `⚠ JIRA UNAVAILABLE — vault may be stale`, continue in
     **degraded mode** from the vault alone, and label the whole report degraded.
     Never silently fall back.
2. **Read Jira.** Run `./scripts/jira.sh list`. This is authoritative for
   key, legacy id, type, status, goal and title.
3. **Read the vault:** the most recent note in `Sessions/`, plus `Goals.md`,
   `Progress.md`, and `Tasks/` for any item needing detail.
4. **Join.** Match Jira rows to vault rows on the legacy id (`BITE-###`) or Jira
   key. **Each item is rendered exactly once.** On any conflict, Jira wins.
5. **Report**, grouped in this order — In Progress → Ready → Backlog → Done.
   `Ready` vs `Backlog` is distinguished by the `state-ready` / `state-backlog`
   label, since Jira has no `Ready` status. Show `<KEY> (vault-###) [type] title — G#`.
6. **Drift report.** Print each class, or `none` if empty:
   - `UNFILED` — vault row with no Jira ticket
   - `UNTRACKED` — bite-labelled ticket with no vault row
   - `DESYNCED` — status disagreement between Jira and the vault
   - `NO-GOAL` — item with a missing or `no-goal` goal label
7. Summarize where we left off from the session note.
8. **STOP.** Do not auto-pick an item or start work. Wait for `/bite-work`.
```

- [ ] **Step 2: Verify by running it**

Run `/bite-start` and confirm: 18 items appear, each exactly once; `KAN-1..3` do not
appear; the four groups render; the drift report prints.

- [ ] **Step 3: Verify degraded mode (spec §11)**

Prove the fallback works rather than assuming it — a broken health check must not
produce a confident-looking but stale report:

```bash
ENV_FILE=/dev/null ./scripts/jira.sh check; echo "exit=$?"   # expect exit=2
```

Then run `/bite-start` with the adapter unable to authenticate and confirm the report
is rendered from the vault **and** is clearly labelled `⚠ JIRA UNAVAILABLE`. Restore
normal operation and re-run to confirm the banner disappears.

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/bite-start.md
git commit -m "feat(jira): bite-start reads Jira first with dedupe and drift report"
```

---

### Task 7: Rewrite `/bite-new`

**Files:**
- Modify: `.claude/commands/bite-new.md`

- [ ] **Step 1: Replace the file body**

Keep the frontmatter (`description:`, `argument-hint:`) unchanged. Replace the body with:

```markdown
Follow the `## /bite-new` section of `MYWORKFLOW.md`, for a new item titled:
**$ARGUMENTS**. Jira is the ID authority — the ticket is created first, then the
vault row. New items are Jira-native and receive **no** `BITE-###` legacy id.

Do ONLY this, then stop:

1. **Resolve the goal.** Pick the `G#` from `Goals.md` that this serves. If none
   fits, STOP and ask — never file with `no-goal` silently.
2. **Determine the type** (feat / enhancement / chore / test / bug) and map it:
   feat→Feature, enhancement→Story, chore→Task, test→Task, bug→Bug.
3. **Draft the ticket** — title, and a description with these exact sections:
   `## Context`, `## Scope` (including explicit NON-GOALS), `## Expected Result`
   (one observable end state), `## Acceptance Criteria` (checkbox list).
4. **Show the full draft and WAIT for explicit confirmation.** This is a write to
   a real tracker and the token cannot delete what it creates.
5. **Create it:** write the description to a temp file, then
   `./scripts/jira.sh create <IssueType> "<title>" <descfile> bite type-<type> goal-<G#> state-backlog`
   Capture the returned key (e.g. `BITE-22`).
6. **Write the vault:** add the row to `Backlog.md` under **Backlog** keyed by the
   Jira key, and create `Tasks/<KEY>.md` from the template in `Tasks/README.md`.
7. **STOP.** This only files the item — I will run `/bite-work <KEY>` when ready.
```

- [ ] **Step 2: Verify with a real end-to-end run**

Run: `/bite-new "Cover LoginForm async submit path"` — the follow-up the 2026-07-19
session note identified (`LoginForm` at 94.91%). Confirm the draft is shown and
approval is requested **before** any write; approve; then:

```bash
./scripts/jira.sh list | tail -1     # new KAN key present, legacy column shows "-"
./scripts/jira.sh list | wc -l       # expect 19
```

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/bite-new.md
git commit -m "feat(jira): bite-new creates the ticket before the vault row"
```

---

### Task 8: Add status transitions to `/bite-work`

**Files:**
- Modify: `.claude/commands/bite-work.md`

- [ ] **Step 1: Add the transition table**

Append to `.claude/commands/bite-work.md` (leave all existing steps intact):

```markdown
## Jira status writeback

`/bite-work` accepts **either** a Jira key (`BITE-7`) or a legacy id (`BITE-016`);
resolve a legacy id first with `./scripts/jira.sh find-legacy BITE-016`.

Jira is the source of truth for status, so the loop must move the ticket:

| Loop step | Command |
|---|---|
| 1 — pull the item | `./scripts/jira.sh transition <KEY> "In Progress"` |
| 7 — verification passes | `./scripts/jira.sh transition <KEY> "QA Review"` |
| 9 — PR opened | `./scripts/jira.sh transition <KEY> "Code Review"` |
| 10 — close the loop | `./scripts/jira.sh transition <KEY> "Done"` |
| PR review requests changes | `./scripts/jira.sh transition <KEY> "Needs Revision"` |

Also at step 1, clear the queue label: `./scripts/jira.sh label <KEY> remove state-ready`
(or `state-backlog`) — those labels only mean something while the status is `To Do`.

`Ready for Production` is not used by the loop; leave it for manual promotion.
A transition failure is a **warning, not a loop abort** — report it and continue.
```

- [ ] **Step 2: Verify the transition path without running a full loop**

Pick the ticket created in Task 7, then:

```bash
KEY=$(./scripts/jira.sh find-legacy BITE-005)   # any backfilled key works
./scripts/jira.sh transition "$KEY" "In Progress"
./scripts/jira.sh list | grep "^$KEY" | cut -f4    # expect: In Progress
./scripts/jira.sh transition "$KEY" "To Do"        # restore
./scripts/jira.sh list | grep "^$KEY" | cut -f4    # expect: To Do
```

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/bite-work.md
git commit -m "feat(jira): bite-work drives status transitions through the loop"
```

---

### Task 9: Correct `MYWORKFLOW.md`

**Files:**
- Modify: `MYWORKFLOW.md:1-18` (header) and the `/bite-start`, `/bite-new` sections

- [ ] **Step 1: Fix the false header claim**

Replace lines 3–5:

```markdown
> Personal working process for the **bite** repo. Kept local via `.git/info/exclude`
> — never committed. Loaded because `AGENTS.md` tells any AI harness to read this file
> when it exists. Anyone without it gets default agent behavior.
```

with:

```markdown
> Personal working process for the **bite** repo. **This file IS committed** and is
> published with the repo — put no credentials in it, and reference configuration by
> environment-variable name only. Loaded because `AGENTS.md` tells any AI harness to
> read this file when it exists. Anyone without it gets default agent behavior.
```

- [ ] **Step 2: Update the source-of-truth paragraph**

Replace the paragraph beginning "Work items live in the **BiteVault**…" with:

```markdown
Work items live in **Jira** (project `KAN`, via `scripts/jira.sh`) and the **BiteVault**
Obsidian vault at `/mnt/d/Obsidian/vaults/BiteVault/`.

**Jira is the source of truth for item state** — id, title, type, status, description.
**The vault owns everything Jira handles poorly** — `Goals.md` (why work happens, `G#`),
`Tasks/` (acceptance criteria and context), `Fixes/`, `Decisions/`, `Sessions/`
(continuity) and `Progress.md` (app snapshot). `Backlog.md` is a **generated mirror**
of Jira — regenerate it on `/bite-start`, never hand-edit it.

Jira config lives in `.env.local` (git-ignored): `JIRA_SITE`, `JIRA_EMAIL`,
`JIRA_TOKEN`, `JIRA_CLOUD_ID`, `JIRA_PROJECT_KEY`. The token is **scoped to issue
read/write** — it cannot delete issues, create projects, or read `/myself`, so every
write is gated on explicit confirmation and nothing created can be undone by tooling.

Legacy `BITE-###` ids map to Jira keys in `BiteVault/JiraMap.md`. New items are
Jira-native and never receive a `BITE-###`.
```

- [ ] **Step 3: Sync the `/bite-start` and `/bite-new` sections**

Update both sections in `MYWORKFLOW.md` to match the command files written in
Tasks 6 and 7 verbatim in intent, and add the transition table from Task 8 to the
`/bite-work` section. `MYWORKFLOW.md` is the source of truth the commands defer to —
if they disagree, the commands are wrong.

- [ ] **Step 4: Verify no secrets landed in tracked files**

```bash
git grep -nE "atlassian\.net|ATATT|ATCTT|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" -- \
  MYWORKFLOW.md .claude scripts docs || echo "CLEAN: no site URL, token prefix or cloudId in tracked files"
```

Expected: `CLEAN: …`

- [ ] **Step 5: Commit**

```bash
git add MYWORKFLOW.md
git commit -m "docs: correct MYWORKFLOW header and document Jira as source of truth"
```

---

## Verification (whole feature)

```bash
./scripts/test-jira.sh                              # all pass
./scripts/jira-backfill.sh --execute                # 18 SKIP, 0 created (idempotent)
./scripts/jira.sh list | cut -f2 | sort | uniq -d   # empty — no duplicate legacy ids
yarn type-check && yarn lint                        # unaffected: no TS/JS touched
yarn test:coverage                                  # gates still 90/85/95/90
```

The last two matter because the spec chose shell precisely so the coverage gate
would be untouched. If `yarn test:coverage` moves at all, something was added in
the wrong language.

## Out of scope

Per spec §12: no migration of `Fixes/`/`Sessions/`/`Decisions/` into Jira, no Epics
for G1–G3, no sprints or estimates, no edits to the `KAN-1..3` placeholders, and no
two-way sync of `Tasks/` note bodies.
