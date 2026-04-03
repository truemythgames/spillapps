import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// MMKV requires native build; use AsyncStorage-backed fallback for Expo Go
// Swap to real MMKV after `expo prebuild`

const memoryCache: Record<string, string> = {};

export const storage = {
  getString: (key: string): string | undefined => memoryCache[key],
  getNumber: (key: string): number | undefined => {
    const v = memoryCache[key];
    return v !== undefined ? Number(v) : undefined;
  },
  getBoolean: (key: string): boolean | undefined => {
    const v = memoryCache[key];
    return v !== undefined ? v === "true" : undefined;
  },
  set: (key: string, value: string | number | boolean) => {
    memoryCache[key] = String(value);
    AsyncStorage.setItem(key, String(value)).catch(() => {});
  },
};

// Hydrate cache from AsyncStorage on startup
AsyncStorage.multiGet([
  "has_onboarded",
  "selected_speaker",
  "last_played_story",
  "playback_speed",
  "local_progress",
  "streak_data",
  "is_subscribed",
  "likes",
]).then((pairs) => {
  for (const [k, v] of pairs) {
    if (v !== null) memoryCache[k] = v;
  }
});

export const StorageKeys = {
  HAS_ONBOARDED: "has_onboarded",
  SELECTED_SPEAKER: "selected_speaker",
  LAST_PLAYED_STORY: "last_played_story",
  PLAYBACK_SPEED: "playback_speed",
  LOCAL_PROGRESS: "local_progress",
  STREAK_DATA: "streak_data",
  IS_SUBSCRIBED: "is_subscribed",
  LIKES: "likes",
} as const;

// --- Progress ---

export interface StoryProgress {
  position: number;
  duration: number;
  completed: boolean;
  lastPlayedAt?: string;
}

export function getLocalProgress(): Record<string, StoryProgress> {
  const raw = storage.getString(StorageKeys.LOCAL_PROGRESS);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function setLocalProgress(
  storyId: string,
  position: number,
  completed: boolean,
  duration?: number
) {
  const progress = getLocalProgress();
  progress[storyId] = {
    position,
    duration: duration ?? progress[storyId]?.duration ?? 0,
    completed,
    lastPlayedAt: new Date().toISOString(),
  };
  storage.set(StorageKeys.LOCAL_PROGRESS, JSON.stringify(progress));
}

export function getOverallProgress(totalStories: number): {
  listenedCount: number;
  completedCount: number;
  percent: number;
} {
  const progress = getLocalProgress();
  const entries = Object.values(progress);
  const completedCount = entries.filter((p) => p.completed).length;
  return {
    listenedCount: entries.length,
    completedCount,
    percent: totalStories > 0 ? Math.round((completedCount / totalStories) * 100) : 0,
  };
}

// --- Likes ---

export function getLikes(): string[] {
  const raw = storage.getString(StorageKeys.LIKES);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleLike(storyId: string): boolean {
  const likes = getLikes();
  const idx = likes.indexOf(storyId);
  if (idx >= 0) {
    likes.splice(idx, 1);
  } else {
    likes.push(storyId);
  }
  storage.set(StorageKeys.LIKES, JSON.stringify(likes));
  return idx < 0;
}

export function isLiked(storyId: string): boolean {
  return getLikes().includes(storyId);
}

// --- Streaks ---

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
}

export function getStreakData(): StreakData {
  const raw = storage.getString(StorageKeys.STREAK_DATA);
  if (!raw) return { currentStreak: 0, longestStreak: 0, lastCheckIn: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastCheckIn: null };
  }
}

export function recordStreakCheckIn(): StreakData {
  const data = getStreakData();
  const today = new Date().toISOString().slice(0, 10);

  if (data.lastCheckIn === today) return data;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const isConsecutive = data.lastCheckIn === yesterday;

  const newStreak = isConsecutive ? data.currentStreak + 1 : 1;
  const updated: StreakData = {
    currentStreak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastCheckIn: today,
  };

  storage.set(StorageKeys.STREAK_DATA, JSON.stringify(updated));
  return updated;
}
