import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/stores/app";
import { usePlayerStore } from "@/stores/player";
import { useGate } from "@/lib/useGate";
import { coverUrl, getStoryById } from "@/lib/content";
import { getOverallProgress } from "@/lib/storage";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export default function StoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { guardedPush } = useGate();
  const { stories, likedStoryIds, streak } = useAppStore();
  const currentStory = usePlayerStore((s) => s.currentStory);

  const likedCount = likedStoryIds.filter((id) => getStoryById(id)).length;
  const overall = getOverallProgress(stories.length);

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
          <Text style={styles.progressPercent}>{overall.percent}%</Text>
          <Text style={styles.progressLabel}>completed</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${overall.percent}%` }]} />
        </View>
        <Text style={styles.progressSub}>
          {overall.completedCount} of {stories.length} stories
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
          <Text style={styles.statNum}>{overall.completedCount}</Text>
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
            <Image source={{ uri: currentStory.cover_image_url }} style={styles.npThumb} contentFit="cover" />
            <View style={styles.npInfo}>
              <Text style={styles.npTitle} numberOfLines={1}>{currentStory.title}</Text>
              <Text style={styles.npSub}>Tap to continue</Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* OT / NT cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse</Text>
        <View style={styles.testamentRow}>
          <Pressable style={styles.testamentCard} onPress={() => router.push("/testament/old")}>
            <Image source={{ uri: coverUrl("crossing-the-red-sea") }} style={styles.testamentImg} contentFit="cover" />
            <View style={styles.testamentOverlay} />
            <View style={styles.testamentContent}>
              <Text style={styles.testamentLabel}>Old Testament</Text>
            </View>
          </Pressable>
          <Pressable style={styles.testamentCard} onPress={() => router.push("/testament/new")}>
            <Image source={{ uri: coverUrl("the-resurrection") }} style={styles.testamentImg} contentFit="cover" />
            <View style={styles.testamentOverlay} />
            <View style={styles.testamentContent}>
              <Text style={styles.testamentLabel}>New Testament</Text>
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
    fontSize: fontSize.xl,
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

});
