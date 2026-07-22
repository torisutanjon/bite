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

# Every query is scoped to `labels = bite` so the pre-existing placeholder
# issues (BITE-1..3) are never read, reported, or mutated.
jql_scope() { printf 'project = "%s" AND labels = bite' "$JIRA_PROJECT_KEY"; }

urlenc() { jq -rn --arg v "$1" '$v|@uri'; }

# Vault ids are labelled `legacy-vault-003`, NOT `legacy-BITE-003`: with the
# project key set to BITE, a BITE-003 marker would be ambiguous with the real
# Jira key BITE-3. Accept either spelling from the caller and normalise.
normalise_legacy() {
  case "$1" in
    BITE-*|bite-*) printf 'vault-%s' "${1#*-}" ;;
    vault-*)       printf '%s' "$1" ;;
    *)             printf 'vault-%s' "$1" ;;
  esac
}

# TSV columns: key, legacy, issuetype, status, goal, state, summary
cmd_list() {
  require_env
  local q; q=$(urlenc "$(jql_scope) ORDER BY created ASC")
  _api GET "/rest/api/3/search/jql?jql=${q}&maxResults=200&fields=summary,status,issuetype,labels" \
  | jq -r '
      .issues[]? |
      (.fields.labels // []) as $l |
      [ .key,
        ((first($l[] | select(startswith("legacy-"))) // "-") | sub("^legacy-";"")),
        .fields.issuetype.name,
        .fields.status.name,
        ((first($l[] | select(startswith("goal-")))   // "-") | sub("^goal-";"")),
        ((first($l[] | select(startswith("state-")))  // "-") | sub("^state-";"")),
        .fields.summary
      ] | @tsv'
}

cmd_find_legacy() {
  require_env
  [ -z "${1:-}" ] && die "usage: jira.sh find-legacy <BITE-### | vault-###>" 64
  local marker; marker=$(normalise_legacy "$1")
  local q; q=$(urlenc "$(jql_scope) AND labels = \"legacy-${marker}\"")
  _api GET "/rest/api/3/search/jql?jql=${q}&maxResults=1&fields=summary" \
  | jq -r '.issues[0].key // empty'
}

case "${1:-}" in
  check)       shift; cmd_check "$@" ;;
  list)        shift; cmd_list "$@" ;;
  find-legacy) shift; cmd_find_legacy "$@" ;;
  *) die "usage: jira.sh {check|list|find-legacy}" 64 ;;
esac
