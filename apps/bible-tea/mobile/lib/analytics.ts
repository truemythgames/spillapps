import { Settings, AppEventsLogger } from "react-native-fbsdk-next";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";

let initialized = false;

export async function initAnalytics() {
  if (initialized) return;

  try {
    Settings.initializeSDK();
    Settings.setAdvertiserTrackingEnabled(true);
  } catch (e) {
    console.warn("[Analytics] Facebook SDK init failed:", e);
  }

  try {
    await crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
  } catch (e) {
    console.warn("[Analytics] Crashlytics init failed:", e);
  }

  initialized = true;
}

export function trackEvent(name: string, params?: Record<string, any>) {
  try {
    if (params) {
      AppEventsLogger.logEvent(name, params);
    } else {
      AppEventsLogger.logEvent(name);
    }
  } catch {}

  try {
    analytics().logEvent(name, params);
  } catch {}
}

export function trackScreen(screenName: string) {
  try {
    AppEventsLogger.logEvent("screen_view", { screen: screenName });
  } catch {}

  try {
    analytics().logScreenView({ screen_name: screenName, screen_class: screenName });
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
    AppEventsLogger.logPurchase(value, "USD", { plan });
  } catch {}

  try {
    analytics().logPurchase({ value, currency: "USD", items: [{ item_id: plan, item_name: plan }] });
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
    analytics().setUserId(userId);
  } catch {}

  try {
    crashlytics().setUserId(userId);
  } catch {}
}

export function logError(error: Error, context?: string) {
  try {
    if (context) crashlytics().log(context);
    crashlytics().recordError(error);
  } catch {}
}
