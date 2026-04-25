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

# Pick stories where cover.webp is either missing OR was generated very recently
# (last 24h) — the recent ones may have failed to upload to R2 last time.
# generate.ts will skip Flux when a local cover exists and just (re)upload to R2.
missing=()
for d in "$STORIES_DIR"/*/; do
  id="$(basename "$d")"
  cover="$d/cover.webp"
  if [ ! -f "$cover" ]; then
    missing+=("$id")
  elif find "$cover" -mmin -120 -print -quit 2>/dev/null | grep -q .; then
    missing+=("$id")
  fi
done

count=${#missing[@]}
echo "[$(date '+%H:%M:%S')] Processing $count covers (missing locally OR recently generated)" | tee "$LOG_FILE"
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
