import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { useAppStore } from "@/stores/app";
import { getLocalProgress } from "@/lib/storage";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export default function SeasonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSubscribed } = useAppStore();

  const [season, setSeason] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const progress = getLocalProgress();

  useEffect(() => {
    loadSeason();
  }, [id]);

  async function loadSeason() {
    try {
      const data = await api.getSeason(id);
      setSeason(data.season);
      setStories(data.stories);
    } catch (err) {
      console.error("Failed to load season:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.testament}>
              {season?.testament === "old"
                ? "OLD TESTAMENT"
                : "NEW TESTAMENT"}
            </Text>
            <Text style={styles.seasonTitle}>{season?.name}</Text>
            <Text style={styles.seasonDesc}>{season?.description}</Text>
            <Text style={styles.storyCount}>
              {stories.length} stories
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const p = progress[item.id];
          const isCompleted = p?.completed;

          return (
            <Pressable
              style={styles.storyRow}
              onPress={() => router.push(`/story/${item.id}`)}
            >
              <View style={styles.storyNumber}>
                <Text
                  style={[
                    styles.numberText,
                    isCompleted && { color: colors.success },
                  ]}
                >
                  {isCompleted ? "✓" : index + 1}
                </Text>
              </View>
              <View style={styles.storyInfo}>
                <Text style={styles.storyTitle}>{item.title}</Text>
                <Text style={styles.storyMeta}>
                  {Math.ceil(item.duration_seconds / 60)} min
                  {item.is_free
                    ? "  •  Free"
                    : !isSubscribed
                      ? "  •  Premium"
                      : ""}
                </Text>
              </View>
              {!item.is_free && !isSubscribed && (
                <Text style={styles.lockIcon}>🔒</Text>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

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
  backBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  testament: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 1.5,
  },
  seasonTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.hero,
    color: colors.text,
    marginTop: spacing.xs,
  },
  seasonDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  storyCount: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  storyNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  storyInfo: {
    flex: 1,
  },
  storyTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  storyMeta: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  lockIcon: {
    fontSize: 16,
  },
});
