import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import OpenAI from "openai";
import Replicate from "replicate";
import { contentAppDir } from "./lib/content-dir.js";

const R2_BUCKET = "spill-media";
const R2_APP_PREFIX = process.env.R2_APP_PREFIX?.trim() || "bible-tea";
let UPLOAD_ENABLED = true;

function uploadToR2(localPath: string, r2Key: string, contentType: string): void {
  if (!UPLOAD_ENABLED) return;
  try {
    execSync(
      `npx wrangler r2 object put "${R2_BUCKET}/${R2_APP_PREFIX}/${r2Key}" --file="${localPath}" --content-type="${contentType}" --remote`,
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    console.log(`  [r2] Uploaded ${r2Key}`);
  } catch (err: any) {
    console.warn(`  [r2] Upload FAILED for ${r2Key}: ${err?.message?.slice(0, 200) ?? err}`);
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+.*$/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function prepareForSpeech(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inBlockquote = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#\s+/.test(trimmed)) {
      out.push(trimmed.replace(/^#\s+/, ""));
      out.push('<break time="1.0s"/>');
      continue;
    }
    if (/^\*[^*]+\*$/.test(trimmed) && out.length < 3) {
      out.push(trimmed.replace(/\*/g, ""));
      out.push('<break time="0.8s"/>');
      continue;
    }
    if (/^##\s+/.test(trimmed)) {
      out.push('<break time="1.2s"/>');
      out.push(trimmed.replace(/^##\s+/, ""));
      out.push('<break time="0.8s"/>');
      continue;
    }
    if (/^>\s?/.test(trimmed)) {
      if (!inBlockquote) {
        out.push('<break time="0.8s"/>');
        inBlockquote = true;
      }
      const content = trimmed
        .replace(/^>\s?/, "")
        .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1");
      if (content) out.push(content);
      continue;
    }
    if (inBlockquote && !trimmed.startsWith(">")) {
      inBlockquote = false;
      out.push('<break time="0.6s"/>');
    }
    if (!trimmed) {
      out.push('<break time="0.3s"/>');
      continue;
    }
    const cleaned = trimmed.replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1");
    out.push(cleaned);
  }

  return out
    .join("\n")
    .replace(/(<break[^/]*\/>)\s*(<break[^/]*\/>)/g, "$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const ROOT = join(__dirname, "..");
const CONTENT_DIR = contentAppDir(ROOT);
const CATALOG_PATH = join(CONTENT_DIR, "story-catalog.json");

interface Story {
  id: string;
  title: string;
  description: string;
  section: string;
  bibleRef: string;
  inSeed: boolean;
  seedId: string | null;
}

const SPEAKERS = {
  grace: {
    voiceId: "cgSgspJ2msm6clMCkdW9",
    label: "Grace — warm & casual (Jessica)",
    voiceSettings: { stability: 0.45, similarity_boost: 0.75, style: 0.35 },
  },
  elijah: {
    voiceId: "TxGEqnHWrfWFTfGW9XjX",
    label: "Elijah — deep & steady (Josh)",
    voiceSettings: { stability: 0.45, similarity_boost: 0.75, style: 0.3 },
  },
  maya: {
    voiceId: "pFZP5JQG7iQjIQuC4Bku",
    label: "Maya — dramatic & expressive (Lily)",
    voiceSettings: { stability: 0.3, similarity_boost: 0.7, style: 0.65 },
  },
} as const;

const DEFAULT_SPEAKER: keyof typeof SPEAKERS = "grace";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// ---------------------------------------------------------------------------
// Prompt kits — keyed by CONTENT_APP_ID so each Tea product can have its own
// storytelling voice without forking generate.ts.
// ---------------------------------------------------------------------------

const APP_ID = (process.env.CONTENT_APP_ID?.trim() || "bible-tea").toLowerCase();

interface PromptKit {
  appLabel: string;        // human label for the app (e.g. "Bible Tea")
  domainLabel: string;     // singular domain noun ("Bible story", "history story")
  refLabel: string;        // label for the bibleRef field ("Bible Reference", "Date / Period")
  audienceContext: string; // sentence describing audience priors
  accuracyRule: string;    // bullet about source-material accuracy
  quoteRule: string;       // bullet describing what blockquotes contain
  quoteExample: string;    // an in-system example of a good blockquote
  subtitleRule: string;    // rule describing the subtitle line under the title
  imageContext: string;    // domain hint for the image-prompt model
}

const PROMPT_KITS: Record<string, PromptKit> = {
  "bible-tea": {
    appLabel: "Bible Tea",
    domainLabel: "Bible story",
    refLabel: "Bible Reference",
    audienceContext: "someone with zero Bible knowledge",
    accuracyRule:
      "Accurate to Scripture (cite the actual biblical text and events faithfully)",
    quoteRule:
      "Use markdown blockquotes (> ) for all direct speech and Scripture quotes. These render as styled quote cards in the app.",
    quoteExample: `> *"Is it because there's no God in Israel that you are going off to consult Baal-Zebub, the god of Ekron?*
>
> *You won't leave the bed you're lying on. You'll certainly die."*`,
    subtitleRule: "Add a subtitle line in italics with the Bible reference: *2 Kings 1*",
    imageContext: "Bible story",
  },
  "history-tea": {
    appLabel: "History Tea",
    domainLabel: "history story",
    refLabel: "Date / Period",
    audienceContext: "someone with zero history background",
    accuracyRule:
      "Historically accurate — names, dates, places, and quotes must match the historical record",
    quoteRule:
      "Use markdown blockquotes (> ) for direct speech, famous lines, primary-source quotes, or vivid attributed sayings. These render as styled quote cards in the app.",
    quoteExample: `> *"I came, I saw, I conquered."*
>
> *— Julius Caesar, on his lightning victory at Zela, 47 BCE*`,
    subtitleRule:
      "Add a subtitle line in italics with the date or period: *44 BCE — Rome* or *June 6, 1944 — Normandy*",
    imageContext: "history story",
  },
};

const KIT: PromptKit = PROMPT_KITS[APP_ID] ?? PROMPT_KITS["bible-tea"];

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Transcript generation (OpenAI GPT-4o)
// ---------------------------------------------------------------------------

async function generateTranscript(story: Story): Promise<string> {
  const systemPrompt = `You are a world-class storyteller for the app "${KIT.appLabel}." Your audience is Gen-Z and young millennials. Your job is to write narration scripts that are:

- ${KIT.accuracyRule}
- Conversational and engaging — like a best friend telling you the story over coffee
- Use modern language, casual tone, occasional humor, but NEVER disrespectful to the source material
- Include vivid scene-setting and emotional beats
- About 800-1200 words (roughly 4-6 minutes when read aloud)

The script MUST have three clearly separated sections:

## The Setup
A BRIEF historical/background setup — 2-3 SHORT paragraphs, each 1-2 sentences max (same punchy style as The Story). Just enough context so ${KIT.audienceContext} can follow. Who are we dealing with, what's the situation. Keep it tight — this is a quick "previously on..." not an essay.

## The Story
The main narrative — this is 70-80% of the entire script. Rules:
- Keep narration paragraphs SHORT — 1-2 sentences max. Punchy, fast-paced.
- ${KIT.quoteRule}
- CRITICAL: Quotes must be FULL, DRAMATIC, MULTI-SENTENCE passages — not tiny one-liners. Render them with their full emotional weight. Example of a GOOD quote:

${KIT.quoteExample}

- Use italics (*text*) inside blockquotes for the spoken words.
- A story should have 4-8 substantial blockquoted passages. They are the dramatic heartbeat of the script.
- Between quotes, use casual modern narration. Slang is fine. ("He claps back", "the audacity", "be for real")
- Build tension. Use cliffhanger-style pacing between paragraphs.

## The Takeaway
3-5 bullet points (using - ). Each bullet is ONE short punchy sentence — a clear, practical takeaway a Gen-Z reader can instantly get. No fluff, no elaboration, no mini-paragraphs. Think tweet-length per bullet.

Additional formatting rules:
- Start with a level-1 heading: # Title
- ${KIT.subtitleRule}
- Use ## for section headings (The Setup, The Story, The Takeaway)
- Do NOT use bullet points or numbered lists inside The Setup or The Story — only The Takeaway uses bullets`;

  const userPrompt = `Write a narration script for this ${KIT.domainLabel}:

Title: ${story.title}
${KIT.refLabel}: ${story.bibleRef}
Brief Description: ${story.description}
Section: ${story.section}

CRITICAL: The script MUST be 800-1200 words. MUST include all three sections: ## The Setup, ## The Story, ## The Takeaway. Do NOT stop early. The Story section alone should be 600-900 words.`;

  const generate = async (attempt: number): Promise<string> => {
    console.log(`  [transcript] Calling GPT-4o${attempt > 1 ? ` (attempt ${attempt})` : ""}...`);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8 + (attempt - 1) * 0.05,
      max_tokens: 4096,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No transcript generated");

    const wordCount = text.split(/\s+/).length;
    const hasTakeaway = text.includes("## The Takeaway");
    const tokens = response.usage;
    console.log(
      `  [transcript] Got ${wordCount} words, ${tokens?.total_tokens || "?"} tokens, takeaway: ${hasTakeaway}`
    );

    if ((!hasTakeaway || wordCount < 500) && attempt < 3) {
      console.log(`  [transcript] Too short or missing Takeaway, retrying...`);
      return generate(attempt + 1);
    }

    return text;
  };

  return generate(1);
}

// ---------------------------------------------------------------------------
// Cover image generation (Replicate Flux)
// ---------------------------------------------------------------------------

async function buildImagePrompt(story: Story, mode: "default" | "safe"): Promise<string> {
  const systemDefault = `You write image prompts for a ${KIT.imageContext} app. Output ONLY the prompt, nothing else.

Rules:
- Style: classical oil painting, rich warm tones, dramatic lighting, Renaissance master quality, painterly brushstrokes
- Focus on the single most VISUALLY ICONIC moment of the story
- Describe the scene in vivid detail: environment, lighting, colors, atmosphere, scale
- Only include human figures if they are central to the iconic moment. For cosmic/nature events or wide-shot disasters (eruptions, floods, battles seen from afar) — favor the spectacle over close-up portraits
- NEVER include text, letters, words, borders, or watermarks
- Keep it under 80 words`;

  // Safe mode is used when the default prompt gets refused (modern wars, atrocities,
  // assassinations, political figures). It steers Flux toward symbolic / architectural /
  // landscape compositions with no recognizable real people, no violence, no blood,
  // no weapons in use, no overt political or religious symbols depicted with hostility.
  const systemSafe = `You write image prompts for a ${KIT.imageContext} app. Output ONLY the prompt, nothing else.

The story may involve sensitive modern subject matter (war, conflict, political crises, assassinations, atrocities). You MUST avoid graphic, violent, or named-person depictions. Instead pick a SYMBOLIC, ARCHITECTURAL, or LANDSCAPE composition that evokes the era and mood without showing any of the following:
- No recognizable real living or modern political figures
- No blood, corpses, wounds, or active violence
- No weapons being fired or used in attack
- No swastikas, terror imagery, or burning buildings
- No graphic suffering or distress

Good visual choices:
- Empty iconic locations (Berlin Wall section at sunset, abandoned Cuban beach with a single flag, empty Dallas plaza, empty Capitol steps)
- Period objects and machinery (vintage radios, missiles in a museum-style setup, tanks silhouetted on a hill at dawn, oil rigs on horizon)
- Memorials, monuments, or museum-style still lifes
- Wide-angle landscapes, skies, ruins, or atmospheric weather
- Symbolic compositions: a single chair, a flag at half-mast, a candle, footprints in snow

Style: classical oil painting, rich tones, dramatic but tasteful lighting, painterly brushstrokes, somber dignity. NEVER include text, letters, words, borders, or watermarks. Keep it under 80 words.`;

  const promptResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: mode === "safe" ? systemSafe : systemDefault },
      {
        role: "user",
        content: `${KIT.domainLabel.replace(/^./, (c) => c.toUpperCase())}: "${story.title}" (${story.bibleRef})\nDescription: ${story.description}\n\nWrite the image prompt:`,
      },
    ],
    temperature: mode === "safe" ? 0.6 : 0.7,
    max_tokens: 180,
  });
  return promptResponse.choices[0]?.message?.content?.trim() ?? "";
}

function isContentSafetyError(err: any): boolean {
  const msg = (err?.message || "").toLowerCase();
  return (
    msg.includes("nsfw") ||
    msg.includes("content policy") ||
    msg.includes("flagged") ||
    msg.includes("e005") ||
    msg.includes("safety") ||
    msg.includes("sensitive")
  );
}

async function tryFluxOnce(prompt: string): Promise<string> {
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
        console.log(`  [image] Rate limited, waiting ${wait}s...`);
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
  return imageUrl;
}

async function generateCoverImage(story: Story): Promise<Buffer> {
  let imageUrl: string | null = null;

  console.log(`  [image] Generating scene-specific prompt via GPT...`);
  const defaultPrompt = await buildImagePrompt(story, "default");
  console.log(`  [image] Prompt: ${defaultPrompt}`);

  console.log(`  [image] Calling Flux via Replicate...`);
  try {
    imageUrl = await tryFluxOnce(defaultPrompt);
  } catch (err: any) {
    if (isContentSafetyError(err)) {
      console.log(`  [image] Flux refused (safety) — retrying with SAFE symbolic prompt...`);
      const safePrompt = await buildImagePrompt(story, "safe");
      console.log(`  [image] Safe prompt: ${safePrompt}`);
      try {
        imageUrl = await tryFluxOnce(safePrompt);
      } catch (err2: any) {
        if (isContentSafetyError(err2)) {
          console.log(`  [image] Flux refused safe prompt — retrying with ULTRA-SAFE landscape...`);
          const ultraSafe = `Classical oil painting, wide atmospheric landscape evoking the period of "${story.title}" (${story.bibleRef}). A symbolic, peaceful scene: distant horizon, dramatic sky, soft golden or cool dusk lighting, painterly brushstrokes, muted dignified palette. No people, no text, no flags, no weapons, no buildings on fire. Renaissance master quality, contemplative mood.`;
          imageUrl = await tryFluxOnce(ultraSafe);
        } else {
          throw err2;
        }
      }
    } else {
      throw err;
    }
  }

  console.log(`  [image] Downloading...`);
  const response = await fetch(imageUrl!);
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  console.log(`  [image] Done — ${(buffer.length / 1024).toFixed(0)} KB`);
  return buffer;
}

// ---------------------------------------------------------------------------
// Narration generation (ElevenLabs TTS)
// ---------------------------------------------------------------------------

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;

async function generateNarration(
  transcript: string,
  speakerKey: keyof typeof SPEAKERS
): Promise<Buffer> {
  const speaker = SPEAKERS[speakerKey];
  console.log(`  [narration] Generating ${speaker.label}...`);

  const speechText = prepareForSpeech(transcript);

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

  const buffer = Buffer.from(await response.arrayBuffer());
  console.log(
    `  [narration] ${speakerKey} done — ${(buffer.length / 1024).toFixed(0)} KB`
  );
  return buffer;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

async function processStory(story: Story, step?: string) {
  const storyDir = join(CONTENT_DIR, "stories", story.id);
  mkdirSync(storyDir, { recursive: true });

  const metadataPath = join(storyDir, "metadata.json");
  let metadata: Record<string, any> = existsSync(metadataPath)
    ? JSON.parse(readFileSync(metadataPath, "utf8"))
    : {};

  const shouldRun = (s: string) => !step || step === s;

  // Step 1: Transcript
  if (shouldRun("transcript")) {
    const transcriptPath = join(storyDir, "transcript.md");
    if (existsSync(transcriptPath) && !step) {
      console.log(`  [transcript] Already exists, skipping (use --step transcript to regenerate)`);
    } else {
      const transcript = await generateTranscript(story);
      writeFileSync(transcriptPath, transcript, "utf8");
      metadata.transcript = {
        model: "gpt-4o",
        generatedAt: new Date().toISOString(),
        wordCount: transcript.split(/\s+/).length,
      };
      uploadToR2(transcriptPath, `stories/${story.id}/transcript.md`, "text/markdown");
    }
  }

  // Step 2: Cover image
  if (shouldRun("image")) {
    const imagePath = join(storyDir, "cover.webp");
    if (existsSync(imagePath) && !step) {
      console.log(`  [image] Already exists, skipping (use --step image to regenerate)`);
    } else {
      const imageBuffer = await generateCoverImage(story);
      writeFileSync(imagePath, imageBuffer);
      metadata.coverImage = {
        model: "flux-1.1-pro",
        generatedAt: new Date().toISOString(),
        sizeKB: Math.round(imageBuffer.length / 1024),
      };
      uploadToR2(imagePath, `stories/${story.id}/cover.webp`, "image/webp");
    }
  }

  // Step 3: Narration (grace + elijah by default)
  if (shouldRun("narration")) {
    const transcriptPath = join(storyDir, "transcript.md");
    if (!existsSync(transcriptPath)) {
      console.log(`  [narration] No transcript found — generate transcript first`);
    } else {
      const rawTranscript = readFileSync(transcriptPath, "utf8");
      const voiceKeys: (keyof typeof SPEAKERS)[] = ["grace", "elijah"];
      for (const key of voiceKeys) {
        const speaker = SPEAKERS[key];
        const narrationPath = join(storyDir, `narration-${key}.mp3`);
        if (existsSync(narrationPath) && !step) {
          console.log(`  [narration] ${key} already exists, skipping`);
        } else {
          const buffer = await generateNarration(rawTranscript, key);
          writeFileSync(narrationPath, buffer);
          metadata[`narration_${key}`] = {
            model: "eleven_multilingual_v2",
            voiceId: speaker.voiceId,
            generatedAt: new Date().toISOString(),
            sizeKB: Math.round(buffer.length / 1024),
          };
          uploadToR2(narrationPath, `stories/${story.id}/narration-${key}.mp3`, "audio/mpeg");
        }
      }
    }
  }

  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf8");
  console.log(`  [metadata] Saved to ${metadataPath}`);
}

async function main() {
  const flags = parseArgs();
  if (flags["no-upload"]) UPLOAD_ENABLED = false;
  const catalog: Story[] = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));

  let stories: Story[];

  if (flags.story) {
    const story = catalog.find((s) => s.id === flags.story);
    if (!story) {
      console.error(`Story "${flags.story}" not found in catalog.`);
      console.error(
        `Available IDs: ${catalog.slice(0, 10).map((s) => s.id).join(", ")}...`
      );
      process.exit(1);
    }
    stories = [story];
  } else if (flags.all) {
    stories = flags["seed-only"]
      ? catalog.filter((s) => s.inSeed)
      : catalog;
  } else {
    console.error("Usage:");
    console.error(
      "  npx tsx scripts/generate.ts --story <id>              # single story"
    );
    console.error(
      "  npx tsx scripts/generate.ts --story <id> --step <step> # single step (transcript|image|narration)"
    );
    console.error(
      "  npx tsx scripts/generate.ts --all                      # all stories"
    );
    console.error(
      "  npx tsx scripts/generate.ts --all --seed-only          # only seed stories"
    );
    process.exit(1);
  }

  const step = typeof flags.step === "string" ? flags.step : undefined;

  console.log(
    `\nGenerating content for ${stories.length} stor${stories.length === 1 ? "y" : "ies"}${step ? ` (step: ${step})` : ""}...\n`
  );

  let completed = 0;
  let failed = 0;

  for (const story of stories) {
    console.log(
      `[${completed + failed + 1}/${stories.length}] ${story.title} (${story.bibleRef})`
    );
    try {
      await processStory(story, step);
      completed++;
    } catch (err: any) {
      console.error(`  ERROR: ${err.message}`);
      failed++;
    }
    console.log();
  }

  console.log(`Done. ${completed} completed, ${failed} failed.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
