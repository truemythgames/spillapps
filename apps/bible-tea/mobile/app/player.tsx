import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, ActivityIndicator, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withTiming,
} from "react-native-reanimated";
import { COMPLETED_FRACTION, SKIP_SECONDS, usePlayerStore } from "@/stores/player";
import { useAppStore } from "@/stores/app";
import { isPrayerPlayerId, listHasId, prayerRouteId } from "@/lib/storage";
import { CoverImage } from "@/components/CoverImage";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

const { width, height } = Dimensions.get("window");
const COVER_SIZE = width - 80;
const DISMISS_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 800;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function PlayerScreen() {
  const { t } = useTranslation();
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
  const stop = usePlayerStore((s) => s.stop);
  const completedStoryIds = useAppStore((s) => s.completedStoryIds);

  const [trackW, setTrackW] = useState(Math.max(1, width - spacing.lg * 2));
  const [dragFrac, setDragFrac] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);
  const trackWRef = useRef(trackW);
  trackWRef.current = trackW;

  const translateY = useSharedValue(0);
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (!currentStory && !isBuffering) router.back();
  }, [currentStory, isBuffering]);

  const isCompleted = !!(
    currentStory &&
    (listHasId(completedStoryIds, currentStory.id, ...(currentStory.progressAliases ?? [])) ||
      (duration > 0 && position / duration >= COMPLETED_FRACTION))
  );

  const closePlayer = () => {
    if (isCompleted) stop();
    router.back();
  };

  const dismissGesture = Gesture.Pan()
    .enabled(Platform.OS === "android")
    .activeOffsetY(15)
    .failOffsetX([-20, 20])
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > VELOCITY_THRESHOLD) {
        translateY.value = withTiming(height, { duration: 200 });
        runOnJS(closePlayer)();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  if (!currentStory) {
    return (
      <LinearGradient
        colors={["#2A1F3D", "#1A1528", "#0A0A0F"]}
        style={[styles.container, { paddingBottom: insets.bottom, justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color={colors.text} />
      </LinearGradient>
    );
  }

  const isLiked = listHasId(likedStoryIds, currentStory.id, ...(currentStory.progressAliases ?? []));
  const liveFrac = duration > 0 ? Math.max(0, Math.min(position / duration, 1)) : 0;
  const frac = dragFrac ?? liveFrac;
  const fillW = frac * trackW;
  const shownPosition = dragFrac != null && duration > 0 ? dragFrac * duration : position;
  const remaining = duration > 0 ? Math.max(0, duration - shownPosition) : 0;

  const fracFromX = (x: number) => {
    const w = trackWRef.current;
    return Math.max(0, Math.min(w > 0 ? x / w : 0, 1));
  };

  const onScrub = (x: number) => {
    const next = fracFromX(x);
    dragRef.current = next;
    setDragFrac(next);
  };

  const onScrubEnd = () => {
    const next = dragRef.current;
    if (next == null) return;
    const dur = usePlayerStore.getState().duration;
    if (dur > 0) {
      void seekTo(next * dur).finally(() => {
        dragRef.current = null;
        setDragFrac(null);
      });
      return;
    }
    dragRef.current = null;
    setDragFrac(null);
  };

  const progressGesture = Gesture.Pan()
    .minDistance(0)
    .hitSlop({ top: 20, bottom: 20 })
    .onBegin((e) => {
      runOnJS(onScrub)(e.x);
    })
    .onUpdate((e) => {
      runOnJS(onScrub)(e.x);
    })
    .onFinalize(() => {
      runOnJS(onScrubEnd)();
    });

  const goToStory = () => {
    const id = currentStory.id;
    const path = isPrayerPlayerId(id)
      ? `/prayer/${prayerRouteId(id)}`
      : `/story/${id}`;
    if (router.canDismiss()) {
      router.dismiss();
    }
    requestAnimationFrame(() => {
      router.navigate(path as any);
    });
  };

  function cycleSpeed() {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const idx = speeds.indexOf(playbackSpeed);
    const next = speeds[(idx + 1) % speeds.length];
    setSpeed(next);
  }

  return (
    <Animated.View style={[{ flex: 1 }, containerStyle]}>
    <LinearGradient
      colors={["#2A1F3D", "#1A1528", "#0A0A0F"]}
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          paddingTop: Platform.OS === "android" ? insets.top + 4 : 0,
        },
      ]}
    >
      <GestureDetector gesture={dismissGesture}>
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>
      </GestureDetector>
      <Pressable style={[styles.closeBtn, { top: (Platform.OS === "android" ? insets.top : 0) + 8 }]} onPress={closePlayer}>
        <Ionicons name="close" size={22} color={colors.textSecondary} />
      </Pressable>

      <Pressable style={styles.coverContainer} onPress={goToStory}>
        {currentStory.cover_image_url ? (
          <CoverImage
            uri={currentStory.cover_image_url}
            storyId={currentStory.id}
            displayWidth={1024}
            style={styles.coverImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.coverImage, { backgroundColor: colors.surfaceLight, alignItems: "center", justifyContent: "center" }]}>
            <Ionicons name="heart" size={64} color={colors.primary} />
          </View>
        )}
      </Pressable>

      <View style={styles.titleRow}>
        <View style={styles.titleInfo}>
          <Text style={styles.storyTitle} numberOfLines={2}>{currentStory.title}</Text>
          <Text style={styles.speakerName}>{currentSpeaker?.name}</Text>
          <Pressable style={styles.viewStoryBtn} onPress={goToStory}>
            <Ionicons name={isPrayerPlayerId(currentStory.id) ? "heart-outline" : "book-outline"} size={16} color={colors.text} />
            <Text style={styles.viewStoryText}>
              {isPrayerPlayerId(currentStory.id) ? t("player.viewPrayer") : t("player.viewStory")}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.text} />
          </Pressable>
        </View>
        <Pressable onPress={() => toggleLike(currentStory.id, currentStory.progressAliases)} hitSlop={12}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? colors.error : colors.textSecondary}
          />
        </Pressable>
      </View>

      <View style={styles.progressContainer}>
        <GestureDetector gesture={progressGesture}>
          <View
            style={styles.progressHit}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0) setTrackW(w);
            }}
          >
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: fillW }]} />
              <View style={[styles.progressThumb, { transform: [{ translateX: fillW }] }]} />
            </View>
          </View>
        </GestureDetector>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(shownPosition)}</Text>
          <Text style={styles.timeText}>{duration > 0 ? `-${formatTime(remaining)}` : "--:--"}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={() => { void skipBackward(SKIP_SECONDS); }} style={styles.skipBtn} hitSlop={12}>
          <Ionicons name="play-back" size={34} color={colors.text} />
          <Text style={styles.skipLabel}>{SKIP_SECONDS}</Text>
        </Pressable>

        <Pressable
          onPress={isPlaying ? pause : resume}
          style={styles.playPauseBtn}
          disabled={isBuffering}
        >
          {isBuffering ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Ionicons name={isPlaying ? "pause" : "play"} size={32} color={colors.text} />
          )}
        </Pressable>

        <Pressable onPress={() => { void skipForward(SKIP_SECONDS); }} style={styles.skipBtn} hitSlop={12}>
          <Ionicons name="play-forward" size={34} color={colors.text} />
          <Text style={styles.skipLabel}>{SKIP_SECONDS}</Text>
        </Pressable>
      </View>

      <Pressable onPress={cycleSpeed} style={styles.speedPill}>
        <Text style={styles.speedText}>{playbackSpeed.toFixed(2)}x</Text>
      </Pressable>
    </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  handleRow: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 14,
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
    alignItems: "flex-start",
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
  viewStoryBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  viewStoryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },

  progressContainer: {
    paddingBottom: spacing.xl,
  },
  progressHit: {
    height: 44,
    justifyContent: "center",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 3,
    overflow: "visible",
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.text,
    borderRadius: 3,
  },
  progressThumb: {
    position: "absolute",
    top: -9,
    left: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text,
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
    width: 64,
    height: 64,
  },
  skipLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.text,
    marginTop: 2,
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
