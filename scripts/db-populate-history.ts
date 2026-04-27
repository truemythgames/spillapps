import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APP_ID = "history-tea";
const CONTENT_DIR = join(ROOT, "apps", APP_ID, "content");
const CATALOG_PATH = join(CONTENT_DIR, "story-catalog.json");
const OUT_PATH = join(__dirname, "db-populate-history.sql");

interface CatalogStory {
  id: string;
  title: string;
  description: string;
  section: string;
  bibleRef: string;
  inSeed: boolean;
  seedId: string | null;
}

const catalog: CatalogStory[] = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function storyDbId(catalogId: string, seedId: string | null): string {
  return seedId ?? `st-${catalogId}`;
}

// ---------------------------------------------------------------------------
// Section → testament mapping. The DB schema constrains testament to
// 'old' | 'new' (a Bible-Tea legacy). We repurpose:
//   old = Antiquity through Renaissance (~pre-1500)
//   new = Age of Exploration onwards (modern)
// ---------------------------------------------------------------------------

const OLD_SECTIONS = new Set([
  "Ancient Mesopotamia",
  "Ancient Egypt",
  "Ancient Greece",
  "Roman Republic",
  "Roman Empire",
  "Byzantine Empire",
  "Islamic World",
  "Medieval Europe",
  "Medieval Asia",
  "Renaissance & Reformation",
]);

function testamentFor(section: string): "old" | "new" {
  return OLD_SECTIONS.has(section) ? "old" : "new";
}

// ---------------------------------------------------------------------------
// Build seasons in catalog order (preserves the curated chronology).
// ---------------------------------------------------------------------------

interface Season {
  id: string;
  name: string;
  slug: string;
  testament: "old" | "new";
  description: string;
  sortOrder: number;
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  "Ancient Mesopotamia":
    "Where civilization begins. Cities, codes, and the first writing — humanity figures out how to be human.",
  "Ancient Egypt":
    "Pharaohs, pyramids, and gods on the Nile. Three thousand years of obsession with the afterlife.",
  "Ancient Greece":
    "Philosophy, democracy, war, and tragedy. The blueprint for everything we still argue about today.",
  "Roman Republic":
    "Backstabs, consuls, and the rise of an empire. Politics has never been more dramatic.",
  "Roman Empire":
    "Caesars, gladiators, conquest, and a slow-motion collapse that took centuries.",
  "Byzantine Empire":
    "Rome's eastern half outlived the west by a thousand years. Intrigue, icons, and impossible sieges.",
  "Islamic World":
    "Caliphs, scholars, and a golden age of science when Europe was in the dark.",
  "Medieval Europe":
    "Knights, plagues, cathedrals, crusades. The thousand years that shaped the modern map.",
  "Medieval Asia":
    "Mongols, dynasties, and silk-road empires. The other half of the medieval world, often forgotten.",
  "Renaissance & Reformation":
    "Art, science, and a religious earthquake. Europe wakes up — and splits in two.",
  "Age of Exploration":
    "Ships, gold, and uncharted oceans. The world gets bigger, and a lot more violent.",
  "17th Century":
    "Wars of religion, scientific revolution, and the first global economy.",
  "Enlightenment & Revolutions":
    "Reason, rights, and revolutions. The era that invented modern politics.",
  "Napoleonic Era":
    "One man tries to rewrite Europe. Spoiler: it doesn't end well.",
  "19th Century":
    "Steam, steel, and empires racing for the future. The world we live in starts here.",
  "American Civil War":
    "Brother against brother. The bloodiest chapter in American history.",
  "Imperialism & Late 1800s":
    "Colonies, conquests, and the carve-up of continents. The dark side of progress.",
  "World War I":
    "The war that ended an era. Trenches, gas, and the death of empires.",
  "Interwar Era":
    "Jazz, depression, and the slow-motion road to World War II.",
  "World War II":
    "The deadliest conflict in human history. Heroes, villains, and impossible choices.",
  "Cold War":
    "Decades of nuclear standoff, proxy wars, and a divided world. The peace that wasn't.",
  "Modern Era":
    "From 9/11 to the digital age. The history that's still being written.",
};

const seasonsByName = new Map<string, Season>();
let seasonOrder = 10;
for (const story of catalog) {
  if (seasonsByName.has(story.section)) continue;
  const slug = slugify(story.section);
  seasonsByName.set(story.section, {
    id: `s-ht-${slug}`,
    name: story.section,
    slug: `ht-${slug}`,
    testament: testamentFor(story.section),
    description: SECTION_DESCRIPTIONS[story.section] ?? "",
    sortOrder: seasonOrder,
  });
  seasonOrder += 10;
}

// ---------------------------------------------------------------------------
// Emit SQL.
// ---------------------------------------------------------------------------

const sql: string[] = [];
sql.push("-- ============================================");
sql.push(`-- Auto-generated by scripts/db-populate-history.ts`);
sql.push(`-- App: ${APP_ID}`);
sql.push(`-- Stories: ${catalog.length}, Seasons: ${seasonsByName.size}`);
sql.push("-- ============================================");
sql.push("");

sql.push("-- ── SEASONS ──");
for (const s of seasonsByName.values()) {
  sql.push(
    `INSERT OR IGNORE INTO seasons (id, app_id, testament, name, slug, description, sort_order) VALUES ('${s.id}', '${APP_ID}', '${s.testament}', '${esc(s.name)}', '${s.slug}', '${esc(s.description)}', ${s.sortOrder});`
  );
}
sql.push("");

sql.push("-- ── STORIES ──");
sql.push("-- All stories are published & free in the catalog (paywall is enforced by RC entitlement).");
let storyOrder = 100;
for (const story of catalog) {
  const season = seasonsByName.get(story.section);
  if (!season) continue;
  const dbId = storyDbId(story.id, story.seedId);
  const coverKey = `stories/${story.id}/cover.webp`;
  sql.push(
    `INSERT OR IGNORE INTO stories (id, app_id, season_id, title, slug, description, cover_image_key, sort_order, is_free, is_published) VALUES ('${dbId}', '${APP_ID}', '${season.id}', '${esc(story.title)}', '${esc(story.id)}', '${esc(story.description)}', '${coverKey}', ${storyOrder}, 1, 1);`
  );
  storyOrder += 1;
}
sql.push("");

sql.push("-- ── SPEAKERS ──");
sql.push("-- Two narrators that match scripts/generate.ts SPEAKERS.");
sql.push(
  `INSERT OR IGNORE INTO speakers (id, app_id, name, bio, voice_style, is_default) VALUES ('sp-ht-grace', '${APP_ID}', 'Grace', 'Warm, conversational narrator.', 'warm', 1);`
);
sql.push(
  `INSERT OR IGNORE INTO speakers (id, app_id, name, bio, voice_style, is_default) VALUES ('sp-ht-elijah', '${APP_ID}', 'Elijah', 'Deep, steady narrator.', 'steady', 0);`
);
sql.push("");

sql.push("-- ── STORY AUDIO ──");
sql.push("-- One row per (story, speaker). audio_key is app-scoped by mediaUrl() at read time.");
const SPEAKER_IDS = { grace: "sp-ht-grace", elijah: "sp-ht-elijah" } as const;
let audioCount = 0;
for (const story of catalog) {
  const dbStoryId = storyDbId(story.id, story.seedId);
  for (const [voice, speakerId] of Object.entries(SPEAKER_IDS)) {
    const audioId = `sa-ht-${story.id}-${voice}`;
    const audioKey = `stories/${story.id}/narration-${voice}.mp3`;
    sql.push(
      `INSERT OR IGNORE INTO story_audio (id, story_id, speaker_id, audio_key, duration_seconds) VALUES ('${audioId}', '${dbStoryId}', '${speakerId}', '${audioKey}', 0);`
    );
    audioCount++;
  }
}
sql.push("");

writeFileSync(OUT_PATH, sql.join("\n"), "utf8");
console.log(`Generated ${OUT_PATH}`);
console.log(`  Seasons: ${seasonsByName.size}`);
console.log(`  Stories: ${catalog.length}`);
console.log(`  Speakers: 2`);
console.log(`  Story audio rows: ${audioCount}`);
