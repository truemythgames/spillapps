import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Replicate from "replicate";
import { contentAppDir } from "./lib/content-dir.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = contentAppDir(ROOT);
const CATALOG_PATH = join(CONTENT_DIR, "character-catalog.json");

interface Character {
  id: string;
  name: string;
  subtitle: string;
  imagePrompt: string;
  storyIds: string[];
}

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

async function generatePortrait(prompt: string): Promise<Buffer> {
  let output: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      output = await replicate.run("black-forest-labs/flux-1.1-pro", {
        input: {
          prompt,
          width: 1024,
          height: 1024,
          num_inference_steps: 25,
          output_format: "webp",
          output_quality: 90,
        },
      });
      break;
    } catch (err: any) {
      if (err?.message?.includes("429") && attempt < 4) {
        const wait = 10 * (attempt + 1);
        console.log(`  Rate limited, waiting ${wait}s...`);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      throw err;
    }
  }

  const imageUrl = String(output);
  if (!imageUrl.startsWith("http")) {
    throw new Error(`Unexpected Flux output: ${imageUrl.substring(0, 100)}`);
  }

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const catalog: Character[] = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));

  const targetId = process.argv[2];
  const chars = targetId
    ? catalog.filter((c) => c.id === targetId)
    : catalog;

  if (targetId && chars.length === 0) {
    console.error(`Character "${targetId}" not found. Available: ${catalog.map((c) => c.id).join(", ")}`);
    process.exit(1);
  }

  const charDir = join(CONTENT_DIR, "characters");
  mkdirSync(charDir, { recursive: true });

  console.log(`\nGenerating portraits for ${chars.length} character(s)...\n`);

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  for (const char of chars) {
    const outPath = join(charDir, `${char.id}.webp`);

    if (existsSync(outPath) && !targetId) {
      console.log(`[${char.name}] Already exists, skipping (pass "${char.id}" as arg to regenerate)`);
      skipped++;
      continue;
    }

    console.log(`[${char.name}] Generating portrait...`);
    console.log(`  Prompt: ${char.imagePrompt.substring(0, 80)}...`);

    try {
      const buffer = await generatePortrait(char.imagePrompt);
      writeFileSync(outPath, buffer);
      console.log(`  Done — ${(buffer.length / 1024).toFixed(0)} KB\n`);
      completed++;
    } catch (err: any) {
      console.error(`  ERROR: ${err.message}\n`);
      failed++;
    }
  }

  console.log(`\nDone. ${completed} generated, ${skipped} skipped, ${failed} failed.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
