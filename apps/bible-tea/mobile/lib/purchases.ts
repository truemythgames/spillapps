import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { trackSubscription, trackEvent } from "@/lib/analytics";

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

// Stable per-install identifier used as the RevenueCat appUserID.
// Persisted in the OS keychain via expo-secure-store so it survives app
// restarts and (on iOS) reinstalls. We prefix it so it's recognisable in
// the RevenueCat dashboard versus auto-generated `$RCAnonymousID:` ids.
const APP_USER_ID_KEY = "rc_app_user_id";
const APP_USER_ID_PREFIX = "bt_";

export const PRODUCT_IDS = {
  quarterlyOnboarding3DayTrial: "bibletea_quarterly_onboarding_3day_freetrial",
  quarterly30DayTrial: "bibletea_quarterly_30day_trial",
  quarterly3DayTrial: "bibletea_quarterly_3day_freetrial",
  weeklyOffer: "bibletea_weekly_offer",
  weeklyFreeTrial: "bibletea_weekly_freetrial",
  yearlyOffer: "bibletea_yearly_offer",
} as const;

let initialized = false;
let cachedAppUserId: string | null = null;

async function getOrCreateAppUserId(): Promise<string> {
  if (cachedAppUserId) return cachedAppUserId;
  try {
    const existing = await SecureStore.getItemAsync(APP_USER_ID_KEY);
    if (existing) {
      cachedAppUserId = existing;
      return existing;
    }
  } catch (e) {
    console.warn("[Purchases] Failed to read stored appUserID:", e);
  }

  const fresh = `${APP_USER_ID_PREFIX}${Crypto.randomUUID()}`;
  try {
    await SecureStore.setItemAsync(APP_USER_ID_KEY, fresh);
  } catch (e) {
    console.warn("[Purchases] Failed to persist appUserID:", e);
  }
  cachedAppUserId = fresh;
  return fresh;
}

export async function getAppUserId(): Promise<string> {
  return getOrCreateAppUserId();
}

export async function initPurchases(userId?: string): Promise<void> {
  if (initialized || !Purchases) return;

  const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  // Configure anonymously first, then logIn with our stable id. This makes
  // RevenueCat alias any pre-existing anonymous customer (e.g. an install
  // that already purchased before this fix shipped) onto the stable id,
  // preserving entitlements instead of orphaning them.
  Purchases.configure({ apiKey });
  initialized = true;

  try {
    const stableId = userId?.trim() || (await getOrCreateAppUserId());
    await Purchases.logIn(stableId);
  } catch (e) {
    console.warn("[Purchases] logIn with stable id failed:", e);
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!Purchases) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (e) {
    console.warn("[Purchases] Failed to fetch offerings:", e);
    return null;
  }
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

export async function checkSubscription(): Promise<boolean | null> {
  if (!Purchases) return null;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return hasActiveEntitlement(customerInfo);
  } catch (e) {
    console.warn("[Purchases] Check failed:", e);
    return null;
  }
}

function hasActiveEntitlement(info: CustomerInfo): boolean {
  return typeof info?.entitlements?.active?.[ENTITLEMENT_ID] !== "undefined";
}
