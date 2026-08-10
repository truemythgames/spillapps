import "@/lib/i18n";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack, usePathname, Redirect, router } from "expo-router";
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
import { useAuthStore } from "@/stores/auth";
import { setupPlayer } from "@/stores/player";
import { colors } from "@/lib/theme";
import { storage, StorageKeys } from "@/lib/storage";
import { initPurchases } from "@/lib/purchases";
import { initAnalytics } from "@/lib/analytics";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import { Image as ExpoImage } from "expo-image";
import { storyIdFromUrl } from "@/lib/widget-linking";

SplashScreen.preventAutoHideAsync();

/** Widget taps can arrive before navigation is mounted, so they queue here. */
let pendingWidgetStoryId: string | null = null;
let navReady = false;
let currentPathname = "";

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
  const [appReady, setAppReady] = useState(false);
  const loadInitialData = useAppStore((s) => s.loadInitialData);
  const loadUserData = useAppStore((s) => s.loadUserData);
  const refreshSubscription = useAppStore((s) => s.refreshSubscription);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
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
      loadInitialData();
      ExpoImage.prefetch(require("@/assets/onboarding/noahs-ark.webp"));
      await Promise.all([
        setupPlayer(),
        hydrateAuth(),
        initPurchases(),
        initAnalytics(),
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
    if (!appReady || !fontsLoaded) return;
    if (!storage.getBoolean(StorageKeys.HAS_ONBOARDED)) return;
    navReady = true;
    if (pendingWidgetStoryId) {
      const id = pendingWidgetStoryId;
      pendingWidgetStoryId = null;
      goToStory(id);
    }
  }, [appReady, fontsLoaded]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
    refreshSubscription();
  }, [isAuthenticated]);

  useEffect(() => {
    if (fontsLoaded && appReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appReady]);

  if (!fontsLoaded || !appReady) return null;

  const hasOnboarded = storage.getBoolean(StorageKeys.HAS_ONBOARDED);

  const hideMini = pathname === "/player" || pathname === "/onboarding" || pathname === "/paywall" || pathname === "/post-purchase";

  if (!hasOnboarded && pathname !== "/onboarding") {
    return <Redirect href="/onboarding" />;
  }

  return (
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
          name="login"
          options={{ animation: "slide_from_bottom", presentation: "fullScreenModal" }}
        />
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
          name="settings"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="chat"
          options={{ animation: "slide_from_bottom" }}
        />
      </Stack>
      {currentStory && !hideMini && !hideMiniPlayer && <MiniPlayer />}
    </GestureHandlerRootView>
  );
}
