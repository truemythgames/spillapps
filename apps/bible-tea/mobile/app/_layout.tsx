import { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack, usePathname, Redirect } from "expo-router";
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const loadInitialData = useAppStore((s) => s.loadInitialData);
  const loadUserData = useAppStore((s) => s.loadUserData);
  const refreshSubscription = useAppStore((s) => s.refreshSubscription);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pathname = usePathname();
  const currentStory = usePlayerStore((s) => s.currentStory);

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
      await setupPlayer();
      await hydrateAuth();
      await initPurchases();
      await initAnalytics();
      await loadInitialData();
      setAppReady(true);
    }
    init();
  }, []);

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

  const hideMini = pathname === "/player" || pathname === "/onboarding" || pathname === "/paywall";

  if (!hasOnboarded && pathname !== "/onboarding") {
    return <Redirect href="/onboarding" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
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
      {currentStory && !hideMini && <MiniPlayer />}
    </GestureHandlerRootView>
  );
}
