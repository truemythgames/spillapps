import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithApple = useAuthStore((s) => s.signInWithApple);
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);

  function goToTabs() {
    router.replace("/(tabs)");
  }

  async function handleGoogle() {
    setLoading("google");
    try {
      await signInWithGoogle();
      goToTabs();
    } catch (err: any) {
      Alert.alert("Sign-in failed", err.message ?? "Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleApple() {
    setLoading("apple");
    try {
      await signInWithApple();
      goToTabs();
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") {
        setLoading(null);
        return;
      }
      Alert.alert("Sign-in failed", err.message ?? "Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 60, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.hero}>
        <Text style={styles.emoji}>☕</Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Save your progress, streaks, and{"\n"}favorites across all your devices.
        </Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.btn, styles.googleBtn]}
          onPress={handleGoogle}
          disabled={loading !== null}
        >
          {loading === "google" ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Text style={styles.btnIcon}>G</Text>
              <Text style={styles.btnText}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        {Platform.OS === "ios" && (
          <Pressable
            style={[styles.btn, styles.appleBtn]}
            onPress={handleApple}
            disabled={loading !== null}
          >
            {loading === "apple" ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Text style={[styles.btnIcon, { color: colors.text }]}></Text>
                <Text style={[styles.btnText, { color: colors.text }]}>
                  Continue with Apple
                </Text>
              </>
            )}
          </Pressable>
        )}

        <Pressable style={styles.skipBtn} onPress={goToTabs}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service{"\n"}and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  hero: {
    alignItems: "center",
    paddingTop: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.hero,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  buttons: {
    gap: spacing.md,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: radius.full,
    gap: spacing.sm,
  },
  googleBtn: {
    backgroundColor: colors.text,
  },
  appleBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  btnIcon: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xl,
    color: colors.background,
  },
  btnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.background,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  terms: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 16,
    paddingTop: spacing.sm,
  },
});
