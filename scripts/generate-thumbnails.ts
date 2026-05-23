/**
 * Generate 400x400 thumbnail covers and upload to R2 alongside originals.
 * The API will serve these for list views (much smaller than 1024x1024 originals).
 *
 * Usage: npx tsx scripts/generate-thumbnails.ts
 * Requires: sharp (npm i -D sharp)
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const APPS = ["bible-tea", "history-tea"];
const THUMB_SIZE = 400;
const THUMB_QUALITY = 75;

async function main() {
  for (const app of APPS) {
    const storiesDir = path.join(__dirname, "..", "apps", app, "content", "stories");
    if (!fs.existsSync(storiesDir)) {
      console.log(`Skipping ${app}: no content/stories dir`);
      continue;
    }

    const stories = fs.readdirSync(storiesDir).filter((d) =>
      fs.statSync(path.join(storiesDir, d)).isDirectory()
    );

    let count = 0;
    for (const story of stories) {
      const coverPath = path.join(storiesDir, story, "cover.webp");
      const thumbPath = path.join(storiesDir, story, "cover-thumb.webp");

      if (!fs.existsSync(coverPath)) continue;

      // Skip if thumb already exists and is recent
      if (fs.existsSync(thumbPath)) {
        const orig = fs.statSync(coverPath).mtimeMs;
        const thumb = fs.statSync(thumbPath).mtimeMs;
        if (thumb > orig) continue;
      }

      await sharp(coverPath)
        .resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover" })
        .webp({ quality: THUMB_QUALITY })
        .toFile(thumbPath);

      count++;
    }

    console.log(`${app}: generated ${count} thumbnails (${stories.length} stories total)`);
  }
}

main().catch(console.error);
