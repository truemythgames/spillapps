import { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { getUpcomingVerses, getVerseOfTheDay } from "@/lib/daily-verses";
import { getVerseInsight, storiesForVerse } from "@/lib/verse-insight";
import { useAppStore } from "@/stores/app";
import { useGate } from "@/lib/useGate";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";
import { VerseShareButton } from "@/components/VerseShareCard";
import { CoverImage } from "@/components/CoverImage";

export default function VerseScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { guardedPush } = useGate();
  const stories = useAppStore((s) => s.stories);

  const lang = i18n.language === "es" ? "es" : "en";
  const today = useMemo(() => new Date(), []);
  const verse = useMemo(() => getVerseOfTheDay(today, lang), [lang, today]);
  const verseEn = useMemo(() => getVerseOfTheDay(today, "en"), [today]);
  const insight = useMemo(
    () => getVerseInsight(verseEn, verse, lang),
    [lang, verse, verseEn],
  );
  const related = useMemo(
    () => storiesForVerse(stories, verseEn.ref, verse.ref),
    [stories, verse.ref, verseEn.ref],
  );
  const upcoming = useMemo(() => getUpcomingVerses(lang, 3, today), [lang, today]);
  const dateLabel = today.toLocaleDateString(lang === "es" ? "es" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#12110F", "#2A221C", "#5A4634"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 8 }]}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {t("share.verseOfTheDay")}
            </Text>
            <View style={styles.headerBtn}>
              <VerseShareButton
                storyId={related[0]?.id}
                coverImageUrl={related[0]?.cover_image_url}
              />
            </View>
          </View>

          <Text style={styles.date}>{dateLabel}</Text>
          <Text style={styles.verse}>“{verse.text}”</Text>
          <View style={styles.rule} />
          <Text style={styles.ref}>{verse.ref}</Text>
          <View style={styles.chips}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{insight.book}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {insight.testament === "new"
                  ? t("explore.newTestament")
                  : t("explore.oldTestament")}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.kicker}>{t("home.verseAbout")}</Text>
            <Text style={styles.cardBody}>{insight.reflection}</Text>
          </View>

          {insight.context ? (
            <View style={styles.card}>
              <Text style={styles.kicker}>{t("home.verseBook")}</Text>
              <Text style={styles.cardTitle}>{insight.book}</Text>
              <Text style={styles.cardBody}>{insight.context}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.kicker}>{t("home.verseSit")}</Text>
            <Text style={styles.cardBody}>{insight.practice}</Text>
          </View>

          <View style={[styles.card, styles.askCard]}>
            <Text style={styles.kicker}>{t("home.verseAsk")}</Text>
            <Text style={styles.ask}>{insight.question}</Text>
          </View>

          {related.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("prayers.relatedStories")}</Text>
              {related.map((story) => (
                <Pressable
                  key={story.apiId || story.id}
                  style={styles.storyRow}
                  onPress={() => guardedPush(`/story/${story.id}`)}
                >
                  <CoverImage
                    uri={story.cover_image_url}
                    storyId={story.id}
                    displayWidth={240}
                    style={styles.storyCover}
                    contentFit="cover"
                  />
                  <View style={styles.storyCopy}>
                    <Text style={styles.storyTitle} numberOfLines={2}>
                      {story.title}
                    </Text>
                    {story.bibleRef ? (
                      <Text style={styles.storyRef}>{story.bibleRef}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("home.verseComing")}</Text>
            {upcoming.map((item) => (
              <View key={item.ref + item.date.toISOString()} style={styles.upcoming}>
                <Text style={styles.upcomingDay}>
                  {item.date.toLocaleDateString(lang === "es" ? "es" : "en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <View style={styles.upcomingCopy}>
                  <Text style={styles.upcomingText} numberOfLines={2}>
                    “{item.text}”
                  </Text>
                  <Text style={styles.upcomingRef}>{item.ref}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerBtn: {
    width: 36,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: "rgba(255,209,102,0.9)",
    letterSpacing: 1.6,
    flex: 1,
    textAlign: "center",
  },
  date: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: "rgba(232,214,184,0.75)",
    letterSpacing: 0.4,
    textTransform: "capitalize",
    marginBottom: spacing.md,
  },
  verse: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.text,
    lineHeight: 40,
  },
  rule: {
    width: 48,
    height: 1,
    backgroundColor: "rgba(255,209,102,0.55)",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  ref: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: "rgba(232,214,184,0.95)",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: spacing.md,
  },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(232,214,184,0.28)",
    backgroundColor: "rgba(10,10,15,0.28)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: "rgba(232,214,184,0.9)",
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(200,162,255,0.14)",
  },
  askCard: {
    borderColor: "rgba(255,209,102,0.22)",
    backgroundColor: "#1A1628",
  },
  kicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.accent,
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  ask: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 26,
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
    marginBottom: spacing.md,
  },
  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  storyCover: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceLight,
  },
  storyCopy: {
    flex: 1,
    minWidth: 0,
  },
  storyTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.md,
    color: colors.text,
  },
  storyRef: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  upcoming: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  upcomingDay: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.accent,
    width: 72,
    textTransform: "capitalize",
    paddingTop: 2,
  },
  upcomingCopy: {
    flex: 1,
    minWidth: 0,
  },
  upcomingText: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  upcomingRef: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
});
