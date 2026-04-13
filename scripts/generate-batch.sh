#!/bin/bash
set -e
cd "$(dirname "$0")/.."

stories=(
  abrahams-sister-lie
  the-same-lie-again
  gods-promise-of-a-son
  tired-of-waiting
  sodom-and-gomorrah
  lots-escape-gone-wrong
  birth-of-isaac
  isaac-and-rebekah
  jacob-rachel-and-leah
  jacob-wrestles-god
  jacobs-family-moves-to-egypt
  bread-from-heaven
  god-gives-a-second-chance
  building-gods-tent
  the-first-priests
  offerings-and-sacrifices
  clean-and-unclean
  the-day-of-atonement
  real-world-holiness
  sacred-feasts-and-rhythms
)

total=${#stories[@]}
completed=0
failed=0

for i in "${!stories[@]}"; do
  n=$((i+1))
  s="${stories[$i]}"
  echo "=== [$n/$total] $s ==="
  if npx tsx scripts/generate.ts --story "$s" 2>&1; then
    completed=$((completed+1))
  else
    echo "  FAILED: $s"
    failed=$((failed+1))
  fi
  echo
done

echo "ALL DONE. $completed completed, $failed failed out of $total."
