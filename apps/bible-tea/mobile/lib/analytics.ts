import { Platform } from "react-native";
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from "expo-tracking-transparency";

let Settings: any = null;
let AppEventsLogger: any = null;
let analyticsModule: any = null;
let crashlyticsModule: any = null;

try {
  const fbsdk = require("react-native-fbsdk-next");
  Settings = fbsdk.Settings;
  AppEventsLogger = fbsdk.AppEventsLogger;
} catch {}

try {
  analyticsModule = require("@react-native-firebase/analytics").default;
} catch {}

try {
  crashlyticsModule = require("@react-native-firebase/crashlytics").default;
} catch {}

let initialized = false;
let attRequested = false;

export async function initAnalytics() {
  if (initialized) return;

  try {
    if (Platform.OS === "ios") {
      Settings?.initializeSDK();
      const { granted } = await getTrackingPermissionsAsync();
      Settings?.setAdvertiserTrackingEnabled(granted);
    } else {
      Settings?.initializeSDK();
      Settings?.setAdvertiserTrackingEnabled(true);
    }
  } catch (e) {
    console.warn("[Analytics] Facebook SDK init failed:", e);
  }

  try {
    await crashlyticsModule?.()?.setCrashlyticsCollectionEnabled(!__DEV__);
  } catch (e) {
    console.warn("[Analytics] Crashlytics init failed:", e);
  }

  initialized = true;
}

export async function requestATT(): Promise<boolean> {
  if (attRequested) return false;
  attRequested = true;

  if (Platform.OS !== "ios") return true;

  try {
    const { status } = await requestTrackingPermissionsAsync();
    const granted = status === "granted";
    Settings?.setAdvertiserTrackingEnabled(granted);
    return granted;
  } catch (e) {
    console.warn("[Analytics] ATT request failed:", e);
    return false;
  }
}

export function trackEvent(name: string, params?: Record<string, any>) {
  try {
    if (params) {
      AppEventsLogger?.logEvent(name, params);
    } else {
      AppEventsLogger?.logEvent(name);
    }
  } catch {}

  try {
    analyticsModule?.()?.logEvent(name, params);
  } catch {}
}

export function trackScreen(screenName: string) {
  try {
    AppEventsLogger?.logEvent("screen_view", { screen: screenName });
  } catch {}

  try {
    analyticsModule?.()?.logScreenView({ screen_name: screenName, screen_class: screenName });
  } catch {}
}

export function trackStoryPlayed(storyId: string, storyTitle: string) {
  trackEvent("story_played", {
    content_id: storyId,
    content_type: "story",
    description: storyTitle,
  });
}

export function trackSubscription(plan: string, value: number) {
  try {
    AppEventsLogger?.logPurchase(value, "USD", { plan });
  } catch {}

  try {
    analyticsModule?.()?.logPurchase({ value, currency: "USD", items: [{ item_id: plan, item_name: plan }] });
  } catch {}
}

export function trackOnboardingComplete() {
  trackEvent("onboarding_complete");
}

export function trackChatStarted(topic: string) {
  trackEvent("chat_started", { topic });
}

export function setUserId(userId: string) {
  try {
    analyticsModule?.()?.setUserId(userId);
  } catch {}

  try {
    crashlyticsModule?.()?.setUserId(userId);
  } catch {}
}

export function logError(error: Error, context?: string) {
  try {
    if (context) crashlyticsModule?.()?.log(context);
    crashlyticsModule?.()?.recordError(error);
  } catch {}
}
