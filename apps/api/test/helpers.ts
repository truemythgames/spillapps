import { expect } from "vitest";
import { resetEdgeCache } from "./setup";
import { catKey } from "../src/lib/catalog-store";
import type { Env } from "../src/types";
import worker from "../src/index";

export const APP_ID = "bible-tea";
export const MEDIA_BASE = "https://media.spillapps.com";

/** Loose API JSON — each test asserts the fields it cares about. */
export type ApiJson = Record<string, any>;

export const storyCreation = {
  id: "st-creation",
  season_id: "s-genesis",
  title: "The Creation",
  slug: "creation",
  description: "God built the universe in 6 days.",
  cover_image_key: "stories/creation/cover.webp",
  duration_seconds: 258,
  sort_order: 1,
  is_free: 1,
  is_published: 1,
  published_at: "2026-03-26",
  bible_ref: "Genesis 1-2",
  season_name: "Genesis",
  testament: "old",
  cover_image_url: `${MEDIA_BASE}/bible-tea/stories/creation/cover.webp`,
};

export const storyResurrection = {
  id: "st-resurrection",
  season_id: "s-gospels",
  title: "The Resurrection",
  slug: "the-resurrection",
  description: "The tomb is empty.",
  cover_image_key: "stories/the-resurrection/cover.webp",
  duration_seconds: 312,
  sort_order: 2,
  is_free: 1,
  is_published: 1,
  published_at: "2026-04-01",
  bible_ref: "Matthew 28:1-10",
  season_name: "Gospels",
  testament: "new",
  cover_image_url: `${MEDIA_BASE}/bible-tea/stories/the-resurrection/cover.webp`,
};

export const speakers = [
  {
    id: "spk-grace",
    name: "Grace",
    avatar_key: "speakers/grace.webp",
    is_default: 1,
    avatar_url: `${MEDIA_BASE}/bible-tea/speakers/grace.webp`,
  },
  {
    id: "spk-elijah",
    name: "Elijah",
    avatar_key: "speakers/elijah.webp",
    is_default: 0,
    avatar_url: `${MEDIA_BASE}/bible-tea/speakers/elijah.webp`,
  },
];

export const prayerAnxious = {
  id: "pr-anxious-thoughts",
  slug: "anxious-thoughts",
  title: "When Anxious Thoughts Won't Stop",
  description: "A prayer for racing thoughts.",
  transcript: "Lord, my mind will not be still...",
  category_id: "pc-peace",
  category_name: "Peace",
  category_slug: "peace",
  category_icon: "leaf",
  duration_seconds: 65,
  related_story_ids: ["st-creation"],
  related_character_ids: ["ch-jesus"],
};

export function todayUtc(): string {
  return new Date().toISOString().split("T")[0];
}

class MemoryKV {
  private store = new Map<string, string>();

  async get(key: string, type?: string): Promise<unknown> {
    const raw = this.store.get(key);
    if (raw == null) return null;
    if (type === "json") return JSON.parse(raw);
    return raw;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

class MemoryR2 {
  objects = new Map<string, { size: number; body: Uint8Array }>();

  put(key: string, size = 48_000): void {
    this.objects.set(key, { size, body: new Uint8Array([0xff, 0xfb]) });
  }

  async list(opts: { prefix: string }): Promise<{ objects: { key: string; size: number }[] }> {
    const objects: { key: string; size: number }[] = [];
    for (const [key, o] of this.objects) {
      if (key.startsWith(opts.prefix)) objects.push({ key, size: o.size });
    }
    return { objects };
  }

  async get(key: string): Promise<{
    size: number;
    body: Uint8Array;
    arrayBuffer: () => Promise<ArrayBuffer>;
    httpMetadata: { contentType: string };
  } | null> {
    const o = this.objects.get(key);
    if (!o) return null;
    const copy = new Uint8Array(o.body);
    return {
      size: o.size,
      body: o.body,
      arrayBuffer: async () => copy.buffer,
      httpMetadata: { contentType: "audio/mpeg" },
    };
  }
}

function forbiddenD1(): D1Database {
  return {
    prepare() {
      throw new Error("D1 must not be queried on public catalog routes");
    },
  } as unknown as D1Database;
}

export function seedCatalog(kv: MemoryKV, r2: MemoryR2): void {
  const stories = { stories: [storyCreation, storyResurrection] };
  const playlists = {
    playlists: [
      {
        id: "pl-origins",
        name: "Origins",
        description: "From the beginning.",
        is_featured: 1,
        cover_image_key: "playlists/origins/cover.webp",
        cover_image_url: `${MEDIA_BASE}/bible-tea/playlists/origins/cover.webp`,
        stories: [storyCreation],
      },
    ],
  };
  const characters = {
    characters: [
      {
        id: "ch-jesus",
        name: "Jesus",
        description: "The son.",
        cover_image_key: "characters/jesus/cover.webp",
        image_url: `${MEDIA_BASE}/bible-tea/characters/jesus/cover.webp`,
        stories: [storyCreation],
      },
    ],
  };
  const seasons = {
    seasons: [
      {
        id: "s-genesis",
        name: "Genesis",
        slug: "genesis",
        testament: "old",
        cover_image_url: `${MEDIA_BASE}/bible-tea/seasons/genesis/cover.webp`,
      },
      {
        id: "s-gospels",
        name: "Gospels",
        slug: "gospels",
        testament: "new",
        cover_image_url: `${MEDIA_BASE}/bible-tea/seasons/gospels/cover.webp`,
      },
    ],
  };
  const prayers = {
    categories: [
      { id: "pc-peace", name: "Peace", slug: "peace", icon: "leaf", description: "Rest." },
    ],
    prayers: [prayerAnxious],
  };
  const transcripts = {
    transcripts: {
      "st-creation": "In the beginning God created the heavens and the earth.",
      "st-resurrection": "He is not here; he has risen.",
    },
  };
  const settings = {
    settings: {
      min_app_version: "1.1.0",
      min_ios_version: "1.1.0",
      min_android_version: "1.1.5",
      force_update: "false",
      chat_enabled: "true",
    },
  };
  const sotd = { story: storyResurrection, quote: "He is risen", attribution: "Matthew 28" };

  const writes: [string, unknown][] = [
    [catKey("stories", APP_ID, "en"), stories],
    [catKey("playlists", APP_ID, "en"), playlists],
    [catKey("characters", APP_ID, "en"), characters],
    [catKey("seasons", APP_ID, "en"), seasons],
    [catKey("prayers", APP_ID, "en"), prayers],
    [catKey("transcripts", APP_ID, "en"), transcripts],
    [catKey("speakers", APP_ID), { speakers }],
    [catKey("settings", APP_ID), settings],
    [catKey("sotd", APP_ID, "en", todayUtc()), sotd],
  ];
  for (const [key, value] of writes) {
    void kv.put(key, JSON.stringify(value));
  }

  r2.put("bible-tea/stories/creation/narration-grace.mp3");
  r2.put("bible-tea/stories/creation/narration-elijah.mp3");
  r2.put("bible-tea/stories/creation/narration-grace-v2.mp3");
  r2.put("bible-tea/stories/the-resurrection/narration-grace.mp3");
  r2.put("bible-tea/prayers/anxious-thoughts/narration-grace.mp3");
  r2.put("bible-tea/prayers/anxious-thoughts/narration-elijah.mp3");
}

export function makeEnv(opts: { seed?: boolean } = {}): { env: Env; kv: MemoryKV; r2: MemoryR2 } {
  resetEdgeCache();
  const kv = new MemoryKV();
  const r2 = new MemoryR2();
  if (opts.seed !== false) seedCatalog(kv, r2);

  const env = {
    DB: forbiddenD1(),
    MEDIA: r2 as unknown as R2Bucket,
    CACHE: kv as unknown as KVNamespace,
    ENVIRONMENT: "test",
    APP_ID,
    ALLOWED_APP_IDS: "bible-tea,history-tea,true-crime-tea",
    APP_NAME: "spillapps",
    PUBLIC_API_BASE: "https://api.spillapps.com",
    PUBLIC_MEDIA_BASE: MEDIA_BASE,
    APPLE_BUNDLE_ID: "app.bibletea",
    ADMIN_EMAIL: "hello@truemythgames.com",
    CORS_ALLOWED_ORIGINS: "*",
    JWT_SECRET: "test-jwt-secret-not-for-production",
  } as Env;

  return { env, kv, r2 };
}

export function execCtx(): ExecutionContext {
  return {
    waitUntil(promise: Promise<unknown>) {
      void Promise.resolve(promise).catch(() => {});
    },
    passThroughOnException() {},
    props: {},
  };
}

export async function api(
  path: string,
  env: Env,
  headers: Record<string, string> = {},
): Promise<{ status: number; json: ApiJson }> {
  const res = await worker.fetch(
    new Request(`https://api.spillapps.com${path}`, {
      headers: {
        "X-App-Id": APP_ID,
        "Accept-Language": "en",
        ...headers,
      },
    }),
    env,
    execCtx(),
  );
  return { status: res.status, json: (await res.json()) as ApiJson };
}

export function expectStoryCard(story: ApiJson): void {
  expect(story.id).toBeTruthy();
  expect(story.title).toBeTruthy();
  expect(story.slug).toBeTruthy();
  expect(story.cover_image_url).toMatch(/^https:\/\/media\.spillapps\.com\//);
  expect(Number(story.duration_seconds)).toBeGreaterThan(0);
  expect(story.bible_ref).toBeTruthy();
  expect(story.season_name).toBeTruthy();
  expect(story.testament).toMatch(/^(old|new)$/);
}

export function expectAudioVersion(audio: ApiJson, kind: "story" | "prayer"): void {
  expect(audio.audio_url).toMatch(/^https:\/\/media\.spillapps\.com\/.+\.mp3$/);
  expect(Number(audio.duration_seconds)).toBeGreaterThan(0);
  expect(audio.speaker_name).toBeTruthy();
  expect(audio.speaker_id).toBeTruthy();
  if (kind === "story") expect(audio.story_id).toBeTruthy();
  if (kind === "prayer") expect(audio.prayer_id).toBeTruthy();
}
