#!/usr/bin/env bash
# Regenerate BiteVault/Backlog.md as a mirror of Jira.
#
# Jira owns id / title / type / status / goal. The Notes column is vault-owned
# prose that Jira does not duplicate (blocked-by chains, Figma node refs,
# sequencing hints) — it is PRESERVED by matching on the vault id, never
# regenerated. Editing Notes in Backlog.md is expected; editing anything else
# is pointless because this script overwrites it.
#
# Writes a timestamped backup first: the vault is not under version control.
set -uo pipefail
cd "$(dirname "$0")/.."

VAULT="${BITE_VAULT:-/mnt/d/Obsidian/vaults/BiteVault}"
TARGET="$VAULT/Backlog.md"
[ -f "$TARGET" ] || { echo "jira-mirror-backlog.sh: not found: $TARGET" >&2; exit 1; }

jira=$(mktemp); trap 'rm -f "$jira"' EXIT
./scripts/jira.sh list > "$jira" || { echo "jira-mirror-backlog.sh: jira unreachable, refusing to overwrite" >&2; exit 1; }
[ -s "$jira" ] || { echo "jira-mirror-backlog.sh: jira returned no rows, refusing to overwrite" >&2; exit 1; }

cp "$TARGET" "$VAULT/.Backlog.md.bak-$(date +%Y%m%d-%H%M%S)"

awk -F'\t' -v today="$(date +%Y-%m-%d)" '
  # pass 1: harvest the vault-owned Notes column, keyed by vault id
  FNR==NR {
    if ($0 ~ /^\| BITE-[0-9]/) {
      n=split($0, c, "|")
      id=c[2];   gsub(/^ +| +$/,"",id)
      note=c[n-1]; gsub(/^ +| +$/,"",note)
      notes[id]=note
    }
    next
  }
  # pass 2: emit from Jira
  {
    key=$1; legacy=$2; itype=$3; status=$4; goal=$5; state=$6; title=$7
    sub(/^\[[^]]*\] /, "", title)
    grp = (status=="Done") ? "Done" : (status=="To Do" ? (state=="ready" ? "Ready" : "Backlog") : "In Progress")
    vtype = (itype=="Feature") ? "feat" : (itype=="Story" ? "enhancement" : (itype=="Bug" ? "bug" : "chore"))
    note = (legacy in notes) ? notes[legacy] : "—"
    if (note=="") note="—"
    rows[grp] = rows[grp] sprintf("| %s | %s | %s | %s | %s | %s |\n", key, legacy, vtype, goal, title, note)
    count[grp]++
  }
  END {
    printf "---\ntitle: bite — Backlog\ndate: %s\ntags: [backlog, bite, tracker]\nlinks: []\nstatus: active\n---\n\n", today
    print "> ⚠️ **GENERATED FILE — do not hand-edit except the Notes column.**"
    print "> Mirrors Jira project `BITE`. Regenerate with `scripts/jira-mirror-backlog.sh`."
    print "> Jira owns id / title / type / status / goal; the Notes column is vault-owned"
    print "> and is preserved across regenerations by matching on the vault id."
    print ""
    print "> ⚠️ **`Jira` and `Vault` use the same `BITE-` prefix but are different"
    print "> numbering systems** — `BITE-8` is a Jira key, `BITE-003` is a vault id."
    print "> See [[JiraMap]]."
    print ""
    split("In Progress|Ready|Backlog|Done", order, "|")
    for (i=1; i<=4; i++) {
      g = order[i]
      printf "## %s\n\n", g
      print  "| Jira | Vault | Type | Goal | Title | Notes |"
      print  "| --- | --- | --- | --- | --- | --- |"
      if (count[g]) printf "%s", rows[g]
      else          print "| _(none)_ | | | | | |"
      print ""
    }
    print "## Related"
    print "- [[JiraMap]]"
    print "- [[Goals]]"
    print "- [[Progress]]"
    print "- [[Roadmap]]"
  }
' "$TARGET" "$jira" > "$TARGET.new" && mv "$TARGET.new" "$TARGET"

echo "regenerated $TARGET ($(grep -c '^| BITE-' "$TARGET") items)"
