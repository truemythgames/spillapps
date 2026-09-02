import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePlayerStore } from "@/stores/player";
import { CoverImage } from "@/components/CoverImage";
import { colors, fonts, fontSize, spacing, radius, TAB_BAR_HEIGHT } from "@/lib/theme";

const TAB_ROUTES = ["/", "/explore", "/prayers", "/playlists", "/profile"];

export function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { currentStory, isPlaying, isBuffering, position, duration, pause, resume } =
    usePlayerStore();
  const stop = usePlayerStore((s) => s.stop);

  if (!currentStory) return null;

  const isOnTabs = TAB_ROUTES.includes(pathname);
  const bottomOffset = isOnTabs ? TAB_BAR_HEIGHT + 4 : insets.bottom + spacing.sm;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <Pressable
      style={[styles.container, { bottom: bottomOffset }]}
      onPress={() => router.push("/player")}
    >
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 1000) / 10}%` }]} />
      </View>

      <View style={styles.content}>
        {currentStory.cover_image_url ? (
          <CoverImage
            uri={currentStory.cover_image_url}
            storyId={currentStory.id}
            displayWidth={160}
            style={styles.thumb}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.thumb, { backgroundColor: colors.surfaceLight, alignItems: "center", justifyContent: "center" }]}>
            <Ionicons name="heart" size={20} color={colors.primary} />
          </View>
        )}

        <Text style={styles.title} numberOfLines={1}>
          {currentStory.title}
        </Text>

        <Pressable
          style={styles.controlBtn}
          onPress={(e) => {
            e.stopPropagation();
            if (!isBuffering) isPlaying ? pause() : resume();
          }}
        >
          {isBuffering ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={18}
              color={colors.background}
            />
          )}
        </Pressable>

        <Pressable
          style={styles.controlBtn}
          onPress={(e) => {
            e.stopPropagation();
            stop?.();
          }}
        >
          <Ionicons name="close" size={18} color="rgba(10,10,15,0.5)" />
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
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
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
    color: colors.background,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
