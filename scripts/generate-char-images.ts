import "dotenv/config";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import OpenAI from "openai";
import Replicate from "replicate";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "apps", "bible-tea", "content", "characters");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const characters = [
  { id: "ch-lot", name: "Lot", desc: "Abraham's nephew, fled Sodom" },
  { id: "ch-rebekah", name: "Rebekah", desc: "Isaac's wife, mother of Jacob and Esau" },
  { id: "ch-rachel", name: "Rachel", desc: "Jacob's beloved wife, mother of Joseph" },
  { id: "ch-balaam", name: "Balaam", desc: "Mesopotamian prophet with a talking donkey" },
  { id: "ch-caleb", name: "Caleb", desc: "Faithful Israelite spy, claimed his mountain at 85" },
  { id: "ch-jephthah", name: "Jephthah", desc: "Warrior judge of Israel" },
  { id: "ch-absalom", name: "Absalom", desc: "David's rebellious son with famous long hair" },
  { id: "ch-hezekiah", name: "Hezekiah", desc: "Righteous king of Judah who defied Assyria" },
  { id: "ch-josiah", name: "Josiah", desc: "Boy king who found the lost Book of the Law" },
  { id: "ch-nicodemus", name: "Nicodemus", desc: "Pharisee who visited Jesus at night" },
  { id: "ch-martha", name: "Martha", desc: "Devoted host, sister of Mary and Lazarus" },
  { id: "ch-lazarus", name: "Lazarus", desc: "Man Jesus raised from the dead after 4 days" },
  { id: "ch-zacchaeus", name: "Zacchaeus", desc: "Short, wealthy tax collector who climbed a tree" },
  { id: "ch-judas", name: "Judas Iscariot", desc: "Disciple who betrayed Jesus for 30 silver coins" },
  { id: "ch-pilate", name: "Pontius Pilate", desc: "Roman governor who sentenced Jesus" },
  { id: "ch-stephen", name: "Stephen", desc: "First Christian martyr, stoned for his faith" },
  { id: "ch-barnabas", name: "Barnabas", desc: "The encourager, Paul's missionary partner" },
  { id: "ch-cornelius", name: "Cornelius", desc: "Roman centurion, first Gentile convert" },
  { id: "ch-john-apostle", name: "John the Apostle", desc: "Beloved disciple, author of Revelation" },
];

async function generatePortrait(name: string, desc: string): Promise<Buffer> {
  const promptRes = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You write portrait image prompts for a Bible app. Output ONLY the prompt.
Rules:
- Style: classical oil painting portrait, rich warm tones, dramatic Rembrandt lighting, painterly brushstrokes
- Circular portrait composition — head and shoulders, slight angle
- Character should look authentic to their biblical era and cultural context
- Expressive face capturing their personality
- NEVER include text, letters, words, borders, or watermarks
- Keep under 60 words`,
      },
      {
        role: "user",
        content: `Bible character: "${name}" — ${desc}\n\nWrite the portrait prompt:`,
      },
    ],
    temperature: 0.7,
    max_tokens: 100,
  });

  const prompt = promptRes.choices[0]?.message?.content?.trim() ?? "";
  console.log(`  Prompt: ${prompt}`);

  let output: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      output = await replicate.run("black-forest-labs/flux-1.1-pro", {
        input: {
          prompt,
          width: 512,
          height: 512,
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
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const { mkdirSync } = await import("node:fs");
  mkdirSync(OUT_DIR, { recursive: true });

  const sqlLines: string[] = [];
  let done = 0;

  for (const ch of characters) {
    console.log(`[${done + 1}/${characters.length}] ${ch.name}`);
    try {
      const buf = await generatePortrait(ch.name, ch.desc);
      const filename = ch.id.replace("ch-", "") + ".webp";
      const localPath = join(OUT_DIR, filename);
      writeFileSync(localPath, buf);
      console.log(`  Saved ${(buf.length / 1024).toFixed(0)} KB → ${localPath}`);

      const r2Key = `characters/${filename}`;
      execSync(
        `npx wrangler r2 object put "spill-media/bible-tea/${r2Key}" --file="${localPath}" --content-type="image/webp" --remote`,
        { cwd: ROOT, stdio: "pipe" }
      );
      console.log(`  Uploaded to R2: ${r2Key}`);

      sqlLines.push(
        `UPDATE characters SET cover_image_key = '${r2Key}' WHERE id = '${ch.id}';`
      );
      done++;
    } catch (err: any) {
      console.error(`  ERROR: ${err.message}`);
    }
    console.log();
  }

  if (sqlLines.length > 0) {
    const sqlPath = join(ROOT, "scripts", "db-char-images.sql");
    writeFileSync(sqlPath, sqlLines.join("\n"), "utf8");
    console.log(`SQL written to ${sqlPath}`);
    console.log(`${done}/${characters.length} portraits generated and uploaded.`);
  }
}

main().catch(console.error);
