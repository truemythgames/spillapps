import { create } from "zustand";
import { storage, StorageKeys, findLocalProgress, setLocalProgress, recordStreakCheckIn, recordPrayerStreakCheckIn, isPrayerPlayerId, listHasId } from "@/lib/storage";
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
let completingStoryId: string | null = null;
let seekTargetSec: number | null = null;
let playGen = 0;
const SAVE_INTERVAL_SEC = 5;
export const SKIP_SECONDS = 10;

function beginSeek(next: number) {
  seekTargetSec = next;
  lastSavedPosition = next;
}

function shouldDropStatusTick(position: number) {
  if (seekTargetSec == null) return false;
  if (Math.abs(position - seekTargetSec) > 1.25) return true;
  seekTargetSec = null;
  return false;
}

async function applyNativeSeek(next: number) {
  if (!sound) return;
  const millis = Math.round(next * 1000);
  try {
    await sound.setPositionAsync(millis);
  } catch {
    try {
      await sound.setStatusAsync({
        positionMillis: millis,
        shouldPlay: usePlayerStore.getState().isPlaying,
      });
    } catch {}
  }
}

function durationFromAv(status: any): number {
  // playableDurationMillis is only the buffered window. Using it made
  // every story look a few seconds long and complete immediately.
  const ms = Number(status?.durationMillis);
  if (Number.isFinite(ms) && ms >= 500) return ms / 1000;
  return 0;
}

function adoptDuration(incoming: number, current: number) {
  if (!(incoming > 0)) return current;
  if (!(current > 0)) return incoming;
  if (incoming < current * 0.5) return current;
  return Math.max(incoming, current);
}

function knownDurationFrom(savedDur: number, catalogDur: number) {
  if (catalogDur >= 5) {
    if (savedDur >= catalogDur * 0.5) return Math.max(savedDur, catalogDur);
    return catalogDur;
  }
  return savedDur >= 5 ? savedDur : 0;
}

function applyAvStatus(status: any, gen: number, source: "callback" | "poll") {
  if (gen !== playGen) return;
  if (!status?.isLoaded) return;
  const pos = Number(status.positionMillis || 0) / 1000;
  const dur = durationFromAv(status);
  usePlayerStore.getState().updatePosition(pos, dur);
  if (status.isBuffering !== undefined) {
    usePlayerStore.getState().setBuffering(!!status.isBuffering);
  }
  // getStatusAsync can report a sticky didJustFinish. Polls must ignore it
  // or prayer controls die and duration never lands.
  if (status.didJustFinish && source === "callback") {
    if (dur <= 0 && pos < 1) return;
    usePlayerStore.getState().setPlaying(false);
    if (sound) {
      try { sound.pauseAsync(); } catch {}
    }
    usePlayerStore.getState().completeCurrent();
  }
}

async function pumpStatus(gen: number) {
  while (gen === playGen && sound) {
    try {
      applyAvStatus(await sound.getStatusAsync(), gen, "poll");
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
}
/** A listen counts as completed once the playhead reaches this fraction. */
export const COMPLETED_FRACTION = 0.95;

function syncNowPlaying(state: { currentStory: any; currentSpeaker: any; position: number; duration: number; isPlaying: boolean; playbackSpeed: number }) {
  if (!NowPlaying || !state.currentStory) return;
  const now = Date.now();
  if (now - nowPlayingThrottle < 1000) return;
  nowPlayingThrottle = now;
  const info = {
    title: state.currentStory.title ?? "Bible Tea",
    artist: state.currentSpeaker?.name ?? "Bible Tea",
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

  play: (story: any, speaker: any, audioUrl: string) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  skipForward: (seconds?: number) => Promise<void>;
  skipBackward: (seconds?: number) => Promise<void>;
  setSpeed: (speed: number) => void;
  updatePosition: (position: number, duration: number) => void;
  setBuffering: (buffering: boolean) => void;
  setPlaying: (playing: boolean) => void;
  hideMini: boolean;
  setHideMini: (hide: boolean) => void;
  syncProgress: () => Promise<void>;
  completeCurrent: () => void;
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

  play: async (story, speaker, audioUrl) => {
    console.log("[NP] play() called:", story?.title, "audio:", !!Audio);
    if (!Audio) return;
    const gen = ++playGen;
    try {
      const prev = get();
      if (prev.currentStory && prev.currentStory.id !== story.id && prev.position > 0) {
        const wasCompleted = listHasId(useAppStore.getState().completedStoryIds, prev.currentStory.id, ...(prev.currentStory.progressAliases ?? []));
        const done = wasCompleted || (prev.duration > 0 && prev.position / prev.duration >= COMPLETED_FRACTION);
        setLocalProgress(prev.currentStory.id, prev.position, done, prev.duration);
      }

      const aliases = Array.isArray(story.progressAliases) ? story.progressAliases : [];
      const savedProgress = findLocalProgress(story.id, ...aliases);
      const startPos = savedProgress && !savedProgress.completed && savedProgress.position > 0
        ? savedProgress.position * 1000
        : 0;
      const catalogDur = Number(story.duration_seconds) || 0;
      const savedDur = Number(savedProgress?.duration) || 0;
      const knownDuration = knownDurationFrom(savedDur, catalogDur);

      if (sound) {
        try { await sound.stopAsync(); } catch {}
        try { await sound.unloadAsync(); } catch {}
        sound = null;
      }
      if (gen !== playGen) return;

      lastSavedPosition = startPos / 1000;
      completingStoryId = null;
      seekTargetSec = null;

      set({
        currentStory: story,
        currentSpeaker: speaker,
        audioUrl,
        isPlaying: false,
        isBuffering: true,
        position: startPos / 1000,
        duration: knownDuration,
      });

      storage.set(
        StorageKeys.LAST_PLAYED_STORY,
        JSON.stringify({ storyId: story.id, speakerId: speaker.id })
      );

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, rate: get().playbackSpeed, shouldCorrectPitch: true, pitchCorrectionQuality: Audio.PitchCorrectionQuality?.High, positionMillis: startPos },
        (status: any) => applyAvStatus(status, gen, "callback")
      );

      if (gen !== playGen) {
        try { await newSound.unloadAsync(); } catch {}
        return;
      }

      sound = newSound;
      try {
        await newSound.setProgressUpdateIntervalAsync(250);
      } catch {}
      let loadedDuration = knownDuration;
      try {
        const loaded = await newSound.getStatusAsync();
        applyAvStatus(loaded, gen, "poll");
        if (loaded.isLoaded) {
          loadedDuration = adoptDuration(durationFromAv(loaded), knownDuration);
        }
      } catch {}
      if (gen !== playGen) return;
      console.log("[NP] audio loaded, setting playing");
      set({
        isPlaying: true,
        isBuffering: false,
        duration: adoptDuration(loadedDuration, get().duration),
      });
      void pumpStatus(gen);

      nowPlayingThrottle = 0;
      syncNowPlaying({ currentStory: story, currentSpeaker: speaker, position: startPos / 1000, duration: loadedDuration, isPlaying: true, playbackSpeed: get().playbackSpeed });
    } catch (err) {
      console.warn("[NP] Audio playback error:", err);
      if (gen === playGen && !sound) {
        set({ isBuffering: false, isPlaying: false });
      }
    }
  },

  stop: async () => {
    playGen += 1;
    const { currentStory: s, currentSpeaker: sp, position: pos, duration: dur } = get();
    if (s && pos > 0) {
      const wasCompleted = listHasId(useAppStore.getState().completedStoryIds, s.id, ...(s.progressAliases ?? []));
      const done = wasCompleted || (dur > 0 && pos / dur >= COMPLETED_FRACTION);
      setLocalProgress(s.id, pos, done, dur);
      useAppStore.getState().bumpProgress();
      if (done) {
        useAppStore.getState().markCompleted(s.id);
        if (isPrayerPlayerId(s.id)) {
          recordPrayerStreakCheckIn();
        } else {
          const localStreak = recordStreakCheckIn();
          useAppStore.setState({
            streak: { current_streak: localStreak.currentStreak, max_streak: localStreak.longestStreak, last_listen_date: localStreak.lastCheckIn },
          });
        }
      }
      if (sp && !isPrayerPlayerId(s.id)) {
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
    if (sound) {
      try { await sound.pauseAsync(); } catch {}
    }
    set({ isPlaying: false, isBuffering: false });
    nowPlayingThrottle = 0;
    syncNowPlaying({ ...get(), isPlaying: false });
    get().syncProgress();
  },

  resume: async () => {
    const { position, duration } = get();
    const nearEnd = duration > 0 && position >= Math.max(0, duration - 0.75);
    const pos = nearEnd ? 0 : position;
    if (nearEnd) completingStoryId = null;
    beginSeek(pos);
    set({ position: pos, isPlaying: true });
    if (sound) {
      try {
        await sound.setStatusAsync({
          positionMillis: Math.round(pos * 1000),
          shouldPlay: true,
        });
      } catch {
        try {
          await sound.setPositionAsync(Math.round(pos * 1000));
          await sound.playAsync();
        } catch {
          try { await sound.playAsync(); } catch {}
        }
      }
    }
    nowPlayingThrottle = 0;
    syncNowPlaying({ ...get(), isPlaying: true });
  },

  seekTo: async (seconds) => {
    const duration = get().duration;
    const next =
      duration > 0 ? Math.max(0, Math.min(seconds, duration)) : Math.max(0, seconds);
    beginSeek(next);
    set({ position: next });
    await applyNativeSeek(next);
  },

  skipForward: async (seconds = SKIP_SECONDS) => {
    const { position, duration } = get();
    const newPos = duration > 0 ? Math.min(position + seconds, duration) : position + seconds;
    await get().seekTo(newPos);
  },

  skipBackward: async (seconds = SKIP_SECONDS) => {
    const { position } = get();
    await get().seekTo(Math.max(position - seconds, 0));
  },

  setSpeed: (speed) => {
    if (sound) {
      try { sound.setRateAsync(speed, true); } catch {}
    }
    storage.set(StorageKeys.PLAYBACK_SPEED, speed);
    set({ playbackSpeed: speed });
  },

  updatePosition: (position, duration) => {
    const prevDuration = get().duration;
    const nextDuration = adoptDuration(duration, prevDuration);
    if (shouldDropStatusTick(position)) {
      if (nextDuration > 0 && nextDuration !== prevDuration) {
        set({ duration: nextDuration });
      }
      return;
    }
    // Only freeze the playhead after the user paused. During load
    // (buffering) we still need duration + position or the bar stays at 0.
    if (!get().isPlaying && !get().isBuffering) {
      if (nextDuration > 0 && nextDuration !== prevDuration) {
        set({ duration: nextDuration });
      }
      return;
    }
    const clamped =
      nextDuration > 0 ? Math.max(0, Math.min(position, nextDuration)) : Math.max(0, position);
    set({ position: clamped, duration: nextDuration });
    const state = get();
    if (!state.currentStory || nextDuration < 5) return;
    const catalog = Number(state.currentStory.duration_seconds) || 0;
    if (catalog >= 5 && nextDuration < catalog * 0.5) return;
    if (clamped / nextDuration >= COMPLETED_FRACTION) {
      get().completeCurrent();
      return;
    }
    if (state.isPlaying && clamped > 0) {
      syncNowPlaying(state);
      if (Math.abs(clamped - lastSavedPosition) >= SAVE_INTERVAL_SEC) {
        lastSavedPosition = clamped;
        setLocalProgress(state.currentStory.id, clamped, false, Math.max(nextDuration, catalog));
        useAppStore.getState().bumpProgress();
      }
    }
  },

  setBuffering: (buffering) => set({ isBuffering: buffering }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  hideMini: false,
  setHideMini: (hide) => set({ hideMini: hide }),

  completeCurrent: () => {
    const { currentStory, currentSpeaker, position, duration, isPlaying } = get();
    if (!currentStory) return;
    if (completingStoryId === currentStory.id) return;
    completingStoryId = currentStory.id;

    const end = duration > 0 ? duration : Math.max(position, 0);
    // Natural finish already paused. The 95% mark only records completion —
    // do not jump the bar or freeze controls while audio is still playing.
    if (!isPlaying) {
      set({ position: end, isPlaying: false });
    }

    const wasNew = !listHasId(useAppStore.getState().completedStoryIds, currentStory.id, ...(currentStory.progressAliases ?? []));
    setLocalProgress(currentStory.id, isPlaying ? position : end, true, end || duration);
    lastSavedPosition = end;
    useAppStore.getState().markCompleted(currentStory.id);
    if (wasNew && isPrayerPlayerId(currentStory.id)) {
      recordPrayerStreakCheckIn();
    } else if (wasNew) {
      const localStreak = recordStreakCheckIn();
      useAppStore.setState({
        streak: {
          current_streak: localStreak.currentStreak,
          max_streak: localStreak.longestStreak,
          last_listen_date: localStreak.lastCheckIn,
        },
      });
    }
    useAppStore.getState().bumpProgress();
    if (currentSpeaker && !isPrayerPlayerId(currentStory.id)) {
      api
        .updateProgress(currentStory.id, {
          speaker_id: currentSpeaker.id,
          position_seconds: end,
          completed: true,
        })
        .catch(() => {});
    }
  },

  syncProgress: async () => {
    const { currentStory, currentSpeaker, position, duration } = get();
    if (!currentStory || !currentSpeaker) return;

    const wasCompleted = listHasId(useAppStore.getState().completedStoryIds, currentStory.id, ...(currentStory.progressAliases ?? []));
    const completed = wasCompleted || (duration > 0 && position / duration >= COMPLETED_FRACTION);
    // Never persist a 0:00 snapshot after finish — that is what made
    // a just-ended story look like 0% done.
    if (!completed && position <= 0) return;
    setLocalProgress(currentStory.id, position, completed, duration);
    useAppStore.getState().bumpProgress();

    if (completed) {
      useAppStore.getState().markCompleted(currentStory.id);
      if (isPrayerPlayerId(currentStory.id)) {
        recordPrayerStreakCheckIn();
      } else {
        const localStreak = recordStreakCheckIn();
        useAppStore.setState({
          streak: {
            current_streak: localStreak.currentStreak,
            max_streak: localStreak.longestStreak,
            last_listen_date: localStreak.lastCheckIn,
          },
        });
      }
    }

    if (isPrayerPlayerId(currentStory.id)) return;

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
    NowPlaying.onRemoteSkipForward(() => { console.log("[NP] remote: fwd"); usePlayerStore.getState().skipForward(SKIP_SECONDS); });
    NowPlaying.onRemoteSkipBackward(() => { console.log("[NP] remote: back"); usePlayerStore.getState().skipBackward(SKIP_SECONDS); });
    NowPlaying.onRemoteSeek((e: { position: number }) => { console.log("[NP] remote: seek", e.position); usePlayerStore.getState().seekTo(e.position); });
    console.log("[NP] setupPlayer: done");
  } else {
    console.log("[NP] setupPlayer: NowPlaying is NULL, skipping");
  }
}
