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

function idsOf(pkg: PurchasesPackage): { id: string; pid: string } {
  return {
    id: String(pkg?.identifier ?? ""),
    pid: String(pkg?.product?.identifier ?? ""),
  };
}

export function matchPackage(
  packages: PurchasesPackage[],
  rcIdentifier: string,
  productId: string,
): PurchasesPackage | undefined {
  return packages.find((p) => {
    const { id, pid } = idsOf(p);
    return (
      id === rcIdentifier ||
      id === productId ||
      pid === productId ||
      pid.startsWith(productId) ||
      id.startsWith(productId) ||
      id.includes(rcIdentifier) ||
      pid.includes(productId)
    );
  });
}

function blob(pkg: PurchasesPackage): string {
  const { id, pid } = idsOf(pkg);
  return `${id} ${pid} ${pkg?.packageType ?? ""}`.toLowerCase();
}

function isWeeklyPeriod(pkg: PurchasesPackage): boolean {
  const period = String(pkg?.product?.subscriptionPeriod ?? "").toUpperCase();
  const type = String(pkg?.packageType ?? "").toUpperCase();
  if (type === "WEEKLY") return true;
  if (period === "P1W" || period === "P7D") return true;
  const text = blob(pkg);
  return text.includes("$rc_weekly") || text.includes("weekly") || /:p1w\b/.test(text);
}

function isTrialSku(pkg: PurchasesPackage): boolean {
  return /freetrial|free_trial|free-trial|3day|30day/.test(blob(pkg));
}

function numericPrice(pkg: PurchasesPackage): number {
  const product = pkg?.product;
  const n = Number(product?.price);
  if (n > 0) return n;
  const micros = Number(product?.defaultOption?.fullPricePhase?.price?.amountMicros);
  if (micros > 0) return micros / 1_000_000;
  return Number(product?.pricePerWeek) || 0;
}

/** Start-small sheet: any weekly product, whatever RC/Play named it. */
export function findWeeklyOfferPackage(packages: PurchasesPackage[]): PurchasesPackage | undefined {
  if (!packages?.length) return undefined;

  const named =
    matchPackage(packages, "weekly_offer", PRODUCT_IDS.weeklyOffer) ||
    packages.find((p) => /weekly[_-]?offer/.test(blob(p)));
  if (named) return named;

  const weeklies = packages.filter(isWeeklyPeriod);
  return (
    weeklies.find((p) => !isTrialSku(p)) ||
    weeklies[0] ||
    packages
      .filter((p) => numericPrice(p) > 0 && !/year|annual|quarter|month/.test(blob(p)))
      .sort((a, b) => numericPrice(a) - numericPrice(b))[0]
  );
}

function isZeroPrice(raw: string): boolean {
  const s = raw.trim();
  if (!s) return true;
  return /^(free|gratis)?\s*([$€£₹]|us\$|ca\$|a\$|r\$|mx\$)?\s*0([.,]00)?\s*([$€£₹])?$/i.test(s);
}

function formatAmount(amount: number, currency?: string): string {
  if (!amount || amount <= 0) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return String(amount);
  }
}

function phasePrice(phase: any): { text: string; amount: number; currency?: string } | null {
  const price = phase?.price;
  if (!price) return null;
  const text = String(price.formatted ?? price.priceString ?? "").trim();
  const micros = Number(price.amountMicros);
  const amount = Number(price.amount ?? (Number.isFinite(micros) ? micros / 1_000_000 : 0));
  return { text, amount, currency: price.currencyCode };
}

function fullPriceFromOptions(product: any): { text: string; amount: number; currency?: string } | null {
  const options = [
    product?.defaultOption,
    ...(Array.isArray(product?.subscriptionOptions) ? product.subscriptionOptions : []),
  ].filter(Boolean);

  for (const opt of options) {
    const phase = opt.fullPricePhase ?? opt.pricingPhases?.find((p: any) => Number(p?.price?.amountMicros) > 0);
    const picked = phasePrice(phase);
    if (picked && (picked.amount > 0 || (picked.text && !isZeroPrice(picked.text)))) return picked;
  }
  return null;
}

export function formatStorePrice(product: any): string {
  if (!product) return "";

  const raw = String(product.priceString ?? "").trim();
  if (raw && !isZeroPrice(raw)) return raw;

  const n = Number(product.price);
  if (n > 0) return formatAmount(n, product.currencyCode);

  const fromOption = fullPriceFromOptions(product);
  if (fromOption?.text && !isZeroPrice(fromOption.text)) return fromOption.text;
  if (fromOption?.amount) return formatAmount(fromOption.amount, fromOption.currency || product.currencyCode);

  const weekly = String(product.pricePerWeekString ?? "").trim();
  if (weekly && !isZeroPrice(weekly)) return weekly;

  return formatAmount(Number(product.pricePerWeek), product.currencyCode);
}

function collectPackages(offerings: any): PurchasesPackage[] {
  const seen = new Set<string>();
  const list: PurchasesPackage[] = [];
  const add = (pkgs: PurchasesPackage[] | undefined) => {
    for (const p of pkgs ?? []) {
      const { id, pid } = idsOf(p);
      const key = `${id}|${pid}`;
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(p);
    }
  };
  add(offerings?.current?.availablePackages);
  for (const off of Object.values(offerings?.all ?? {}) as any[]) {
    add(off?.availablePackages);
  }
  return list;
}

async function fetchStoreProducts(): Promise<any[]> {
  const ids = Object.values(PRODUCT_IDS);
  const type = Purchases.PRODUCT_CATEGORY?.SUBSCRIPTION ?? "SUBSCRIPTION";
  try {
    const subs = await Purchases.getProducts(ids, type);
    if (subs?.length) return subs;
  } catch (e) {
    console.warn("[Purchases] getProducts SUBSCRIPTION failed:", e);
  }
  try {
    return (await Purchases.getProducts(ids)) ?? [];
  } catch (e) {
    console.warn("[Purchases] getProducts failed:", e);
    return [];
  }
}

function mergeStoreProducts(packages: PurchasesPackage[], products: any[]): PurchasesPackage[] {
  const next = [...packages];
  for (const product of products ?? []) {
    const pid = String(product?.identifier ?? "");
    if (!pid) continue;
    if (matchPackage(next, pid, pid)) continue;
    next.push({
      identifier: pid,
      product,
      offeringIdentifier: "store",
    });
  }
  return next;
}

export async function getOfferings(opts?: { force?: boolean }): Promise<PurchasesOffering | null> {
  if (!Purchases) return null;
  if (!opts?.force && cachedOffering?.availablePackages?.length) return cachedOffering;
  if (offeringPromise) return offeringPromise;

  offeringPromise = (async () => {
    try {
      const offerings = await Purchases.getOfferings();
      const current =
        offerings?.current ??
        (offerings?.all ? (Object.values(offerings.all)[0] as PurchasesOffering) : null);

      let packages = collectPackages(offerings);
      const weekly = findWeeklyOfferPackage(packages);
      if (!weekly || !formatStorePrice(weekly.product)) {
        packages = mergeStoreProducts(packages, await fetchStoreProducts());
      }

      if (packages.length) {
        cachedOffering = { ...(current ?? {}), availablePackages: packages };
        return cachedOffering;
      }

      return current ?? null;
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
    let customerInfo: CustomerInfo;
    try {
      ({ customerInfo } = await Purchases.purchasePackage(pkg));
    } catch (e: any) {
      if (e?.userCancelled) return false;
      if (!pkg?.product) throw e;
      ({ customerInfo } = await Purchases.purchaseStoreProduct(pkg.product));
    }
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
