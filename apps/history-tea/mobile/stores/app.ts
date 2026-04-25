import { create } from "zustand";
import { getSeedStories, type CatalogStory } from "@/lib/content";
import { storage, StorageKeys, getLocalProgress, getStreakData, setLocalProgress } from "@/lib/storage";
import { api } from "@/lib/api";
import { checkSubscription } from "@/lib/purchases";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "app_data_cache_v2_history";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min — background refresh if stale

const DEMO_MODE = false;

export interface StoryWithCover extends CatalogStory {
  cover_image_url: string | null;
  apiId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  cover_image_url?: string;
  stories: StoryWithCover[];
}

interface ProgressEntry {
  story_id: string;
  position_seconds: number;
  completed: number;
}

interface StreakInfo {
  current_streak: number;
  max_streak: number;
  last_listen_date: string | null;
}

interface CachedData {
  stories: StoryWithCover[];
  storyOfTheDay: StoryWithCover | null;
  playlists: Playlist[];
  characters: any[];
  recentStories: StoryWithCover[];
  seasons: any[];
  speakers: any[];
  cachedAt: number;
}

interface AppState {
  stories: StoryWithCover[];
  storyOfTheDay: StoryWithCover | null;
  playlists: Playlist[];
  characters: any[];
  recentStories: StoryWithCover[];
  isLoading: boolean;
  isSubscribed: boolean;
  seasons: any[];
  speakers: any[];
  selectedSpeaker: any | null;

  likedStoryIds: string[];
  completedStoryIds: string[];
  progressMap: Record<string, ProgressEntry>;
  streak: StreakInfo;
  progressVersion: number;

  loadInitialData: () => Promise<void>;
  loadRemoteData: () => Promise<void>;
  loadUserData: () => Promise<void>;
  toggleLike: (storyId: string) => Promise<void>;
  markCompleted: (storyId: string) => void;
  bumpProgress: () => void;
  setSpeaker: (speaker: any) => void;
  setSubscribed: (subscribed: boolean) => void;
  refreshSubscription: () => Promise<void>;
}

const seedIdToLocalId: Record<string, string> = {};
for (const s of getSeedStories()) {
  if (s.seedId) seedIdToLocalId[s.seedId] = s.id;
}

function apiStoryToCover(s: any): StoryWithCover {
  const localId = seedIdToLocalId[s.id] ?? s.slug ?? s.id;
  return {
    id: localId,
    apiId: s.id,
    title: s.title,
    description: s.description ?? "",
    bibleRef: s.bible_ref ?? s.bibleRef ?? "",
    section: s.season_name ?? s.section ?? "",
    testament: s.testament ?? "",
    order: s.sort_order ?? s.order ?? 0,
    cover_image_url: s.cover_image_url ?? null,
  };
}

async function loadCache(): Promise<CachedData | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveCache(data: Omit<CachedData, "cachedAt">) {
  try {
    const payload: CachedData = { ...data, cachedAt: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {}
}

export const useAppStore = create<AppState>((set, get) => ({
  stories: [],
  storyOfTheDay: null,
  playlists: [],
  characters: [],
  recentStories: [],
  isLoading: true,
  isSubscribed: false,
  seasons: [],
  speakers: [],
  selectedSpeaker: null,

  likedStoryIds: [],
  completedStoryIds: [],
  progressMap: {},
  streak: { current_streak: 0, max_streak: 0, last_listen_date: null },
  progressVersion: 0,

  loadInitialData: async () => {
    const subscribed = storage.getBoolean(StorageKeys.IS_SUBSCRIBED) ?? false;

    let localLikes: string[] = [];
    try {
      const raw = storage.getString(StorageKeys.LIKES);
      if (raw) localLikes = JSON.parse(raw);
    } catch {}

    const localProgress = getLocalProgress();
    const localCompleted = Object.entries(localProgress)
      .filter(([, p]) => p.completed)
      .map(([id]) => id);

    const localStreak = getStreakData();

    set({
      isSubscribed: subscribed,
      likedStoryIds: localLikes,
      completedStoryIds: localCompleted,
      streak: {
        current_streak: localStreak.currentStreak,
        max_streak: localStreak.longestStreak,
        last_listen_date: localStreak.lastCheckIn,
      },
      isLoading: true,
    });

    try {
      const cached = await loadCache();
      if (cached && cached.stories?.length) {
        set({
          stories: cached.stories,
          storyOfTheDay: cached.storyOfTheDay,
          playlists: cached.playlists,
          characters: cached.characters,
          recentStories: cached.recentStories,
          seasons: cached.seasons,
          speakers: cached.speakers,
          isLoading: false,
        });
      }
    } catch {}

    await get().loadRemoteData();
  },

  loadRemoteData: async () => {
    try {
      const storiesP = api.getStories().then((res) => {
        if (res.stories?.length) {
          const mapped = res.stories.map(apiStoryToCover);
          set({ stories: mapped, isLoading: false });
          return mapped;
        }
        return null;
      }).catch(() => null);

      const sotdP = api.getStoryOfTheDay().then((res) => {
        if (res.story) {
          const mapped = apiStoryToCover(res.story);
          set({ storyOfTheDay: mapped });
          return mapped;
        }
        return null;
      }).catch(() => null);

      const playlistsP = api.getPlaylists().then(async (res) => {
        if (!res.playlists?.length) return null;
        const plResults = await Promise.allSettled(
          res.playlists.map(async (pl: any) => {
            const detail = await api.getPlaylist(pl.id);
            return {
              id: pl.id,
              name: pl.name,
              cover_image_url: pl.cover_image_url,
              stories: detail.stories.map(apiStoryToCover),
            } as Playlist;
          }),
        );
        const apiPlaylists = plResults
          .filter((r): r is PromiseFulfilledResult<Playlist> => r.status === "fulfilled")
          .map((r) => r.value)
          .filter((p) => p.stories.length > 0);
        if (apiPlaylists.length) {
          set({ playlists: apiPlaylists });
          return apiPlaylists;
        }
        return null;
      }).catch(() => null);

      const seasonsP = api.getSeasons().then((res) => {
        if (res.seasons?.length) { set({ seasons: res.seasons }); return res.seasons; }
        return null;
      }).catch(() => null);

      const speakersP = api.getSpeakers().then((res) => {
        if (res.speakers?.length) { set({ speakers: res.speakers }); return res.speakers; }
        return null;
      }).catch(() => null);

      const charsP = api.getCharacters().then((res) => {
        if (res.characters?.length) { set({ characters: res.characters }); return res.characters; }
        return null;
      }).catch(() => null);

      const recentP = api.getRecentStories().then((res) => {
        if (res.stories?.length) {
          const mapped = res.stories.map(apiStoryToCover);
          set({ recentStories: mapped });
          return mapped;
        }
        return null;
      }).catch(() => null);

      const [stories, sotd, playlists, seasons, speakers, chars, recent] =
        await Promise.all([storiesP, sotdP, playlistsP, seasonsP, speakersP, charsP, recentP]);

      set({ isLoading: false });

      if (DEMO_MODE) {
        const allStories = stories ?? get().stories;
        if (allStories.length > 0) {
          const ids = allStories.map((s: StoryWithCover) => s.id);
          const completedIds = ids.slice(0, Math.min(18, ids.length));
          const likedIds = ids.slice(0, Math.min(12, ids.length));
          const inProgressIds = ids.slice(completedIds.length, completedIds.length + 4);
          const progressEntries: Record<string, ProgressEntry> = {};
          for (const id of completedIds) {
            progressEntries[id] = { story_id: id, position_seconds: 300, completed: 1 };
          }
          for (const id of inProgressIds) {
            progressEntries[id] = { story_id: id, position_seconds: 120, completed: 0 };
          }
          for (const id of completedIds) {
            setLocalProgress(id, 300, true, 300);
          }
          const percentages = [0.65, 0.40, 0.80, 0.25];
          inProgressIds.forEach((id: string, i: number) => {
            const dur = 300;
            const pos = Math.round(dur * percentages[i % percentages.length]);
            setLocalProgress(id, pos, false, dur);
          });
          set({
            completedStoryIds: completedIds,
            likedStoryIds: likedIds,
            progressMap: progressEntries,
            streak: { current_streak: 12, max_streak: 24, last_listen_date: new Date().toISOString().split("T")[0] },
            isSubscribed: true,
          });
        }
      }

      const state = get();
      saveCache({
        stories: stories ?? state.stories,
        storyOfTheDay: sotd ?? state.storyOfTheDay,
        playlists: playlists ?? state.playlists,
        characters: chars ?? state.characters,
        recentStories: recent ?? state.recentStories,
        seasons: seasons ?? state.seasons,
        speakers: speakers ?? state.speakers,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  loadUserData: async () => {
    if (DEMO_MODE) return;
    try {
      const [likesRes, progressRes, streakRes] = await Promise.allSettled([
        api.getLikes(),
        api.getProgress(),
        api.getStreak(),
      ]);

      const updates: Partial<AppState> = {};

      if (likesRes.status === "fulfilled") {
        updates.likedStoryIds = likesRes.value.likes;
      }
      if (progressRes.status === "fulfilled") {
        const map: Record<string, ProgressEntry> = {};
        for (const p of progressRes.value.progress) {
          map[p.story_id] = p;
        }
        updates.progressMap = map;
        updates.completedStoryIds = Object.values(map)
          .filter((p) => p.completed)
          .map((p) => p.story_id);
      }
      if (streakRes.status === "fulfilled") {
        updates.streak = streakRes.value;
      }

      set(updates);
    } catch {}
  },

  toggleLike: async (storyId) => {
    const prev = get().likedStoryIds;
    const isLiked = prev.includes(storyId);
    const updated = isLiked
      ? prev.filter((id) => id !== storyId)
      : [...prev, storyId];

    set({ likedStoryIds: updated });
    storage.set(StorageKeys.LIKES, JSON.stringify(updated));

    try {
      await api.toggleLike(storyId);
    } catch {}
  },

  markCompleted: (storyId) => {
    const prev = get().completedStoryIds;
    if (!prev.includes(storyId)) {
      set({ completedStoryIds: [...prev, storyId] });
    }
  },

  bumpProgress: () => set({ progressVersion: get().progressVersion + 1 }),

  setSpeaker: (speaker) => set({ selectedSpeaker: speaker }),
  setSubscribed: (subscribed) => {
    storage.set(StorageKeys.IS_SUBSCRIBED, subscribed);
    set({ isSubscribed: subscribed });
  },
  refreshSubscription: async () => {
    const active = await checkSubscription();
    if (active !== null) {
      storage.set(StorageKeys.IS_SUBSCRIBED, active);
      set({ isSubscribed: active });
    }
  },
}));
