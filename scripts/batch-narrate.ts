import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { prepareForSpeech, SPEAKERS } from "./lib/generate-core";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const R2_BUCKET = "spill-media";
const APP_PREFIX = "bible-tea";
const SPEAKER_KEYS: (keyof typeof SPEAKERS)[] = ["elijah", "grace"];
const SPEAKER_DB_IDS: Record<string, string> = {
  elijah: "spk-elijah",
  grace: "spk-grace",
};

const CONCURRENCY = 2;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;

const OUTPUT_DIR = join(__dirname, "narration-output");
const PROGRESS_FILE = join(OUTPUT_DIR, "progress.json");
const SQL_FILE = join(OUTPUT_DIR, "insert-audio.sql");

interface StoryRow {
  id: string;
  slug: string;
  transcript: string;
}

function loadProgress(): Set<string> {
  if (existsSync(PROGRESS_FILE)) {
    return new Set(JSON.parse(readFileSync(PROGRESS_FILE, "utf8")));
  }
  return new Set();
}

function saveProgress(done: Set<string>) {
  writeFileSync(PROGRESS_FILE, JSON.stringify([...done], null, 2));
}

async function generateNarration(text: string, speakerKey: keyof typeof SPEAKERS): Promise<Buffer> {
  const speaker = SPEAKERS[speakerKey];
  const speechText = prepareForSpeech(text);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${speaker.voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: speechText,
        model_id: "eleven_multilingual_v2",
        voice_settings: { ...speaker.voiceSettings },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${err}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function processStory(story: StoryRow, speakerKey: keyof typeof SPEAKERS, done: Set<string>) {
  const key = `${story.slug}:${speakerKey}`;
  if (done.has(key)) return;

  const mp3Dir = join(OUTPUT_DIR, story.slug);
  const mp3Path = join(mp3Dir, `narration-${speakerKey}.mp3`);

  mkdirSync(mp3Dir, { recursive: true });

  if (existsSync(mp3Path)) {
    console.log(`  [skip] ${key} — file exists`);
    done.add(key);
    saveProgress(done);
    return;
  }

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`  [tts] ${key} (attempt ${attempt}/${RETRY_ATTEMPTS})...`);
      const audio = await generateNarration(story.transcript, speakerKey);
      writeFileSync(mp3Path, audio);
      console.log(`  [ok]  ${key} — ${(audio.length / 1024).toFixed(0)} KB`);
      done.add(key);
      saveProgress(done);
      return;
    } catch (err: any) {
      console.error(`  [err] ${key}: ${err.message}`);
      if (attempt < RETRY_ATTEMPTS) {
        console.log(`  [wait] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }
  console.error(`  [FAIL] ${key} — all attempts failed`);
}

async function uploadToR2(story: StoryRow, speakerKey: string) {
  const mp3Path = join(OUTPUT_DIR, story.slug, `narration-${speakerKey}.mp3`);
  if (!existsSync(mp3Path)) return false;

  const r2Key = `${APP_PREFIX}/stories/${story.slug}/narration-${speakerKey}.mp3`;
  try {
    execSync(
      `npx wrangler r2 object put "${R2_BUCKET}/${r2Key}" --file="${mp3Path}" --content-type="audio/mpeg" --remote`,
      { stdio: "pipe" }
    );
    return true;
  } catch (err: any) {
    console.error(`  [r2-err] ${r2Key}: ${err.message}`);
    return false;
  }
}

async function main() {
  const stories: StoryRow[] = JSON.parse(
    readFileSync(join(__dirname, "missing-audio-stories.json"), "utf8")
  );

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const done = loadProgress();

  const total = stories.length * SPEAKER_KEYS.length;
  console.log(`\n=== Bible Tea Batch Narration ===`);
  console.log(`Stories: ${stories.length} | Speakers: ${SPEAKER_KEYS.join(", ")} | Total: ${total}`);
  console.log(`Already done: ${done.size} | Remaining: ${total - done.size}\n`);

  const mode = process.argv[2];

  if (mode === "--upload") {
    console.log("=== Uploading to R2 ===\n");
    const sqlLines: string[] = [];

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      for (const speakerKey of SPEAKER_KEYS) {
        const mp3Path = join(OUTPUT_DIR, story.slug, `narration-${speakerKey}.mp3`);
        if (!existsSync(mp3Path)) {
          console.log(`  [skip] ${story.slug}:${speakerKey} — no file`);
          continue;
        }

        console.log(`  [upload] ${story.slug}:${speakerKey} (${i + 1}/${stories.length})...`);
        const ok = await uploadToR2(story, speakerKey);
        if (ok) {
          const audioId = `sa-${story.slug}-${speakerKey}`;
          const audioKey = `${APP_PREFIX}/stories/${story.slug}/narration-${speakerKey}.mp3`;
          const speakerId = SPEAKER_DB_IDS[speakerKey];
          sqlLines.push(
            `INSERT OR IGNORE INTO story_audio (id, story_id, speaker_id, audio_key, duration_seconds) VALUES ('${audioId}', '${story.id}', '${speakerId}', '${audioKey}', 0);`
          );
        }
      }
    }

    writeFileSync(SQL_FILE, sqlLines.join("\n"), "utf8");
    console.log(`\n=== Done! SQL written to ${SQL_FILE} (${sqlLines.length} rows) ===`);
    console.log(`Run: npx wrangler d1 execute spill-db --remote --file="${SQL_FILE}"`);
    return;
  }

  // Generate narrations
  for (let i = 0; i < stories.length; i += CONCURRENCY) {
    const batch = stories.slice(i, i + CONCURRENCY);
    const tasks: Promise<void>[] = [];

    for (const story of batch) {
      for (const speakerKey of SPEAKER_KEYS) {
        tasks.push(processStory(story, speakerKey, done));
      }
    }

    console.log(`\n--- Batch ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(stories.length / CONCURRENCY)} (stories ${i + 1}-${Math.min(i + CONCURRENCY, stories.length)}) ---`);
    await Promise.all(tasks);

    const remaining = total - done.size;
    if (remaining > 0 && i + CONCURRENCY < stories.length) {
      console.log(`  Progress: ${done.size}/${total} done, ${remaining} remaining`);
    }
  }

  console.log(`\n=== Generation complete! ${done.size}/${total} narrations ===`);
  console.log(`Run with --upload to upload to R2 and generate DB SQL.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
