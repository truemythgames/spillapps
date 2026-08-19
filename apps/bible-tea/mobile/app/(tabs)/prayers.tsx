import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "@/lib/api";
import { useAppStore } from "@/stores/app";
import { getLocalProgress, getPrayerStreakData, isPrayerPlayerId, prayerRouteId, completionPercent } from "@/lib/storage";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

const PRAYER_COVER = require("@/assets/prayer-chat-cover.webp");

interface PrayerCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Prayer {
  id: string;
  title: string;
  slug: string;
  category_name?: string;
  category_icon?: string;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "cloud-rain": "rainy-outline",
  moon: "moon-outline",
  sun: "sunny-outline",
  "heart-pulse": "heart-outline",
  shield: "shield-outline",
  "hand-heart": "hand-left-outline",
  users: "people-outline",
  wallet: "wallet-outline",
  sunrise: "partly-sunny-outline",
  sunset: "cloudy-night-outline",
  cloud: "cloud-outline",
  compass: "compass-outline",
};

export default function PrayersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const likedStoryIds = useAppStore((s) => s.likedStoryIds);
  const completedStoryIds = useAppStore((s) => s.completedStoryIds);
  const progressVersion = useAppStore((s) => s.progressVersion);

  const [categories, setCategories] = useState<PrayerCategory[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [allPrayers, setAllPrayers] = useState<Prayer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [catRes, allRes] = await Promise.all([
        api.getPrayerCategories(),
        api.getPrayers(),
      ]);
      setCategories(catRes.categories);
      setAllPrayers(allRes.prayers);
      setPrayers(allRes.prayers);
      setSelectedCategory(null);
    } catch (err) {
      console.error("[Prayers] Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadData(); } finally { setRefreshing(false); }
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategoryPress = async (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      const res = await api.getPrayers();
      setPrayers(res.prayers);
    } else {
      setSelectedCategory(categoryId);
      const res = await api.getPrayers(categoryId);
      setPrayers(res.prayers);
    }
  };

  const handlePrayerPress = (prayer: Prayer) => {
    router.push(`/prayer/${prayer.slug ?? prayer.id}` as any);
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  void progressVersion;
  const progress = getLocalProgress();
  const likedCount = new Set(
    likedStoryIds.filter(isPrayerPlayerId).map(prayerRouteId),
  ).size;
  const completedKeys = new Set<string>();
  for (const id of completedStoryIds) {
    if (isPrayerPlayerId(id)) completedKeys.add(prayerRouteId(id));
  }
  for (const [id, p] of Object.entries(progress)) {
    if (p.completed && isPrayerPlayerId(id)) completedKeys.add(prayerRouteId(id));
  }
  const completedCount = completedKeys.size;
  const percent = completionPercent(completedCount, allPrayers.length);
  const prayerStreak = getPrayerStreakData();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          progressViewOffset={insets.top}
        />
      }
    >
      <Text style={styles.pageTitle}>{t("prayers.title")}</Text>

      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressPercent}>{percent}%</Text>
          <Text style={styles.progressLabel}>{t("prayers.completed")}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.progressSub}>
          {t("prayers.of", { completed: completedCount, total: allPrayers.length })}
        </Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statNum}>{prayerStreak.currentStreak}</Text>
          <Text style={styles.statLabel}>{t("explore.dayStreak")}</Text>
        </View>
        <Pressable style={styles.statCard} onPress={() => router.push({ pathname: "/completed", params: { kind: "prayer" } })}>
          <Text style={styles.statEmoji}>✅</Text>
          <Text style={styles.statNum}>{completedCount}</Text>
          <Text style={styles.statLabel}>{t("explore.completedLabel")}</Text>
        </Pressable>
        <Pressable style={styles.statCard} onPress={() => router.push({ pathname: "/liked", params: { kind: "prayer" } })}>
          <Text style={styles.statEmoji}>❤️</Text>
          <Text style={styles.statNum}>{likedCount}</Text>
          <Text style={styles.statLabel}>{t("explore.liked")}</Text>
        </Pressable>
      </View>

      {/* Create prayer chat card */}
      <Pressable
        style={styles.createCard}
        onPress={() => router.push({ pathname: "/chat", params: { topic: "prayer" } })}
      >
        <Image
          source={PRAYER_COVER}
          style={styles.createCardImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(10,10,15,0.3)", "rgba(10,10,15,0.85)"]}
          style={styles.createCardGradient}
        />
        <View style={styles.createCardContent}>
          <Ionicons name="sparkles" size={22} color={colors.primary} />
          <Text style={styles.createCardTitle}>{t("prayers.createTitle")}</Text>
          <Text style={styles.createCardSubtitle}>{t("prayers.createSubtitle")}</Text>
        </View>
      </Pressable>

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        scrollEnabled={true}
        renderItem={({ item }) => {
          const isActive = selectedCategory === item.id;
          const iconName = CATEGORY_ICONS[item.icon] || "ellipse-outline";
          return (
            <Pressable
              onPress={() => handleCategoryPress(item.id)}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
            >
              <Ionicons
                name={iconName}
                size={16}
                color={isActive ? colors.background : colors.primary}
              />
              <Text
                style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Prayer list */}
      <View style={styles.prayerList}>
        {prayers.map((prayer) => (
          <Pressable
            key={prayer.id}
            style={styles.prayerCard}
            onPress={() => handlePrayerPress(prayer)}
          >
            <View style={styles.prayerCardIcon}>
              <Ionicons
                name={CATEGORY_ICONS[prayer.category_icon ?? ""] || "heart-outline"}
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={styles.prayerTitle} numberOfLines={2}>
              {prayer.title}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  pageTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.hero,
    color: colors.text,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
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
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
  categoryList: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  categoryChipTextActive: {
    color: colors.background,
  },
  prayerList: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  prayerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.md,
  },
  prayerCardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  createCard: {
    height: 160,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  createCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  createCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  createCardContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    gap: 6,
  },
  createCardTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  createCardSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
