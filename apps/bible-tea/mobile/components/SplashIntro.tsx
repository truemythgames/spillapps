import { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ResizeMode, Video, type AVPlaybackStatus } from "expo-av";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";

const INTRO = require("@/assets/intro-bibletea-splash-square.mp4");
const HERO = require("@/assets/onboarding/teastories.webp");
const FAILSAFE_MS = 5500;

export function SplashIntro({ onDone }: { onDone: () => void }) {
  const finished = useRef(false);
  const hidden = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    const t = setTimeout(finish, FAILSAFE_MS);
    return () => clearTimeout(t);
  }, [finish]);

  const hideSplash = useCallback(() => {
    if (hidden.current) return;
    hidden.current = true;
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  const onStatus = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      if (status.isPlaying) hideSplash();
      if (status.didJustFinish) finish();
    },
    [finish, hideSplash],
  );

  return (
    <View style={styles.root}>
      <Image
        source={HERO}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        contentPosition="center"
        transition={0}
      />
      <Video
        source={INTRO}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isMuted
        isLooping={false}
        progressUpdateIntervalMillis={50}
        onReadyForDisplay={hideSplash}
        onPlaybackStatusUpdate={onStatus}
        onError={finish}
      />
      <Pressable style={StyleSheet.absoluteFill} onPress={finish} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A0F",
  },
});
