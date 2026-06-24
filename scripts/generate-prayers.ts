import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { SPEAKERS, prepareForSpeech } from "./lib/generate-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "apps", "bible-tea", "content");
const PRAYERS_DIR = join(CONTENT_DIR, "prayers");
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PrayerEntry {
  id: string;
  title: string;
  description: string;
  storyLinks: string[];
  characterLinks: string[];
}

interface CategoryEntry {
  category: { id: string; name: string; slug: string; description: string; icon: string };
  prayers: PrayerEntry[];
}

const catalog: CategoryEntry[] = JSON.parse(
  readFileSync(join(CONTENT_DIR, "prayer-catalog.json"), "utf8")
);

const SPEAKER_KEYS: (keyof typeof SPEAKERS)[] = ["grace", "elijah"];

async function generatePrayerTranscript(prayer: PrayerEntry, categoryName: string): Promise<string> {
  const prayerDir = join(PRAYERS_DIR, prayer.id.replace("pr-", ""));
  const transcriptPath = join(prayerDir, "transcript.md");

  if (existsSync(transcriptPath)) {
    return readFileSync(transcriptPath, "utf8");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are writing guided prayer scripts for a Bible app called "Bible Tea". The prayers are narrated aloud by a warm, casual narrator.

Rules:
- Write in second person ("you") speaking directly to the listener
- Keep it 150-250 words (1-2 minutes when read aloud)
- Start with a brief grounding (1-2 sentences setting the scene/emotion)
- Move into the prayer itself (addressed to God, but guiding the listener)
- End with a short closing affirmation or scripture
- Tone: intimate, warm, conversational — like a trusted friend praying with you
- NOT preachy or churchy. Natural, genuine, slightly vulnerable
- Include 1 relevant Bible verse woven naturally (not forced)
- Use markdown: # Title, then the prayer text
- Do NOT use ## headings or bullet points — it should flow as continuous speech
- The prayer should feel like one unbroken moment of connection with God`,
      },
      {
        role: "user",
        content: `Write a guided prayer for the category "${categoryName}".

Title: ${prayer.title}
Description: ${prayer.description}

Remember: 150-250 words, intimate tone, one scripture woven in naturally.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const transcript = response.choices[0]?.message?.content?.trim();
  if (!transcript) throw new Error(`Empty transcript for ${prayer.id}`);

  mkdirSync(prayerDir, { recursive: true });
  writeFileSync(transcriptPath, transcript, "utf8");
  return transcript;
}

async function generateNarration(
  text: string,
  speakerKey: keyof typeof SPEAKERS
): Promise<Buffer> {
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

async function processPrayer(prayer: PrayerEntry, categoryName: string) {
  const slug = prayer.id.replace("pr-", "");
  const prayerDir = join(PRAYERS_DIR, slug);
  mkdirSync(prayerDir, { recursive: true });

  console.log(`  [transcript] ${prayer.title}...`);
  const transcript = await generatePrayerTranscript(prayer, categoryName);
  console.log(`  [transcript] Done (${transcript.split(/\s+/).length} words)`);

  for (const speakerKey of SPEAKER_KEYS) {
    const audioPath = join(prayerDir, `narration-${speakerKey}.mp3`);
    if (existsSync(audioPath)) {
      console.log(`  [skip] ${speakerKey} — file exists`);
      continue;
    }

    console.log(`  [tts] ${speakerKey}...`);
    const audio = await generateNarration(transcript, speakerKey);
    writeFileSync(audioPath, audio);
    console.log(`  [ok] ${speakerKey} — ${(audio.length / 1024).toFixed(0)} KB`);
  }
}

async function main() {
  const allPrayers = catalog.flatMap((c) =>
    c.prayers.map((p) => ({ ...p, categoryName: c.category.name }))
  );

  console.log(`\n=== Bible Tea Prayer Generation ===`);
  console.log(`Categories: ${catalog.length} | Prayers: ${allPrayers.length}`);
  console.log(`Speakers: ${SPEAKER_KEYS.join(", ")}\n`);

  let done = 0;
  let failed = 0;

  for (let i = 0; i < allPrayers.length; i++) {
    const prayer = allPrayers[i];
    console.log(`[${i + 1}/${allPrayers.length}] ${prayer.title}`);
    try {
      await processPrayer(prayer, prayer.categoryName);
      done++;
    } catch (err: any) {
      console.error(`  [ERROR] ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Done! ${done} completed, ${failed} failed ===`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
