#!/usr/bin/env bash
# Jira Cloud adapter for the bite workflow.
#
# Config comes from .env.local (git-ignored) — never hardcode credentials here.
# This file IS committed and published with the repo.
#
# The token is a SCOPED api token, which means:
#   - it authenticates against https://api.atlassian.com/ex/jira/{cloudId}/...
#     and NOT against https://<site>.atlassian.net/rest/... (that returns 401)
#   - it has issue read/write only: no delete, no admin, no read:me
set -uo pipefail

ENV_FILE="${ENV_FILE:-$(dirname "$0")/../.env.local}"
# shellcheck disable=SC1090
[ -f "$ENV_FILE" ] && { set -a; . "$ENV_FILE"; set +a; }

die() { printf 'jira.sh: %s\n' "$1" >&2; exit "${2:-1}"; }

require_env() {
  local missing="" val
  for v in JIRA_EMAIL JIRA_TOKEN JIRA_CLOUD_ID JIRA_PROJECT_KEY; do
    eval "val=\${$v:-}"
    [ -z "$val" ] && missing="$missing $v"
  done
  [ -n "$missing" ] && die "missing required env:$missing (set them in .env.local)" 2
  BASE="https://api.atlassian.com/ex/jira/${JIRA_CLOUD_ID}"
}

# _api METHOD PATH [BODY] -> response body on stdout.
# Non-2xx prints status + body to stderr and returns 1. Never prints the token.
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
  # /myself is deliberately NOT used as the health check: it needs read:me,
  # which this ticket-scoped token does not have and never will. Probing it
  # would report a false failure.
  _api GET "/rest/api/3/project/${JIRA_PROJECT_KEY}" >/dev/null || return 1
  printf 'OK %s reachable\n' "$JIRA_PROJECT_KEY"
}

case "${1:-}" in
  check) shift; cmd_check "$@" ;;
  *) die "usage: jira.sh {check}" 64 ;;
esac
