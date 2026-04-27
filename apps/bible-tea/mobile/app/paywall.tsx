import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Alert, ActivityIndicator } from "react-native";
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
import { storage, StorageKeys } from "@/lib/storage";
import { getOfferings, purchasePackage, restorePurchases, type PurchasesPackage } from "@/lib/purchases";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

const { height: SCREEN_H } = Dimensions.get("window");

type Plan = "weekly" | "quarterly";

// Per-cold-start flag: the special-offer screen shows at most once per app
// launch when dismissing the *normal* sales page (not the onboarding paywall).
let SPECIAL_OFFER_SHOWN_THIS_SESSION = false;

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSubscribed = useAppStore((s) => s.setSubscribed);
  const isSubscribed = useAppStore((s) => s.isSubscribed);

  const [step, setStep] = useState<1 | 2>(1);
  const [plan, setPlan] = useState<Plan>("weekly");
  const [busy, setBusy] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const returning = !!storage.getBoolean(StorageKeys.HAS_SEEN_INITIAL_OFFER);

  const s1Y = useSharedValue(SCREEN_H);
  const s2Y = useSharedValue(SCREEN_H);
  const badgeSc = useSharedValue(0);

  useEffect(() => {
    s1Y.value = withSpring(0, { damping: 22, stiffness: 90 });
    getOfferings().then((offering) => {
      if (offering?.availablePackages) {
        setPackages(offering.availablePackages);
      }
    });
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
    storage.set(StorageKeys.HAS_SEEN_INITIAL_OFFER, true);
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
    if (step === 1 && !returning) {
      showOffer();
      return;
    }
    // Normal sales page (post-onboarding): show the special offer once per
    // session when dismissing. Onboarding entry uses router.replace() so
    // canGoBack() === false there, which we use to skip this branch.
    if (
      !SPECIAL_OFFER_SHOWN_THIS_SESSION &&
      router.canGoBack() &&
      step === 1
    ) {
      SPECIAL_OFFER_SHOWN_THIS_SESSION = true;
      router.replace("/special-offer" as any);
      return;
    }
    goBack();
  }

  function findPackage(identifier: string): PurchasesPackage | undefined {
    return packages.find((p) => p.identifier === identifier);
  }

  function getTargetPackage(): PurchasesPackage | undefined {
    if (step === 2) {
      return findPackage("weekly_offer");
    }
    if (returning) {
      return plan === "weekly"
        ? findPackage("weekly_freetrial")
        : findPackage("quarterly_3day");
    }
    return plan === "weekly"
      ? findPackage("quarterly_onboarding")
      : findPackage("quarterly_30day");
  }

  // Resolved prices from the RevenueCat packages — never hardcoded.
  const weeklyFreetrial = findPackage("weekly_freetrial");
  const quarterly3day = findPackage("quarterly_3day");
  const quarterlyOnboarding = findPackage("quarterly_onboarding");
  const quarterly30day = findPackage("quarterly_30day");
  const weeklyOffer = findPackage("weekly_offer");

  function priceOf(pkg?: PurchasesPackage): string {
    return pkg?.product?.priceString ?? "";
  }
  function introPriceOf(pkg?: PurchasesPackage): string {
    return pkg?.product?.introPrice?.priceString ?? "";
  }

  const weeklyFullPrice = priceOf(weeklyFreetrial);
  const quarterlyFullPriceReturning = priceOf(quarterly3day);
  const quarterlyFullPriceOnboarding = priceOf(quarterlyOnboarding);
  const quarterly30dayFullPrice = priceOf(quarterly30day);
  const quarterly30dayIntroPrice = introPriceOf(quarterly30day);
  const weeklyOfferPrice = priceOf(weeklyOffer);

  async function subscribe() {
    if (busy || purchasing) return;

    const pkg = getTargetPackage() ?? packages[0];

    if (!pkg) {
      setSubscribed(true);
      goBack();
      return;
    }

    setPurchasing(true);
    try {
      const success = await purchasePackage(pkg);
      if (success) {
        setSubscribed(true);
        goBack();
      }
    } catch (e: any) {
      Alert.alert("Purchase failed", e?.message ?? "Something went wrong. Please try again.");
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    if (purchasing || restoring) return;
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        setSubscribed(true);
        Alert.alert("Restored!", "Your subscription has been restored.");
        goBack();
      } else {
        Alert.alert("Nothing to restore", "No active subscription found for this account.");
      }
    } catch {
      Alert.alert("Restore failed", "Please try again later.");
    } finally {
      setRestoring(false);
    }
  }

  const s1Style = useAnimatedStyle(() => ({ transform: [{ translateY: s1Y.value }] }));
  const s2Style = useAnimatedStyle(() => ({ transform: [{ translateY: s2Y.value }] }));
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgeSc.value }] }));

  return (
    <View style={styles.root}>

      {/* STEP 1 */}
      <Animated.View style={[styles.page, s1Style]}>
        <Hero source={require("@/assets/onboarding/noahs-ark.webp")} />
        <XBtn onPress={dismiss} disabled={busy || purchasing} top={insets.top + 8} />

        <View style={[styles.body, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.title}>Unlock Bible Tea</Text>
          <Text style={styles.sub}>3-day free trial.</Text>

          {returning ? (
            <>
              <NoPay />
              <Pressable
                style={[styles.plan, plan === "weekly" && styles.planOn]}
                onPress={() => setPlan("weekly")}
                disabled={purchasing}
              >
                <View style={styles.radio}>
                  {plan === "weekly" && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>Weekly Access</Text>
                  <Text style={styles.planPrice}>
                    {weeklyFullPrice
                      ? `3 days free then ${weeklyFullPrice}/week`
                      : "3 days free"}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={[styles.plan, plan === "quarterly" && styles.planOn]}
                onPress={() => setPlan("quarterly")}
                disabled={purchasing}
              >
                <View style={styles.radio}>
                  {plan === "quarterly" && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>3 Month Access</Text>
                  <Text style={styles.planPrice}>
                    {quarterlyFullPriceReturning
                      ? `3 days free then ${quarterlyFullPriceReturning}/3 mo`
                      : "3 days free"}
                  </Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>50% off</Text>
                </View>
              </Pressable>

              <Pressable
                style={[styles.cta, purchasing && styles.ctaDisabled]}
                onPress={subscribe}
                disabled={purchasing}
              >
                {purchasing ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.ctaText}>Try for FREE</Text>
                )}
              </Pressable>
              <Legal onRestore={handleRestore} restoring={restoring} disabled={purchasing} />
            </>
          ) : (
            <>
              <View style={styles.noPay}>
                <Text style={styles.noPayCheck}>✓</Text>
                <Text style={styles.noPayText}>
                  {plan === "weekly" ? "No Payment Due Now" : "No commitment, cancel anytime"}
                </Text>
              </View>

              <Pressable
                style={[styles.plan, plan === "weekly" && styles.planOn]}
                onPress={() => setPlan("weekly")}
                disabled={purchasing}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>Free</Text>
                  <Text style={styles.planPrice}>3 day trial</Text>
                </View>
                <View style={styles.radio}>
                  {plan === "weekly" && <View style={styles.radioDot} />}
                </View>
              </Pressable>

              <Pressable
                style={[styles.plan, plan === "quarterly" && styles.planOn]}
                onPress={() => setPlan("quarterly")}
                disabled={purchasing}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>{quarterly30dayIntroPrice || "—"}</Text>
                  <Text style={styles.planPrice}>30-Day trial</Text>
                </View>
                <View style={styles.radio}>
                  {plan === "quarterly" && <View style={styles.radioDot} />}
                </View>
              </Pressable>

              <Pressable
                style={[styles.cta, purchasing && styles.ctaDisabled]}
                onPress={subscribe}
                disabled={purchasing}
              >
                {purchasing ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.ctaText}>
                    {plan === "weekly"
                      ? "Try for free"
                      : quarterly30dayIntroPrice
                        ? `Redeem 30 days for ${quarterly30dayIntroPrice}`
                        : "Redeem 30 days"}
                  </Text>
                )}
              </Pressable>
              <Text style={styles.pricingNote}>
                {plan === "weekly"
                  ? quarterlyFullPriceOnboarding
                    ? `3 days free, then ${quarterlyFullPriceOnboarding}/quarterly\nCancel anytime`
                    : "3 days free\nCancel anytime"
                  : quarterly30dayIntroPrice && quarterly30dayFullPrice
                    ? `30 days for ${quarterly30dayIntroPrice}, then ${quarterly30dayFullPrice}/quarterly\nCancel anytime`
                    : "Cancel anytime"}
              </Text>
              <Legal onRestore={handleRestore} restoring={restoring} disabled={purchasing} />
            </>
          )}
        </View>
      </Animated.View>

      {/* STEP 2 — bottom sheet overlay */}
      {step === 2 && (
        <>
          <Pressable
            style={styles.overlay}
            onPress={hideOffer}
            disabled={purchasing}
          />
          <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }, s2Style]}>
            <Pressable
              style={styles.sheetX}
              onPress={goBack}
              hitSlop={12}
              disabled={purchasing}
            >
              <Text style={styles.sheetXText}>✕</Text>
            </Pressable>

            <Text style={styles.sheetTitle}>Want to start small?</Text>
            <Text style={styles.sheetSub}>
              No pressure. Go <Text style={styles.sheetBold}>week by week</Text> instead
            </Text>

            <View style={styles.sheetPlan}>
              <Text style={styles.sheetPlanName}>Weekly Plan</Text>
              <Text style={styles.sheetPlanPrice}>
                {weeklyOfferPrice ? `${weeklyOfferPrice}/week` : ""}
              </Text>
            </View>

            <View style={styles.sheetCheck}>
              <Text style={styles.sheetCheckIcon}>✓</Text>
              <Text style={styles.sheetCheckText}>No commitment, cancel anytime</Text>
            </View>

            <Pressable
              style={[styles.sheetCta, purchasing && styles.ctaDisabled]}
              onPress={subscribe}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sheetCtaText}>Unlock</Text>
              )}
            </Pressable>
          </Animated.View>
        </>
      )}
    </View>
  );
}

function Hero({ source }: { source: number }) {
  return (
    <View style={styles.heroWrap} pointerEvents="none">
      <Image source={source} style={styles.heroImg} contentFit="cover" />
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

function Legal({
  onRestore,
  restoring,
  disabled,
}: {
  onRestore?: () => void;
  restoring?: boolean;
  disabled?: boolean;
}) {
  return (
    <View style={styles.legalRow}>
      <Text style={styles.legalLink}>Terms</Text>
      <Text style={styles.legalDot}>·</Text>
      <Text style={styles.legalLink}>Privacy Policy</Text>
      <Text style={styles.legalDot}>·</Text>
      <Pressable onPress={onRestore} hitSlop={8} disabled={disabled || restoring}>
        {restoring ? (
          <ActivityIndicator size="small" color={colors.textMuted} />
        ) : (
          <Text style={styles.legalLink}>Restore</Text>
        )}
      </Pressable>
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
  discountBadge: {
    backgroundColor: "#FF6B35",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: "#fff",
    letterSpacing: 0.3,
  },

  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    minHeight: 56,
    justifyContent: "center",
  },
  ctaDisabled: { opacity: 0.7 },
  ctaText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.background },

  pricingNote: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 18,
  },
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
    minHeight: 56,
    justifyContent: "center",
  },
  sheetCtaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: "#fff",
  },
});
