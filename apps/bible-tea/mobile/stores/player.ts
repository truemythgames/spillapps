import { create } from "zustand";
import { Audio } from "expo-av";
import { storage, StorageKeys, setLocalProgress, recordStreakCheckIn } from "@/lib/storage";
import { api } from "@/lib/api";
import { useAppStore } from "./app";

let sound: Audio.Sound | null = null;

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
    try {
      if (sound) {
        await sound.unloadAsync();
        sound = null;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, rate: get().playbackSpeed },
        (status) => {
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

      set({
        currentStory: story,
        currentSpeaker: speaker,
        audioUrl,
        isPlaying: true,
      });

      storage.set(
        StorageKeys.LAST_PLAYED_STORY,
        JSON.stringify({ storyId: story.id, speakerId: speaker.id })
      );
    } catch (err) {
      console.warn("Audio playback error:", err);
    }
  },

  stop: async () => {
    get().syncProgress();
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
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
    get().syncProgress();
  },

  resume: async () => {
    if (sound) await sound.playAsync();
    set({ isPlaying: true });
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
  },

  setBuffering: (buffering) => set({ isBuffering: buffering }),
  setPlaying: (playing) => set({ isPlaying: playing }),

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
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  });
}
