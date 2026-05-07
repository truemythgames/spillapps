import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import { colors, fonts, fontSize, spacing } from "@/lib/theme";

const FEATURES = [
  { icon: "🎧", text: "200+ narrated Bible stories" },
  { icon: "👤", text: "Deep-dive character profiles" },
  { icon: "📚", text: "Curated playlists & collections" },
  { icon: "💬", text: "AI chat companion" },
];

export default function PostPurchaseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const circleScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.3);
  const confettiOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(1);

  useEffect(() => {
    circleScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    checkOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));
    checkScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 160 }),
      ),
    );
    confettiOpacity.value = withDelay(
      500,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1800, withTiming(0, { duration: 600 })),
      ),
    );
  }, []);

  function handleContinue() {
    ctaScale.value = withSequence(
      withTiming(0.94, { duration: 90, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 8, stiffness: 260 }),
    );
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)" as any);
    }
  }

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));
  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));
  const ctaAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.celebration}>
        <Animated.View style={[styles.confetti, confettiStyle]}>
          <Text style={styles.confettiText}>🎉</Text>
        </Animated.View>

        <Animated.View style={[styles.circle, circleStyle]}>
          <Animated.Text style={[styles.checkmark, checkStyle]}>✓</Animated.Text>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(500).duration(400)}
          style={styles.title}
        >
          You're all set!
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(650).duration(400)}
          style={styles.subtitle}
        >
          Welcome to Bible Tea Premium
        </Animated.Text>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <Animated.View
            key={i}
            entering={FadeInDown.delay(800 + i * 120).duration(350)}
            style={styles.featureRow}
          >
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </Animated.View>
        ))}
      </View>

      <View style={styles.bottom}>
        <Animated.Text
          entering={FadeInDown.delay(1400).duration(400)}
          style={styles.motivation}
        >
          Your journey through the Bible starts now.{"\n"}One story at a time.
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(1600).duration(400)}
          style={ctaAnimStyle}
        >
          <Pressable style={styles.cta} onPress={handleContinue}>
            <Text style={styles.ctaText}>Start Exploring</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 28,
  },
  celebration: {
    alignItems: "center",
    marginTop: 20,
  },
  confetti: {
    position: "absolute",
    top: -10,
  },
  confettiText: {
    fontSize: 48,
  },
  circle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary + "20",
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 40,
    color: colors.primary,
    fontWeight: "700",
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: "center",
  },
  features: {
    marginTop: 40,
    gap: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 14,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  bottom: {
    flex: 1,
    justifyContent: "flex-end",
  },
  motivation: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
  },
  ctaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.background,
  },
});
