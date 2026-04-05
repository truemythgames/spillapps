import { create } from "zustand";
import { getSeedStories, coverUrl, type CatalogStory } from "@/lib/content";
import { storage, StorageKeys } from "@/lib/storage";
import { api } from "@/lib/api";
import { checkSubscription } from "@/lib/purchases";

export interface StoryWithCover extends CatalogStory {
  cover_image_url: string;
}

export interface Playlist {
  id: string;
  name: string;
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
  stories: CatalogStory[];
  storyOfTheDay: StoryWithCover | null;
  playlists: Playlist[];
  isLoading: boolean;
  isSubscribed: boolean;
  seasons: any[];
  speakers: any[];
  selectedSpeaker: any | null;

  // Cloud-synced user data
  likedStoryIds: string[];
  progressMap: Record<string, ProgressEntry>;
  streak: StreakInfo;

  loadInitialData: () => void;
  loadUserData: () => Promise<void>;
  toggleLike: (storyId: string) => Promise<void>;
  setSpeaker: (speaker: any) => void;
  setSubscribed: (subscribed: boolean) => void;
  refreshSubscription: () => Promise<void>;
}

function withCover(story: CatalogStory): StoryWithCover {
  return { ...story, cover_image_url: coverUrl(story.id) };
}

const PLAYLIST_DEFS: { id: string; name: string; match: (s: CatalogStory) => boolean }[] = [
  { id: "epic", name: "Epic Bible Moments", match: (s) => ["david-and-goliath", "crossing-the-red-sea", "noahs-ark", "the-ten-plagues", "daniel-and-the-lions-den", "jonah-and-the-whale", "samson-and-delilah", "joshua-and-jericho", "the-crucifixion", "the-resurrection", "feeding-5000", "walking-on-water"].includes(s.id) },
  {
    id: "heroes",
    name: "Heroes & Legends",
    match: (s) =>
      ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "Daniel", "Esther", "Jonah"].includes(s.section),
  },
  { id: "exodus", name: "The Great Escape", match: (s) => ["Exodus", "Numbers", "Deuteronomy"].includes(s.section) },
  { id: "genesis", name: "Origin Stories", match: (s) => s.section === "Genesis" },
];

export const useAppStore = create<AppState>((set, get) => ({
  stories: [],
  storyOfTheDay: null,
  playlists: [],
  isLoading: true,
  isSubscribed: false,
  seasons: [],
  speakers: [],
  selectedSpeaker: null,

  likedStoryIds: [],
  progressMap: {},
  streak: { current_streak: 0, max_streak: 0, last_listen_date: null },

  loadInitialData: () => {
    const seeds = getSeedStories();
    const shuffled = [...seeds].sort(() => Math.random() - 0.5);
    const sotd = shuffled[0];

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

    set({
      stories: seeds,
      storyOfTheDay: sotd ? withCover(sotd) : null,
      playlists,
      seasons,
      isSubscribed: subscribed,
      likedStoryIds: localLikes,
      isLoading: false,
    });
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
      // keep local state even if API fails (offline / unauthenticated)
    }
  },

  setSpeaker: (speaker) => set({ selectedSpeaker: speaker }),
  setSubscribed: (subscribed) => {
    storage.set(StorageKeys.IS_SUBSCRIBED, subscribed);
    set({ isSubscribed: subscribed });
  },
  refreshSubscription: async () => {
    try {
      const active = await checkSubscription();
      storage.set(StorageKeys.IS_SUBSCRIBED, active);
      set({ isSubscribed: active });
    } catch {
      // keep local cached value
    }
  },
}));
