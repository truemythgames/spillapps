import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "apps", "bible-tea", "content");
const PRAYERS_DIR = join(CONTENT_DIR, "prayers");

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

async function regenerateTranscript(prayer: PrayerEntry, categoryName: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You write prayers for a Bible app. These are actual prayers — words spoken directly to God.

Rules:
- This is a PRAYER, not a meditation. No instructions to the listener. No "take a deep breath", no "close your eyes", no scene-setting, no grounding exercises.
- Write 100% as words spoken TO GOD. Every sentence is addressed to God.
- 150-250 words
- Tone: intimate, honest, vulnerable — like someone genuinely talking to God in a hard moment
- Weave in 1 relevant Bible verse naturally (as part of the prayer, not quoted at the listener)
- Use markdown: # Title on the first line, then a blank line, then the prayer
- No ## headings, no bullet points — continuous flowing prayer
- No "Amen" instructions or closing instructions. Just end with "Amen."
- Do NOT address the listener at any point. This is purely God-directed speech.`,
      },
      {
        role: "user",
        content: `Write a prayer for the category "${categoryName}".

Title: ${prayer.title}
Context: ${prayer.description}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const transcript = response.choices[0]?.message?.content?.trim();
  if (!transcript) throw new Error(`Empty transcript for ${prayer.id}`);
  return transcript;
}

async function main() {
  const allPrayers = catalog.flatMap((c) =>
    c.prayers.map((p) => ({ ...p, categoryName: c.category.name }))
  );

  console.log(`\n=== Regenerating ${allPrayers.length} prayer transcripts ===\n`);

  let done = 0;
  let failed = 0;

  for (let i = 0; i < allPrayers.length; i++) {
    const prayer = allPrayers[i];
    const slug = prayer.id.replace("pr-", "");
    const prayerDir = join(PRAYERS_DIR, slug);
    mkdirSync(prayerDir, { recursive: true });

    console.log(`[${i + 1}/${allPrayers.length}] ${prayer.title}...`);
    try {
      const transcript = await regenerateTranscript(prayer, prayer.categoryName);
      writeFileSync(join(prayerDir, "transcript.md"), transcript, "utf8");
      console.log(`  [ok] ${transcript.split(/\s+/).length} words`);
      done++;
    } catch (err: any) {
      console.error(`  [FAIL] ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Done! ${done} regenerated, ${failed} failed ===`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
