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

# Load the real config so the leak assertion has a token to search for.
[ -f .env.local ] && { set -a; . ./.env.local; set +a; }

# Sourcing above EXPORTS the vars, which a child would inherit. Strip them
# explicitly so the env-guard test actually exercises the missing-var path.
noenv() { env -u JIRA_EMAIL -u JIRA_TOKEN -u JIRA_CLOUD_ID -u JIRA_PROJECT_KEY \
            ENV_FILE=/dev/null "$@"; }

echo "== env guard =="
out=$(noenv ./scripts/jira.sh check 2>&1); rc=$?
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
