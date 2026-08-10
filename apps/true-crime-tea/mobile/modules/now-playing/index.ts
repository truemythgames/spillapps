import { NativeModules, NativeEventEmitter, type EmitterSubscription } from "react-native";

interface NowPlayingInfo {
  title?: string;
  artist?: string;
  duration?: number;
  position?: number;
  rate?: number;
  artworkUrl?: string;
}

const { NowPlayingBridge } = NativeModules;
const emitter = NowPlayingBridge ? new NativeEventEmitter(NowPlayingBridge) : null;

export async function ping(): Promise<string | null> {
  if (!NowPlayingBridge?.ping) return null;
  return NowPlayingBridge.ping();
}

export function updateNowPlaying(info: NowPlayingInfo): void {
  NowPlayingBridge?.updateNowPlaying(info);
}

export function clearNowPlaying(): void {
  NowPlayingBridge?.clearNowPlaying();
}

export function onRemotePlay(cb: () => void): EmitterSubscription | null {
  return emitter?.addListener("onRemotePlay", cb) ?? null;
}

export function onRemotePause(cb: () => void): EmitterSubscription | null {
  return emitter?.addListener("onRemotePause", cb) ?? null;
}

export function onRemoteSkipForward(cb: () => void): EmitterSubscription | null {
  return emitter?.addListener("onRemoteSkipForward", cb) ?? null;
}

export function onRemoteSkipBackward(cb: () => void): EmitterSubscription | null {
  return emitter?.addListener("onRemoteSkipBackward", cb) ?? null;
}

export function onRemoteSeek(cb: (event: { position: number }) => void): EmitterSubscription | null {
  return emitter?.addListener("onRemoteSeek", cb) ?? null;
}
