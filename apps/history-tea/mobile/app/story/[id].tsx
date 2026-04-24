import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { usePlayerStore } from "@/stores/player";
import { useAppStore } from "@/stores/app";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";
import {
  getStoryById,
  transcriptUrl,
  type Speaker,
} from "@/lib/content";
import { api } from "@/lib/api";
import { storage } from "@/lib/storage";

const { width } = Dimensions.get("window");
const COVER_HEIGHT = 420;

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    currentStory,
    currentSpeaker: playerSpeaker,
    isPlaying,
    isBuffering,
    play,
    pause,
    resume,
    setHideMini,
  } = usePlayerStore();

  const likedStoryIds = useAppStore((s) => s.likedStoryIds);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const isLiked = likedStoryIds.includes(id);

  const story = getStoryById(id);
  const storeStory = useAppStore((s) => s.stories.find((st) => st.id === id));
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);
  const [storyDetail, setStoryDetail] = useState<any>(null);

  const coverImageUrl = storyDetail?.cover_image_url ?? storeStory?.cover_image_url ?? null;
  const apiStoryId = storeStory?.apiId ?? id;

  useEffect(() => {
    let cancelled = false;
    api.getStory(apiStoryId).then((data) => {
      if (cancelled) return;
      if (data.story) {
        setStoryDetail(data.story);
      }
      if (data.audio_versions?.length) {
        const apiSpeakers: Speaker[] = data.audio_versions.map((a: any) => ({
          key: a.speaker_id,
          name: a.speaker_name,
          audioUrl: a.audio_url,
        }));
        setSpeakers(apiSpeakers);
        setActiveSpeaker((prev) => {
          if (prev && apiSpeakers.find((s) => s.key === prev.key)) return prev;
          const { currentStory: ps, currentSpeaker: psp } = usePlayerStore.getState();
          if (ps?.id === id && psp) {
            const match = apiSpeakers.find((s) => s.key === psp.id);
            if (match) return match;
          }
          const savedKey = storage.getString(`speaker_${id}`);
          if (savedKey) {
            const saved = apiSpeakers.find((s) => s.key === savedKey);
            if (saved) return saved;
          }
          return apiSpeakers[0] ?? prev;
        });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [id]);
  const [showSpeakerPicker, setShowSpeakerPicker] = useState(false);
  const sheetTranslateY = useSharedValue(400);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    return () => setHideMini(false);
  }, []);

  const openSheet = useCallback(() => {
    setShowSpeakerPicker(true);
    setHideMini(true);
    backdropOpacity.value = withTiming(1, { duration: 200 });
    sheetTranslateY.value = withSpring(0, { damping: 25, stiffness: 300 });
  }, []);

  const closeSheet = useCallback(() => {
    setHideMini(false);
    backdropOpacity.value = withTiming(0, { duration: 200 });
    sheetTranslateY.value = withTiming(400, { duration: 250 }, () => {
      runOnJS(setShowSpeakerPicker)(false);
    });
  }, []);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        sheetTranslateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 80 || e.velocityY > 500) {
        runOnJS(closeSheet)();
      } else {
        sheetTranslateY.value = withSpring(0, { damping: 25, stiffness: 300 });
      }
    });

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const backdropAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      backdropOpacity.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const [transcript, setTranscript] = useState<string | null>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(true);

  const playerDuration = usePlayerStore((s) => s.duration);
  const isThisPlaying = currentStory?.id === id && isPlaying;
  const isThisLoaded = currentStory?.id === id;
  const hasAudio = speakers.length > 0;

  useEffect(() => {
    if (!story) return;
    const urlsToTry: string[] = [];
    if (coverImageUrl) {
      const derived = coverImageUrl.replace(/\/cover\.webp(\?.*)?$/, "/transcript.md");
      if (derived !== coverImageUrl) urlsToTry.push(derived);
    }
    urlsToTry.push(transcriptUrl(id));

    let cancelled = false;
    (async () => {
      for (const url of urlsToTry) {
        try {
          const r = await fetch(url);
          if (r.ok) {
            const text = await r.text();
            if (cancelled) return;
            const stripped = text.replace(/^#\s+.*\n+\*.*\*\n*/m, "");
            setTranscript(stripped);
            setLoadingTranscript(false);
            return;
          }
        } catch {}
      }
      if (!cancelled) {
        setTranscript(null);
        setLoadingTranscript(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, coverImageUrl]);

  const handlePlayPause = useCallback(async () => {
    if (!story || !activeSpeaker) return;
    if (isThisLoaded) {
      isPlaying ? await pause() : await resume();
    } else {
      play(
        { id: story.id, title: story.title, cover_image_url: coverImageUrl },
        { id: activeSpeaker.key, name: activeSpeaker.name },
        activeSpeaker.audioUrl
      );
      router.push("/player");
    }
  }, [story, activeSpeaker, isThisLoaded, isPlaying]);

  const handleSpeakerSelect = useCallback(
    async (speaker: Speaker) => {
      setActiveSpeaker(speaker);
      storage.set(`speaker_${id}`, speaker.key);
      closeSheet();
      if (!story) return;
      await play(
        { id: story.id, title: story.title, cover_image_url: coverImageUrl },
        { id: speaker.key, name: speaker.name },
        speaker.audioUrl
      );
    },
    [story, id]
  );

  if (!story) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Story not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const realMinutes = isThisLoaded && playerDuration > 0
    ? Math.max(1, Math.round(playerDuration / 60))
    : null;
  const estimatedMinutes = realMinutes
    ?? (transcript ? Math.max(1, Math.round(transcript.split(/\s+/).length / 120)) : null);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero cover with overlay content */}
        <View style={styles.coverWrap}>
          <Image
            source={{ uri: coverImageUrl }}
            style={styles.coverImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.85)"]}
            style={styles.coverGradient}
          />

          {/* Back + Like buttons */}
          <Pressable
            style={[styles.navBtn, styles.backBtn, { top: insets.top + spacing.xs }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <Pressable
            style={[styles.navBtn, styles.likeBtn, { top: insets.top + spacing.xs }]}
            onPress={() => toggleLike(id)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? colors.error : "#fff"}
            />
          </Pressable>

          {/* Title + meta overlaid at bottom */}
          <View style={styles.coverContent}>
            <Text style={styles.heroTitle}>{story.title}</Text>
            <Text style={styles.heroRef}>{story.bibleRef}</Text>

            {/* Speaker + Length row */}
            {hasAudio && (
              <View style={styles.metaRow}>
                <Pressable
                  style={styles.metaItem}
                  onPress={openSheet}
                >
                  <Text style={styles.metaLabel}>Speaker</Text>
                  <View style={styles.metaValueRow}>
                    <Text style={styles.metaValue}>
                      {isBuffering && isThisLoaded ? "Loading..." : activeSpeaker?.name ?? "—"}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color="#fff" />
                  </View>
                </Pressable>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Length</Text>
                  <Text style={styles.metaValue}>
                    {estimatedMinutes ? `${estimatedMinutes} min` : "—"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          {hasAudio && (
            <Pressable style={styles.playSessionBtn} onPress={handlePlayPause}>
              <Ionicons
                name={isThisPlaying ? "pause" : "play"}
                size={18}
                color={colors.background}
              />
              <Text style={styles.playSessionText}>
                {isThisPlaying ? "Pause" : "Play Session"}
              </Text>
            </Pressable>
          )}
          <Pressable
            style={styles.askBtn}
            onPress={() => router.push(`/chat?topic=story&storyId=${id}&storyTitle=${encodeURIComponent(story.title)}&storyRef=${encodeURIComponent(story.bibleRef)}` as any)}
          >
            <Ionicons name="sparkles" size={18} color={colors.text} />
            <Text style={styles.askBtnText}>Ask a question</Text>
          </Pressable>
        </View>

        {/* Transcript / Context */}
        <View style={styles.transcriptSection}>
          {loadingTranscript ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
          ) : transcript ? (
            <Markdown style={markdownStyles}>{transcript}</Markdown>
          ) : (
            <Text style={styles.noTranscript}>
              Transcript not yet generated.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Speaker picker bottom sheet */}
      {showSpeakerPicker && (
        <>
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.sheetBackdrop, backdropAnimStyle]}
            pointerEvents="auto"
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          </Animated.View>
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.sheetContainer,
                { paddingBottom: insets.bottom + spacing.md },
                sheetAnimStyle,
              ]}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Choose a voice</Text>
              {speakers.map((s) => (
                <Pressable
                  key={s.key}
                  style={[
                    styles.speakerOption,
                    s.key === activeSpeaker?.key && styles.speakerOptionActive,
                  ]}
                  onPress={() => handleSpeakerSelect(s)}
                >
                  <View style={styles.speakerInfo}>
                    <View style={styles.speakerAvatar}>
                      <Ionicons name="mic" size={18} color={s.key === activeSpeaker?.key ? colors.primary : colors.textMuted} />
                    </View>
                    <Text
                      style={[
                        styles.speakerOptionText,
                        s.key === activeSpeaker?.key && styles.speakerOptionTextActive,
                      ]}
                    >
                      {s.name}
                    </Text>
                  </View>
                  {s.key === activeSpeaker?.key && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </Animated.View>
          </GestureDetector>
        </>
      )}
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: 26,
  },
  heading1: {
    display: "none" as any,
  },
  heading2: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  paragraph: {
    marginBottom: spacing.md,
  },
  blockquote: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.surfaceBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginVertical: spacing.sm,
  },
  em: {
    color: colors.textSecondary,
    fontStyle: "italic",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },

  /* Hero cover */
  coverWrap: {
    width,
    height: COVER_HEIGHT,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  navBtn: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    left: spacing.md,
  },
  likeBtn: {
    right: spacing.md,
  },

  coverContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  heroTitle: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: "#fff",
    lineHeight: 34,
  },
  heroRef: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.5)",
  },
  metaValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  metaValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: "#fff",
  },
  metaDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: spacing.md,
  },

  /* Speaker bottom sheet */
  sheetBackdrop: {
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    zIndex: 11,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceBorder,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
    marginBottom: spacing.md,
  },
  speakerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  speakerOptionActive: {
    borderBottomColor: colors.surfaceBorder,
  },
  speakerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },
  speakerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  speakerOptionText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.text,
  },
  speakerOptionTextActive: {
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
  },

  /* Action buttons */
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  playSessionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  playSessionText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.background,
  },
  askBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  askBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },

  /* Transcript */
  transcriptSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  contextHeading: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xxl,
    color: colors.text,
    marginBottom: spacing.md,
  },
  noTranscript: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontStyle: "italic",
    marginTop: spacing.sm,
  },
});
