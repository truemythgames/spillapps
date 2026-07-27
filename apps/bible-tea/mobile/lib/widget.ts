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

/**
 * Write today's verse + story cover image into the App Group container
 * so the iOS widget can display them. Call this on app launch and when
 * the story of the day changes.
 */
export async function syncWidgetData(storyOfTheDay?: {
  id: string;
  cover_image_url: string | null;
}): Promise<void> {
  if (Platform.OS !== "ios" || !VerseWidgetBridge) return;

  const lang = getDeviceLanguage();
  const verse = getVerseOfTheDay(new Date(), lang);

  const storyId = storyOfTheDay?.id ?? "";
  const imageUrl = storyOfTheDay?.cover_image_url ?? coverUrl(storyId);

  try {
    await VerseWidgetBridge.updateWidget(
      verse.text,
      verse.ref,
      storyId,
      imageUrl
    );
  } catch (e) {
    console.warn("[Widget] Failed to sync widget data:", e);
  }
}

/** Ask WidgetKit to reload timelines without downloading a new image. */
export async function refreshWidget(): Promise<void> {
  if (Platform.OS !== "ios" || !VerseWidgetBridge) return;
  try {
    await VerseWidgetBridge.refreshTimeline();
  } catch {}
}

/** Returns true if the user has at least one Bible Tea widget on their home/lock screen. */
export async function checkWidgetInstalled(): Promise<boolean> {
  if (Platform.OS !== "ios" || !VerseWidgetBridge) return false;
  try {
    return await VerseWidgetBridge.isWidgetInstalled();
  } catch {
    return false;
  }
}
