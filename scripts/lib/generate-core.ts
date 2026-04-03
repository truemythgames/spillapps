import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import OpenAI from "openai";
import Replicate from "replicate";

export interface Story {
  id: string;
  title: string;
  description: string;
  section: string;
  bibleRef: string;
  inSeed: boolean;
  seedId: string | null;
}

export const SPEAKERS = {
  grace: {
    voiceId: "cgSgspJ2msm6clMCkdW9",
    label: "Grace — warm & casual (Jessica)",
    voiceSettings: { stability: 0.45, similarity_boost: 0.75, style: 0.35 },
  },
  maya: {
    voiceId: "pFZP5JQG7iQjIQuC4Bku",
    label: "Maya — dramatic & expressive (Lily)",
    voiceSettings: { stability: 0.3, similarity_boost: 0.7, style: 0.65 },
  },
  jordan: {
    voiceId: "SAz9YHcvj6GT2YYXdXww",
    label: "Jordan — calm & reflective (River)",
    voiceSettings: { stability: 0.55, similarity_boost: 0.8, style: 0.2 },
  },
} as const;

export const DEFAULT_SPEAKER: keyof typeof SPEAKERS = "grace";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;

export const DEFAULT_TRANSCRIPT_SYSTEM_PROMPT = `You are a world-class Bible storyteller for the app "Bible Tea." Your audience is Gen-Z and young millennials. Your job is to write narration scripts that are:

- Accurate to Scripture (cite the actual biblical text and events faithfully)
- Conversational and engaging — like a best friend telling you the story over coffee
- Use modern language, casual tone, occasional humor, but NEVER disrespectful to the source material
- Include vivid scene-setting and emotional beats
- About 800-1200 words (roughly 4-6 minutes when read aloud)

The script MUST have three clearly separated sections:

## The Setup
A BRIEF historical/background setup — 2-3 SHORT paragraphs, each 1-2 sentences max (same punchy style as The Story). Just enough context so someone with zero Bible knowledge can follow. Who are we dealing with, what's the situation. Keep it tight — this is a quick "previously on..." not an essay.

## The Story
The main narrative — this is 70-80% of the entire script. Rules:
- Keep narration paragraphs SHORT — 1-2 sentences max. Punchy, fast-paced.
- Use markdown blockquotes (> ) for all direct speech and Scripture quotes. These render as styled quote cards in the app.
- CRITICAL: Quotes must be FULL, DRAMATIC, MULTI-SENTENCE Scripture passages — not tiny one-liners. Pull actual dialogue from the biblical text and render it in full. Include the emotional weight. Example of a GOOD quote:

> *"Is it because there's no God in Israel that you are going off to consult Baal-Zebub, the god of Ekron?*
>
> *You won't leave the bed you're lying on. You'll certainly die."*

- Use italics (*text*) inside blockquotes for the spoken words.
- A story should have 4-8 substantial blockquoted passages. They are the dramatic heartbeat of the script.
- Between quotes, use casual modern narration. Slang is fine. ("He claps back", "the audacity", "be for real")
- Build tension. Use cliffhanger-style pacing between paragraphs.

## The Takeaway
3-5 bullet points (using - ). Each bullet is ONE short punchy sentence — a clear, practical takeaway a Gen-Z reader can instantly get. No fluff, no elaboration, no mini-paragraphs. Think tweet-length per bullet. Example:
- Your words have power — God literally spoke the world into existence.
- Rest isn't lazy, it's sacred. Even God took a day off.

Additional formatting rules:
- Start with a level-1 heading: # Title
- Add a subtitle line in italics with the Bible reference: *2 Kings 1*
- Use ## for section headings (The Setup, The Story, The Takeaway)
- Do NOT use bullet points or numbered lists inside The Setup or The Story — only The Takeaway uses bullets`;

export function defaultTranscriptUserPrompt(story: Story): string {
  return `Write a narration script for this Bible story:

Title: ${story.title}
Bible Reference: ${story.bibleRef}
Brief Description: ${story.description}
Section: ${story.section}

Remember: ~800-1200 words, three sections (The Setup → The Story → The Takeaway), very short punchy paragraphs, blockquotes for all direct speech/Scripture, conversational Gen-Z tone, biblically accurate.`;
}

export async function generateImagePrompt(story: Story): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You write image prompts for a Bible story app. Output ONLY the prompt, nothing else.

Rules:
- Style: classical oil painting, rich warm tones, dramatic lighting, Renaissance master quality, painterly brushstrokes
- Focus on the single most VISUALLY ICONIC moment of the story
- Describe the scene in vivid detail: environment, lighting, colors, atmosphere, scale
- Only include human figures if they are absolutely central to the iconic moment (e.g. David vs Goliath needs David). For cosmic/nature events like Creation, the Flood, the Burning Bush — NO people, focus on the spectacle
- NEVER include text, letters, words, borders, or watermarks
- Keep it under 80 words`,
      },
      {
        role: "user",
        content: `Bible story: "${story.title}" (${story.bibleRef})\nDescription: ${story.description}\n\nWrite the image prompt:`,
      },
    ],
    temperature: 0.7,
    max_tokens: 150,
  });
  return response.choices[0]?.message?.content?.trim() ?? "";
}

export function defaultImagePrompt(story: Story): string {
  return `Classical oil painting style, biblical scene: ${story.title}. ${story.description}. Rich warm tones, dramatic lighting, Renaissance master painting quality. Painterly brushstrokes, museum-quality fine art. No text, no letters, no words, no borders, no watermarks.`;
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+.*$/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Converts a markdown transcript into speech-optimized text for TTS.
 * Adds pauses between sections, breathing room around quotes,
 * and strips formatting while preserving natural spoken rhythm.
 */
export function prepareForSpeech(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inBlockquote = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip the H1 title — the narration doesn't read the title aloud
    if (/^#\s+/.test(trimmed)) continue;

    // Skip the italic subtitle line (e.g. *Genesis 1-2*)
    if (/^\*[^*]+\*$/.test(trimmed) && out.length < 3) continue;

    // Section headings → long pause instead of reading "The Setup" etc.
    if (/^##\s+/.test(trimmed)) {
      out.push('<break time="1.2s"/>');
      continue;
    }

    // Blockquote lines → dramatic pause before, strip marker, pause after
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

    // Leaving a blockquote → pause after the quote ends
    if (inBlockquote && !trimmed.startsWith(">")) {
      inBlockquote = false;
      out.push('<break time="0.6s"/>');
    }

    // Empty line → small breath pause
    if (!trimmed) {
      out.push('<break time="0.3s"/>');
      continue;
    }

    // Regular paragraph — strip bold/italic markers
    const cleaned = trimmed.replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1");
    out.push(cleaned);
  }

  return out
    .join("\n")
    .replace(/(<break[^/]*\/>)\s*(<break[^/]*\/>)/g, "$2") // collapse consecutive breaks
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function generateTranscript(
  story: Story,
  opts?: { systemPrompt?: string; userPrompt?: string }
): Promise<string> {
  const systemPrompt = opts?.systemPrompt ?? DEFAULT_TRANSCRIPT_SYSTEM_PROMPT;
  const userPrompt = opts?.userPrompt ?? defaultTranscriptUserPrompt(story);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("No transcript generated");
  return text;
}

export async function generateCoverImage(
  story: Story,
  opts?: { prompt?: string }
): Promise<Buffer> {
  const prompt = opts?.prompt ?? await generateImagePrompt(story);

  const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
    input: {
      prompt,
      width: 1024,
      height: 1024,
      num_inference_steps: 25,
      output_format: "webp",
      output_quality: 90,
    },
  });

  const imageUrl = String(output);
  if (!imageUrl.startsWith("http")) {
    throw new Error(`Unexpected Flux output: ${imageUrl.substring(0, 100)}`);
  }

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

export async function generateNarration(
  transcript: string,
  speakerKey: keyof typeof SPEAKERS
): Promise<Buffer> {
  const speaker = SPEAKERS[speakerKey];
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

  return Buffer.from(await response.arrayBuffer());
}

export function storyDir(contentDir: string, storyId: string): string {
  return join(contentDir, "stories", storyId);
}

export function saveContent(
  contentDir: string,
  storyId: string,
  file: string,
  data: Buffer | string
) {
  const dir = storyDir(contentDir, storyId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, file), data);
}

export function updateMetadata(
  contentDir: string,
  storyId: string,
  patch: Record<string, any>
) {
  const dir = storyDir(contentDir, storyId);
  mkdirSync(dir, { recursive: true });
  const metaPath = join(dir, "metadata.json");
  let meta: Record<string, any> = {};
  if (existsSync(metaPath)) {
    meta = JSON.parse(readFileSync(metaPath, "utf8"));
  }
  Object.assign(meta, patch);
  writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf8");
}
