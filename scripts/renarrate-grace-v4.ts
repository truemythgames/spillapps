/**
 * Re-narrate English Bible Tea stories + prayers with Grace on Eleven v4,
 * overwrite the live R2 objects, and update story metadata.
 *
 * Usage:
 *   npx tsx scripts/renarrate-grace-v4.ts            # run (resumable)
 *   npx tsx scripts/renarrate-grace-v4.ts --dry-run  # list work only
 *   npx tsx scripts/renarrate-grace-v4.ts --limit 5
 */
import "dotenv/config";
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { SPEAKERS, prepareForSpeech } from "./lib/generate-core";

const MODEL_ID = "eleven_v4";
const SPEAKER_KEY = "grace" as const;
const CONCURRENCY = 3;
const MAX_CHARS = 10_000;
const R2_BUCKET = "spill-media";
const R2_APP_PREFIX = "bible-tea";

const ROOT = join(__dirname, "..");
const CONTENT = join(ROOT, "apps/bible-tea/content");
const BATCH_OUTPUT = join(__dirname, "narration-output");
const BACKUP_DIR = join(ROOT, "tmp-mp3/grace-v2-backup");
const PROGRESS_FILE = join(__dirname, "renarrate-grace-v4-progress.json");

type Job = { kind: "stories" | "prayers"; slug: string; dir: string };

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;

function loadProgress(): Set<string> {
  return new Set(existsSync(PROGRESS_FILE) ? JSON.parse(readFileSync(PROGRESS_FILE, "utf8")) : []);
}

function collectJobs(): Job[] {
  const jobs: Job[] = [];
  for (const kind of ["stories", "prayers"] as const) {
    const base = join(CONTENT, kind);
    for (const slug of readdirSync(base).sort()) {
      const dir = join(base, slug);
      if (existsSync(join(dir, "transcript.md"))) jobs.push({ kind, slug, dir });
    }
  }
  return jobs;
}

async function tts(text: string): Promise<Buffer> {
  const speaker = SPEAKERS[SPEAKER_KEY];
  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${speaker.voiceId}`, {
        method: "POST",
        headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!, "Content-Type": "application/json" },
        body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: { ...speaker.voiceSettings } }),
      });
    } catch (err) {
      if (attempt < 6) {
        await new Promise((r) => setTimeout(r, 10_000 * attempt));
        continue;
      }
      throw err;
    }
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const err = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      await new Promise((r) => setTimeout(r, 10_000 * attempt));
      continue;
    }
    throw new Error(`ElevenLabs TTS failed (${res.status}): ${err.slice(0, 300)}`);
  }
}

async function processJob(job: Job) {
  const text = prepareForSpeech(readFileSync(join(job.dir, "transcript.md"), "utf8"));
  if (text.length > MAX_CHARS) throw new Error(`transcript too long (${text.length} chars)`);

  const audio = await tts(text);
  const file = `narration-${SPEAKER_KEY}.mp3`;
  const localPath = join(job.dir, file);

  const batchCopy = job.kind === "stories" ? join(BATCH_OUTPUT, job.slug, file) : null;
  const backupDir = join(BACKUP_DIR, job.kind, job.slug);
  const backupPath = join(backupDir, file);
  const oldSource = [localPath, batchCopy].find((p): p is string => !!p && existsSync(p));
  if (oldSource && !existsSync(backupPath)) {
    mkdirSync(backupDir, { recursive: true });
    copyFileSync(oldSource, backupPath);
  }

  writeFileSync(localPath, audio);
  if (batchCopy && existsSync(batchCopy)) writeFileSync(batchCopy, audio);

  execSync(
    `npx wrangler r2 object put "${R2_BUCKET}/${R2_APP_PREFIX}/${job.kind}/${job.slug}/${file}" --file="${localPath}" --content-type="audio/mpeg" --remote`,
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  const metaPath = join(job.dir, "metadata.json");
  if (job.kind === "stories" || existsSync(metaPath)) {
    const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, "utf8")) : {};
    meta[`narration_${SPEAKER_KEY}`] = {
      model: MODEL_ID,
      voiceId: SPEAKERS[SPEAKER_KEY].voiceId,
      generatedAt: new Date().toISOString(),
      sizeKB: Math.round(audio.length / 1024),
    };
    writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf8");
  }
  return text.length;
}

async function main() {
  const done = loadProgress();
  const todo = collectJobs()
    .filter((j) => !done.has(`${j.kind}/${j.slug}`))
    .slice(0, limit);
  console.log(`=== Grace -> ${MODEL_ID}: ${todo.length} to do, ${done.size} already done ===`);
  if (dryRun) {
    todo.forEach((j) => console.log(`  ${j.kind}/${j.slug}`));
    return;
  }

  let ok = 0;
  let failed = 0;
  let chars = 0;
  const queue = [...todo];
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const key = `${job.kind}/${job.slug}`;
      try {
        const n = await processJob(job);
        chars += n;
        done.add(key);
        writeFileSync(PROGRESS_FILE, JSON.stringify([...done].sort(), null, 2));
        ok++;
        console.log(`[ok ${ok + failed}/${todo.length}] ${key}`);
      } catch (err: any) {
        failed++;
        console.error(`[fail ${ok + failed}/${todo.length}] ${key}: ${err?.message ?? err}`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`\nDone. ok=${ok} failed=${failed} chars=${chars}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
