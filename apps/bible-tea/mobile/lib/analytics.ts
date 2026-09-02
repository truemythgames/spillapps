import { AppState, Platform } from "react-native";
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
let attInFlight: Promise<boolean> | null = null;
let trackingSdksReady = false;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForActive(): Promise<void> {
  if (AppState.currentState === "active") return Promise.resolve();
  return new Promise((resolve) => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        sub.remove();
        resolve();
      }
    });
  });
}

export async function initAnalytics() {
  if (initialized) return;

  try {
    await crashlyticsModule?.()?.setCrashlyticsCollectionEnabled(!__DEV__);
  } catch (e) {
    console.warn("[Analytics] Crashlytics init failed:", e);
  }

  initialized = true;
}

/** Facebook stays off until ATT is granted or denied. */
async function enableTrackingSdks() {
  if (trackingSdksReady) return;
  trackingSdksReady = true;

  try {
    Settings?.initializeSDK();
    if (Platform.OS === "ios") {
      const { status } = await getTrackingPermissionsAsync();
      const granted = status === "granted";
      Settings?.setAdvertiserTrackingEnabled(granted);
    } else {
      Settings?.setAdvertiserTrackingEnabled(true);
    }
    Settings?.setAutoLogAppEventsEnabled?.(true);
  } catch (e) {
    console.warn("[Analytics] Facebook SDK init failed:", e);
  }
}

/**
 * Show the system ATT dialog once the app is active and still.
 * iPadOS drops the prompt if we ask during launch, splash, or a transition.
 * A silent no-op returns "undetermined" — retry instead of treating that as done.
 */
export async function requestATT(): Promise<boolean> {
  if (Platform.OS !== "ios") {
    await enableTrackingSdks();
    return true;
  }
  if (attInFlight) return attInFlight;

  attInFlight = (async () => {
    try {
      await waitForActive();
      await delay(Platform.isPad ? 800 : 400);

      const existing = await getTrackingPermissionsAsync();
      if (existing.status === "granted" || existing.status === "denied") {
        await enableTrackingSdks();
        return existing.status === "granted";
      }

      let { status } = await requestTrackingPermissionsAsync();
      if (status === "undetermined") {
        await waitForActive();
        await delay(600);
        ({ status } = await requestTrackingPermissionsAsync());
      }

      await enableTrackingSdks();
      return status === "granted";
    } catch (e) {
      console.warn("[Analytics] ATT request failed:", e);
      await enableTrackingSdks();
      return false;
    } finally {
      attInFlight = null;
    }
  })();

  return attInFlight;
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

export function logError(error: Error, context?: string) {
  try {
    if (context) crashlyticsModule?.()?.log(context);
    crashlyticsModule?.()?.recordError(error);
  } catch {}
}
