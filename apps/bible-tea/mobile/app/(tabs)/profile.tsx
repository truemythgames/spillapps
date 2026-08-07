import { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from "react-native";
import { Image, Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/app";
import { coverUrl } from "@/lib/content";
import { CoverImage } from "@/components/CoverImage";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";
import { LinearGradient } from "expo-linear-gradient";

export default function ChatScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const stories = useAppStore((s) => s.stories);
  const loadRemoteData = useAppStore((s) => s.loadRemoteData);
  const storyMap = Object.fromEntries(stories.map((s) => [s.id, s]));
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await ExpoImage.clearDiskCache();
      await ExpoImage.clearMemoryCache();
      await loadRemoteData();
    } finally { setRefreshing(false); }
  }, [loadRemoteData]);

  const CHAT_TOPIC_DEFS = [
    { id: "verse", title: t("chatTab.topicVerse"), storyId: "the-good-samaritan" },
    { id: "advice", title: t("chatTab.topicAdvice"), storyId: "solomons-wisdom" },
    { id: "explain", title: t("chatTab.topicExplain"), storyId: "the-ten-commandments" },
  ];

  const CHAT_TOPICS = CHAT_TOPIC_DEFS.map((td) => ({
    ...td,
    image: storyMap[td.storyId]?.cover_image_url ?? coverUrl(td.storyId),
  }));

  function handleTopic(topicId: string) {
    router.push({ pathname: "/chat", params: { topic: topicId } });
  }

  function handleFreeChat() {
    router.push({ pathname: "/chat", params: { topic: "free" } });
  }

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
      <Text style={styles.pageTitle}>{t("chatTab.title")}</Text>

      <Text style={styles.subtitle}>{t("chatTab.subtitle")}</Text>

      {/* Topic cards */}
      <View style={styles.cards}>
        {CHAT_TOPICS.map((topic) => (
          <Pressable key={topic.id} style={styles.card} onPress={() => handleTopic(topic.id)}>
            <CoverImage uri={topic.image} storyId={topic.storyId} style={styles.cardImage} contentFit="cover" />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.cardGradient}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{topic.title}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Free chat button */}
      <Pressable style={styles.freeBtn} onPress={handleFreeChat}>
        <Text style={styles.freeBtnText}>{t("chatTab.freeChat")}</Text>
      </Pressable>
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
  },

  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  cards: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  card: {
    height: 160,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xl,
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  freeBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  freeBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
});
