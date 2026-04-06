import { create } from "zustand";
import { getSeedStories, coverUrl, type CatalogStory } from "@/lib/content";
import { storage, StorageKeys, getLocalProgress, getStreakData } from "@/lib/storage";
import { api } from "@/lib/api";
import { checkSubscription } from "@/lib/purchases";

export interface StoryWithCover extends CatalogStory {
  cover_image_url: string;
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

  loadInitialData: () => void;
  loadRemoteData: () => Promise<void>;
  loadUserData: () => Promise<void>;
  toggleLike: (storyId: string) => Promise<void>;
  markCompleted: (storyId: string) => void;
  bumpProgress: () => void;
  setSpeaker: (speaker: any) => void;
  setSubscribed: (subscribed: boolean) => void;
  refreshSubscription: () => Promise<void>;
}

function withCover(story: CatalogStory): StoryWithCover {
  return { ...story, cover_image_url: coverUrl(story.id) };
}

const seedIdToLocalId: Record<string, string> = {};
for (const s of getSeedStories()) {
  if (s.seedId) seedIdToLocalId[s.seedId] = s.id;
}

function apiStoryToCover(s: any): StoryWithCover {
  const localId = seedIdToLocalId[s.id] ?? s.slug ?? s.id;
  return {
    id: localId,
    title: s.title,
    description: s.description ?? "",
    bibleRef: s.bible_ref ?? s.bibleRef ?? "",
    section: s.season_name ?? s.section ?? "",
    testament: s.testament ?? "",
    order: s.sort_order ?? s.order ?? 0,
    cover_image_url: s.cover_image_url ?? coverUrl(localId),
  };
}

const PLAYLIST_DEFS: { id: string; name: string; match: (s: CatalogStory) => boolean }[] = [
  { id: "epic", name: "Epic Bible Moments", match: (s) => ["david-and-goliath", "crossing-the-red-sea", "noahs-ark", "the-ten-plagues", "daniel-and-the-lions-den", "jonah-and-the-whale", "samson-and-delilah", "joshua-and-jericho", "the-crucifixion", "the-resurrection", "feeding-5000", "walking-on-water"].includes(s.id) },
  { id: "heroes", name: "Heroes & Legends", match: (s) => ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "Daniel", "Esther", "Jonah"].includes(s.section) },
  { id: "exodus", name: "The Great Escape", match: (s) => ["Exodus", "Numbers", "Deuteronomy"].includes(s.section) },
  { id: "genesis", name: "Origin Stories", match: (s) => s.section === "Genesis" },
];

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

  loadInitialData: () => {
    const seeds = getSeedStories();
    const today = new Date();
    const dayIndex = Math.floor(today.getTime() / 86400000) % seeds.length;
    const sotd = seeds[dayIndex];

    const playlists: Playlist[] = PLAYLIST_DEFS
      .map((def) => ({
        id: def.id,
        name: def.name,
        stories: seeds.filter(def.match).map(withCover),
      }))
      .filter((p) => p.stories.length > 0);

    const sections = [...new Set(seeds.map((s) => s.section))];
    const seasons = sections.map((name, i) => ({
      id: `section-${i}`,
      name,
      stories: seeds.filter((s) => s.section === name).map(withCover),
    }));

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
      stories: seeds.map(withCover),
      storyOfTheDay: sotd ? withCover(sotd) : null,
      playlists,
      seasons,
      isSubscribed: subscribed,
      likedStoryIds: localLikes,
      completedStoryIds: localCompleted,
      streak: {
        current_streak: localStreak.currentStreak,
        max_streak: localStreak.longestStreak,
        last_listen_date: localStreak.lastCheckIn,
      },
      isLoading: false,
    });

    get().loadRemoteData();
  },

  loadRemoteData: async () => {
    const results = await Promise.allSettled([
      api.getStories(),
      api.getStoryOfTheDay(),
      api.getPlaylists(),
      api.getSeasons(),
      api.getSpeakers(),
      api.getCharacters(),
      api.getRecentStories(),
    ]);

    const updates: Partial<AppState> = {};

    const [storiesRes, sotdRes, playlistsRes, seasonsRes, speakersRes, charsRes, recentRes] = results;

    if (storiesRes.status === "fulfilled" && storiesRes.value.stories?.length) {
      updates.stories = storiesRes.value.stories.map(apiStoryToCover);
    }

    if (sotdRes.status === "fulfilled" && sotdRes.value.story) {
      updates.storyOfTheDay = apiStoryToCover(sotdRes.value.story);
    }

    if (playlistsRes.status === "fulfilled" && playlistsRes.value.playlists?.length) {
      const apiPlaylists: Playlist[] = [];
      for (const pl of playlistsRes.value.playlists) {
        try {
          const detail = await api.getPlaylist(pl.id);
          apiPlaylists.push({
            id: pl.id,
            name: pl.name,
            cover_image_url: pl.cover_image_url,
            stories: detail.stories.map(apiStoryToCover),
          });
        } catch {
          apiPlaylists.push({
            id: pl.id,
            name: pl.name,
            cover_image_url: pl.cover_image_url,
            stories: [],
          });
        }
      }
      if (apiPlaylists.length) {
        updates.playlists = apiPlaylists.filter((p) => p.stories.length > 0);
      }
    }

    if (seasonsRes.status === "fulfilled" && seasonsRes.value.seasons?.length) {
      updates.seasons = seasonsRes.value.seasons;
    }

    if (speakersRes.status === "fulfilled" && speakersRes.value.speakers?.length) {
      updates.speakers = speakersRes.value.speakers;
    }

    if (charsRes.status === "fulfilled" && charsRes.value.characters?.length) {
      updates.characters = charsRes.value.characters;
    }

    if (recentRes.status === "fulfilled" && recentRes.value.stories?.length) {
      updates.recentStories = recentRes.value.stories.map(apiStoryToCover);
    }

    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },

  loadUserData: async () => {
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
    } catch {
      // offline or not yet authenticated — keep defaults
    }
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
    } catch {
      // keep local state even if API fails
    }
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
