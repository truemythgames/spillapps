import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";

const REVENUECAT_IOS_KEY = "appl_wkihlIqfRBLXmhtmZBUiijkxsxN";
const REVENUECAT_ANDROID_KEY = "goog_REPLACE_WITH_YOUR_ANDROID_KEY";

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
  if (initialized) return;

  const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  Purchases.configure({ apiKey, appUserID: userId ?? undefined });
  initialized = true;
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (e) {
    console.warn("[Purchases] Failed to fetch offerings:", e);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return hasActiveEntitlement(customerInfo);
  } catch (e: any) {
    if (e.userCancelled) return false;
    console.warn("[Purchases] Purchase failed:", e);
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return hasActiveEntitlement(customerInfo);
  } catch (e) {
    console.warn("[Purchases] Restore failed:", e);
    return false;
  }
}

export async function checkSubscription(): Promise<boolean | null> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return hasActiveEntitlement(customerInfo);
  } catch (e) {
    console.warn("[Purchases] Check failed:", e);
    return null;
  }
}

export async function loginUser(appUserId: string): Promise<void> {
  try {
    await Purchases.logIn(appUserId);
  } catch (e) {
    console.warn("[Purchases] Login failed:", e);
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (e) {
    console.warn("[Purchases] Logout failed:", e);
  }
}

function hasActiveEntitlement(info: CustomerInfo): boolean {
  return typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
}
