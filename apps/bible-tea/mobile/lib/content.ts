import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { mediaBase?: string; appId?: string } | undefined;
const MEDIA_BASE = extra?.mediaBase?.replace(/\/$/, "") || "https://media.spillapps.com";
const APP_ID = extra?.appId || "bible-tea";

/** Resize via media.spillapps.com ?w= (media-worker). */
export function sizedMedia(url: string, width: number, quality = 72): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("spillapps.com")) return url;
    u.searchParams.set("w", String(Math.min(1024, Math.max(80, Math.round(width)))));
    u.searchParams.set("q", String(quality));
    u.searchParams.set("v", "2");
    return u.toString();
  } catch {
    return url;
  }
}

export function coverUrl(storyId: string, width?: number): string {
  const url = `${MEDIA_BASE}/${APP_ID}/stories/${storyId}/cover.webp`;
  return width ? sizedMedia(url, width) : url;
}

export function characterImageUrl(charId: string): string {
  return `${MEDIA_BASE}/${APP_ID}/characters/${charId}.webp`;
}
