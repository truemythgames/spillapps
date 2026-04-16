import { Platform } from "react-native";
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

export const PRODUCT_IDS = {
  quarterlyOnboarding3DayTrial: "bibletea_quarterly_onboarding_3day_freetrial",
  quarterly30DayTrial: "bibletea_quarterly_30day_trial",
  quarterly3DayTrial: "bibletea_quarterly_3day_freetrial",
  weeklyOffer: "bibletea_weekly_offer",
  weeklyFreeTrial: "bibletea_weekly_freetrial",
} as const;

let initialized = false;

export async function initPurchases(userId?: string): Promise<void> {
  if (initialized || !Purchases) return;

  const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  Purchases.configure({ apiKey, appUserID: userId ?? undefined });
  initialized = true;
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

export async function loginUser(appUserId: string): Promise<void> {
  if (!Purchases) return;
  try {
    await Purchases.logIn(appUserId);
  } catch (e) {
    console.warn("[Purchases] Login failed:", e);
  }
}

export async function logoutUser(): Promise<void> {
  if (!Purchases) return;
  try {
    await Purchases.logOut();
  } catch (e) {
    console.warn("[Purchases] Logout failed:", e);
  }
}

function hasActiveEntitlement(info: CustomerInfo): boolean {
  return typeof info?.entitlements?.active?.[ENTITLEMENT_ID] !== "undefined";
}
