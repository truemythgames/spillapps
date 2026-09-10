import { describe, expect, it } from "vitest";

const LIVE = process.env.LIVE_API === "1";
const BASE = process.env.LIVE_API_BASE || "https://api.spillapps.com";

async function get(path: string, locale = "en"): Promise<{ status: number; json: Record<string, any> }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-App-Id": "bible-tea", "Accept-Language": locale },
  });
  return { status: res.status, json: await res.json() };
}

describe.skipIf(!LIVE)("live api.spillapps.com contract", () => {
  it("catalog lists are populated", async () => {
    const stories = await get("/v1/stories?limit=500");
    expect(stories.status).toBe(200);
    expect(stories.json.stories.length).toBeGreaterThan(50);
    const s = stories.json.stories[0];
    expect(s.cover_image_url).toMatch(/^https:\/\//);
    expect(Number(s.duration_seconds)).toBeGreaterThan(0);
    expect(s.bible_ref).toBeTruthy();

    const playlists = await get("/v1/playlists");
    expect(playlists.json.playlists.length).toBeGreaterThan(0);
    expect(playlists.json.playlists[0].stories?.length).toBeGreaterThan(0);

    const characters = await get("/v1/characters");
    expect(characters.json.characters.length).toBeGreaterThan(0);

    const prayers = await get("/v1/prayers?limit=50");
    expect(prayers.json.prayers.length).toBeGreaterThan(0);
    expect(Number(prayers.json.prayers[0].duration_seconds)).toBeGreaterThan(0);
  });

  it("story and prayer detail are playable", async () => {
    const story = await get("/v1/stories/john-the-baptists-last-words");
    expect(story.status).toBe(200);
    expect(story.json.story.transcript).toBeTruthy();
    expect(story.json.audio_versions.length).toBeGreaterThan(0);
    expect(Number(story.json.audio_versions[0].duration_seconds)).toBeGreaterThan(0);
    expect(story.json.audio_versions[0].audio_url).toMatch(/\.mp3$/);

    const prayer = await get("/v1/prayers/anxious-thoughts");
    expect(prayer.status).toBe(200);
    expect(prayer.json.prayer.transcript).toBeTruthy();
    expect(prayer.json.audio_versions.length).toBeGreaterThan(0);
    expect(Number(prayer.json.audio_versions[0].duration_seconds)).toBeGreaterThan(0);
  });
});
