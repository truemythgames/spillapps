import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { usePlayerStore } from "@/stores/player";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

const TAB_ROUTES = ["/", "/explore", "/playlists", "/profile"];

export function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { currentStory, isPlaying, position, duration, pause, resume } =
    usePlayerStore();
  const stop = usePlayerStore((s) => s.stop);

  if (!currentStory) return null;

  const isOnTabs = TAB_ROUTES.includes(pathname);
  const bottomOffset = isOnTabs ? insets.bottom + 56 : insets.bottom + spacing.sm;

  const progress = duration > 0 ? position / duration : 0;

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%`, { duration: 500 }),
  }));

  return (
    <Pressable
      style={[styles.container, { bottom: bottomOffset }]}
      onPress={() => router.push("/player")}
    >
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      <View style={styles.content}>
        {currentStory.cover_image_url ? (
          <Image
            source={{ uri: currentStory.cover_image_url }}
            style={styles.thumb}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.thumb, { backgroundColor: colors.surfaceLight }]} />
        )}

        <Text style={styles.title} numberOfLines={1}>
          {currentStory.title}
        </Text>

        <Pressable
          style={styles.controlBtn}
          onPress={(e) => {
            e.stopPropagation();
            isPlaying ? pause() : resume();
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={18}
            color={colors.text}
          />
        </Pressable>

        <Pressable
          style={styles.controlBtn}
          onPress={(e) => {
            e.stopPropagation();
            stop?.();
          }}
        >
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.surfaceBorder,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
  },
  title: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
