import { View, Text, StyleSheet, ScrollView, Pressable, FlatList } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/stores/app";
import { usePlayerStore } from "@/stores/player";
import { useGate } from "@/lib/useGate";
import { coverUrl } from "@/lib/content";

import { getLocalProgress } from "@/lib/storage";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export default function StoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { guardedPush } = useGate();
  const { stories, likedStoryIds, completedStoryIds, streak, progressVersion } = useAppStore();
  const currentStory = usePlayerStore((s) => s.currentStory);

  const likedCount = likedStoryIds.length;
  const completedCount = completedStoryIds.length;
  const percent = stories.length > 0 ? Math.round((completedCount / stories.length) * 100) : 0;

  // progressVersion triggers re-render when progress is synced
  void progressVersion;
  const progress = getLocalProgress();
  const storyMap = Object.fromEntries(stories.map((s) => [s.id, s]));
  const continueListening = Object.entries(progress)
    .filter(([id, p]) => !p.completed && p.position > 0 && storyMap[id])
    .sort(([, a], [, b]) => (b.lastPlayedAt ?? "").localeCompare(a.lastPlayedAt ?? ""))
    .slice(0, 10)
    .map(([id, p]) => {
      const story = storyMap[id];
      return {
        ...story,
        progressPercent: p.duration > 0 ? Math.round((p.position / p.duration) * 100) : 0,
      };
    });

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Stories</Text>

      {/* Overall progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressPercent}>{percent}%</Text>
          <Text style={styles.progressLabel}>completed</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.progressSub}>
          {completedCount} of {stories.length} stories
        </Text>
      </View>

      {/* Streak + stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statNum}>{streak.current_streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <Pressable style={styles.statCard} onPress={() => router.push("/completed")}>
          <Text style={styles.statEmoji}>✅</Text>
          <Text style={styles.statNum}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </Pressable>
        <Pressable style={styles.statCard} onPress={() => router.push("/liked")}>
          <Text style={styles.statEmoji}>❤️</Text>
          <Text style={styles.statNum}>{likedCount}</Text>
          <Text style={styles.statLabel}>Liked</Text>
        </Pressable>
      </View>

      {/* Currently listening */}
      {currentStory && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Now Playing</Text>
          <Pressable
            style={styles.nowPlaying}
            onPress={() => guardedPush(`/story/${currentStory.id}`)}
          >
            <Image source={{ uri: currentStory.cover_image_url ?? undefined }} style={styles.npThumb} contentFit="cover" transition={300} />
            <View style={styles.npInfo}>
              <Text style={styles.npTitle} numberOfLines={1}>{currentStory.title}</Text>
              <Text style={styles.npSub}>Tap to continue</Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Continue Listening */}
      {continueListening.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Listening</Text>
          <FlatList
            horizontal
            data={continueListening}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable style={styles.clCard} onPress={() => guardedPush(`/story/${item.id}`)}>
                <View>
                  <Image source={{ uri: item.cover_image_url ?? undefined }} style={styles.clImg} contentFit="cover" transition={300} />
                  <View style={styles.clBarBg}>
                    <View style={[styles.clBarFill, { width: `${item.progressPercent}%` }]} />
                  </View>
                </View>
                <Text style={styles.clTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.clSub}>{item.progressPercent}% done</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Era cards (pre-1500 vs post-1500) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse</Text>
        <View style={styles.testamentRow}>
          <Pressable style={styles.testamentCard} onPress={() => router.push("/testament/old")}>
            <Image source={{ uri: storyMap["building-the-pyramids"]?.cover_image_url ?? coverUrl("building-the-pyramids") }} style={styles.testamentImg} contentFit="cover" transition={300} />
            <View style={styles.testamentOverlay} />
            <View style={styles.testamentContent}>
              <Text style={styles.testamentLabel}>Ancient & Medieval</Text>
              <Text style={styles.testamentSub}>pre-1500</Text>
            </View>
          </Pressable>
          <Pressable style={styles.testamentCard} onPress={() => router.push("/testament/new")}>
            <Image source={{ uri: storyMap["moon-landing"]?.cover_image_url ?? coverUrl("moon-landing") }} style={styles.testamentImg} contentFit="cover" transition={300} />
            <View style={styles.testamentOverlay} />
            <View style={styles.testamentContent}>
              <Text style={styles.testamentLabel}>Modern Era</Text>
              <Text style={styles.testamentSub}>post-1500</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pageTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.hero,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },

  progressCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  progressTop: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  progressPercent: { fontFamily: fonts.bodyBold, fontSize: 32, color: colors.primary },
  progressLabel: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 3 },
  progressSub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  statEmoji: { fontSize: 20 },
  statNum: { fontFamily: fonts.bodyBold, fontSize: fontSize.xl, color: colors.text, marginTop: 4 },
  statLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionTitle: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.text, marginBottom: spacing.sm },

  nowPlaying: {
    flexDirection: "row",
    backgroundColor: colors.primary + "15",
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary + "40",
  },
  npThumb: { width: 50, height: 50, borderRadius: radius.sm },
  npInfo: { flex: 1 },
  npTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.text },
  npSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.primary, marginTop: 2 },

  clCard: { width: 130, marginRight: spacing.md },
  clImg: { width: 130, height: 130, borderRadius: radius.md },
  clBarBg: {
    height: 3,
    backgroundColor: colors.surfaceLight,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    overflow: "hidden",
    marginTop: -3,
  },
  clBarFill: { height: "100%", backgroundColor: colors.primary },
  clTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  clSub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  testamentRow: { flexDirection: "row", gap: spacing.md },
  testamentCard: {
    flex: 1,
    height: 140,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  testamentImg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  testamentOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  testamentContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  testamentLabel: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  testamentSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 2,
    letterSpacing: 0.5,
  },

});
