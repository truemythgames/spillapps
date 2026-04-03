const CONTENT_SERVER = "http://localhost:3456";

export interface CatalogStory {
  id: string;
  title: string;
  description: string;
  section: string;
  bibleRef: string;
  inSeed: boolean;
  seedId: string | null;
}

export const SPEAKERS = [
  { key: "grace", name: "Grace" },
  { key: "maya", name: "Maya" },
  { key: "jordan", name: "Jordan" },
] as const;

let catalogCache: CatalogStory[] | null = null;

export async function getCatalog(): Promise<CatalogStory[]> {
  if (catalogCache) return catalogCache;
  const res = await fetch(`${CONTENT_SERVER}/story-catalog.json`);
  if (!res.ok) throw new Error("Failed to load story catalog");
  catalogCache = await res.json();
  return catalogCache!;
}

export function coverUrl(storyId: string): string {
  return `${CONTENT_SERVER}/stories/${storyId}/cover.webp`;
}

export function transcriptUrl(storyId: string): string {
  return `${CONTENT_SERVER}/stories/${storyId}/transcript.md`;
}

export function narrationUrl(storyId: string, speaker: string): string {
  return `${CONTENT_SERVER}/stories/${storyId}/narration-${speaker}.mp3`;
}

export async function hasGeneratedContent(storyId: string): Promise<boolean> {
  try {
    const res = await fetch(coverUrl(storyId), { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// --- Regeneration API ---

export interface DefaultPrompts {
  imagePrompt: string;
  transcriptSystemPrompt: string;
  transcriptUserPrompt: string;
}

export async function getDefaultPrompts(storyId: string): Promise<DefaultPrompts> {
  const res = await fetch(`${CONTENT_SERVER}/api/stories/${storyId}/prompts`);
  if (!res.ok) throw new Error("Failed to load prompts");
  return res.json();
}

export async function regenerateTranscript(
  storyId: string,
  opts?: { systemPrompt?: string; userPrompt?: string }
): Promise<{ ok: boolean; wordCount?: number; error?: string }> {
  const res = await fetch(`${CONTENT_SERVER}/api/stories/${storyId}/regenerate/transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts ?? {}),
  });
  return res.json();
}

export async function regenerateImage(
  storyId: string,
  opts?: { prompt?: string }
): Promise<{ ok: boolean; sizeKB?: number; error?: string }> {
  const res = await fetch(`${CONTENT_SERVER}/api/stories/${storyId}/regenerate/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts ?? {}),
  });
  return res.json();
}

export async function regenerateNarration(
  storyId: string,
  speaker: string
): Promise<{ ok: boolean; sizeKB?: number; error?: string }> {
  const res = await fetch(`${CONTENT_SERVER}/api/stories/${storyId}/regenerate/narration/${speaker}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}
