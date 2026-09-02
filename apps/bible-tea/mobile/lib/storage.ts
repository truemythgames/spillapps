import AsyncStorage from "@react-native-async-storage/async-storage";

const memoryCache: Record<string, string> = {};

export const StorageKeys = {
  HAS_ONBOARDED: "has_onboarded",
  SELECTED_SPEAKER: "selected_speaker",
  LAST_PLAYED_STORY: "last_played_story",
  PLAYBACK_SPEED: "playback_speed",
  LOCAL_PROGRESS: "local_progress",
  STREAK_DATA: "streak_data",
  LIKES: "likes",
  HAS_SEEN_INITIAL_OFFER: "has_seen_initial_offer",
  PRAYER_STREAK_DATA: "prayer_streak_data",
  WIDGET_PROMPT_DISMISSED: "widget_prompt_dismissed",
  HAS_REQUESTED_REVIEW: "has_requested_review",
  LAUNCH_COUNT: "launch_count",
} as const;

export function isPrayerPlayerId(id: string) {
  return typeof id === "string" && id.startsWith("prayer-");
}

export function prayerRouteId(playerId: string) {
  return isPrayerPlayerId(playerId) ? playerId.slice("prayer-".length) : playerId;
}

/** Stable player id so slug and canonical prayer id share one session. */
export function prayerPlayerId(prayer: { id?: string; slug?: string } | null, routeId?: string) {
  const key = prayer?.slug || prayer?.id || routeId || "";
  return key ? `prayer-${key}` : "";
}

export function isSamePrayerPlayer(
  playerId: string | undefined,
  prayer: { id?: string; slug?: string } | null,
  routeId?: string
) {
  if (!playerId || !isPrayerPlayerId(playerId)) return false;
  const raw = prayerRouteId(playerId);
  return raw === routeId || raw === prayer?.id || raw === prayer?.slug;
}

export function prayerAliasIds(
  prayer: { id?: string; slug?: string } | null,
  routeId?: string
) {
  return [...new Set(
    [prayerPlayerId(prayer, routeId), prayer?.id && `prayer-${prayer.id}`, prayer?.slug && `prayer-${prayer.slug}`, routeId && `prayer-${routeId}`]
      .filter((id): id is string => !!id)
  )];
}

export function storyAliasIds(
  story?: { id?: string; slug?: string; apiId?: string } | null,
  ...extra: (string | undefined)[]
) {
  return [...new Set([story?.id, story?.slug, story?.apiId, ...extra].filter((id): id is string => !!id))];
}

export function listHasId(list: string[] | undefined, ...ids: (string | undefined | null)[]) {
  if (!list?.length) return false;
  return ids.some((id) => !!id && list.includes(id));
}

export function findLocalProgress(...ids: (string | undefined | null)[]): StoryProgress | undefined {
  const progress = getLocalProgress();
  let best: StoryProgress | undefined;
  for (const id of ids) {
    if (!id) continue;
    const next = progress[id];
    if (!next) continue;
    if (!best) {
      best = next;
      continue;
    }
    if (next.completed && !best.completed) best = next;
    else if (!best.completed && next.position > best.position) best = next;
  }
  return best;
}

const HYDRATE_KEYS = Object.values(StorageKeys);

let hydratePromise: Promise<void> | null = null;

/**
 * Load persisted keys into memory before any reads.
 * Must be awaited on app start — otherwise progress shows 0% forever.
 */
export function hydrateStorage(): Promise<void> {
  if (hydratePromise) return hydratePromise;
  hydratePromise = AsyncStorage.multiGet(HYDRATE_KEYS).then((pairs) => {
    for (const [k, v] of pairs) {
      // Don't clobber values written before hydrate finished.
      if (v !== null && memoryCache[k] === undefined) {
        memoryCache[k] = v;
      }
    }
    // Legacy unlock flag — never use disk as subscription source of truth.
    delete memoryCache["is_subscribed"];
    AsyncStorage.removeItem("is_subscribed").catch(() => {});
  });
  return hydratePromise;
}

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
  const prev = progress[storyId];
  progress[storyId] = {
    position,
    duration: duration ?? prev?.duration ?? 0,
    // Once completed, stay completed.
    completed: Boolean(completed || prev?.completed),
    lastPlayedAt: new Date().toISOString(),
  };
  storage.set(StorageKeys.LOCAL_PROGRESS, JSON.stringify(progress));
}

export function getCompletedStoryIds(): string[] {
  return Object.entries(getLocalProgress())
    .filter(([, p]) => p.completed)
    .map(([id]) => id);
}

/** Stored oldest-first; screens show newest first. */
export function newestFirst(ids: string[]): string[] {
  return ids.slice().reverse();
}

/**
 * With ~260 stories a single completion rounds to 0%, which reads as "my
 * progress wasn't saved". Anything completed shows at least 1%.
 */
export function completionPercent(completed: number, total: number): number {
  if (total <= 0 || completed <= 0) return 0;
  return Math.max(1, Math.round((completed / total) * 100));
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

function recordCheckIn(key: string): StreakData {
  const raw = storage.getString(key);
  let data: StreakData = { currentStreak: 0, longestStreak: 0, lastCheckIn: null };
  if (raw) {
    try { data = JSON.parse(raw); } catch {}
  }
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
  storage.set(key, JSON.stringify(updated));
  return updated;
}

export function recordStreakCheckIn(): StreakData {
  return recordCheckIn(StorageKeys.STREAK_DATA);
}

export function getPrayerStreakData(): StreakData {
  const raw = storage.getString(StorageKeys.PRAYER_STREAK_DATA);
  if (!raw) return { currentStreak: 0, longestStreak: 0, lastCheckIn: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastCheckIn: null };
  }
}

export function recordPrayerStreakCheckIn(): StreakData {
  return recordCheckIn(StorageKeys.PRAYER_STREAK_DATA);
}
