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
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { GoldCta, GOLD, GOLD_LIGHT } from "@/components/GoldCta";
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
  const { t } = useTranslation();

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
    if (busy || purchasing) return;
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
      Alert.alert(t("paywall.purchaseFailed"), t("paywall.purchaseError"));
      return;
    }

    setPurchasing(true);
    try {
      const success = await purchasePackage(pkg);
      if (success) {
        setSubscribed(true);
        router.replace("/post-purchase" as any);
      }
    } catch (e: any) {
      Alert.alert(t("paywall.purchaseFailed"), e?.message ?? t("paywall.purchaseError"));
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
        Alert.alert(t("paywall.restored"), t("paywall.restoredDesc"));
        goBack();
      } else {
        Alert.alert(t("paywall.nothingToRestore"), t("paywall.nothingToRestoreDesc"));
      }
    } catch {
      Alert.alert(t("paywall.restoreFailed"), t("paywall.restoreFailedDesc"));
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
        <XBtn onPress={dismiss} disabled={busy || purchasing} top={insets.top - 6} />

        <View style={[styles.body, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.title}>{t("paywall.title")}</Text>
          <Text style={styles.sub}>{t("paywall.trialSubtitle")}</Text>

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
                  <Text style={styles.planName}>{t("paywall.weeklyAccess")}</Text>
                  <Text style={styles.planPrice}>
                    {weeklyFullPrice
                      ? t("paywall.threeDaysFreeThen", { price: weeklyFullPrice })
                      : t("paywall.threeDaysFree")}
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
                  <Text style={styles.planName}>{t("paywall.threeMonthAccess")}</Text>
                  <Text style={styles.planPrice}>
                    {quarterlyFullPriceReturning
                      ? t("paywall.threeDaysFreeThenQuarterly", { price: quarterlyFullPriceReturning })
                      : t("paywall.threeDaysFree")}
                  </Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{t("paywall.fiftyOff")}</Text>
                </View>
              </Pressable>

              <GoldCta label={t("paywall.tryForFree")} onPress={subscribe} busy={purchasing} style={styles.ctaGap} />
              <Legal onRestore={handleRestore} restoring={restoring} disabled={purchasing} />
            </>
          ) : (
            <>
              <View style={styles.noPay}>
                <Text style={styles.noPayCheck}>✓</Text>
                <Text style={styles.noPayText}>
                  {plan === "weekly" ? t("paywall.noPaymentDue") : t("paywall.noCommitment")}
                </Text>
              </View>

              <Pressable
                style={[styles.plan, plan === "weekly" && styles.planOn]}
                onPress={() => setPlan("weekly")}
                disabled={purchasing}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>{t("paywall.freePlan")}</Text>
                  <Text style={styles.planPrice}>{t("paywall.threeDayTrial")}</Text>
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
                  <Text style={styles.planPrice}>{t("paywall.thirtyDayTrial")}</Text>
                </View>
                <View style={styles.radio}>
                  {plan === "quarterly" && <View style={styles.radioDot} />}
                </View>
              </Pressable>

              <GoldCta
                label={
                  plan === "weekly"
                    ? t("paywall.tryForFreeLower")
                    : quarterly30dayIntroPrice
                      ? t("paywall.redeemThirtyDaysFor", { price: quarterly30dayIntroPrice })
                      : t("paywall.redeemThirtyDays")
                }
                onPress={subscribe}
                busy={purchasing}
                style={styles.ctaGap}
              />
              <Text style={styles.pricingNote}>
                {plan === "weekly"
                  ? quarterlyFullPriceOnboarding
                    ? t("paywall.pricingFreeTrial", { price: quarterlyFullPriceOnboarding })
                    : t("paywall.pricingFreeTrialShort")
                  : quarterly30dayIntroPrice && quarterly30dayFullPrice
                    ? t("paywall.pricingThirtyDay", { introPrice: quarterly30dayIntroPrice, price: quarterly30dayFullPrice })
                    : t("paywall.cancelAnytime")}
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
          <Animated.View
            style={[styles.sheet, { paddingBottom: insets.bottom + 20 }, s2Style]}
          >
            <LinearGradient
              colors={["#221B12", "#141009", "#0C0A07"]}
              locations={[0, 0.5, 1]}
              style={styles.sheetBg}
            />
            <View style={styles.sheetHairline} pointerEvents="none" />
            <View style={styles.sheetGrabber} pointerEvents="none" />

            <Pressable
              style={styles.sheetX}
              onPress={goBack}
              hitSlop={12}
              disabled={purchasing}
            >
              <Ionicons name="close" size={16} color="rgba(232,214,184,0.8)" />
            </Pressable>

            {/* Swallow taps on the sheet so they don't hit the backdrop. */}
            <Pressable style={{ width: "100%" }}>
              <Text style={styles.sheetKicker}>{t("paywall.sheetKicker")}</Text>
              <Text style={styles.sheetTitle}>{t("paywall.sheetTitle")}</Text>
              <Text style={styles.sheetSub}>
                {t("paywall.sheetSub")}
                <Text style={styles.sheetBold}>{t("paywall.sheetBold")}</Text>
                {t("paywall.sheetSubEnd")}
              </Text>

              <View style={styles.sheetPlan}>
                <LinearGradient
                  colors={["rgba(212,169,74,0.18)", "rgba(212,169,74,0.04)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetPlanName}>{t("paywall.weeklyPlan")}</Text>
                  <View style={styles.sheetPill}>
                    <Text style={styles.sheetPillText}>{t("paywall.sheetPill")}</Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.sheetPlanPrice}>{weeklyOfferPrice ?? ""}</Text>
                  <Text style={styles.sheetPlanPer}>{t("paywall.perWeek")}</Text>
                </View>
              </View>

              <View style={styles.sheetCheck}>
                <Ionicons name="checkmark-circle" size={16} color={GOLD} />
                <Text style={styles.sheetCheckText}>{t("paywall.noCommitment")}</Text>
              </View>

              <GoldCta label={t("paywall.unlock")} onPress={subscribe} busy={purchasing} style={styles.ctaGap} />
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
      <Image source={source} style={styles.heroImg} contentFit="cover" transition={0} priority="high" cachePolicy="memory-disk" />
      <LinearGradient
        colors={["transparent", colors.background + "DD", colors.background]}
        style={styles.heroFade}
      />
    </View>
  );
}

function XBtn({ onPress, disabled, top }: { onPress: () => void; disabled: boolean; top: number }) {
  return (
    <Pressable style={[styles.x, { top }]} onPress={onPress} disabled={disabled} hitSlop={16}>
      <Ionicons name="close" size={24} color="rgba(232,214,184,0.32)" />
    </Pressable>
  );
}

function NoPay() {
  const { t } = useTranslation();
  return (
    <View style={styles.noPay}>
      <Text style={styles.noPayCheck}>✓</Text>
      <Text style={styles.noPayText}>{t("paywall.noPaymentDue")}</Text>
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
  const { t } = useTranslation();
  return (
    <View style={styles.legalRow}>
      <Text style={styles.legalLink}>{t("paywall.terms")}</Text>
      <Text style={styles.legalDot}>·</Text>
      <Text style={styles.legalLink}>{t("paywall.privacyPolicy")}</Text>
      <Text style={styles.legalDot}>·</Text>
      <Pressable onPress={onRestore} hitSlop={8} disabled={disabled || restoring}>
        {restoring ? (
          <ActivityIndicator size="small" color={colors.textMuted} />
        ) : (
          <Text style={styles.legalLink}>{t("paywall.restore")}</Text>
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
    left: 16,
    zIndex: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

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
    borderColor: GOLD,
    backgroundColor: "rgba(212,169,74,0.10)",
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
    backgroundColor: GOLD,
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

  ctaGap: { marginTop: 20 },

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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetBg: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sheetHairline: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(212,169,74,0.35)",
  },
  sheetGrabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(232,214,184,0.28)",
    marginTop: -18,
    marginBottom: 18,
  },
  sheetX: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(232,214,184,0.10)",
    borderWidth: 1,
    borderColor: "rgba(232,214,184,0.18)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  sheetKicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 2.2,
    color: GOLD,
    textAlign: "center",
    marginBottom: 8,
  },
  sheetTitle: {
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 34,
    color: "#F3E7D0",
    textAlign: "center",
    marginBottom: 8,
  },
  sheetSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: "rgba(232,214,184,0.68)",
    textAlign: "center",
    marginBottom: 22,
  },
  sheetBold: {
    fontFamily: fonts.bodySemiBold,
    color: "#F3E7D0",
  },
  sheetPlan: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
    overflow: "hidden",
    gap: 12,
  },
  sheetPlanName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: "#F3E7D0",
  },
  sheetPill: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(212,169,74,0.16)",
    borderWidth: 1,
    borderColor: "rgba(212,169,74,0.45)",
  },
  sheetPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: GOLD_LIGHT,
    textTransform: "uppercase",
  },
  sheetPlanPrice: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: GOLD_LIGHT,
  },
  sheetPlanPer: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: "rgba(232,214,184,0.6)",
    marginTop: 2,
  },
  sheetCheck: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 2,
  },
  sheetCheckText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: "rgba(232,214,184,0.75)",
  },
});
