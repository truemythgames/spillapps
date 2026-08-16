import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Share,
  Platform,
  Image,
  Modal,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { getVerseOfTheDay } from "@/lib/daily-verses";
import { coverUrl } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

/** Logical size; capture scales up via pixelRatio. */
const CARD_W = 360;
const CARD_H = 450;
const SITE_URL = "https://bibletea.app/verse-of-the-day/";

function getLang(): "en" | "es" {
  try {
    const i18n = require("@/lib/i18n").default;
    return i18n.language === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}

function CaptureCard({
  verseText,
  verseRef,
  coverUri,
  label,
  brand,
  onReady,
}: {
  verseText: string;
  verseRef: string;
  coverUri?: string;
  label: string;
  brand: string;
  onReady: () => void;
}) {
  const readyFired = useRef(false);
  const markReady = useCallback(() => {
    if (readyFired.current) return;
    readyFired.current = true;
    // Let layout settle before capture
    requestAnimationFrame(() => setTimeout(onReady, 80));
  }, [onReady]);

  return (
    <View style={captureStyles.root} collapsable={false}>
      {coverUri ? (
        <Image
          source={{ uri: coverUri }}
          style={captureStyles.cover}
          resizeMode="cover"
          onLoad={markReady}
          onError={markReady}
        />
      ) : (
        <View style={[captureStyles.cover, { backgroundColor: "#1A1428" }]} onLayout={markReady} />
      )}
      <View style={captureStyles.scrim} />

      <View style={captureStyles.content}>
        <View style={captureStyles.topRow}>
          <Text style={captureStyles.brandEmoji}>🍵</Text>
          <Text style={captureStyles.brand}>{brand}</Text>
        </View>

        <View style={captureStyles.bottom}>
          <Text style={captureStyles.label}>{label}</Text>
          <Text style={captureStyles.verse} numberOfLines={8}>
            "{verseText}"
          </Text>
          <Text style={captureStyles.ref}>{verseRef}</Text>
          <Text style={captureStyles.url}>bibletea.app</Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Home-screen Verse of the Day card with a single share icon.
 * Captures a branded image via a brief modal (reliable on iOS/Android).
 */
export function VerseOfTheDayCard({
  storyId,
  coverImageUrl,
}: {
  storyId?: string;
  coverImageUrl?: string | null;
}) {
  const { t } = useTranslation();
  const captureViewRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const [showCapture, setShowCapture] = useState(false);

  const lang = getLang();
  const verse = getVerseOfTheDay(new Date(), lang);
  const coverUri =
    (coverImageUrl && coverImageUrl.trim()) ||
    (storyId ? coverUrl(storyId) : undefined);

  const shareText = useCallback(async () => {
    const message = t("share.message", {
      text: verse.text,
      ref: verse.ref,
      url: SITE_URL,
    });
    await Share.share(
      Platform.OS === "ios" ? { message, url: SITE_URL } : { message }
    );
  }, [t, verse.ref, verse.text]);

  const finishShare = useCallback(() => {
    setShowCapture(false);
    setSharing(false);
  }, []);

  const runCaptureAndShare = useCallback(async () => {
    try {
      if (!captureViewRef.current) {
        await shareText();
        finishShare();
        return;
      }

      const uri = await captureRef(captureViewRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        width: CARD_W * 3,
        height: CARD_H * 3,
      });

      const fileUri = uri.startsWith("file://") ? uri : `file://${uri}`;
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "image/png",
          dialogTitle: t("share.dialogTitle"),
          UTI: "public.png",
        });
      } else {
        await shareText();
      }
    } catch (e) {
      console.warn("[Share] Image share failed, falling back to text:", e);
      try {
        await shareText();
      } catch (err) {
        console.warn("[Share] Text share failed:", err);
      }
    } finally {
      finishShare();
    }
  }, [finishShare, shareText, t]);

  const handleShare = useCallback(() => {
    if (sharing) return;
    setSharing(true);
    trackEvent("verse_shared", { ref: verse.ref });
    setShowCapture(true);
  }, [sharing, verse.ref]);

  return (
    <View style={styles.wrap}>
      <Modal
        visible={showCapture}
        transparent
        animationType="none"
        onRequestClose={finishShare}
      >
        <View style={styles.captureModal}>
          <ActivityIndicator color={colors.accent} />
          <View
            ref={captureViewRef}
            collapsable={false}
            style={styles.captureMount}
          >
            <CaptureCard
              verseText={verse.text}
              verseRef={verse.ref}
              coverUri={coverUri}
              label={t("share.verseOfTheDay")}
              brand={t("share.brand")}
              onReady={runCaptureAndShare}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>{t("share.verseOfTheDay")}</Text>
          <Pressable
            style={styles.shareBtn}
            onPress={handleShare}
            disabled={sharing}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("share.button")}
          >
            {sharing ? (
              <ActivityIndicator size="small" color={colors.textMuted} />
            ) : (
              <Ionicons name="share-outline" size={18} color={colors.textMuted} />
            )}
          </Pressable>
        </View>

        <Text style={styles.verseText}>"{verse.text}"</Text>
        <Text style={styles.verseRef}>{verse.ref}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  captureModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureMount: {
    position: "absolute",
    left: 0,
    top: 0,
    opacity: 0.02,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  verseText: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  verseRef: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});

const captureStyles = StyleSheet.create({
  root: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: "#0A0A0F",
    overflow: "hidden",
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    width: CARD_W,
    height: CARD_H,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandEmoji: {
    fontSize: 16,
  },
  brand: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
  },
  bottom: {
    gap: 10,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 1.2,
  },
  verse: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: "#FFFFFF",
    lineHeight: 26,
  },
  ref: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.accent,
  },
  url: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    marginTop: 4,
  },
});
