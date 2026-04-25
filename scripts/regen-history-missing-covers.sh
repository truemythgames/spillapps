#!/usr/bin/env bash
# Regenerate cover.webp for any history-tea story that's missing one.
# Uses the safe-prompt fallback added to generate.ts for sensitive content.
# Uploads to R2 (CONTENT_APP_ID=history-tea, R2_APP_PREFIX=history-tea).

set -u
cd "$(dirname "$0")/.."

export CONTENT_APP_ID=history-tea
export R2_APP_PREFIX=history-tea

STORIES_DIR="apps/history-tea/content/stories"
LOG_DIR="logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/regen-covers-$(date +%Y%m%d-%H%M%S).log"

missing=()
for d in "$STORIES_DIR"/*/; do
  id="$(basename "$d")"
  [ ! -f "$d/cover.webp" ] && missing+=("$id")
done

count=${#missing[@]}
echo "[$(date '+%H:%M:%S')] Regenerating $count missing covers" | tee "$LOG_FILE"
echo "Log: $LOG_FILE"
echo ""

i=0
ok=0
fail=0
for id in "${missing[@]}"; do
  i=$((i+1))
  echo "[$(date '+%H:%M:%S')] [$i/$count] $id" | tee -a "$LOG_FILE"
  if npx tsx scripts/generate.ts --story "$id" --step image >> "$LOG_FILE" 2>&1; then
    ok=$((ok+1))
    echo "  -> OK" | tee -a "$LOG_FILE"
  else
    fail=$((fail+1))
    echo "  -> FAILED" | tee -a "$LOG_FILE"
  fi
done

echo "" | tee -a "$LOG_FILE"
echo "[$(date '+%H:%M:%S')] DONE. ok=$ok fail=$fail / $count" | tee -a "$LOG_FILE"
