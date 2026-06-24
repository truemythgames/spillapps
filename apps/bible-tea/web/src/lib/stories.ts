import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "./i18n";

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

export const MEDIA_BASE = "https://media.spillapps.com/bible-tea";
export const APP_STORE_URL =
  "https://apps.apple.com/app/bible-tea-bible-storycast/id6761665565";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.bibletea";

export function getCatalog(locale: Locale = "en"): CatalogStory[] {
  if (locale !== "en") {
    const locPath = join(CONTENT_DIR, `story-catalog.${locale}.json`);
    if (existsSync(locPath)) return JSON.parse(readFileSync(locPath, "utf8"));
  }
  return JSON.parse(readFileSync(join(CONTENT_DIR, "story-catalog.json"), "utf8"));
}

export async function getTranscript(id: string, locale: Locale = "en"): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/stories/${id}`, {
      headers: apiHeaders(locale),
    });
    if (!res.ok) return null;
    const { story } = (await res.json()) as any;
    return story?.transcript ?? null;
  } catch {
    return null;
  }
}

export function hasCover(id: string): boolean {
  return existsSync(join(CONTENT_DIR, "stories", id, "cover.webp"));
}

export function coverUrl(id: string): string {
  return `${MEDIA_BASE}/stories/${id}/cover.webp`;
}

const API_BASE = "https://api.spillapps.com/v1";
const APP_ID = "bible-tea";

function apiHeaders(locale: Locale = "en"): Record<string, string> {
  return { "x-app-id": APP_ID, "Accept-Language": locale };
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover_image_url: string | null;
  stories: CatalogStory[];
}

export async function getPlaylists(catalog: CatalogStory[], locale: Locale = "en"): Promise<Playlist[]> {
  const slugMap = new Map(catalog.map((s) => [s.id, s]));

  const listRes = await fetch(`${API_BASE}/playlists`, {
    headers: apiHeaders(locale),
  });
  const { playlists: rawPlaylists } = (await listRes.json()) as any;

  const results: Playlist[] = [];
  for (const pl of rawPlaylists) {
    const detailRes = await fetch(`${API_BASE}/playlists/${pl.id}`, {
      headers: apiHeaders(locale),
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

export async function getSeasons(locale: Locale = "en"): Promise<Season[]> {
  const res = await fetch(`${API_BASE}/seasons`, {
    headers: apiHeaders(locale),
  });
  const { seasons: rawSeasons } = (await res.json()) as any;

  const results: Season[] = [];
  for (const s of rawSeasons) {
    const detailRes = await fetch(`${API_BASE}/seasons/${s.id}`, {
      headers: apiHeaders(locale),
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

export async function getCharacters(locale: Locale = "en"): Promise<Character[]> {
  const res = await fetch(`${API_BASE}/characters`, {
    headers: apiHeaders(locale),
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

export interface PrayerCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
}

export interface Prayer {
  id: string;
  title: string;
  slug: string;
  description: string;
  transcript: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  category_icon: string;
}

export interface PrayerRelatedStory {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
}

export interface PrayerRelatedCharacter {
  id: string;
  name: string;
  description: string;
}

export interface PrayerDetail extends Prayer {
  related_stories: PrayerRelatedStory[];
  related_characters: PrayerRelatedCharacter[];
}

async function fetchWithRetry(url: string, init: RequestInit, attempts = 4): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      lastErr = new Error(`${url} -> ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
    await new Promise((r) => setTimeout(r, 400 * (i + 1)));
  }
  throw lastErr;
}

export async function getPrayerCategories(locale: Locale = "en"): Promise<PrayerCategory[]> {
  const res = await fetchWithRetry(`${API_BASE}/prayers/categories`, {
    headers: apiHeaders(locale),
  });
  const { categories } = (await res.json()) as any;
  return (categories || []) as PrayerCategory[];
}

export async function getPrayers(locale: Locale = "en"): Promise<Prayer[]> {
  const res = await fetchWithRetry(`${API_BASE}/prayers?limit=300`, {
    headers: apiHeaders(locale),
  });
  const { prayers } = (await res.json()) as any;
  return (prayers || []) as Prayer[];
}

export async function getPrayerDetail(idOrSlug: string, locale: Locale = "en"): Promise<PrayerDetail | null> {
  let res: Response;
  try {
    res = await fetchWithRetry(`${API_BASE}/prayers/${idOrSlug}`, {
      headers: apiHeaders(locale),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data = (await res.json()) as any;
  if (!data?.prayer) return null;
  return {
    ...data.prayer,
    related_stories: (data.related_stories || []) as PrayerRelatedStory[],
    related_characters: (data.related_characters || []) as PrayerRelatedCharacter[],
  };
}

/** Strip the leading markdown H1 (the title) from a prayer transcript body. */
export function prayerBody(transcript: string): string {
  return (transcript || "").replace(/^#\s+.*\n+/, "").trim();
}
