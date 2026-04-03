import { readAdminAuthRaw } from "./storage";
import { getCmsAppId } from "./cms-app";

/**
 * `VITE_API_BASE_URL` wins whenever set (use it to hit production API while running Vite locally).
 * Otherwise: dev → local Worker; prod build → spillapps API.
 */
function resolveApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:8787";
  return "https://api.spillapps.com";
}

const API_BASE = resolveApiBase();

export function getCmsApiBaseUrl(): string {
  return API_BASE;
}

function getToken(): string {
  try {
    const stored = readAdminAuthRaw();
    if (!stored) return "";
    return JSON.parse(stored).token || "";
  } catch {
    return "";
  }
}

function headersWithApp(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
    "X-App-Id": getCmsAppId(),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headersWithApp(),
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

/** Exchange Google ID token for a Spill API session JWT (required for /admin routes). */
export async function exchangeGoogleSession(idToken: string): Promise<{
  session_token: string;
  user: { id: string; email: string; name?: string; picture?: string };
}> {
  const res = await fetch(`${API_BASE}/v1/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: idToken,
      provider: "google",
      app_id: getCmsAppId(),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j.error === "string" && j.error) msg = j.error;
    } catch {
      /* use raw */
    }
    throw new Error(`${res.status} ${msg}`);
  }
  return res.json();
}

export const adminApi = {
  getSeasons: () => request<{ seasons: any[] }>("/v1/seasons"),
  getStories: () => request<{ stories: any[] }>("/v1/stories"),
  getStory: (id: string) => request<any>(`/v1/stories/${id}`),
  getSpeakers: () => request<{ speakers: any[] }>("/v1/speakers"),
  getPlaylists: () => request<{ playlists: any[] }>("/v1/playlists"),

  createStory: (data: any) =>
    request<{ id: string }>("/admin/stories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStory: (id: string, data: any) =>
    request<{ success: boolean }>(`/admin/stories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  createSpeaker: (data: any) =>
    request<{ id: string }>("/admin/speakers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createStoryAudio: (data: any) =>
    request<{ id: string }>("/admin/story-audio", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createPlaylist: (data: any) =>
    request<{ id: string }>("/admin/playlists", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCharacters: () => request<{ characters: any[] }>("/v1/characters"),

  createCharacter: (data: any) =>
    request<{ id: string }>("/admin/characters", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCharacter: (id: string, data: any) =>
    request<{ success: boolean }>(`/admin/characters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCharacter: (id: string) =>
    request<{ success: boolean }>(`/admin/characters/${id}`, {
      method: "DELETE",
    }),

  purgeCache: () =>
    request<{ success: boolean }>("/admin/cache/purge", { method: "POST" }),

  upload: async (file: File, key: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);

    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "X-App-Id": getCmsAppId(),
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    return res.json() as Promise<{ key: string; url: string }>;
  },
};
