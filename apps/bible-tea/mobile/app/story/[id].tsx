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
import { LinearGradient } from "expo-linear-gradient";
import { CoverImage } from "@/components/CoverImage";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
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
import { api } from "@/lib/api";
import { bibleRefFromTranscript, bibleRefFromStory } from "@/lib/bible-ref";
import { listHasId, storage, storyAliasIds } from "@/lib/storage";

interface Speaker {
  key: string;
  name: string;
  audioUrl: string;
  durationSeconds?: number;
}

const { width } = Dimensions.get("window");
const COVER_HEIGHT = 420;

export default function StoryScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }, [navigation, router]);

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

  const isSubscribed = useAppStore((s) => s.isSubscribed);
  const likedStoryIds = useAppStore((s) => s.likedStoryIds);
  const toggleLike = useAppStore((s) => s.toggleLike);

  useEffect(() => {
    if (!isSubscribed) {
      router.replace("/paywall");
    }
  }, [isSubscribed]);

  const storeStory = useAppStore((s) => s.stories.find((st) => st.id === id || st.apiId === id));
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);
  const [storyDetail, setStoryDetail] = useState<any>(null);

  const coverImageUrl = storyDetail?.cover_image_url ?? storeStory?.cover_image_url ?? null;
  const apiStoryId = storeStory?.apiId ?? id;
  const story = storeStory || storyDetail;

  const [detailLoaded, setDetailLoaded] = useState(false);
  const [relatedPrayers, setRelatedPrayers] = useState<any[]>([]);
  const [relatedCharacters, setRelatedCharacters] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    setDetailLoaded(false);
    setRelatedPrayers([]);
    setRelatedCharacters([]);

    const fetchStory = () => {
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
            durationSeconds: Number(a.duration_seconds) || 0,
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
        setRelatedCharacters(data.characters ?? []);
        if (data.related_prayers) {
          setRelatedPrayers(data.related_prayers);
        } else {
          const storyKey = data.story?.id ?? apiStoryId;
          api.getPrayersForStory(storyKey).then((res) => {
            if (!cancelled) setRelatedPrayers(res.prayers ?? []);
          }).catch(() => {
            if (!cancelled) setRelatedPrayers([]);
          });
        }
        setDetailLoaded(true);
      }).catch(() => {
        if (!cancelled) setTimeout(fetchStory, 2000);
      });
    };

    fetchStory();
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
  const storyPlayerId = storeStory?.id ?? storyDetail?.slug ?? id;
  const storyAliases = storyAliasIds(storeStory ?? null, storyDetail?.id, storyDetail?.slug, id, storyPlayerId);
  const isLiked = listHasId(likedStoryIds, ...storyAliases);
  const isThisLoaded =
    currentStory?.id === id ||
    currentStory?.id === storeStory?.id ||
    currentStory?.id === storeStory?.apiId ||
    currentStory?.id === storyDetail?.id ||
    currentStory?.id === storyDetail?.slug;
  const isThisPlaying = isThisLoaded && isPlaying;
  const hasAudio = speakers.length > 0;

  useEffect(() => {
    if (!detailLoaded) {
      setLoadingTranscript(true);
      return;
    }

    if (storyDetail?.transcript) {
      const stripped = storyDetail.transcript.replace(/^#\s+.*\n+\*.*\*\n*/m, "");
      setTranscript(stripped);
    } else {
      setTranscript(null);
    }
    setLoadingTranscript(false);
  }, [id, detailLoaded, storyDetail?.transcript]);

  const displayTitle = storyDetail?.title ?? storeStory?.title ?? "";
  const bibleRef =
    bibleRefFromTranscript(storyDetail?.transcript) ||
    bibleRefFromStory(storyDetail) ||
    storeStory?.bibleRef ||
    "";

  const handlePlayPause = useCallback(async () => {
    if (!story || !activeSpeaker) return;
    if (isThisLoaded) {
      isPlaying ? await pause() : await resume();
    } else {
      play(
        {
          id: storyPlayerId,
          title: displayTitle,
          cover_image_url: coverImageUrl,
          duration_seconds:
            activeSpeaker.durationSeconds ||
            storyDetail?.duration_seconds ||
            storeStory?.duration_seconds ||
            0,
          progressAliases: storyAliases,
        },
        { id: activeSpeaker.key, name: activeSpeaker.name },
        activeSpeaker.audioUrl
      );
      router.push("/player");
    }
  }, [story, activeSpeaker, isThisLoaded, isPlaying, displayTitle, storyDetail, storeStory, storyPlayerId, storyAliases]);

  const handleSpeakerSelect = useCallback(
    async (speaker: Speaker) => {
      setActiveSpeaker(speaker);
      storage.set(`speaker_${id}`, speaker.key);
      closeSheet();
      if (!story) return;
      await play(
        {
          id: storyPlayerId,
          title: displayTitle,
          cover_image_url: coverImageUrl,
          duration_seconds:
            speaker.durationSeconds ||
            storyDetail?.duration_seconds ||
            storeStory?.duration_seconds ||
            0,
          progressAliases: storyAliases,
        },
        { id: speaker.key, name: speaker.name },
        speaker.audioUrl
      );
    },
    [story, id, displayTitle, storyDetail, storeStory, storyPlayerId, storyAliases]
  );

  if (!story) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{t("story.notFound")}</Text>
        <Pressable onPress={handleBack} style={{ marginTop: 16 }}>
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.primary }}>{t("story.goBack")}</Text>
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
          <CoverImage
            uri={coverImageUrl}
            storyId={id}
            displayWidth={1024}
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
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <Pressable
            style={[styles.navBtn, styles.likeBtn, { top: insets.top + spacing.xs }]}
            onPress={() => toggleLike(storyPlayerId, storyAliases)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? colors.error : "#fff"}
            />
          </Pressable>

          {/* Title + meta overlaid at bottom */}
          <View style={styles.coverContent}>
            <Text style={styles.heroTitle}>{displayTitle}</Text>
            {bibleRef ? <Text style={styles.heroRef}>{bibleRef}</Text> : null}

            {/* Speaker + Length row */}
            {hasAudio && (
              <View style={styles.metaRow}>
                <Pressable
                  style={styles.metaItem}
                  onPress={openSheet}
                >
                  <Text style={styles.metaLabel}>{t("story.speaker")}</Text>
                  <View style={styles.metaValueRow}>
                    <Text style={styles.metaValue}>
                      {isBuffering && isThisLoaded ? t("story.loading") : activeSpeaker?.name ?? "—"}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color="#fff" />
                  </View>
                </Pressable>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>{t("story.length")}</Text>
                  <Text style={styles.metaValue}>
                    {estimatedMinutes ? t("common.min", { count: estimatedMinutes }) : "—"}
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
                {isThisPlaying ? t("story.pause") : t("story.playSession")}
              </Text>
            </Pressable>
          )}
          <Pressable
            style={styles.askBtn}
            onPress={() => router.push(`/chat?topic=story&storyId=${id}&storyTitle=${encodeURIComponent(displayTitle)}&storyRef=${encodeURIComponent(bibleRef)}` as any)}
          >
            <Ionicons name="sparkles" size={18} color={colors.text} />
            <Text style={styles.askBtnText}>{t("story.askQuestion")}</Text>
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
              {t("story.noTranscript")}
            </Text>
          )}
        </View>

        {relatedPrayers.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>{t("story.relatedPrayers")}</Text>
            {relatedPrayers.map((prayer: any) => (
              <Pressable
                key={prayer.id}
                style={styles.relatedItem}
                onPress={() => router.push(`/prayer/${prayer.slug ?? prayer.id}` as any)}
              >
                <Ionicons name="heart-outline" size={18} color={colors.primary} />
                <Text style={styles.relatedItemText}>{prayer.title}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

        {relatedCharacters.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>{t("story.relatedCharacters")}</Text>
            {relatedCharacters.map((ch: any) => (
              <Pressable
                key={ch.id}
                style={styles.relatedItem}
                onPress={() => router.push(`/character/${encodeURIComponent(ch.slug ?? ch.id ?? ch.name)}` as any)}
              >
                <Ionicons name="person-outline" size={18} color={colors.accent} />
                <Text style={styles.relatedItemText}>{ch.name}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}
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
              <Text style={styles.sheetTitle}>{t("story.chooseVoice")}</Text>
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
  relatedSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  relatedTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  relatedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  relatedItemText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
});
