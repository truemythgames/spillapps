/**
 * Upload prayer narrations to R2 and register audio in D1.
 *
 * Usage:
 *   npx tsx scripts/sync-prayers-r2.ts               # upload all prayer narrations
 *   npx tsx scripts/sync-prayers-r2.ts --dry-run     # only report, do not upload
 */
import "dotenv/config";
import { readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PRAYERS_DIR = join(ROOT, "apps", "bible-tea", "content", "prayers");

const R2_BUCKET = "spill-media";
const R2_APP_PREFIX = "bible-tea";
const CDN_BASE = `https://media.spillapps.com/${R2_APP_PREFIX}`;

const NARRATION_FILES = [
  "narration-grace.mp3",
  "narration-elijah.mp3",
  "narration-grace-es.mp3",
  "narration-elijah-es.mp3",
];

async function isOnCdn(key: string): Promise<boolean> {
  try {
    const r = await fetch(`${CDN_BASE}/${key}`, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}

function uploadToR2(localPath: string, r2Key: string) {
  execSync(
    `npx wrangler r2 object put "${R2_BUCKET}/${R2_APP_PREFIX}/${r2Key}" --file="${localPath}" --content-type="audio/mpeg" --remote`,
    { stdio: ["ignore", "ignore", "pipe"] },
  );
}

async function main() {
  const dry = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");

  const prayerDirs = readdirSync(PRAYERS_DIR).filter((n) =>
    statSync(join(PRAYERS_DIR, n)).isDirectory(),
  );
  console.log(`Found ${prayerDirs.length} prayer directories`);

  let uploaded = 0;
  let skipped = 0;
  let missing = 0;
  let failed = 0;

  for (const slug of prayerDirs) {
    for (const file of NARRATION_FILES) {
      const localPath = join(PRAYERS_DIR, slug, file);
      if (!existsSync(localPath)) {
        missing++;
        continue;
      }
      const r2Key = `prayers/${slug}/${file}`;
      const present = !force && (await isOnCdn(r2Key));
      if (present) {
        skipped++;
        continue;
      }
      if (dry) {
        console.log(`[dry-run] would upload ${r2Key}`);
        uploaded++;
        continue;
      }
      try {
        uploadToR2(localPath, r2Key);
        console.log(`[ok] ${r2Key}`);
        uploaded++;
      } catch (err: any) {
        console.error(`[fail] ${r2Key}: ${err?.message?.slice(0, 200) ?? err}`);
        failed++;
      }
    }
  }

  console.log(
    `\nDone. uploaded=${uploaded} skipped=${skipped} missingLocal=${missing} failed=${failed}`,
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
