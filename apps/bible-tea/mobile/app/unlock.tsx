import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/stores/app";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

// Reviewer access code. Provided to Google Play / App Store reviewers via the
// "App access" / "Notes for reviewer" sections of the respective consoles.
// Reaching this screen requires a hidden 7-tap gesture on the home title icon.
const REVIEWER_CODE = "Reviewer2026";

export default function UnlockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSubscribed = useAppStore((s) => s.setSubscribed);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function close() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)" as any);
    }
  }

  function submit() {
    const entered = code.trim();
    if (!entered) {
      setError("Enter a code to continue.");
      return;
    }

    if (entered === REVIEWER_CODE) {
      setSubscribed(true);
      Alert.alert(
        "Unlocked",
        "All content is now available on this device.",
        [{ text: "OK", onPress: close }]
      );
      return;
    }

    setError("That code didn’t work.");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <Pressable
          style={[styles.closeBtn, { top: insets.top + spacing.sm }]}
          onPress={close}
          hitSlop={16}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.emoji}>🔑</Text>
          <Text style={styles.title}>Enter access code</Text>
          <Text style={styles.subtitle}>
            For internal reviewers only.{"\n"}If you don’t have a code, close this screen.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            value={code}
            onChangeText={(v) => {
              setCode(v);
              if (error) setError(null);
            }}
            placeholder="Access code"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            style={styles.input}
            onSubmitEditing={submit}
            returnKeyType="go"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable style={styles.submitBtn} onPress={submit}>
            <Text style={styles.submitText}>Unlock</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  closeBtn: {
    position: "absolute",
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
  closeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  hero: {
    alignItems: "center",
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.hero,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: -spacing.sm,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.full,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  submitText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.background,
  },
});
