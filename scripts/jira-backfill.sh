#!/usr/bin/env bash
# One-time backfill of BiteVault items into Jira.
#
# IDEMPOTENT: an item whose legacy-vault-### label already exists in Jira is
# skipped, so re-running cannot create duplicates.
#
# DRY-RUN IS THE DEFAULT. --execute performs irreversible writes: the scoped
# token cannot delete issues, so a mistake can only be relabelled, not removed.
set -uo pipefail
cd "$(dirname "$0")/.."

MANIFEST=scripts/jira-backfill.json
RESULTS=scripts/.jira-backfill-results.tsv
MODE=dry
[ "${1:-}" = "--execute" ] && MODE=exec

itype_for() {
  case "$1" in
    feat)        echo Feature ;;
    enhancement) echo Story   ;;
    chore|test)  echo Task    ;;
    bug)         echo Bug     ;;
    *) return 1 ;;
  esac
}

created=0; skipped=0; failed=0
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

count=$(jq 'length' "$MANIFEST")
printf 'mode=%s  items=%s\n\n' "$MODE" "$count"

for i in $(seq 0 $((count-1))); do
  item=$(jq -c ".[$i]" "$MANIFEST")
  legacy=$(printf '%s' "$item" | jq -r .legacy)
  type=$(printf   '%s' "$item" | jq -r .type)
  goal=$(printf   '%s' "$item" | jq -r .goal)
  status=$(printf '%s' "$item" | jq -r .status)
  title=$(printf  '%s' "$item" | jq -r .title)

  itype=$(itype_for "$type") || {
    echo "FAIL $legacy unknown type: $type"; failed=$((failed+1)); continue; }

  # BITE-003 -> vault-003. A BITE-### marker would be ambiguous with the real
  # Jira key BITE-3 now that the project key is BITE.
  marker="vault-${legacy#*-}"

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

  summary="[$marker] $title"
  labels="bite type-$type goal-$goal legacy-$marker"
  case "$status" in
    Ready)   labels="$labels state-ready"   ;;
    Backlog) labels="$labels state-backlog" ;;
  esac

  if [ "$MODE" = dry ]; then
    printf 'PLAN %s -> %-7s | %-8s | %s\n' "$legacy" "$itype" "$status" "$labels"
    printf '     summary: %s\n' "$summary"
    printf '     description: %s lines, %s bytes\n' "$(wc -l < "$desc")" "$(wc -c < "$desc")"
    created=$((created+1)); continue
  fi

  # shellcheck disable=SC2086
  key=$(./scripts/jira.sh create "$itype" "$summary" "$desc" $labels) || {
    echo "FAIL $legacy create failed"; failed=$((failed+1)); continue; }
  printf '%s\t%s\n' "$legacy" "$key" >> "$RESULTS"

  if [ "$status" = "Done" ]; then
    ./scripts/jira.sh transition "$key" "Done" ||
      echo "WARN $legacy created as $key but transition to Done failed"
  fi
  printf 'CREATED %s -> %s (%s, %s)\n' "$legacy" "$key" "$itype" "$status"
  created=$((created+1))
done

printf '\nplanned/created=%s skipped=%s failed=%s\n' "$created" "$skipped" "$failed"
[ "$failed" -eq 0 ]
