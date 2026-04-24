import { create } from "zustand";
import { storage, StorageKeys, getLocalProgress, setLocalProgress, recordStreakCheckIn } from "@/lib/storage";
import { api } from "@/lib/api";
import { useAppStore } from "./app";

let Audio: any = null;
try { Audio = require("expo-av").Audio; } catch {}

let NowPlaying: any = null;
try {
  NowPlaying = require("@/modules/now-playing");
  const { NativeModules } = require("react-native");
  console.log("[NP] Bridge:", NativeModules.NowPlayingBridge ? "OK" : "NULL");
} catch (e: any) {
  console.log("[NP] require failed:", e?.message);
}

let sound: any = null;
let lastSavedPosition = 0;
let nowPlayingThrottle = 0;
const SAVE_INTERVAL_SEC = 5;

function syncNowPlaying(state: { currentStory: any; currentSpeaker: any; position: number; duration: number; isPlaying: boolean; playbackSpeed: number }) {
  if (!NowPlaying || !state.currentStory) return;
  const now = Date.now();
  if (now - nowPlayingThrottle < 1000) return;
  nowPlayingThrottle = now;
  const info = {
    title: state.currentStory.title ?? "History Tea",
    artist: state.currentSpeaker?.name ?? "History Tea",
    duration: state.duration,
    position: state.position,
    rate: state.isPlaying ? state.playbackSpeed : 0,
    artworkUrl: state.currentStory.cover_image_url ?? undefined,
  };
  console.log("[NP] updateNowPlaying:", info.title, "rate:", info.rate);
  NowPlaying.updateNowPlaying(info);
}

interface PlayerState {
  currentStory: any | null;
  currentSpeaker: any | null;
  audioUrl: string | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  isBuffering: boolean;
  playbackSpeed: number;
  queue: any[];
  queueIndex: number;

  play: (story: any, speaker: any, audioUrl: string) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  skipForward: (seconds?: number) => Promise<void>;
  skipBackward: (seconds?: number) => Promise<void>;
  setSpeed: (speed: number) => void;
  setQueue: (stories: any[], startIndex: number) => void;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  updatePosition: (position: number, duration: number) => void;
  setBuffering: (buffering: boolean) => void;
  setPlaying: (playing: boolean) => void;
  hideMini: boolean;
  setHideMini: (hide: boolean) => void;
  syncProgress: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentStory: null,
  currentSpeaker: null,
  audioUrl: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  isBuffering: false,
  playbackSpeed: storage.getNumber(StorageKeys.PLAYBACK_SPEED) || 1.0,
  queue: [],
  queueIndex: 0,

  play: async (story, speaker, audioUrl) => {
    console.log("[NP] play() called:", story?.title, "audio:", !!Audio);
    if (!Audio) return;
    try {
      const prev = get();
      if (prev.currentStory && prev.position > 0) {
        const wasCompleted = useAppStore.getState().completedStoryIds.includes(prev.currentStory.id);
        const done = wasCompleted || (prev.duration > 0 && prev.position / prev.duration >= 0.97);
        setLocalProgress(prev.currentStory.id, prev.position, done, prev.duration);
      }

      const savedProgress = getLocalProgress()[story.id];
      const startPos = savedProgress && !savedProgress.completed && savedProgress.position > 0
        ? savedProgress.position * 1000
        : 0;

      set({
        currentStory: story,
        currentSpeaker: speaker,
        audioUrl,
        isPlaying: false,
        isBuffering: true,
        position: startPos / 1000,
        duration: 0,
      });

      storage.set(
        StorageKeys.LAST_PLAYED_STORY,
        JSON.stringify({ storyId: story.id, speakerId: speaker.id })
      );

      if (sound) {
        try { await sound.stopAsync(); } catch {}
        try { await sound.unloadAsync(); } catch {}
        sound = null;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
      });

      lastSavedPosition = startPos / 1000;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, rate: get().playbackSpeed, shouldCorrectPitch: true, pitchCorrectionQuality: Audio.PitchCorrectionQuality?.High, positionMillis: startPos },
        (status: any) => {
          if (!status.isLoaded) return;
          get().updatePosition(
            status.positionMillis / 1000,
            (status.durationMillis || 0) / 1000
          );
          if (status.isBuffering !== undefined) {
            get().setBuffering(status.isBuffering);
          }
          if (status.didJustFinish) {
            get().setPlaying(false);
            get().syncProgress();
          }
        }
      );

      sound = newSound;
      console.log("[NP] audio loaded, setting playing");
      set({ isPlaying: true, isBuffering: false });

      nowPlayingThrottle = 0;
      syncNowPlaying({ currentStory: story, currentSpeaker: speaker, position: startPos / 1000, duration: 0, isPlaying: true, playbackSpeed: get().playbackSpeed });
    } catch (err) {
      console.warn("[NP] Audio playback error:", err);
      if (!sound) {
        set({ isBuffering: false, isPlaying: false });
      }
    }
  },

  stop: async () => {
    const { currentStory: s, currentSpeaker: sp, position: pos, duration: dur } = get();
    if (s && pos > 0) {
      const wasCompleted = useAppStore.getState().completedStoryIds.includes(s.id);
      const done = wasCompleted || (dur > 0 && pos / dur >= 0.97);
      setLocalProgress(s.id, pos, done, dur);
      useAppStore.getState().bumpProgress();
      if (done) {
        useAppStore.getState().markCompleted(s.id);
        const localStreak = recordStreakCheckIn();
        useAppStore.setState({
          streak: { current_streak: localStreak.currentStreak, max_streak: localStreak.longestStreak, last_listen_date: localStreak.lastCheckIn },
        });
      }
      if (sp) {
        api.updateProgress(s.id, { speaker_id: sp.id, position_seconds: pos, completed: done }).catch(() => {});
      }
    }
    if (sound) {
      try { await sound.stopAsync(); } catch {}
      try { await sound.unloadAsync(); } catch {}
      sound = null;
    }
    if (NowPlaying) NowPlaying.clearNowPlaying();
    set({
      currentStory: null,
      currentSpeaker: null,
      audioUrl: null,
      isPlaying: false,
      position: 0,
      duration: 0,
    });
  },

  pause: async () => {
    if (sound) await sound.pauseAsync();
    set({ isPlaying: false });
    nowPlayingThrottle = 0;
    syncNowPlaying({ ...get(), isPlaying: false });
    get().syncProgress();
  },

  resume: async () => {
    if (sound) await sound.playAsync();
    set({ isPlaying: true });
    nowPlayingThrottle = 0;
    syncNowPlaying({ ...get(), isPlaying: true });
  },

  seekTo: async (position) => {
    if (sound) await sound.setPositionAsync(position * 1000);
    set({ position });
  },

  skipForward: async (seconds = 15) => {
    const { position, duration } = get();
    const newPos = Math.min(position + seconds, duration);
    if (sound) await sound.setPositionAsync(newPos * 1000);
    set({ position: newPos });
  },

  skipBackward: async (seconds = 15) => {
    const { position } = get();
    const newPos = Math.max(position - seconds, 0);
    if (sound) await sound.setPositionAsync(newPos * 1000);
    set({ position: newPos });
  },

  setSpeed: (speed) => {
    if (sound) sound.setRateAsync(speed, true);
    storage.set(StorageKeys.PLAYBACK_SPEED, speed);
    set({ playbackSpeed: speed });
  },

  setQueue: (stories, startIndex) => {
    set({ queue: stories, queueIndex: startIndex });
  },

  playNext: async () => {
    const { queue, queueIndex } = get();
    if (queueIndex < queue.length - 1) {
      set({ queueIndex: queueIndex + 1 });
    }
  },

  playPrevious: async () => {
    const { queueIndex, position } = get();
    if (position > 3) {
      await get().seekTo(0);
    } else if (queueIndex > 0) {
      set({ queueIndex: queueIndex - 1 });
    }
  },

  updatePosition: (position, duration) => {
    set({ position, duration });
    const state = get();
    if (state.currentStory && state.isPlaying && duration > 0 && position > 0) {
      syncNowPlaying(state);
      if (Math.abs(position - lastSavedPosition) >= SAVE_INTERVAL_SEC) {
        lastSavedPosition = position;
        const completed = position / duration >= 0.97;
        setLocalProgress(state.currentStory.id, position, completed, duration);
      }
    }
  },

  setBuffering: (buffering) => set({ isBuffering: buffering }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  hideMini: false,
  setHideMini: (hide) => set({ hideMini: hide }),

  syncProgress: async () => {
    const { currentStory, currentSpeaker, position, duration } = get();
    if (!currentStory || !currentSpeaker) return;

    const wasCompleted = useAppStore.getState().completedStoryIds.includes(currentStory.id);
    const completed = wasCompleted || (duration > 0 && position / duration >= 0.97);
    setLocalProgress(currentStory.id, position, completed, duration);
    useAppStore.getState().bumpProgress();

    if (completed) {
      useAppStore.getState().markCompleted(currentStory.id);
      const localStreak = recordStreakCheckIn();
      useAppStore.setState({
        streak: {
          current_streak: localStreak.currentStreak,
          max_streak: localStreak.longestStreak,
          last_listen_date: localStreak.lastCheckIn,
        },
      });
    }

    try {
      await api.updateProgress(currentStory.id, {
        speaker_id: currentSpeaker.id,
        position_seconds: position,
        completed,
      });
      if (completed) {
        const streakRes = await api.streakCheckin();
        useAppStore.setState({
          streak: { ...useAppStore.getState().streak, ...streakRes },
        });
      }
    } catch {
      // offline — local progress saved, will sync later
    }
  },
}));

export async function setupPlayer() {
  if (!Audio) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: 1,
    });
  } catch {}

  if (NowPlaying) {
    console.log("[NP] setupPlayer: registering remote listeners");
    try {
      const pong = await NowPlaying.ping();
      console.log("[NP] ping result:", pong);
    } catch (e: any) {
      console.log("[NP] ping FAILED:", e?.message);
    }
    NowPlaying.onRemotePlay(() => { console.log("[NP] remote: play"); usePlayerStore.getState().resume(); });
    NowPlaying.onRemotePause(() => { console.log("[NP] remote: pause"); usePlayerStore.getState().pause(); });
    NowPlaying.onRemoteSkipForward(() => { console.log("[NP] remote: fwd"); usePlayerStore.getState().skipForward(15); });
    NowPlaying.onRemoteSkipBackward(() => { console.log("[NP] remote: back"); usePlayerStore.getState().skipBackward(15); });
    NowPlaying.onRemoteSeek((e: { position: number }) => { console.log("[NP] remote: seek", e.position); usePlayerStore.getState().seekTo(e.position); });
    console.log("[NP] setupPlayer: done");
  } else {
    console.log("[NP] setupPlayer: NowPlaying is NULL, skipping");
  }
}
