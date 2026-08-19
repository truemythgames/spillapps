import Constants from "expo-constants";
import { getSession, clearSession } from "@/lib/identity";

const extra = Constants.expoConfig?.extra as
  | { apiUrl?: string; appId?: string }
  | undefined;

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  extra?.apiUrl ||
  "https://api.spillapps.com";

export const APP_ID = extra?.appId || "bible-tea";

function getLanguage(): string {
  try {
    const i18n = require("./i18n").default;
    return i18n.language || "en";
  } catch {
    return "en";
  }
}

async function buildHeaders(
  options: RequestInit,
  token: string | null
): Promise<Record<string, string>> {
  return {
    "Content-Type": "application/json",
    "Accept-Language": getLanguage(),
    "X-App-Id": APP_ID,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getSession();

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: await buildHeaders(options, session?.token ?? null),
  });

  // Sessions last 30 days; a rejected token means mint a new one and retry once.
  if (res.status === 401 && session) {
    await clearSession();
    const retry = await getSession();
    if (retry) {
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: await buildHeaders(options, retry.token),
      });
    }
  }

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Config
  getConfig: () =>
    request<{
      api_base: string;
      media_base: string;
      app_id?: string;
      min_app_version: string;
      min_ios_version?: string;
      min_android_version?: string;
      force_update: boolean;
      force_update_ios?: boolean;
      force_update_android?: boolean;
      maintenance: boolean;
      feature_flags: Record<string, boolean>;
    }>("/v1/config"),

  // Content
  getSeasons: (testament?: string) =>
    request<{ seasons: any[] }>(
      `/v1/seasons${testament ? `?testament=${testament}` : ""}`
    ),

  getSeason: (id: string) =>
    request<{ season: any; stories: any[] }>(`/v1/seasons/${id}`),

  getStories: (params?: { season_id?: string; testament?: string; limit?: number }) => {
    const merged = { limit: "500", ...(params ?? {}) } as Record<string, string>;
    const q = new URLSearchParams(merged).toString();
    return request<{ stories: any[] }>(`/v1/stories?${q}`);
  },

  getStory: (id: string) =>
    request<{ story: any; audio_versions: any[]; characters: any[]; related_prayers?: any[] }>(
      `/v1/stories/${id}`
    ),

  getRecentStories: (limit = 10) =>
    request<{ stories: any[] }>(`/v1/stories/recently-added?limit=${limit}`),

  getPopularStories: () =>
    request<{ stories: any[] }>("/v1/stories/popular"),

  getSpeakers: () =>
    request<{ speakers: any[] }>("/v1/speakers"),

  getPlaylists: () =>
    request<{ playlists: any[] }>("/v1/playlists"),

  getPlaylist: (id: string) =>
    request<{ playlist: any; stories: any[] }>(`/v1/playlists/${id}`),

  getStoryOfTheDay: () =>
    request<{ story: any; quote?: string; attribution?: string }>(
      "/v1/featured/story-of-the-day"
    ),

  getPlaylistOfTheWeek: () =>
    request<{ playlist: any }>("/v1/featured/playlist-of-the-week"),

  getCharacters: () =>
    request<{ characters: any[] }>("/v1/characters"),

  // Prayers
  getPrayerCategories: () =>
    request<{ categories: any[] }>("/v1/prayers/categories"),

  getPrayers: (categoryId?: string) => {
    const q = categoryId ? `?category_id=${categoryId}&limit=50` : "?limit=50";
    return request<{ prayers: any[] }>(`/v1/prayers${q}`);
  },

  getPrayer: (id: string) =>
    request<{ prayer: any; audio_versions: any[]; related_stories: any[]; related_characters: any[] }>(
      `/v1/prayers/${id}`
    ),

  getPrayersForStory: (storyId: string) =>
    request<{ prayers: any[] }>(`/v1/prayers/for-story/${encodeURIComponent(storyId)}`),

  // Progress
  getProgress: () =>
    request<{ progress: any[] }>("/v1/me/progress"),

  updateProgress: (
    storyId: string,
    data: { speaker_id: string; position_seconds: number; completed?: boolean }
  ) =>
    request<{ success: boolean }>(`/v1/me/progress/${storyId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Streak
  getStreak: () =>
    request<{ current_streak: number; max_streak: number; last_listen_date: string | null }>(
      "/v1/me/progress/streak"
    ),

  streakCheckin: () =>
    request<{ current_streak: number; max_streak: number }>(
      "/v1/me/progress/streak/checkin",
      { method: "POST" }
    ),

  // Likes
  getLikes: () => request<{ likes: string[] }>("/v1/me/likes"),

  toggleLike: (storyId: string) =>
    request<{ liked: boolean }>(`/v1/me/likes/${storyId}`, { method: "POST" }),

  // Chat
  sendChatMessage: (data: {
    conversation_id?: string;
    topic: string;
    message: string;
  }) =>
    request<{
      conversation_id: string;
      is_new: boolean;
      message: { id: string; role: string; content: string };
    }>("/v1/chat", { method: "POST", body: JSON.stringify(data) }),

  streamChatMessage: async (
    data: { conversation_id?: string; topic: string; message: string },
    onMeta: (meta: { conversation_id: string; is_new: boolean; message_id: string }) => void,
    onDelta: (delta: string) => void,
    onDone: () => void,
  ) => {
    const session = await getSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept-Language": getLanguage(),
      "X-App-Id": APP_ID,
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    };

    const res = await fetch(`${API_BASE}/v1/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    // React Native (Hermes) doesn't support ReadableStream, fall back to text
    const text = await res.text();
    const lines = text.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const payload = trimmed.slice(6);
      if (payload === "[DONE]") break;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.conversation_id) {
          onMeta(parsed);
        } else if (parsed.delta) {
          onDelta(parsed.delta);
        }
      } catch {
        // skip malformed chunks
      }
    }
    onDone();
  },
};
