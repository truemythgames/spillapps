#!/bin/bash
# Generates the 9 stories used as History Tea onboarding backgrounds,
# then copies their cover.webp into the mobile app's onboarding assets folder.
#
# Run from repo root:
#   bash scripts/generate-history-onboarding.sh
set -e
cd "$(dirname "$0")/.."

stories=(
  building-the-pyramids
  the-trojan-horse
  ides-of-march
  pompeii-destroyed
  vikings-raid-lindisfarne
  joan-of-arc
  napoleons-rise
  hiroshima-and-nagasaki
  moon-landing
)

CONTENT_DIR="apps/history-tea/content/stories"
ASSETS_DIR="apps/history-tea/mobile/assets/onboarding"

mkdir -p "$ASSETS_DIR"

total=${#stories[@]}
completed=0
failed=0

for i in "${!stories[@]}"; do
  n=$((i+1))
  s="${stories[$i]}"
  echo "=== [$n/$total] $s ==="

  # Generate (skips work if already cached inside generate.ts)
  if CONTENT_APP_ID=history-tea R2_APP_PREFIX=history-tea \
      npx tsx scripts/generate.ts --story "$s" 2>&1; then
    completed=$((completed+1))
  else
    echo "  GENERATE FAILED: $s"
    failed=$((failed+1))
    continue
  fi

  # Copy cover into onboarding assets
  src="$CONTENT_DIR/$s/cover.webp"
  dst="$ASSETS_DIR/$s.webp"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
    echo "  copied -> $dst"
  else
    echo "  COVER MISSING: $src"
    failed=$((failed+1))
  fi
  echo
done

echo "ALL DONE. $completed generated, $failed failed out of $total."
echo "Onboarding assets are in: $ASSETS_DIR"
