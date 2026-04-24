/**
 * Syncs local content files to R2 (Cloudflare), uploading anything that is
 * missing on the CDN. Safe to re-run: only uploads files that return 404.
 *
 * Usage:
 *   npx tsx scripts/sync-to-r2.ts                 # check & upload all missing
 *   npx tsx scripts/sync-to-r2.ts --force         # re-upload everything
 *   npx tsx scripts/sync-to-r2.ts --dry-run       # only report, do not upload
 *   npx tsx scripts/sync-to-r2.ts --kind transcript|cover|narration
 */
import { readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { contentAppDir } from "./lib/content-dir.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = contentAppDir(ROOT);
const STORIES_DIR = join(CONTENT_DIR, "stories");

const R2_BUCKET = "spill-media";
const R2_APP_PREFIX = process.env.R2_APP_PREFIX?.trim() || "bible-tea";
const CDN_BASE = `https://media.spillapps.com/${R2_APP_PREFIX}`;

function parseArgs() {
  const args = process.argv.slice(2);
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

async function isOnCdn(key: string): Promise<boolean> {
  try {
    const r = await fetch(`${CDN_BASE}/${key}`, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}

function uploadToR2(localPath: string, r2Key: string, contentType: string) {
  execSync(
    `npx wrangler r2 object put "${R2_BUCKET}/${R2_APP_PREFIX}/${r2Key}" --file="${localPath}" --content-type="${contentType}" --remote`,
    { stdio: ["ignore", "ignore", "pipe"] },
  );
}

const CONTENT_TYPES: Record<string, string> = {
  "transcript.md": "text/markdown",
  "cover.webp": "image/webp",
  "narration-grace.mp3": "audio/mpeg",
  "narration-elijah.mp3": "audio/mpeg",
  "narration-maya.mp3": "audio/mpeg",
};

const KIND_FILES: Record<string, string[]> = {
  transcript: ["transcript.md"],
  cover: ["cover.webp"],
  narration: ["narration-grace.mp3", "narration-elijah.mp3", "narration-maya.mp3"],
  all: [
    "transcript.md",
    "cover.webp",
    "narration-grace.mp3",
    "narration-elijah.mp3",
    "narration-maya.mp3",
  ],
};

async function main() {
  const flags = parseArgs();
  const force = !!flags.force;
  const dry = !!flags["dry-run"];
  const kind = (typeof flags.kind === "string" ? flags.kind : "all") as keyof typeof KIND_FILES;
  const files = KIND_FILES[kind];
  if (!files) {
    console.error(`Unknown --kind ${kind}. Use: ${Object.keys(KIND_FILES).join("|")}`);
    process.exit(1);
  }

  const storyIds = readdirSync(STORIES_DIR).filter((n) =>
    statSync(join(STORIES_DIR, n)).isDirectory(),
  );
  console.log(`Scanning ${storyIds.length} stories for kind=${kind}...`);

  let uploaded = 0;
  let skipped = 0;
  let missing = 0;
  let failed = 0;

  for (const id of storyIds) {
    for (const file of files) {
      const localPath = join(STORIES_DIR, id, file);
      if (!existsSync(localPath)) {
        missing++;
        continue;
      }
      const r2Key = `stories/${id}/${file}`;
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
        uploadToR2(localPath, r2Key, CONTENT_TYPES[file] ?? "application/octet-stream");
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
