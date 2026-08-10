import { NativeModules, Platform } from "react-native";
import { getVerseOfTheDay } from "./daily-verses";
import { coverUrl } from "./content";

const VerseWidgetBridge = NativeModules.VerseWidgetBridge;

function getDeviceLanguage(): "en" | "es" {
  try {
    const i18n = require("./i18n").default;
    return i18n.language === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  // eslint-disable-next-line no-undef
  return btoa(binary);
}

async function fetchCoverBase64(url: string): Promise<string> {
  if (!url) return "";
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("[Widget] Cover fetch failed:", res.status, url);
      return "";
    }
    const buf = await res.arrayBuffer();
    if (!buf.byteLength) return "";
    return arrayBufferToBase64(buf);
  } catch (e) {
    console.warn("[Widget] Cover fetch error:", e);
    return "";
  }
}

/**
 * Write today's verse + story cover into shared storage for the native widget.
 * Cover is downloaded in JS (WebP-safe) and passed to native as base64.
 */
export async function syncWidgetData(storyOfTheDay?: {
  id: string;
  cover_image_url: string | null;
}): Promise<void> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;
  if (!VerseWidgetBridge) {
    console.warn("[Widget] VerseWidgetBridge native module missing");
    return;
  }

  const lang = getDeviceLanguage();
  const verse = getVerseOfTheDay(new Date(), lang);
  const storyId = storyOfTheDay?.id ?? "";
  const imageUrl =
    (storyOfTheDay?.cover_image_url && storyOfTheDay.cover_image_url.trim()) ||
    (storyId ? coverUrl(storyId) : "");

  const coverBase64 = await fetchCoverBase64(imageUrl);

  try {
    await VerseWidgetBridge.updateWidget(
      verse.text,
      verse.ref,
      storyId,
      imageUrl,
      coverBase64
    );
  } catch (e) {
    console.warn("[Widget] Failed to sync widget data:", e);
  }
}

export async function refreshWidget(): Promise<void> {
  if (!VerseWidgetBridge) return;
  try {
    await VerseWidgetBridge.refreshTimeline();
  } catch {}
}

export async function checkWidgetInstalled(): Promise<boolean> {
  if (!VerseWidgetBridge) return false;
  try {
    return await VerseWidgetBridge.isWidgetInstalled();
  } catch {
    return false;
  }
}
