import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
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
import { getOfferings, purchasePackage, restorePurchases, PRODUCT_IDS, type PurchasesPackage } from "@/lib/purchases";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

const { height: SCREEN_H } = Dimensions.get("window");

type Plan = "weekly" | "quarterly" | "offer";

// The highlighted yearly_offer card on the inside-app paywall is a
// "one-time" offer per app session — show it the first time the inside-app
// paywall opens, then hide it for the rest of the cold-start session.
let YEARLY_OFFER_SHOWN_THIS_SESSION = false;

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const setSubscribed = useAppStore((s) => s.setSubscribed);
  const isSubscribed = useAppStore((s) => s.isSubscribed);

  // Snapshot `returning` ONCE at mount so it stays stable for the lifetime
  // of this paywall instance. Otherwise setting HAS_SEEN_INITIAL_OFFER below
  // would flip the onboarding paywall into the inside-app variant mid-render.
  const [returning] = useState(
    () => !!storage.getBoolean(StorageKeys.HAS_SEEN_INITIAL_OFFER),
  );
  // Snapshot whether the yearly_offer card should render this mount. We show
  // it the FIRST time the inside-app paywall is opened in this session, then
  // hide it on subsequent opens until the next cold start.
  const [showYearlyOffer] = useState(() => {
    if (!returning) return false;
    if (YEARLY_OFFER_SHOWN_THIS_SESSION) return false;
    YEARLY_OFFER_SHOWN_THIS_SESSION = true;
    return true;
  });
  const [plan, setPlan] = useState<Plan>(showYearlyOffer ? "offer" : "weekly");
  const [busy, setBusy] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  const s1Y = useSharedValue(SCREEN_H);
  const badgeSc = useSharedValue(0);

  useEffect(() => {
    s1Y.value = withSpring(0, { damping: 22, stiffness: 90 });
    // Mark that the user has seen the initial offer so the NEXT time the
    // paywall opens it renders the inside-app variant (yearly_offer card).
    // The current mount keeps the snapshot above, so this only takes effect
    // on subsequent opens.
    if (!returning) {
      storage.set(StorageKeys.HAS_SEEN_INITIAL_OFFER, true);
    }
    getOfferings().then((offering) => {
      if (offering?.availablePackages) {
        setPackages(offering.availablePackages);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function dismiss() {
    if (busy || purchasing) return;
    goBack();
  }

  function findPackage(
    identifier: string,
    productIdentifier?: string,
  ): PurchasesPackage | undefined {
    return packages.find(
      (p) =>
        p.identifier === identifier ||
        (productIdentifier && p.product?.identifier === productIdentifier),
    );
  }

  function getTargetPackage(): PurchasesPackage | undefined {
    if (plan === "offer") {
      return returning ? yearlyOffer : weeklyOffer;
    }
    if (returning) {
      return plan === "weekly" ? weeklyFreetrial : quarterly3day;
    }
    return plan === "weekly" ? quarterlyOnboarding : quarterly30day;
  }

  // Resolved prices from the RevenueCat packages — never hardcoded.
  const weeklyFreetrial = findPackage("weekly_freetrial", PRODUCT_IDS.weeklyFreeTrial);
  const quarterly3day = findPackage("quarterly_3day", PRODUCT_IDS.quarterly3DayTrial);
  const quarterlyOnboarding = findPackage("quarterly_onboarding", PRODUCT_IDS.quarterlyOnboarding3DayTrial);
  const quarterly30day = findPackage("quarterly_30day", PRODUCT_IDS.quarterly30DayTrial);
  const weeklyOffer = findPackage("weekly_offer", PRODUCT_IDS.weeklyOffer);
  const yearlyOffer = findPackage("yearly_offer", PRODUCT_IDS.yearlyOffer);

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
  const yearlyOfferPrice = priceOf(yearlyOffer);
  const yearlyOfferPerWeek = yearlyOffer?.product?.pricePerWeekString ?? "";

  // Calculate yearly discount vs weekly_freetrial for the badge.
  let yearlyDiscount: string | null = null;
  if (yearlyOffer?.product?.price && weeklyFreetrial?.product?.price) {
    const pct = Math.round(
      (1 - yearlyOffer.product.price / 52 / weeklyFreetrial.product.price) * 100,
    );
    if (pct > 0 && pct < 100) yearlyDiscount = `${pct}% off`;
  }

  async function subscribe() {
    if (busy || purchasing) return;

    const pkg = getTargetPackage();

    if (!pkg) {
      Alert.alert(
        t("paywall.purchaseFailed"),
        t("paywall.purchaseError"),
      );
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
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgeSc.value }] }));

  return (
    <View style={styles.root}>

      {/* STEP 1 */}
      <Animated.View style={[styles.page, s1Style]}>
        <Hero source={require("@/assets/onboarding/building-the-pyramids.webp")} />
        <XBtn onPress={dismiss} disabled={busy || purchasing} top={insets.top + 8} />

        <View style={[styles.body, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.title}>{t("paywall.title")}</Text>
          <Text style={styles.sub}>{t("paywall.trialSubtitle")}</Text>

          {returning ? (
            <>
              <NoPay />
              {showYearlyOffer && yearlyOffer && yearlyOfferPrice ? (
                <Pressable
                  style={[styles.offerPlan, plan === "offer" && styles.offerPlanOn]}
                  onPress={() => setPlan("offer")}
                  disabled={purchasing}
                >
                  <View style={styles.radio}>
                    {plan === "offer" && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.offerBody}>
                    <View style={styles.offerHeaderRow}>
                      <Text style={styles.offerStar}>★</Text>
                      <Text style={styles.offerLabel}>YEARLY</Text>
                      {yearlyDiscount && (
                        <View style={styles.bestBadge}>
                          <Text style={styles.bestBadgeText}>BEST · {yearlyDiscount}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.offerPriceMain}>{yearlyOfferPrice}/year</Text>
                    {yearlyOfferPerWeek ? (
                      <Text style={styles.offerPriceSub}>
                        just {yearlyOfferPerWeek}/week
                      </Text>
                    ) : null}
                    <Text style={styles.offerOnceNote}>
                      🎁 One-time offer · you won't see this again
                    </Text>
                  </View>
                </Pressable>
              ) : null}

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
                {!showYearlyOffer && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{t("paywall.fiftyOff")}</Text>
                  </View>
                )}
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
                    {plan === "offer"
                      ? yearlyOfferPrice
                        ? `Subscribe — ${yearlyOfferPrice}/year`
                        : "Subscribe"
                      : t("paywall.tryForFree")}
                  </Text>
                )}
              </Pressable>
              {plan === "offer" && yearlyOfferPrice ? (
                <Text style={styles.pricingNote}>
                  Auto-renews yearly at {yearlyOfferPrice}.{"\n"}{t("paywall.cancelAnytime")}
                </Text>
              ) : null}
              <Legal onRestore={handleRestore} restoring={restoring} disabled={purchasing} t={t} />
            </>
          ) : (
            <>
              <View style={styles.noPay}>
                <Text style={styles.noPayCheck}>✓</Text>
                <Text style={styles.noPayText}>
                  {plan === "weekly"
                    ? t("paywall.noPaymentDue")
                    : t("paywall.noCommitment")}
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

              {weeklyOffer && weeklyOfferPrice ? (
                <Pressable
                  style={[styles.plan, plan === "offer" && styles.planOn]}
                  onPress={() => setPlan("offer")}
                  disabled={purchasing}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planName}>Just want to try?</Text>
                    <Text style={styles.planPrice}>
                      {weeklyOfferPrice}/week — no trial, cancel anytime
                    </Text>
                  </View>
                  <View style={styles.radio}>
                    {plan === "offer" && <View style={styles.radioDot} />}
                  </View>
                </Pressable>
              ) : null}

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
                      ? t("paywall.tryForFreeLower")
                      : plan === "quarterly"
                        ? quarterly30dayIntroPrice
                          ? t("paywall.redeemThirtyDaysFor", { price: quarterly30dayIntroPrice })
                          : t("paywall.redeemThirtyDays")
                        : weeklyOfferPrice
                          ? `Subscribe — ${weeklyOfferPrice}/week`
                          : "Subscribe"}
                  </Text>
                )}
              </Pressable>
              <Text style={styles.pricingNote}>
                {plan === "weekly"
                  ? quarterlyFullPriceOnboarding
                    ? t("paywall.pricingFreeTrial", { price: quarterlyFullPriceOnboarding })
                    : t("paywall.pricingFreeTrialShort")
                  : plan === "quarterly"
                    ? quarterly30dayIntroPrice && quarterly30dayFullPrice
                      ? t("paywall.pricingThirtyDay", { introPrice: quarterly30dayIntroPrice, price: quarterly30dayFullPrice })
                      : t("paywall.cancelAnytime")
                    : weeklyOfferPrice
                      ? `Auto-renews weekly at ${weeklyOfferPrice}.\n${t("paywall.cancelAnytime")}`
                      : t("paywall.cancelAnytime")}
              </Text>
              <Legal onRestore={handleRestore} restoring={restoring} disabled={purchasing} t={t} />
            </>
          )}
        </View>
      </Animated.View>

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
  t,
}: {
  onRestore?: () => void;
  restoring?: boolean;
  disabled?: boolean;
  t: (key: string) => string;
}) {
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

  // Highlighted yearly_offer card on the inside-app paywall.
  offerPlan: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  offerPlanOn: {
    borderWidth: 2,
    backgroundColor: colors.primary + "1F",
    borderColor: colors.primary,
  },
  offerBody: {
    flex: 1,
  },
  offerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  offerStar: {
    fontSize: 16,
    color: colors.primary,
  },
  offerLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primary,
    letterSpacing: 1,
  },
  bestBadge: {
    backgroundColor: "#FF6B35",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: "auto",
  },
  bestBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: "#fff",
    letterSpacing: 0.4,
  },
  radioOnOffer: {
    marginLeft: 8,
  },
  offerPriceMain: {
    fontFamily: fonts.heading,
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  offerPriceSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  offerOnceNote: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.primary,
    marginTop: 8,
    letterSpacing: 0.2,
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
    borderColor: colors.primary,
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
    backgroundColor: colors.primary,
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
