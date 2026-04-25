#!/usr/bin/env bash
# Generate transcripts + cover images for every history-tea story.
# Skips mp3 narration entirely. Skips R2 upload (wrangler not authed locally).
# Re-runs are safe: existing transcript.md / cover.webp files are skipped.

set -u
cd "$(dirname "$0")/.."

export CONTENT_APP_ID=history-tea
export R2_APP_PREFIX=history-tea

LOG_DIR="logs"
mkdir -p "$LOG_DIR"

echo "==================================================================="
echo "[$(date '+%H:%M:%S')] STEP 1/2 — TRANSCRIPTS for all 260 stories"
echo "==================================================================="
npx tsx scripts/generate.ts --all --step transcript --no-upload
TRANSCRIPT_EXIT=$?
echo "[$(date '+%H:%M:%S')] transcript step exit=$TRANSCRIPT_EXIT"

echo ""
echo "==================================================================="
echo "[$(date '+%H:%M:%S')] STEP 2/2 — COVER IMAGES for all 260 stories"
echo "==================================================================="
npx tsx scripts/generate.ts --all --step image --no-upload
IMAGE_EXIT=$?
echo "[$(date '+%H:%M:%S')] image step exit=$IMAGE_EXIT"

echo ""
echo "[$(date '+%H:%M:%S')] DONE. transcript=$TRANSCRIPT_EXIT image=$IMAGE_EXIT"
