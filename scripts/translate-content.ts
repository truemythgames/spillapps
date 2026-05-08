import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { contentAppDir, getContentAppId } from "./lib/content-dir.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const APP_ID = getContentAppId();
const CONTENT_DIR = contentAppDir(ROOT);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CatalogStory {
  id: string;
  title: string;
  description: string;
  section: string;
  bibleRef: string;
  inSeed?: boolean;
  seedId?: string | null;
}

interface CharacterEntry {
  id: string;
  name: string;
  subtitle: string;
  overview: string;
  storyIds: string[];
  imagePrompt?: string;
}

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

const LOCALE_NAMES: Record<string, string> = {
  es: "Spanish",
  fr: "French",
  pt: "Portuguese",
  de: "German",
  it: "Italian",
};

async function translateStoryCatalog(locale: string): Promise<void> {
  const catalogPath = join(CONTENT_DIR, "story-catalog.json");
  const catalog: CatalogStory[] = JSON.parse(readFileSync(catalogPath, "utf8"));
  const langName = LOCALE_NAMES[locale] ?? locale;

  console.log(`Translating ${catalog.length} stories to ${langName}...`);

  const BATCH_SIZE = 20;
  const translated: CatalogStory[] = [];

  for (let i = 0; i < catalog.length; i += BATCH_SIZE) {
    const batch = catalog.slice(i, i + BATCH_SIZE);
    const prompt = `Translate the following Bible story titles and descriptions to ${langName}. 
Keep the same JSON structure. Only translate "title" and "description" fields.
Keep bibleRef, section, id, and all other fields exactly as-is.
The descriptions are casual and fun (Gen-Z tone) — preserve that vibe in ${langName}.

${JSON.stringify(batch, null, 2)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Output valid JSON only, no markdown fences. Translate to ${langName} while keeping the casual, fun, Gen-Z tone. Bible book names should use their standard ${langName} forms (e.g. Génesis, Éxodo for Spanish).`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 8192,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) throw new Error(`Empty response for batch starting at index ${i}`);

    const parsed = JSON.parse(text.replace(/^```json\n?/, "").replace(/\n?```$/, ""));
    translated.push(...parsed);
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(catalog.length / BATCH_SIZE)} done (${parsed.length} stories)`);
  }

  const outPath = join(CONTENT_DIR, `story-catalog.${locale}.json`);
  writeFileSync(outPath, JSON.stringify(translated, null, 2), "utf8");
  console.log(`Wrote ${outPath} (${translated.length} stories)`);
}

async function translateCharacterCatalog(locale: string): Promise<void> {
  const catalogPath = join(CONTENT_DIR, "character-catalog.json");
  const catalog: CharacterEntry[] = JSON.parse(readFileSync(catalogPath, "utf8"));
  const langName = LOCALE_NAMES[locale] ?? locale;

  console.log(`Translating ${catalog.length} characters to ${langName}...`);

  const prompt = `Translate the following Bible character entries to ${langName}.
Only translate "name" (use standard ${langName} Bible names), "subtitle", and "overview" fields.
Keep id, storyIds, imagePrompt, and all other fields exactly as-is.
Output valid JSON only, no markdown fences.

${JSON.stringify(catalog, null, 2)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a professional translator specializing in Biblical content. Translate to ${langName}. Use standard ${langName} Bible character names (e.g. Moisés, Abrahán/Abraham, Jesús for Spanish). Keep the casual, accessible tone.`,
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 16384,
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response for character catalog");

  const parsed = JSON.parse(text.replace(/^```json\n?/, "").replace(/\n?```$/, ""));

  const outPath = join(CONTENT_DIR, `character-catalog.${locale}.json`);
  writeFileSync(outPath, JSON.stringify(parsed, null, 2), "utf8");
  console.log(`Wrote ${outPath} (${parsed.length} characters)`);
}

async function generateDbTranslationsSQL(locale: string): Promise<void> {
  const storyCatalogPath = join(CONTENT_DIR, `story-catalog.${locale}.json`);
  const charCatalogPath = join(CONTENT_DIR, `character-catalog.${locale}.json`);

  if (!existsSync(storyCatalogPath)) {
    console.error(`Missing ${storyCatalogPath} — run with --step catalog first`);
    return;
  }

  const stories: CatalogStory[] = JSON.parse(readFileSync(storyCatalogPath, "utf8"));
  const enStories: CatalogStory[] = JSON.parse(
    readFileSync(join(CONTENT_DIR, "story-catalog.json"), "utf8")
  );

  const existingDbStories = new Map<string, string>();
  for (const s of enStories) {
    if (s.seedId) existingDbStories.set(s.id, s.seedId);
  }

  function storyDbId(catalogId: string): string {
    return existingDbStories.get(catalogId) ?? `st-${catalogId}`;
  }

  function esc(s: string): string {
    return s.replace(/'/g, "''");
  }

  const sql: string[] = [];
  sql.push(`-- Auto-generated: content_translations for locale '${locale}'`);
  sql.push(`-- App: ${APP_ID}`);
  sql.push(`-- Generated: ${new Date().toISOString()}`);
  sql.push("");

  for (const story of stories) {
    const en = enStories.find((s) => s.id === story.id);
    if (!en) continue;
    const dbId = storyDbId(story.id);

    if (story.title !== en.title) {
      sql.push(
        `INSERT OR REPLACE INTO content_translations (app_id, entity_type, entity_id, locale, field, value) VALUES ('${APP_ID}', 'story', '${dbId}', '${locale}', 'title', '${esc(story.title)}');`
      );
    }
    if (story.description !== en.description) {
      sql.push(
        `INSERT OR REPLACE INTO content_translations (app_id, entity_type, entity_id, locale, field, value) VALUES ('${APP_ID}', 'story', '${dbId}', '${locale}', 'description', '${esc(story.description)}');`
      );
    }
  }

  if (existsSync(charCatalogPath)) {
    const chars: CharacterEntry[] = JSON.parse(readFileSync(charCatalogPath, "utf8"));
    const enChars: CharacterEntry[] = JSON.parse(
      readFileSync(join(CONTENT_DIR, "character-catalog.json"), "utf8")
    );

    sql.push("");
    sql.push("-- Characters");
    for (const ch of chars) {
      const en = enChars.find((c) => c.id === ch.id);
      if (!en) continue;
      const dbId = `ch-${ch.id}`;

      if (ch.name !== en.name) {
        sql.push(
          `INSERT OR REPLACE INTO content_translations (app_id, entity_type, entity_id, locale, field, value) VALUES ('${APP_ID}', 'character', '${dbId}', '${locale}', 'name', '${esc(ch.name)}');`
        );
      }
      if (ch.subtitle !== en.subtitle) {
        sql.push(
          `INSERT OR REPLACE INTO content_translations (app_id, entity_type, entity_id, locale, field, value) VALUES ('${APP_ID}', 'character', '${dbId}', '${locale}', 'description', '${esc(ch.subtitle)}');`
        );
      }
    }
  }

  const outputPath = join(ROOT, "scripts", `db-translations-${locale}.sql`);
  writeFileSync(outputPath, sql.join("\n"), "utf8");
  console.log(`Wrote ${outputPath} (${sql.length} lines)`);
}

async function translateTranscript(storyId: string, locale: string): Promise<void> {
  const langName = LOCALE_NAMES[locale] ?? locale;
  const storyDir = join(CONTENT_DIR, "stories", storyId);
  const transcriptPath = join(storyDir, "transcript.md");

  if (!existsSync(transcriptPath)) {
    console.error(`  No transcript.md found for ${storyId}`);
    return;
  }

  const outPath = join(storyDir, `transcript.${locale}.md`);
  if (existsSync(outPath)) {
    console.log(`  [transcript.${locale}] Already exists, skipping`);
    return;
  }

  const english = readFileSync(transcriptPath, "utf8");
  console.log(`  [transcript.${locale}] Translating (${english.split(/\s+/).length} words)...`);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a professional translator specializing in Biblical storytelling content. Translate the following Bible story narration script from English to ${langName}.

Rules:
- Preserve ALL markdown formatting exactly (headings, blockquotes, bold, italics, bullet points)
- Keep the casual, Gen-Z, conversational tone — adapt slang and idioms naturally to ${langName}
- Use ${langName === "Spanish" ? "RVR1960" : "standard"} Bible verse translations when Scripture is quoted
- Bible character names should use their standard ${langName} forms
- Keep the same section structure (## The Setup → ## La Preparación, ## The Story → ## La Historia, ## The Takeaway → ## Lo Que Aprendemos)
- Do NOT add or remove content — translate faithfully`,
      },
      { role: "user", content: english },
    ],
    temperature: 0.4,
    max_tokens: 8192,
  });

  const translated = response.choices[0]?.message?.content;
  if (!translated) throw new Error("Empty translation response");

  writeFileSync(outPath, translated, "utf8");
  console.log(`  [transcript.${locale}] Done (${translated.split(/\s+/).length} words)`);
}

async function main() {
  const flags = parseArgs();
  const locale = typeof flags.locale === "string" ? flags.locale : "";
  if (!locale) {
    console.error("Usage:");
    console.error("  npx tsx scripts/translate-content.ts --locale es --step catalog");
    console.error("  npx tsx scripts/translate-content.ts --locale es --step characters");
    console.error("  npx tsx scripts/translate-content.ts --locale es --step db-sql");
    console.error("  npx tsx scripts/translate-content.ts --locale es --step transcript --story <id>");
    console.error("  npx tsx scripts/translate-content.ts --locale es --step transcript --all");
    process.exit(1);
  }

  const step = typeof flags.step === "string" ? flags.step : "all";

  if (step === "catalog" || step === "all") {
    await translateStoryCatalog(locale);
  }

  if (step === "characters" || step === "all") {
    await translateCharacterCatalog(locale);
  }

  if (step === "db-sql" || step === "all") {
    await generateDbTranslationsSQL(locale);
  }

  if (step === "transcript") {
    const catalog: CatalogStory[] = JSON.parse(
      readFileSync(join(CONTENT_DIR, "story-catalog.json"), "utf8")
    );

    if (flags.story && typeof flags.story === "string") {
      await translateTranscript(flags.story, locale);
    } else if (flags.all) {
      let done = 0;
      let failed = 0;
      for (const story of catalog) {
        console.log(`[${done + failed + 1}/${catalog.length}] ${story.title}`);
        try {
          await translateTranscript(story.id, locale);
          done++;
        } catch (err: any) {
          console.error(`  ERROR: ${err.message}`);
          failed++;
        }
      }
      console.log(`\nDone. ${done} translated, ${failed} failed.`);
    } else {
      console.error("--step transcript requires --story <id> or --all");
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
