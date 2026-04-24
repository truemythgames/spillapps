import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface CatalogStory {
  id: string;
  title: string;
  description: string;
  section: string;
  bibleRef: string;
  inSeed: boolean;
  seedId: string | null;
}

const CONTENT_DIR = join(process.cwd(), "..", "content");
const CATALOG_PATH = join(CONTENT_DIR, "story-catalog.json");

export const MEDIA_BASE = "https://media.spillapps.com/history-tea";
export const APP_STORE_URL =
  "https://apps.apple.com/app/history-tea-bible-storycast/id6761665565";

export function getCatalog(): CatalogStory[] {
  return JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
}

export function getTranscript(id: string): string | null {
  const path = join(CONTENT_DIR, "stories", id, "transcript.md");
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

export function hasCover(id: string): boolean {
  return existsSync(join(CONTENT_DIR, "stories", id, "cover.webp"));
}

export function coverUrl(id: string): string {
  return `${MEDIA_BASE}/stories/${id}/cover.webp`;
}

const API_BASE = "https://api.spillapps.com/v1";
const APP_ID = "history-tea";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover_image_url: string | null;
  stories: CatalogStory[];
}

export async function getPlaylists(catalog: CatalogStory[]): Promise<Playlist[]> {
  const slugMap = new Map(catalog.map((s) => [s.id, s]));

  const listRes = await fetch(`${API_BASE}/playlists`, {
    headers: { "x-app-id": APP_ID },
  });
  const { playlists: rawPlaylists } = (await listRes.json()) as any;

  const results: Playlist[] = [];
  for (const pl of rawPlaylists) {
    const detailRes = await fetch(`${API_BASE}/playlists/${pl.id}`, {
      headers: { "x-app-id": APP_ID },
    });
    const { playlist, stories: rawStories } = (await detailRes.json()) as any;

    const mapped = (rawStories as any[])
      .map((s: any) => slugMap.get(s.slug))
      .filter(Boolean) as CatalogStory[];

    if (mapped.length > 0) {
      results.push({
        id: pl.id,
        name: playlist.name,
        description: playlist.description,
        cover_image_url: pl.cover_image_url,
        stories: mapped,
      });
    }
  }

  return results;
}

export type StoryPlaylistMap = Map<string, { id: string; name: string }>;

export function buildStoryPlaylistMap(playlists: Playlist[]): StoryPlaylistMap {
  const map: StoryPlaylistMap = new Map();
  for (const pl of playlists) {
    for (const s of pl.stories) {
      if (!map.has(s.id)) {
        map.set(s.id, { id: pl.id, name: pl.name });
      }
    }
  }
  return map;
}

export interface Season {
  id: string;
  testament: string;
  name: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  stories: SeasonStory[];
}

export interface SeasonStory {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  duration_seconds: number | null;
}

export async function getSeasons(): Promise<Season[]> {
  const res = await fetch(`${API_BASE}/seasons`, {
    headers: { "x-app-id": APP_ID },
  });
  const { seasons: rawSeasons } = (await res.json()) as any;

  const results: Season[] = [];
  for (const s of rawSeasons) {
    const detailRes = await fetch(`${API_BASE}/seasons/${s.id}`, {
      headers: { "x-app-id": APP_ID },
    });
    const { season, stories } = (await detailRes.json()) as any;
    results.push({
      id: season.id,
      testament: season.testament,
      name: season.name,
      slug: season.slug,
      description: season.description,
      cover_image_url: s.cover_image_url,
      stories: (stories as any[]).map((st: any) => ({
        id: st.id,
        title: st.title,
        slug: st.slug,
        description: st.description,
        cover_image_url: st.cover_image_url,
        duration_seconds: st.duration_seconds,
      })),
    });
  }
  return results;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  stories: CharacterStory[];
}

export interface CharacterStory {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
}

export async function getCharacters(): Promise<Character[]> {
  const res = await fetch(`${API_BASE}/characters`, {
    headers: { "x-app-id": APP_ID },
  });
  const { characters } = (await res.json()) as any;
  return (characters as any[]).map((ch: any) => ({
    id: ch.id,
    name: ch.name,
    description: ch.description,
    image_url: ch.image_url,
    stories: (ch.stories || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      description: s.description,
      cover_image_url: s.cover_image_url,
    })),
  }));
}
