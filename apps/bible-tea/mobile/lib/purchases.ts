import { Platform } from "react-native";
import { getUserId } from "@/lib/identity";
import { trackSubscription, trackEvent } from "@/lib/analytics";

let AppEventsLogger: any = null;
try {
  AppEventsLogger = require("react-native-fbsdk-next").AppEventsLogger;
} catch {}

let Purchases: any = null;
let LOG_LEVEL: any = {};

try {
  const mod = require("react-native-purchases");
  Purchases = mod.default;
  LOG_LEVEL = mod.LOG_LEVEL;
} catch {}

export type PurchasesOffering = any;
export type PurchasesPackage = any;
type CustomerInfo = any;

const REVENUECAT_IOS_KEY = "appl_wkihlIqfRBLXmhtmZBUiijkxsxN";
const REVENUECAT_ANDROID_KEY = "goog_OrYzAxZViXKjAqteWSEQolNVWNU";

const ENTITLEMENT_ID = "premium";

export const PRODUCT_IDS = {
  quarterlyOnboarding3DayTrial: "bibletea_quarterly_onboarding_3day_freetrial",
  quarterly30DayTrial: "bibletea_quarterly_30day_trial",
  quarterly3DayTrial: "bibletea_quarterly_3day_freetrial",
  weeklyOffer: "bibletea_weekly_offer",
  weeklyFreeTrial: "bibletea_weekly_freetrial",
  yearlyOffer: "bibletea_yearly_offer",
} as const;

let initialized = false;
let cachedOffering: PurchasesOffering | null = null;
let offeringPromise: Promise<PurchasesOffering | null> | null = null;
export async function getAppUserId(): Promise<string> {
  return getUserId();
}

export async function initPurchases(userId?: string): Promise<void> {
  if (initialized || !Purchases) return;

  const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  // Anonymous configure, then logIn with our own user id. RevenueCat aliases
  // the existing anonymous customer onto it, so entitlements carry over and a
  // customer maps to a row in our users table.
  Purchases.configure({ apiKey });
  initialized = true;

  try {
    await Purchases.logIn(userId?.trim() || (await getUserId()));
  } catch (e) {
    console.warn("[Purchases] logIn failed:", e);
  }

  // Pass Facebook Anonymous ID so RevenueCat can forward events via Conversions API
  try {
    const fbAnonId = await AppEventsLogger?.getAnonymousID();
    if (fbAnonId) {
      Purchases.setFBAnonymousID(fbAnonId);
    }
  } catch (e) {
    console.warn("[Purchases] setFBAnonymousID failed:", e);
  }

  // Pass the Firebase app instance ID so RevenueCat's Firebase integration
  // can attribute server-side events (renewals, cancellations, refunds) to
  // the correct GA4 user. Required for the dashboard integration to work.
  try {
    const analytics = require("@react-native-firebase/analytics").default;
    const instanceId = await analytics().getAppInstanceId();
    if (instanceId) {
      Purchases.setFirebaseAppInstanceID(instanceId);
    }
  } catch (e) {
    console.warn("[Purchases] setFirebaseAppInstanceID failed:", e);
  }

  // Apple Ads (Search Ads) attribution: collect the AdServices token so
  // RevenueCat can attribute installs/subscriptions to Apple Ads campaigns.
  // iOS only, and must run after configure(). Yields campaign-level
  // ("Standard") attribution when ATT is undetermined; upgrades to "Detailed"
  // once the user has answered the ATT prompt.
  if (Platform.OS === "ios") {
    try {
      await Purchases.enableAdServicesAttributionTokenCollection();
    } catch (e) {
      console.warn("[Purchases] AdServices attribution failed:", e);
    }
  }

  // Pre-fetch offerings so paywall opens instantly
  getOfferings();
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!Purchases) return null;
  if (cachedOffering) return cachedOffering;
  if (offeringPromise) return offeringPromise;

  offeringPromise = (async () => {
    try {
      const offerings = await Purchases.getOfferings();
      cachedOffering = offerings.current;
      return cachedOffering;
    } catch (e) {
      console.warn("[Purchases] Failed to fetch offerings:", e);
      return null;
    } finally {
      offeringPromise = null;
    }
  })();

  return offeringPromise;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isActive = hasActiveEntitlement(customerInfo);
    if (isActive) {
      const price = pkg.product.price;
      const productId = pkg.product.identifier;
      trackSubscription(productId, price);
      trackEvent("start_trial", { product_id: productId, price });
    }
    return isActive;
  } catch (e: any) {
    if (e.userCancelled) return false;
    console.warn("[Purchases] Purchase failed:", e);
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return hasActiveEntitlement(customerInfo);
  } catch (e) {
    console.warn("[Purchases] Restore failed:", e);
    return false;
  }
}

/** Store expirations can miss RevenueCat's webhook, so the receipt is
 * verified once per launch rather than trusting a cached entitlement. */
let syncedThisLaunch = false;

export async function checkSubscription(): Promise<boolean | null> {
  if (!Purchases) return null;

  // Cached answer first: works offline, so a subscriber on bad signal is
  // never locked out by a failed request.
  let cached: boolean | null = null;
  try {
    cached = hasActiveEntitlement(await Purchases.getCustomerInfo());
  } catch (e) {
    console.warn("[Purchases] Cached check failed:", e);
  }

  if (syncedThisLaunch) return cached;
  syncedThisLaunch = true;

  // Then confirm against the current store receipt. Access is only revoked
  // when fresh data says so, never because the network was unavailable.
  try {
    await Purchases.invalidateCustomerInfoCache();
    await Purchases.syncPurchases();
    return hasActiveEntitlement(await Purchases.getCustomerInfo());
  } catch (e) {
    console.warn("[Purchases] Receipt verification failed:", e);
    return cached;
  }
}

function hasActiveEntitlement(info: CustomerInfo): boolean {
  const ent = info?.entitlements?.active?.[ENTITLEMENT_ID];
  if (!ent) return false;
  if (ent.isActive === false) return false;
  if (ent.expirationDate && new Date(ent.expirationDate).getTime() <= Date.now()) {
    return false;
  }
  // Receipt has no live products → do not trust a leftover RC entitlement.
  const activeSubs = info.activeSubscriptions;
  if (Array.isArray(activeSubs) && activeSubs.length === 0) {
    const store = String(ent.store ?? "").toUpperCase();
    if (store !== "PROMOTIONAL") return false;
  }
  return true;
}
