import "@/lib/i18n";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Stack, usePathname, router } from "expo-router";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import { MiniPlayer } from "@/components/MiniPlayer";
import { usePlayerStore } from "@/stores/player";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  PlayfairDisplay_500Medium,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppStore } from "@/stores/app";
import { setupPlayer } from "@/stores/player";
import { colors } from "@/lib/theme";
import { storage, StorageKeys, hydrateStorage } from "@/lib/storage";
import { initPurchases } from "@/lib/purchases";
import { initAnalytics } from "@/lib/analytics";
import { getSession } from "@/lib/identity";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import { SplashIntro } from "@/components/SplashIntro";
import { Image as ExpoImage } from "expo-image";
import { storyIdFromUrl } from "@/lib/widget-linking";

SplashScreen.preventAutoHideAsync();

/** Widget taps can arrive before navigation is mounted, so they queue here. */
let pendingWidgetStoryId: string | null = null;
let navReady = false;
let currentPathname = "";
/** Survives RootLayout remounts (Redirect / expo-router) so the intro cannot replay. */
let introPlayedThisLaunch = false;

function goToStory(storyId: string) {
  // Delay so the root Stack is mounted before we navigate.
  setTimeout(() => {
    const target = `/story/${storyId}`;
    // expo-router resolves bibletea:///story/<id> by itself; only step in
    // when it didn't, otherwise the screen gets pushed twice.
    if (currentPathname === target) return;
    router.push(target as any);
  }, 400);
}

function handleWidgetUrl(url: string | null) {
  if (!url) return;
  const storyId = storyIdFromUrl(url);
  if (!storyId) return;
  if (navReady && storage.getBoolean(StorageKeys.HAS_ONBOARDED)) {
    goToStory(storyId);
  } else {
    pendingWidgetStoryId = storyId;
  }
}

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [introDone, setIntroDone] = useState(introPlayedThisLaunch);
  const loadInitialData = useAppStore((s) => s.loadInitialData);
  const loadUserData = useAppStore((s) => s.loadUserData);
  const refreshSubscription = useAppStore((s) => s.refreshSubscription);
  const pathname = usePathname();
  const currentStory = usePlayerStore((s) => s.currentStory);
  const hideMiniPlayer = usePlayerStore((s) => s.hideMini);
  const setHideMini = usePlayerStore((s) => s.setHideMini);

  useEffect(() => {
    currentPathname = pathname;
    if (hideMiniPlayer && !pathname.startsWith("/story")) {
      setHideMini(false);
    }
  }, [pathname]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    async function init() {
      await hydrateStorage();
      if (storage.getBoolean(StorageKeys.HAS_ONBOARDED)) {
        introPlayedThisLaunch = true;
        setIntroDone(true);
      }
      setHydrated(true);
      loadInitialData();
      ExpoImage.prefetch(require("@/assets/onboarding/teastories.webp"));
      ExpoImage.prefetch(require("@/assets/onboarding/noahs-ark.webp"));
      await Promise.all([
        setupPlayer(),
        initPurchases(),
        initAnalytics(),
        getSession(),
      ]);
      setAppReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then(handleWidgetUrl);
    const sub = Linking.addEventListener("url", ({ url }) =>
      handleWidgetUrl(url),
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!appReady || !fontsLoaded || !introDone) return;
    if (!storage.getBoolean(StorageKeys.HAS_ONBOARDED)) return;
    navReady = true;
    if (pendingWidgetStoryId) {
      const id = pendingWidgetStoryId;
      pendingWidgetStoryId = null;
      goToStory(id);
    }
  }, [appReady, fontsLoaded, introDone]);

  useEffect(() => {
    if (!appReady) return;
    loadUserData();
    refreshSubscription();
  }, [appReady]);

  useEffect(() => {
    if (fontsLoaded && appReady && introPlayedThisLaunch) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appReady]);

  useEffect(() => {
    if (!appReady || !fontsLoaded || !introDone) return;
    if (storage.getBoolean(StorageKeys.HAS_ONBOARDED)) return;
    if (pathname === "/onboarding") return;
    router.replace("/onboarding");
  }, [appReady, fontsLoaded, introDone, pathname]);

  if (!hydrated) return null;

  const hasOnboarded = storage.getBoolean(StorageKeys.HAS_ONBOARDED);
  const showIntro = !introDone && !hasOnboarded;
  const hideMini = pathname === "/player" || pathname === "/onboarding" || pathname === "/paywall" || pathname === "/post-purchase";
  const ready = fontsLoaded && appReady;

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0A0F" }}>
      {ready ? (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
          <UpdatePrompt />
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: "none",
            }}
            initialRouteName={hasOnboarded ? "(tabs)" : "onboarding"}
          >
            <Stack.Screen name="onboarding" />
            <Stack.Screen
              name="paywall"
              options={{
                animation: "slide_from_bottom",
                presentation: "fullScreenModal",
                gestureEnabled: false,
              }}
            />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="unlock"
              options={{ animation: "slide_from_bottom", presentation: "fullScreenModal" }}
            />
            <Stack.Screen
              name="special-offer"
              options={{
                animation: "slide_from_bottom",
                presentation: "fullScreenModal",
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="post-purchase"
              options={{
                animation: "fade",
                presentation: "fullScreenModal",
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="story/[id]"
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="player"
              options={{
                animation: "slide_from_bottom",
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="season/[id]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="playlist/[id]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="liked"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="completed"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="character/[name]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="characters"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="collection"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="testament/[id]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="chat"
              options={{ animation: "slide_from_bottom" }}
            />
          </Stack>
          {currentStory && !hideMini && !hideMiniPlayer && <MiniPlayer />}
        </GestureHandlerRootView>
      ) : (
        <View style={{ flex: 1, backgroundColor: "#0A0A0F" }} />
      )}
      {showIntro && (
        <View style={styles.introOverlay}>
          <SplashIntro
            onDone={() => {
              introPlayedThisLaunch = true;
              setIntroDone(true);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: "#0A0A0F",
  },
});
