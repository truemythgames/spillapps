import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore, type StoryWithCover } from "@/stores/app";
import { useGate } from "@/lib/useGate";
import { getLocalProgress } from "@/lib/storage";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

const NEW_TESTAMENT = new Set(["Gospels"]);

export default function TestamentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { guardedPush } = useGate();
  const { seasons } = useAppStore();
  const progress = getLocalProgress();

  const isOT = id === "old";
  const title = isOT ? "Old Testament" : "New Testament";
  const filtered = seasons.filter((s: any) =>
    isOT ? !NEW_TESTAMENT.has(s.name) : NEW_TESTAMENT.has(s.name),
  );
  const totalStories = filtered.reduce((n: number, s: any) => n + s.stories.length, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>{totalStories} stories</Text>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((season: any) => {
          const stories: StoryWithCover[] = season.stories;
          const completed = stories.filter((s) => progress[s.id]?.completed).length;
          const pct = stories.length > 0 ? Math.round((completed / stories.length) * 100) : 0;

          return (
            <View key={season.name} style={styles.seasonBlock}>
              <View style={styles.seasonHeader}>
                <Text style={styles.seasonName}>{season.name}</Text>
                <Text style={styles.seasonMeta}>{stories.length} stories · {pct}% done</Text>
                <View style={styles.seasonBar}>
                  <View style={[styles.seasonBarFill, { width: `${pct}%` }]} />
                </View>
              </View>

              {stories.map((story) => {
                const done = progress[story.id]?.completed;
                return (
                  <Pressable
                    key={story.id}
                    style={styles.storyRow}
                    onPress={() => guardedPush(`/story/${story.id}`)}
                  >
                    <Image source={{ uri: story.cover_image_url }} style={styles.storyThumb} contentFit="cover" />
                    <View style={styles.storyInfo}>
                      <Text style={styles.storyTitle} numberOfLines={1}>{story.title}</Text>
                      <Text style={styles.storySub} numberOfLines={1}>{story.description}</Text>
                    </View>
                    {done && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.text },

  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },

  seasonBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  seasonHeader: { marginBottom: spacing.sm },
  seasonName: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.text },
  seasonMeta: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  seasonBar: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  seasonBarFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 2 },

  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  storyThumb: { width: 48, height: 48, borderRadius: radius.sm },
  storyInfo: { flex: 1 },
  storyTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.text },
  storySub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
