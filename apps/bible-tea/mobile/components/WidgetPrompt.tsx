import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";
import { checkWidgetInstalled } from "@/lib/widget";
import { storage, StorageKeys } from "@/lib/storage";

/**
 * Modal with step-by-step instructions for adding the widget.
 * Used by the home screen card's "How to add" button.
 */
export function WidgetInstructionsModal({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalEmoji}>🍵</Text>
          <Text style={styles.modalTitle}>{t("widget.promptTitle")}</Text>
          <Text style={styles.modalSubtitle}>{t("widget.promptSubtitle")}</Text>

          <View style={styles.instructions}>
            {Platform.OS === "android" ? (
              <>
                <InstructionStep num="1" text={t("widget.androidStep1")} />
                <InstructionStep num="2" text={t("widget.androidStep2")} />
                <InstructionStep num="3" text={t("widget.androidStep3")} />
              </>
            ) : (
              <>
                <InstructionStep num="1" text={t("widget.step1")} />
                <InstructionStep num="2" text={t("widget.step2")} />
                <InstructionStep num="3" text={t("widget.step3")} />
                <InstructionStep num="4" text={t("widget.step4")} />
              </>
            )}
          </View>

          <Pressable style={styles.modalButton} onPress={onDismiss}>
            <Text style={styles.modalButtonText}>{t("widget.gotIt")}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Quiet footer prompt. Hidden once the widget is installed or the user taps X.
 */
export function WidgetCard() {
  const { t } = useTranslation();
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(
    () => storage.getBoolean(StorageKeys.WIDGET_PROMPT_DISMISSED) === true
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkWidgetInstalled().then(setInstalled);
  }, []);

  useEffect(() => {
    const { AppState } = require("react-native");
    const sub = AppState.addEventListener("change", (state: string) => {
      if (state === "active") {
        checkWidgetInstalled().then(setInstalled);
      }
    });
    return () => sub.remove();
  }, []);

  const dismiss = () => {
    storage.set(StorageKeys.WIDGET_PROMPT_DISMISSED, true);
    setDismissed(true);
  };

  if (dismissed || installed === null || installed) return null;

  return (
    <>
      <View style={styles.card}>
        <Pressable style={styles.cardTap} onPress={() => setShowModal(true)}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardEmoji}>🍵</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{t("widget.cardTitle")}</Text>
            <Text style={styles.cardSubtitle}>{t("widget.cardSubtitle")}</Text>
          </View>
        </Pressable>
        <Pressable
          style={styles.dismissBtn}
          onPress={dismiss}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t("widget.dismiss")}
        >
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
      <WidgetInstructionsModal
        visible={showModal}
        onDismiss={() => setShowModal(false)}
      />
    </>
  );
}

function InstructionStep({ num, text }: { num: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{num}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Inline card (home screen) ──
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.sm,
  },
  cardTap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Modal ──
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
    lineHeight: 26,
  },
  modalSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 19,
  },
  instructions: {
    width: "100%",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  stepText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: radius.lg,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.background,
  },
});
