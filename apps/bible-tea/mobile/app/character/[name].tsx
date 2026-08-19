import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/app";
import { CoverImage } from "@/components/CoverImage";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export default function CharacterScreen() {
  const { t } = useTranslation();
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { characters: apiCharacters } = useAppStore();

  const decoded = name ? decodeURIComponent(name) : "";
  const apiChar = apiCharacters.find(
    (c: any) => c.id === decoded || c.slug === decoded || c.name === decoded
  );
  if (!apiChar) return null;

  const displayName = apiChar.name;
  const displaySubtitle = (apiChar as any).description || "";
  const displayOverview = (apiChar as any).overview || "";
  const heroImage = (apiChar as any).image_url || "";
  const stories = (apiChar as any).stories || [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{displayName}</Text>
            <Text style={styles.heroSub}>{displaySubtitle}</Text>
          </View>
        </View>

        {displayOverview ? (
          <Text style={styles.overview}>{displayOverview}</Text>
        ) : null}

        <Text style={styles.count}>{stories.length} {stories.length === 1 ? t("common.story") : t("common.stories")}</Text>

        {stories.map((story: any) => (
          <Pressable
            key={story.id}
            style={styles.row}
            onPress={() => router.push(`/story/${story.slug ?? story.id}` as any)}
          >
            <CoverImage uri={story.cover_image_url} storyId={story.slug ?? story.id} style={styles.thumb} contentFit="cover" />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>{story.title}</Text>
              <Text style={styles.sub} numberOfLines={2}>{story.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  hero: { width: "100%", height: 260, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  heroContent: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  heroName: { fontFamily: fonts.heading, fontSize: 32, color: "#fff" },
  heroSub: { fontFamily: fonts.body, fontSize: fontSize.md, color: "rgba(255,255,255,0.8)", marginTop: 4 },

  overview: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  count: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
  info: { flex: 1 },
  title: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
