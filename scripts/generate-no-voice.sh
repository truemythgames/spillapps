#!/bin/bash
# Generate transcript + cover image for all stories that don't have them yet.
# Skips narration (ElevenLabs) entirely to save cost.
set -e
cd "$(dirname "$0")/.."

CONTENT_DIR="apps/bible-tea/content/stories"

# Build list of story IDs from catalog that are missing transcript or cover
missing=()
while IFS= read -r id; do
  if [ ! -f "$CONTENT_DIR/$id/transcript.md" ] || [ ! -f "$CONTENT_DIR/$id/cover.webp" ]; then
    missing+=("$id")
  fi
done < <(node -e "require('./apps/bible-tea/content/story-catalog.json').forEach(s=>console.log(s.id))")

total=${#missing[@]}
if [ "$total" -eq 0 ]; then
  echo "All stories already have transcript + cover. Nothing to do."
  exit 0
fi

echo "=== Generating $total stories (transcript + image, NO voice) ==="
echo ""

completed=0
failed=0
failed_ids=()

for i in "${!missing[@]}"; do
  n=$((i+1))
  s="${missing[$i]}"
  echo "=== [$n/$total] $s ==="

  # Transcript
  if [ ! -f "$CONTENT_DIR/$s/transcript.md" ]; then
    if ! npx tsx scripts/generate.ts --story "$s" --step transcript 2>&1; then
      echo "  FAILED transcript: $s"
      failed=$((failed+1))
      failed_ids+=("$s")
      echo
      continue
    fi
  else
    echo "  [transcript] Already exists, skipping"
  fi

  # Cover image
  if [ ! -f "$CONTENT_DIR/$s/cover.webp" ]; then
    if ! npx tsx scripts/generate.ts --story "$s" --step image 2>&1; then
      echo "  FAILED image: $s"
      failed=$((failed+1))
      failed_ids+=("$s")
      echo
      continue
    fi
  else
    echo "  [image] Already exists, skipping"
  fi

  completed=$((completed+1))
  echo
done

echo "==========================================="
echo "DONE. $completed completed, $failed failed out of $total."
if [ ${#failed_ids[@]} -gt 0 ]; then
  echo "Failed stories: ${failed_ids[*]}"
fi
