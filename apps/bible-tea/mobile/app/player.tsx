import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { usePlayerStore } from "@/stores/player";
import { useAppStore } from "@/stores/app";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

const { width } = Dimensions.get("window");
const COVER_SIZE = width - 80;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    currentStory,
    currentSpeaker,
    isPlaying,
    position,
    duration,
    isBuffering,
    playbackSpeed,
    pause,
    resume,
    seekTo,
    skipForward,
    skipBackward,
    setSpeed,
  } = usePlayerStore();

  const likedStoryIds = useAppStore((s) => s.likedStoryIds);
  const toggleLike = useAppStore((s) => s.toggleLike);

  if (!currentStory) {
    router.back();
    return null;
  }

  const isLiked = likedStoryIds.includes(currentStory.id);
  const progress = duration > 0 ? position / duration : 0;
  const remaining = duration > 0 ? duration - position : 0;

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%`, { duration: 500 }),
  }));

  function handleProgressPress(e: any) {
    const x = e.nativeEvent.locationX;
    const barWidth = width - spacing.lg * 2;
    const newPos = (x / barWidth) * duration;
    seekTo(Math.max(0, Math.min(newPos, duration)));
  }

  function cycleSpeed() {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const idx = speeds.indexOf(playbackSpeed);
    const next = speeds[(idx + 1) % speeds.length];
    setSpeed(next);
  }

  return (
    <LinearGradient
      colors={["#2A1F3D", "#1A1528", "#0A0A0F"]}
      style={[styles.container, { paddingBottom: insets.bottom }]}
    >
      {/* Handle */}
      <View style={styles.handleRow}>
        <View style={styles.handle} />
      </View>
      <Pressable style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={22} color={colors.textSecondary} />
      </Pressable>

      {/* Cover Art */}
      <View style={styles.coverContainer}>
        {currentStory.cover_image_url ? (
          <Image
            source={{ uri: currentStory.cover_image_url }}
            style={styles.coverImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.coverImage, { backgroundColor: colors.surfaceLight }]} />
        )}
      </View>

      {/* Title + Like */}
      <View style={styles.titleRow}>
        <View style={styles.titleInfo}>
          <Text style={styles.storyTitle} numberOfLines={2}>{currentStory.title}</Text>
          <Text style={styles.speakerName}>{currentSpeaker?.name}</Text>
        </View>
        <Pressable onPress={() => toggleLike(currentStory.id)} hitSlop={12}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? colors.error : colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <Pressable style={styles.progressContainer} onPress={handleProgressPress}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
          <Animated.View
            style={[
              styles.progressThumb,
              useAnimatedStyle(() => ({
                left: withTiming(`${progress * 100}%`, { duration: 500 }),
              })),
            ]}
          />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>-{formatTime(remaining)}</Text>
        </View>
      </Pressable>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable onPress={() => skipBackward(10)} style={styles.skipBtn}>
          <View style={styles.skipIconWrap}>
            <Ionicons name="refresh-outline" size={36} color={colors.text} style={{ transform: [{ scaleX: -1 }] }} />
            <Text style={styles.skipLabel}>10</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={isPlaying ? pause : resume}
          style={styles.playPauseBtn}
        >
          {isBuffering ? (
            <Ionicons name="hourglass" size={32} color={colors.text} />
          ) : (
            <Ionicons name={isPlaying ? "pause" : "play"} size={32} color={colors.text} />
          )}
        </Pressable>

        <Pressable onPress={() => skipForward(10)} style={styles.skipBtn}>
          <View style={styles.skipIconWrap}>
            <Ionicons name="refresh-outline" size={36} color={colors.text} />
            <Text style={styles.skipLabel}>10</Text>
          </View>
        </Pressable>
      </View>

      {/* Speed */}
      <Pressable onPress={cycleSpeed} style={styles.speedPill}>
        <Text style={styles.speedText}>{playbackSpeed.toFixed(2)}x</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  handleRow: {
    alignItems: "center",
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  closeBtn: {
    position: "absolute",
    right: spacing.md,
    top: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  coverContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  coverImage: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: radius.xl,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  titleInfo: {
    flex: 1,
  },
  storyTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xxl,
    color: colors.text,
    lineHeight: 34,
  },
  speakerName: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 4,
  },

  progressContainer: {
    paddingBottom: spacing.xl,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.text,
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.text,
    marginLeft: -7,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs + 2,
  },
  timeText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xl + spacing.md,
    paddingBottom: spacing.xl,
  },
  skipBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
  },
  skipIconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  skipLabel: {
    position: "absolute",
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.text,
    marginTop: 6,
  },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  speedPill: {
    alignSelf: "center",
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  speedText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
});
