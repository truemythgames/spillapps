/**
 * One-shot: upload history-tea character portraits to R2 and emit SQL to
 * populate `characters` + `character_stories` for app_id = 'history-tea'.
 *
 * Usage:
 *   npx tsx scripts/sync-history-characters.ts            # upload + write sql
 *   npx tsx scripts/sync-history-characters.ts --skip-r2  # only emit sql
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

function tokens(s: string): Set<string> {
  return new Set(
    s
      .replace(/^st-/, "")
      .split(/[-_]+/)
      .filter((t) => t.length > 2 && !["the", "and", "of"].includes(t)),
  );
}

function resolveStoryId(raw: string, valid: Set<string> | null): string | null {
  if (!valid) return raw;
  if (valid.has(raw)) return raw;
  const withPrefix = `st-${raw}`;
  if (valid.has(withPrefix)) return withPrefix;
  const viaCatalog = CATALOG_TO_SEED.get(raw);
  if (viaCatalog && valid.has(viaCatalog)) return viaCatalog;
  const want = tokens(raw);
  if (!want.size) return null;
  let best: string | null = null;
  let bestScore = 0;
  for (const id of valid) {
    const have = tokens(id);
    let inter = 0;
    for (const t of want) if (have.has(t)) inter++;
    const score = inter / Math.max(want.size, have.size);
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return bestScore >= 0.5 ? best : null;
}

function loadValidStoryIds(): Set<string> | null {
  try {
    const raw = readFileSync("/tmp/ht-story-ids.json", "utf8");
    return new Set(JSON.parse(raw));
  } catch {
    return null;
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APP_ID = "history-tea";
const CONTENT_DIR = join(ROOT, "apps", APP_ID, "content");
const PORTRAIT_DIR = join(CONTENT_DIR, "characters");
const CATALOG = JSON.parse(
  readFileSync(join(CONTENT_DIR, "character-catalog.json"), "utf8"),
) as Array<{
  id: string;
  name: string;
  subtitle?: string;
  overview: string;
  storyIds: string[];
}>;

type StoryCatalogEntry = { id: string; title: string; seedId?: string | null };
const STORY_CATALOG = JSON.parse(
  readFileSync(join(CONTENT_DIR, "story-catalog.json"), "utf8"),
) as StoryCatalogEntry[];

// Map every catalog-id AND title-slug -> authoritative seedId (if present)
const CATALOG_TO_SEED = new Map<string, string>();
for (const s of STORY_CATALOG) {
  if (s.seedId) {
    CATALOG_TO_SEED.set(s.id, s.seedId);
    CATALOG_TO_SEED.set(s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), s.seedId);
  }
}

const R2_BUCKET = "spill-media";
const R2_PREFIX = APP_ID;
const SQL_OUT = join(ROOT, "scripts", "db-history-characters.sql");

const skipR2 = process.argv.includes("--skip-r2");

function sqlEscape(s: string) {
  return s.replace(/'/g, "''");
}

function uploadPortrait(id: string) {
  const local = join(PORTRAIT_DIR, `${id}.webp`);
  if (!existsSync(local)) {
    console.error(`[miss] no portrait for ${id} at ${local}`);
    return false;
  }
  const key = `${R2_PREFIX}/characters/${id}.webp`;
  try {
    execSync(
      `npx wrangler r2 object put "${R2_BUCKET}/${key}" --file="${local}" --content-type="image/webp" --remote`,
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    console.log(`[ok] ${key}`);
    return true;
  } catch (err: any) {
    console.error(`[fail] ${key}: ${err?.message?.slice(0, 200) ?? err}`);
    return false;
  }
}

async function main() {
  if (!skipR2) {
    console.log(`Uploading ${CATALOG.length} portraits to R2 (${R2_PREFIX}/characters/)...`);
    for (const c of CATALOG) uploadPortrait(c.id);
  }

  const validStoryIds = loadValidStoryIds();
  if (validStoryIds) {
    console.log(`Filtering character->story links against ${validStoryIds.size} live story ids`);
  }

  const lines: string[] = [];
  lines.push(`-- history-tea character catalog (auto-generated)`);
  lines.push(`-- Idempotent: removes existing history-tea chars, then re-inserts.`);
  lines.push(``);
  lines.push(
    `DELETE FROM character_stories WHERE character_id IN (SELECT id FROM characters WHERE app_id = '${APP_ID}');`,
  );
  lines.push(`DELETE FROM characters WHERE app_id = '${APP_ID}';`);
  lines.push(``);

  CATALOG.forEach((c, i) => {
    const charId = `ht-${c.id}`;
    const desc = c.subtitle ? `${c.subtitle}. ${c.overview}` : c.overview;
    const cover = `characters/${c.id}.webp`;
    lines.push(
      `INSERT INTO characters (id, name, description, cover_image_key, sort_order, app_id) VALUES ('${charId}', '${sqlEscape(
        c.name,
      )}', '${sqlEscape(desc)}', '${cover}', ${i}, '${APP_ID}');`,
    );
    const links: string[] = [];
    const dropped: string[] = [];
    for (const raw of c.storyIds) {
      const resolved = resolveStoryId(raw, validStoryIds);
      if (resolved) links.push(resolved);
      else dropped.push(raw);
    }
    if (dropped.length) {
      console.warn(`  [skip] ${c.id}: unresolved story ids -> ${dropped.join(", ")}`);
    }
    for (const sid of links) {
      lines.push(
        `INSERT OR IGNORE INTO character_stories (character_id, story_id) VALUES ('${charId}', '${sqlEscape(
          sid,
        )}');`,
      );
    }
  });

  writeFileSync(SQL_OUT, lines.join("\n") + "\n", "utf8");
  console.log(`\nWrote SQL: ${SQL_OUT} (${CATALOG.length} characters)`);
  console.log(`\nApply with:\n  cd apps/api && npx wrangler d1 execute spill-db --remote --file=../../scripts/db-history-characters.sql`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
