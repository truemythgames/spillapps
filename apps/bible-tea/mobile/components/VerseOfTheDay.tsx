import React, { useMemo } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { getVerseOfTheDay } from "@/lib/daily-verses";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export function VerseOfTheDay({ onPress }: { onPress: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "es" ? "es" : "en";
  const verse = useMemo(() => getVerseOfTheDay(new Date(), lang), [lang]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("share.verseOfTheDay")}
    >
      <LinearGradient
        colors={["#12110F", "#2A221C", "#5A4634"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.label}>{t("share.verseOfTheDay")}</Text>
        <Text style={styles.verse}>“{verse.text}”</Text>
        <Text style={styles.ref}>{verse.ref}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.xl,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: "rgba(255,209,102,0.9)",
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  verse: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
    lineHeight: 28,
  },
  ref: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: "rgba(232,214,184,0.9)",
    marginTop: spacing.sm,
  },
});
