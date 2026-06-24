import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SPEAKERS, prepareForSpeech } from "./lib/generate-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "apps", "bible-tea", "content");
const PRAYERS_DIR = join(CONTENT_DIR, "prayers");
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;

const MODEL_ID = "eleven_turbo_v2_5";
const SPEAKER_KEYS: (keyof typeof SPEAKERS)[] = ["grace", "elijah"];

interface CategoryEntry {
  category: { id: string; name: string; slug: string };
  prayers: { id: string; title: string }[];
}

const catalog: CategoryEntry[] = JSON.parse(
  readFileSync(join(CONTENT_DIR, "prayer-catalog.json"), "utf8")
);

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
        model_id: MODEL_ID,
        voice_settings: { ...speaker.voiceSettings, stability: 0.55, style: 0.2 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${err}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const locale = process.argv.includes("--es") ? "es" : "en";
  const suffix = locale === "es" ? "-es" : "";
  const transcriptFile = locale === "es" ? "transcript.es.md" : "transcript.md";

  const allPrayers = catalog.flatMap((c) =>
    c.prayers.map((p) => ({ ...p, categoryName: c.category.name }))
  );

  console.log(`\n=== Prayer Narration (${locale.toUpperCase()}) ===`);
  console.log(`Prayers: ${allPrayers.length} | Speakers: ${SPEAKER_KEYS.join(", ")} | Total: ${allPrayers.length * SPEAKER_KEYS.length}\n`);

  let done = 0;
  let failed = 0;

  for (let i = 0; i < allPrayers.length; i++) {
    const prayer = allPrayers[i];
    const slug = prayer.id.replace("pr-", "");
    const prayerDir = join(PRAYERS_DIR, slug);
    const tPath = join(prayerDir, transcriptFile);

    if (!existsSync(tPath)) {
      console.log(`  [skip] ${slug} — no ${transcriptFile}`);
      continue;
    }

    const transcript = readFileSync(tPath, "utf8");

    for (const speakerKey of SPEAKER_KEYS) {
      const audioPath = join(prayerDir, `narration-${speakerKey}${suffix}.mp3`);
      if (existsSync(audioPath)) {
        done++;
        continue;
      }

      try {
        console.log(`  [tts] ${slug}:${speakerKey} (${i + 1}/${allPrayers.length})...`);
        const audio = await generateNarration(transcript, speakerKey);
        writeFileSync(audioPath, audio);
        console.log(`  [ok]  ${slug}:${speakerKey} — ${(audio.length / 1024).toFixed(0)} KB`);
        done++;
      } catch (err: any) {
        console.error(`  [FAIL] ${slug}:${speakerKey}: ${err.message}`);
        failed++;
      }
    }
  }

  console.log(`\n=== Done! ${done} completed, ${failed} failed ===`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
