import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { mediaBase?: string; appId?: string } | undefined;
const MEDIA_BASE = extra?.mediaBase?.replace(/\/$/, "") || "https://media.spillapps.com";
const APP_ID = extra?.appId || "bible-tea";

export function coverUrl(storyId: string): string {
  return `${MEDIA_BASE}/${APP_ID}/stories/${storyId}/cover.webp`;
}

export function characterImageUrl(charId: string): string {
  return `${MEDIA_BASE}/${APP_ID}/characters/${charId}.webp`;
}
