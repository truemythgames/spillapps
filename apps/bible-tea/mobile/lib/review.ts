import { storage, StorageKeys, getCompletedStoryIds } from "@/lib/storage";

let StoreReview: any = null;
try {
  StoreReview = require("expo-store-review");
} catch {}

const MIN_COMPLETED = 1;

/**
 * Ask for a store rating after real use — never on first launch or onboarding.
 * Triggers: finished a story/prayer, or a later app open after onboarding.
 */
export function maybeRequestReview(opts?: { allowWithoutCompletion?: boolean }) {
  if (storage.getBoolean(StorageKeys.HAS_REQUESTED_REVIEW)) return;
  if (!storage.getBoolean(StorageKeys.HAS_ONBOARDED)) return;
  if (!opts?.allowWithoutCompletion && getCompletedStoryIds().length < MIN_COMPLETED) return;
  if (!StoreReview) return;

  setTimeout(async () => {
    try {
      if (!(await StoreReview.hasAction())) return;
      await StoreReview.requestReview();
      storage.set(StorageKeys.HAS_REQUESTED_REVIEW, true);
    } catch {}
  }, 1200);
}

/** Count this open only if onboarding already finished (a returning visit). */
export function recordReturningLaunch() {
  if (!storage.getBoolean(StorageKeys.HAS_ONBOARDED)) return;
  const n = (storage.getNumber(StorageKeys.LAUNCH_COUNT) ?? 0) + 1;
  storage.set(StorageKeys.LAUNCH_COUNT, n);
  if (n >= 1) maybeRequestReview({ allowWithoutCompletion: true });
}
