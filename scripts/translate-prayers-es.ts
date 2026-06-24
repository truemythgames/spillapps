import "dotenv/config";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const APP_ID = "bible-tea";
const LOCALE = "es";
const API_BASE = "https://api.spillapps.com/v1";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function esc(s: string): string {
  return String(s ?? "").replace(/'/g, "''");
}

async function api(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "x-app-id": APP_ID, "Accept-Language": "en" },
  });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json();
}

interface PrayerRow {
  id: string;
  title: string;
  description: string;
  transcript: string;
}

interface CategoryRow {
  id: string;
  name: string;
  description: string;
}

async function translateCategories(categories: CategoryRow[]): Promise<CategoryRow[]> {
  const prompt = `Translate the following prayer category entries to Spanish.
Only translate "name" and "description". Keep "id" exactly as-is.
Tone: warm, modern, accessible (Gen-Z Christian). Output valid JSON array only, no markdown fences.

${JSON.stringify(categories.map((c) => ({ id: c.id, name: c.name, description: c.description })), null, 2)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a professional translator specializing in Christian devotional content. Output valid JSON only." },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });
  const text = response.choices[0]?.message?.content?.trim() ?? "";
  return JSON.parse(text.replace(/^```json\n?/, "").replace(/\n?```$/, ""));
}

async function translatePrayer(p: PrayerRow): Promise<PrayerRow> {
  const prompt = `Translate this prayer to Spanish. Return a JSON object with keys "id", "title", "description", "transcript".
Keep "id" exactly as-is: "${p.id}".

Rules:
- Preserve ALL markdown formatting exactly (the transcript starts with a "# Heading" line — translate the heading text but keep it as an H1).
- Warm, sincere, prayerful tone. Address God naturally (Señor, Padre, Dios).
- When Scripture is quoted, use the RVR1960 Spanish Bible wording.
- Do NOT add or remove content. Output valid JSON only, no markdown fences.

${JSON.stringify({ id: p.id, title: p.title, description: p.description, transcript: p.transcript }, null, 2)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a professional translator specializing in Christian prayer and devotional content. Output valid JSON only." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 4096,
  });
  const text = response.choices[0]?.message?.content?.trim() ?? "";
  return JSON.parse(text.replace(/^```json\n?/, "").replace(/\n?```$/, ""));
}

async function main() {
  console.log("Fetching English prayer data from API...");
  const { categories } = await api("/prayers/categories");
  const { prayers } = await api("/prayers?limit=300");
  console.log(`  ${categories.length} categories, ${prayers.length} prayers`);

  const sql: string[] = [];
  sql.push(`-- Auto-generated: Spanish (es) translations for prayers & prayer categories`);
  sql.push(`-- App: ${APP_ID}  Generated: ${new Date().toISOString()}`);
  sql.push("");

  console.log("Translating categories...");
  const tCats = await translateCategories(categories);
  const enCatById = new Map<string, CategoryRow>(categories.map((c: CategoryRow) => [c.id, c]));
  sql.push("-- Prayer categories");
  for (const c of tCats) {
    const en = enCatById.get(c.id);
    if (!en) continue;
    if (c.name && c.name !== en.name) {
      sql.push(`INSERT OR REPLACE INTO content_translations (app_id, entity_type, entity_id, locale, field, value) VALUES ('${APP_ID}', 'prayer_category', '${c.id}', '${LOCALE}', 'name', '${esc(c.name)}');`);
    }
    if (c.description && c.description !== en.description) {
      sql.push(`INSERT OR REPLACE INTO content_translations (app_id, entity_type, entity_id, locale, field, value) VALUES ('${APP_ID}', 'prayer_category', '${c.id}', '${LOCALE}', 'description', '${esc(c.description)}');`);
    }
  }
  sql.push("");

  sql.push("-- Prayers");
  let done = 0;
  let failed = 0;
  for (const p of prayers as PrayerRow[]) {
    try {
      const t = await translatePrayer(p);
      if (t.title) sql.push(`INSERT OR REPLACE INTO content_translations (app_id, entity_type, entity_id, locale, field, value) VALUES ('${APP_ID}', 'prayer', '${p.id}', '${LOCALE}', 'title', '${esc(t.title)}');`);
      if (t.description) sql.push(`INSERT OR REPLACE INTO content_translations (app_id, entity_type, entity_id, locale, field, value) VALUES ('${APP_ID}', 'prayer', '${p.id}', '${LOCALE}', 'description', '${esc(t.description)}');`);
      if (t.transcript) sql.push(`INSERT OR REPLACE INTO content_translations (app_id, entity_type, entity_id, locale, field, value) VALUES ('${APP_ID}', 'prayer', '${p.id}', '${LOCALE}', 'transcript', '${esc(t.transcript)}');`);
      done++;
      console.log(`  [${done + failed}/${prayers.length}] ${p.title} -> ${t.title}`);
    } catch (err: any) {
      failed++;
      console.error(`  [${done + failed}/${prayers.length}] FAILED ${p.id}: ${err.message}`);
    }
  }

  const outPath = join(ROOT, "scripts", `prayer-translations-${LOCALE}.sql`);
  writeFileSync(outPath, sql.join("\n") + "\n", "utf8");
  console.log(`\nWrote ${outPath}`);
  console.log(`Done. ${done} prayers translated, ${failed} failed.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
