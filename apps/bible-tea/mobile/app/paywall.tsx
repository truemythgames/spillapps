import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { useAppStore } from "@/stores/app";
import { coverUrl } from "@/lib/content";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

const { height: SCREEN_H } = Dimensions.get("window");


type Plan = "weekly" | "yearly";

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSubscribed = useAppStore((s) => s.setSubscribed);
  const isSubscribed = useAppStore((s) => s.isSubscribed);

  const [step, setStep] = useState<1 | 2>(1);
  const [plan, setPlan] = useState<Plan>("yearly");
  const [busy, setBusy] = useState(false);

  const s1Y = useSharedValue(SCREEN_H);
  const s2Y = useSharedValue(SCREEN_H);
  const badgeSc = useSharedValue(0);

  useEffect(() => {
    s1Y.value = withSpring(0, { damping: 22, stiffness: 90 });
  }, []);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)" as any);
    }
  }

  function navigate(path: string) {
    router.replace(path as any);
  }

  function showOffer() {
    if (busy) return;
    setBusy(true);
    setStep(2);
    s2Y.value = 400;
    s2Y.value = withSpring(0, { damping: 20, stiffness: 120 });
    setTimeout(() => setBusy(false), 500);
  }

  function hideOffer() {
    if (busy) return;
    setBusy(true);
    s2Y.value = withSpring(400, { damping: 20, stiffness: 120 });
    setTimeout(() => {
      setStep(1);
      setBusy(false);
    }, 300);
  }

  function dismiss() {
    if (busy) return;
    if (step === 1) {
      showOffer();
    } else {
      goBack();
    }
  }

  function subscribe() {
    if (busy) return;
    setSubscribed(true);
    navigate("/login");
  }

  const s1Style = useAnimatedStyle(() => ({ transform: [{ translateY: s1Y.value }] }));
  const s2Style = useAnimatedStyle(() => ({ transform: [{ translateY: s2Y.value }] }));
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgeSc.value }] }));

  return (
    <View style={styles.root}>

      {/* STEP 1 */}
      <Animated.View style={[styles.page, s1Style]}>
        <Hero uri={coverUrl("noahs-ark")} />
        <XBtn onPress={dismiss} disabled={busy} top={insets.top + 8} />

        <View style={[styles.body, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.title}>Unlock Bible Tea</Text>
          <Text style={styles.sub}>3-day free trial.</Text>
          <NoPay />

          <Pressable
            style={[styles.plan, plan === "weekly" && styles.planOn]}
            onPress={() => setPlan("weekly")}
          >
            <View style={styles.radio}>
              {plan === "weekly" && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>Weekly Access</Text>
              <Text style={styles.planPrice}>3 days free then $1.99/week</Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.plan, plan === "yearly" && styles.planOn]}
            onPress={() => setPlan("yearly")}
          >
            <View style={styles.radio}>
              {plan === "yearly" && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>Yearly Access</Text>
              <Text style={styles.planPrice}>3 days free then $29.99/year</Text>
            </View>
            <Text style={styles.planBadge}>BEST VALUE</Text>
          </Pressable>

          <Pressable style={styles.cta} onPress={subscribe}>
            <Text style={styles.ctaText}>Try for FREE</Text>
          </Pressable>
          <Legal />
        </View>
      </Animated.View>

      {/* STEP 2 — bottom sheet overlay */}
      {step === 2 && (
        <>
          <Pressable style={styles.overlay} onPress={hideOffer} />
          <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }, s2Style]}>
            <Pressable style={styles.sheetX} onPress={goBack} hitSlop={12}>
              <Text style={styles.sheetXText}>✕</Text>
            </Pressable>

            <Text style={styles.sheetTitle}>Want to start small?</Text>
            <Text style={styles.sheetSub}>
              No pressure. Go <Text style={styles.sheetBold}>week by week</Text> instead
            </Text>

            <View style={styles.sheetPlan}>
              <Text style={styles.sheetPlanName}>Weekly Plan</Text>
              <Text style={styles.sheetPlanPrice}>$1.99/week</Text>
            </View>

            <View style={styles.sheetCheck}>
              <Text style={styles.sheetCheckIcon}>✓</Text>
              <Text style={styles.sheetCheckText}>No commitment, cancel anytime</Text>
            </View>

            <Pressable style={styles.sheetCta} onPress={subscribe}>
              <Text style={styles.sheetCtaText}>Unlock</Text>
            </Pressable>
          </Animated.View>
        </>
      )}
    </View>
  );
}

function Hero({ uri }: { uri: string }) {
  return (
    <View style={styles.heroWrap} pointerEvents="none">
      <Image source={{ uri }} style={styles.heroImg} contentFit="cover" />
      <LinearGradient
        colors={["transparent", colors.background + "DD", colors.background]}
        style={styles.heroFade}
      />
    </View>
  );
}

function XBtn({ onPress, disabled, top }: { onPress: () => void; disabled: boolean; top: number }) {
  return (
    <Pressable style={[styles.x, { top }]} onPress={onPress} disabled={disabled} hitSlop={12}>
      <Text style={styles.xText}>✕</Text>
    </Pressable>
  );
}

function NoPay() {
  return (
    <View style={styles.noPay}>
      <Text style={styles.noPayCheck}>✓</Text>
      <Text style={styles.noPayText}>No Payment Due Now</Text>
    </View>
  );
}

function Legal() {
  return (
    <View style={styles.legalRow}>
      <Text style={styles.legalLink}>Terms</Text>
      <Text style={styles.legalDot}>·</Text>
      <Text style={styles.legalLink}>Privacy Policy</Text>
      <Text style={styles.legalDot}>·</Text>
      <Text style={styles.legalLink}>Restore</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  page: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.background },

  heroWrap: { width: "100%", height: 280 },
  heroImg: { width: "100%", height: "100%" },
  heroFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 120 },

  x: {
    position: "absolute",
    right: 20,
    zIndex: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  xText: { fontSize: 15, color: "#fff", fontWeight: "600" },

  body: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.text,
    textAlign: "center",
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  offerBadge: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.accent,
    letterSpacing: 1,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  noPay: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 18,
    marginBottom: 18,
  },
  noPayCheck: { fontSize: 16, color: colors.success, fontWeight: "700" },
  noPayText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textSecondary },

  plan: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 12,
  },
  planOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  planName: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.text },
  planPrice: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  planBadge: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.accent, letterSpacing: 0.5 },

  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  ctaText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.background },

  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
  },
  legalLink: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  legalDot: { fontSize: 11, color: colors.textMuted },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 30,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    backgroundColor: "#FFF8F0",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  sheetX: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.08)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  sheetXText: { fontSize: 13, color: "#666", fontWeight: "600" },
  sheetTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: "#1A1A2E",
    textAlign: "center",
    marginBottom: 6,
  },
  sheetSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  sheetBold: {
    fontFamily: fonts.bodySemiBold,
    textDecorationLine: "underline",
  },
  sheetPlan: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#C49A3C",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  sheetPlanName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: "#1A1A2E",
  },
  sheetPlanPrice: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: "#555",
  },
  sheetCheck: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 20,
  },
  sheetCheckIcon: { fontSize: 16, color: colors.success, fontWeight: "700" },
  sheetCheckText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: "#555" },
  sheetCta: {
    backgroundColor: "#C49A3C",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  sheetCtaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: "#fff",
  },
});
