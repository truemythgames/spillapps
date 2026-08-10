import { useRouter } from "expo-router";
import { useAppStore } from "@/stores/app";

export function useGate() {
  const router = useRouter();
  const isSubscribed = useAppStore((s) => s.isSubscribed);

  return {
    isSubscribed,
    /** Navigate to a route if subscribed, otherwise show the paywall. */
    guardedPush: (path: string) => {
      if (isSubscribed) {
        router.push(path as any);
      } else {
        router.push("/paywall");
      }
    },
  };
}
