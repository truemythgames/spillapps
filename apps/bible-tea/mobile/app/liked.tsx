import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/app";
import { CoverImage } from "@/components/CoverImage";
import { api } from "@/lib/api";
import { isPrayerPlayerId, newestFirst, prayerRouteId } from "@/lib/storage";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export default function LikedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const forPrayers = kind === "prayer";
  const likedStoryIds = useAppStore((s) => s.likedStoryIds);
  const stories = useAppStore((s) => s.stories);
  const [prayers, setPrayers] = useState<{ id: string; slug: string; title: string }[]>([]);

  useEffect(() => {
    if (!forPrayers) return;
    api.getPrayers().then((res) => setPrayers(res.prayers ?? [])).catch(() => {});
  }, [forPrayers]);

  const items = forPrayers
    ? newestFirst(likedStoryIds.filter(isPrayerPlayerId))
        .map((id) => {
          const key = prayerRouteId(id);
          const prayer = prayers.find((p) => p.slug === key || p.id === key);
          return prayer ? { id, title: prayer.title, sub: "", path: `/prayer/${prayer.slug ?? prayer.id}` } : null;
        })
        .filter(Boolean) as { id: string; title: string; sub: string; path: string; cover?: string | null }[]
    : newestFirst(likedStoryIds.filter((id) => !isPrayerPlayerId(id)))
        .map((id) => {
          const story = stories.find((s) => s.id === id || s.apiId === id);
          return story
            ? { id, title: story.title, sub: story.description, path: `/story/${story.id}`, cover: story.cover_image_url }
            : null;
        })
        .filter(Boolean) as { id: string; title: string; sub: string; path: string; cover?: string | null }[];

  const noun = items.length === 1
    ? (forPrayers ? t("prayers.prayer") : t("common.story"))
    : (forPrayers ? t("prayers.prayers") : t("common.stories"));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {forPrayers ? t("liked.prayerTitle") : t("liked.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {forPrayers ? t("liked.emptyPrayerTitle") : t("liked.emptyTitle")}
          </Text>
          <Text style={styles.emptySub}>
            {forPrayers ? t("liked.emptyPrayerDesc") : t("liked.emptyDesc")}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.count}>{items.length} {noun}</Text>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => router.push(item.path as any)}
            >
              {item.cover ? (
                <CoverImage uri={item.cover} storyId={item.id} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, styles.prayerThumb]}>
                  <Ionicons name="heart-outline" size={22} color={colors.primary} />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                {item.sub ? <Text style={styles.sub} numberOfLines={2}>{item.sub}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </ScrollView>
      )}
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
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.text },

  count: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.sm },
  prayerThumb: {
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  title: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.sm },
  emptyTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.text },
  emptySub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
});
