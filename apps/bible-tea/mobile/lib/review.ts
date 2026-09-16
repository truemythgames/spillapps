import { storage, StorageKeys, getCompletedStoryIds } from "@/lib/storage";

let StoreReview: any = null;
try {
  StoreReview = require("expo-store-review");
} catch {}

const MIN_COMPLETED = 1;

async function presentStoreReview(): Promise<boolean> {
  if (storage.getBoolean(StorageKeys.HAS_REQUESTED_REVIEW)) return false;
  if (!storage.getBoolean(StorageKeys.HAS_ONBOARDED)) return false;
  if (!StoreReview) return false;
  try {
    if (!(await StoreReview.hasAction())) return false;
    await StoreReview.requestReview();
    storage.set(StorageKeys.HAS_REQUESTED_REVIEW, true);
    return true;
  } catch {
    return false;
  }
}

/** Native rating sheet after a delay — home / stories / later launches only. */
export function requestStoreReview(delayMs = 1200) {
  setTimeout(() => {
    void presentStoreReview();
  }, delayMs);
}

/** Remember to ask after onboarding has actually left the screen. */
export function markReviewAfterOnboarding() {
  storage.set(StorageKeys.PENDING_ONBOARDING_REVIEW, true);
}

/** Call from home. Never from onboarding or the sales page. */
export function requestPendingOnboardingReview() {
  if (!storage.getBoolean(StorageKeys.PENDING_ONBOARDING_REVIEW)) return;
  if (!storage.getBoolean(StorageKeys.HAS_ONBOARDED)) return;
  storage.set(StorageKeys.PENDING_ONBOARDING_REVIEW, false);
  requestStoreReview(800);
}

/**
 * Ask for a store rating after real use, or a later app open after onboarding.
 */
export function maybeRequestReview(opts?: { allowWithoutCompletion?: boolean }) {
  if (storage.getBoolean(StorageKeys.HAS_REQUESTED_REVIEW)) return;
  if (!storage.getBoolean(StorageKeys.HAS_ONBOARDED)) return;
  if (!opts?.allowWithoutCompletion && getCompletedStoryIds().length < MIN_COMPLETED) return;
  requestStoreReview(1200);
}

/** Count this open only if onboarding already finished (a returning visit). */
export function recordReturningLaunch() {
  if (!storage.getBoolean(StorageKeys.HAS_ONBOARDED)) return;
  const n = (storage.getNumber(StorageKeys.LAUNCH_COUNT) ?? 0) + 1;
  storage.set(StorageKeys.LAUNCH_COUNT, n);
  if (n >= 1) maybeRequestReview({ allowWithoutCompletion: true });
}
