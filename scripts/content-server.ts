import "dotenv/config";
import express from "express";
import cors from "cors";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  type Story,
  SPEAKERS,
  generateTranscript,
  generateCoverImage,
  generateNarration,
  stripMarkdown,
  saveContent,
  updateMetadata,
  defaultImagePrompt,
  defaultTranscriptUserPrompt,
  DEFAULT_TRANSCRIPT_SYSTEM_PROMPT,
} from "./lib/generate-core.js";
import { contentAppDir, getContentAppId } from "./lib/content-dir.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = contentAppDir(ROOT);
const CATALOG_PATH = join(CONTENT_DIR, "story-catalog.json");

function loadCatalog(): Story[] {
  return JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
}

function findStory(id: string): Story | undefined {
  return loadCatalog().find((s) => s.id === id);
}

const app = express();
app.use(cors());
app.use(express.json());

// Static content (served from apps/<CONTENT_APP_ID>/content/)
app.use(express.static(CONTENT_DIR));

// --- API: Get default prompts for a story ---
app.get("/api/stories/:id/prompts", (req, res) => {
  const story = findStory(req.params.id);
  if (!story) return res.status(404).json({ error: "Story not found" });

  res.json({
    imagePrompt: defaultImagePrompt(story),
    transcriptSystemPrompt: DEFAULT_TRANSCRIPT_SYSTEM_PROMPT,
    transcriptUserPrompt: defaultTranscriptUserPrompt(story),
  });
});

// --- API: Regenerate transcript ---
app.post("/api/stories/:id/regenerate/transcript", async (req, res) => {
  const story = findStory(req.params.id);
  if (!story) return res.status(404).json({ error: "Story not found" });

  try {
    const { systemPrompt, userPrompt } = req.body || {};
    const transcript = await generateTranscript(story, {
      systemPrompt: systemPrompt || undefined,
      userPrompt: userPrompt || undefined,
    });

    saveContent(CONTENT_DIR, story.id, "transcript.md", transcript);
    updateMetadata(CONTENT_DIR, story.id, {
      transcript: {
        model: "gpt-4o",
        generatedAt: new Date().toISOString(),
        wordCount: transcript.split(/\s+/).length,
        customPrompt: !!(systemPrompt || userPrompt),
      },
    });

    res.json({ ok: true, wordCount: transcript.split(/\s+/).length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- API: Regenerate cover image ---
app.post("/api/stories/:id/regenerate/image", async (req, res) => {
  const story = findStory(req.params.id);
  if (!story) return res.status(404).json({ error: "Story not found" });

  try {
    const { prompt } = req.body || {};
    const buffer = await generateCoverImage(story, {
      prompt: prompt || undefined,
    });

    saveContent(CONTENT_DIR, story.id, "cover.webp", buffer);
    updateMetadata(CONTENT_DIR, story.id, {
      coverImage: {
        model: "flux-1.1-pro",
        generatedAt: new Date().toISOString(),
        sizeKB: Math.round(buffer.length / 1024),
        customPrompt: !!prompt,
      },
    });

    res.json({ ok: true, sizeKB: Math.round(buffer.length / 1024) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- API: Regenerate narration for a single speaker ---
app.post("/api/stories/:id/regenerate/narration/:speaker", async (req, res) => {
  const story = findStory(req.params.id);
  if (!story) return res.status(404).json({ error: "Story not found" });

  const speakerKey = req.params.speaker as keyof typeof SPEAKERS;
  if (!SPEAKERS[speakerKey]) {
    return res.status(400).json({ error: `Invalid speaker: ${speakerKey}` });
  }

  const transcriptPath = join(CONTENT_DIR, "stories", story.id, "transcript.md");
  if (!existsSync(transcriptPath)) {
    return res.status(400).json({ error: "Generate transcript first" });
  }

  try {
    const rawTranscript = stripMarkdown(readFileSync(transcriptPath, "utf8"));
    const buffer = await generateNarration(rawTranscript, speakerKey);

    saveContent(CONTENT_DIR, story.id, `narration-${speakerKey}.mp3`, buffer);
    updateMetadata(CONTENT_DIR, story.id, {
      [`narration_${speakerKey}`]: {
        model: "eleven_multilingual_v2",
        voiceId: SPEAKERS[speakerKey].voiceId,
        generatedAt: new Date().toISOString(),
        sizeKB: Math.round(buffer.length / 1024),
      },
    });

    res.json({ ok: true, sizeKB: Math.round(buffer.length / 1024) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3456;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Content server running at http://0.0.0.0:${PORT}`);
  console.log(`  App: ${getContentAppId()}`);
  console.log(`  Static files: ${CONTENT_DIR}`);
  console.log(`  API: http://localhost:${PORT}/api/...`);
});
