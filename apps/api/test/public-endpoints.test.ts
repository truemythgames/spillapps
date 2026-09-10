import { describe, expect, it } from "vitest";
import {
  APP_ID,
  type ApiJson,
  api,
  expectAudioVersion,
  expectStoryCard,
  makeEnv,
  prayerAnxious,
  storyCreation,
  storyResurrection,
} from "./helpers";

describe("public API — full payloads without D1", () => {
  it("health check", async () => {
    const { env } = makeEnv();
    const { status, json } = await api("/", env);
    expect(status).toBe(200);
    expect(json.status).toBe("ok");
    expect(json.app_id).toBe(APP_ID);
  });

  it("GET /v1/config returns version gates and flags", async () => {
    const { env } = makeEnv();
    const { status, json } = await api("/v1/config", env);
    expect(status).toBe(200);
    expect(json.api_base).toBe("https://api.spillapps.com");
    expect(json.media_base).toBe("https://media.spillapps.com");
    expect(json.app_id).toBe(APP_ID);
    expect(json.min_app_version).toBe("1.1.0");
    expect(json.min_ios_version).toBe("1.1.0");
    expect(json.min_android_version).toBe("1.1.5");
    expect(json.force_update).toBe(false);
    expect(json.maintenance).toBe(false);
    expect(json.feature_flags.chat_enabled).toBe(true);
  });

  it("GET /v1/stories returns every card field the app home uses", async () => {
    const { env } = makeEnv();
    const { status, json } = await api("/v1/stories?limit=500", env);
    expect(status).toBe(200);
    expect(json.stories).toHaveLength(2);
    json.stories.forEach(expectStoryCard);
  });

  it("GET /v1/stories filters by season and testament", async () => {
    const { env } = makeEnv();
    const season = await api("/v1/stories?season_id=s-genesis", env);
    expect(season.json.stories.map((s: ApiJson) => s.id)).toEqual(["st-creation"]);

    const testament = await api("/v1/stories?testament=new", env);
    expect(testament.json.stories.map((s: ApiJson) => s.id)).toEqual(["st-resurrection"]);
  });

  it("GET /v1/stories/recently-added and /popular return timed cards", async () => {
    const { env } = makeEnv();
    const recent = await api("/v1/stories/recently-added?limit=10", env);
    expect(recent.status).toBe(200);
    expect(recent.json.stories[0].id).toBe("st-resurrection");
    recent.json.stories.forEach(expectStoryCard);

    const popular = await api("/v1/stories/popular", env);
    expect(popular.status).toBe(200);
    expect(popular.json.stories.length).toBeGreaterThan(0);
    popular.json.stories.forEach(expectStoryCard);
  });

  it("GET /v1/stories/:id serves playable detail (id or slug)", async () => {
    const { env } = makeEnv();
    for (const id of [storyCreation.id, storyCreation.slug]) {
      const { status, json } = await api(`/v1/stories/${id}`, env);
      expect(status).toBe(200);
      expectStoryCard(json.story);
      expect(json.story.transcript).toContain("In the beginning");
      expect(json.story.duration_seconds).toBe(258);

      expect(json.audio_versions).toHaveLength(2);
      json.audio_versions.forEach((a: ApiJson) => expectAudioVersion(a, "story"));
      expect(json.audio_versions.some((a: ApiJson) => /grace-v2/.test(a.audio_key))).toBe(false);
      expect(json.audio_versions[0].speaker_name).toBe("Grace");
      expect(json.audio_versions[0].is_default).toBe(1);

      expect(json.characters).toHaveLength(1);
      expect(json.characters[0].id).toBe("ch-jesus");
      expect(json.characters[0].cover_image_url).toMatch(/^https:\/\//);

      expect(json.related_prayers).toHaveLength(1);
      expect(json.related_prayers[0].id).toBe(prayerAnxious.id);
      expect(json.related_prayers[0].title).toBeTruthy();
    }
  });

  it("GET /v1/stories/:unknown is 404, not 500", async () => {
    const { env } = makeEnv();
    const { status, json } = await api("/v1/stories/does-not-exist", env);
    expect(status).toBe(404);
    expect(json.error).toBeTruthy();
  });

  it("GET /v1/playlists embeds stories so home does not N+1", async () => {
    const { env } = makeEnv();
    const list = await api("/v1/playlists", env);
    expect(list.status).toBe(200);
    expect(list.json.playlists).toHaveLength(1);
    const pl = list.json.playlists[0];
    expect(pl.name).toBe("Origins");
    expect(pl.cover_image_url).toMatch(/^https:\/\/media\.spillapps\.com\//);
    expect(pl.stories).toHaveLength(1);
    expectStoryCard(pl.stories[0]);

    const detail = await api("/v1/playlists/pl-origins", env);
    expect(detail.status).toBe(200);
    expect(detail.json.playlist.id).toBe("pl-origins");
    expect(detail.json.stories).toHaveLength(1);
    expectStoryCard(detail.json.stories[0]);
  });

  it("GET /v1/characters includes image and linked stories", async () => {
    const { env } = makeEnv();
    const list = await api("/v1/characters", env);
    expect(list.status).toBe(200);
    expect(list.json.characters).toHaveLength(1);
    const ch = list.json.characters[0];
    expect(ch.name).toBe("Jesus");
    expect(ch.image_url).toMatch(/^https:\/\/media\.spillapps\.com\//);
    expect(ch.stories[0].id).toBe("st-creation");
    expect(ch.stories[0].cover_image_url).toMatch(/^https:\/\//);

    const detail = await api("/v1/characters/ch-jesus", env);
    expect(detail.status).toBe(200);
    expect(detail.json.character.name).toBe("Jesus");
    expect(detail.json.stories).toHaveLength(1);
  });

  it("GET /v1/seasons and season detail include covers and stories", async () => {
    const { env } = makeEnv();
    const list = await api("/v1/seasons", env);
    expect(list.status).toBe(200);
    expect(list.json.seasons).toHaveLength(2);
    expect(list.json.seasons[0].cover_image_url).toMatch(/^https:\/\//);

    const old = await api("/v1/seasons?testament=old", env);
    expect(old.json.seasons.map((s: ApiJson) => s.id)).toEqual(["s-genesis"]);

    const detail = await api("/v1/seasons/s-gospels", env);
    expect(detail.status).toBe(200);
    expect(detail.json.season.name).toBe("Gospels");
    expect(detail.json.stories).toHaveLength(1);
    expectStoryCard(detail.json.stories[0]);
  });

  it("GET /v1/speakers lists default first with avatar urls", async () => {
    const { env } = makeEnv();
    const list = await api("/v1/speakers", env);
    expect(list.status).toBe(200);
    expect(list.json.speakers[0].name).toBe("Grace");
    expect(list.json.speakers[0].is_default).toBe(1);
    expect(list.json.speakers[0].avatar_url).toMatch(/^https:\/\//);

    const detail = await api("/v1/speakers/spk-elijah", env);
    expect(detail.status).toBe(200);
    expect(detail.json.speaker.name).toBe("Elijah");
  });

  it("GET /v1/prayers and categories are complete", async () => {
    const { env } = makeEnv();
    const cats = await api("/v1/prayers/categories", env);
    expect(cats.status).toBe(200);
    expect(cats.json.categories[0].id).toBe("pc-peace");
    expect(cats.json.categories[0].name).toBe("Peace");

    const list = await api("/v1/prayers?limit=50", env);
    expect(list.status).toBe(200);
    expect(list.json.prayers).toHaveLength(1);
    expect(list.json.prayers[0].title).toBe(prayerAnxious.title);
    expect(Number(list.json.prayers[0].duration_seconds)).toBeGreaterThan(0);
    expect(list.json.prayers[0].transcript).toBeTruthy();
  });

  it("GET /v1/prayers/:id serves playable detail with relations", async () => {
    const { env } = makeEnv();
    for (const id of [prayerAnxious.id, prayerAnxious.slug]) {
      const { status, json } = await api(`/v1/prayers/${id}`, env);
      expect(status).toBe(200);
      expect(json.prayer.title).toBe(prayerAnxious.title);
      expect(json.prayer.transcript).toBeTruthy();
      expect(Number(json.prayer.duration_seconds)).toBeGreaterThan(0);

      expect(json.audio_versions).toHaveLength(2);
      json.audio_versions.forEach((a: ApiJson) => expectAudioVersion(a, "prayer"));
      expect(json.audio_versions[0].speaker_name).toBe("Grace");
      expect(json.audio_versions[0].duration_seconds).toBe(65);

      expect(json.related_stories).toHaveLength(1);
      expect(json.related_stories[0].id).toBe("st-creation");
      expect(json.related_stories[0].cover_image_url).toMatch(/^https:\/\//);

      expect(json.related_characters).toHaveLength(1);
      expect(json.related_characters[0].id).toBe("ch-jesus");
    }
  });

  it("GET /v1/prayers/for-story/:id returns linked prayers by id or slug", async () => {
    const { env } = makeEnv();
    for (const id of [storyCreation.id, storyCreation.slug]) {
      const { status, json } = await api(`/v1/prayers/for-story/${id}`, env);
      expect(status).toBe(200);
      expect(json.prayers).toHaveLength(1);
      expect(json.prayers[0].id).toBe(prayerAnxious.id);
      expect(json.prayers[0].title).toBeTruthy();
    }

    const none = await api("/v1/prayers/for-story/the-resurrection", env);
    expect(none.status).toBe(200);
    expect(none.json.prayers).toEqual([]);
  });

  it("GET /v1/featured/story-of-the-day and playlist-of-the-week", async () => {
    const { env } = makeEnv();
    const sotd = await api("/v1/featured/story-of-the-day", env);
    expect(sotd.status).toBe(200);
    expectStoryCard(sotd.json.story);
    expect(sotd.json.story.id).toBe(storyResurrection.id);
    expect(sotd.json.quote).toBeTruthy();

    const potw = await api("/v1/featured/playlist-of-the-week", env);
    expect(potw.status).toBe(200);
    expect(potw.json.playlist.id).toBe("pl-origins");
    expect(potw.json.playlist.cover_image_url).toMatch(/^https:\/\//);
    expect(potw.json.playlist.stories).toBeUndefined();
  });

  it("GET /v1/media/audio/:story/:speaker streams from R2 without D1", async () => {
    const { env } = makeEnv();
    const res = await (
      await import("../src/index")
    ).default.fetch(
      new Request("https://api.spillapps.com/v1/media/audio/creation/spk-grace", {
        headers: { "X-App-Id": APP_ID },
      }),
      env,
      {
        waitUntil() {},
        passThroughOnException() {},
        props: {},
      },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("audio/mpeg");
  });

  it("Spanish requests fall back to English catalog when es keys are missing", async () => {
    const { env } = makeEnv();
    const { status, json } = await api("/v1/stories?limit=500", env, {
      "Accept-Language": "es-MX,es;q=0.9",
    });
    expect(status).toBe(200);
    expect(json.stories).toHaveLength(2);
    json.stories.forEach(expectStoryCard);
  });

  it("empty KV returns empty lists, not 500", async () => {
    const { env } = makeEnv({ seed: false });
    const stories = await api("/v1/stories", env);
    expect(stories.status).toBe(200);
    expect(stories.json.stories).toEqual([]);

    const playlists = await api("/v1/playlists", env);
    expect(playlists.status).toBe(200);
    expect(playlists.json.playlists).toEqual([]);

    const story = await api("/v1/stories/creation", env);
    expect(story.status).toBe(404);

    const config = await api("/v1/config", env);
    expect(config.status).toBe(200);
    expect(config.json.min_app_version).toBe("1.0.0");
  });

  it("user endpoints reject missing auth instead of crashing", async () => {
    const { env } = makeEnv();
    const progress = await api("/v1/me/progress", env);
    expect(progress.status).toBe(401);
    const likes = await api("/v1/me/likes", env);
    expect(likes.status).toBe(401);
  });
});
