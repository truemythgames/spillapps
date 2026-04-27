#!/usr/bin/env bash
# Generate narration MP3s (grace + elijah) for every history-tea story that
# does not yet have both files on disk. Idempotent: stories with both voices
# already generated are skipped. Safe to re-run after failures.
#
# Runs with --no-upload because wrangler is typically not authed in this env.
# After the run, push to R2 with:
#   R2_APP_PREFIX=history-tea CONTENT_APP_ID=history-tea \
#     npx tsx scripts/sync-to-r2.ts --kind narration
set -u
cd "$(dirname "$0")/.."

export CONTENT_APP_ID=history-tea
export R2_APP_PREFIX=history-tea

CONTENT_DIR="apps/history-tea/content/stories"
CATALOG="apps/history-tea/content/story-catalog.json"

LOG_DIR="logs/history-narrations"
mkdir -p "$LOG_DIR"

# Build list of story IDs missing at least one narration file.
missing=()
while IFS= read -r id; do
  g="$CONTENT_DIR/$id/narration-grace.mp3"
  e="$CONTENT_DIR/$id/narration-elijah.mp3"
  if [ ! -f "$g" ] || [ ! -f "$e" ]; then
    missing+=("$id")
  fi
done < <(node -e "require('./$CATALOG').forEach(s=>console.log(s.id))")

total_catalog=$(node -e "console.log(require('./$CATALOG').length)")
total=${#missing[@]}
done_count=$((total_catalog - total))

if [ "$total" -eq 0 ]; then
  echo "All $total_catalog stories already have both narration files. Nothing to do."
  exit 0
fi

echo "==================================================================="
echo "Catalog total:     $total_catalog"
echo "Already complete:  $done_count"
echo "To generate:       $total"
echo "Log dir:           $LOG_DIR"
echo "==================================================================="
echo ""

start_ts=$(date +%s)
completed=0
failed=0
failed_ids=()

for i in "${!missing[@]}"; do
  n=$((i+1))
  s="${missing[$i]}"
  log="$LOG_DIR/$s.log"

  elapsed=$(( $(date +%s) - start_ts ))
  if [ "$n" -gt 1 ] && [ "$completed" -gt 0 ]; then
    avg=$(( elapsed / (n - 1) ))
    remaining_est=$(( avg * (total - (n - 1)) ))
    mm=$(( remaining_est / 60 ))
    ss=$(( remaining_est % 60 ))
    eta="~${mm}m${ss}s remaining"
  else
    eta=""
  fi

  echo "=== [$n/$total] $s $eta ==="

  if npx tsx scripts/generate.ts --story "$s" --step narration --no-upload \
        > "$log" 2>&1; then
    # Double-check both files now exist (generate.ts can succeed partially on retry).
    if [ -f "$CONTENT_DIR/$s/narration-grace.mp3" ] && \
       [ -f "$CONTENT_DIR/$s/narration-elijah.mp3" ]; then
      size_g=$(du -h "$CONTENT_DIR/$s/narration-grace.mp3" | cut -f1)
      size_e=$(du -h "$CONTENT_DIR/$s/narration-elijah.mp3" | cut -f1)
      echo "  OK grace=$size_g elijah=$size_e"
      completed=$((completed+1))
    else
      echo "  INCOMPLETE (missing one voice) — see $log"
      failed=$((failed+1))
      failed_ids+=("$s")
    fi
  else
    echo "  FAILED — see $log"
    tail -n 5 "$log" | sed 's/^/    | /'
    failed=$((failed+1))
    failed_ids+=("$s")
  fi
  echo
done

elapsed=$(( $(date +%s) - start_ts ))
mm=$(( elapsed / 60 ))
ss=$(( elapsed % 60 ))

echo "==================================================================="
echo "DONE in ${mm}m${ss}s. $completed completed, $failed failed out of $total."
if [ ${#failed_ids[@]} -gt 0 ]; then
  echo "Failed stories: ${failed_ids[*]}"
  echo "Retry: just re-run this script — completed stories are skipped."
fi
echo ""
echo "Next step — push MP3s to R2:"
echo "  R2_APP_PREFIX=history-tea CONTENT_APP_ID=history-tea \\"
echo "    npx tsx scripts/sync-to-r2.ts --kind narration"
