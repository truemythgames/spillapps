import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/app";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  findWeeklyOfferPackage,
  PRODUCT_IDS,
  type PurchasesPackage,
} from "@/lib/purchases";
import { fonts, fontSize, spacing } from "@/lib/theme";
import { GoldCta, GOLD, GOLD_LIGHT, GOLD_DARK } from "@/components/GoldCta";

const TERMS_URL = "https://bibletea.app/terms/";
const PRIVACY_URL = "https://bibletea.app/privacy/";

const { height: SCREEN_H } = Dimensions.get("window");

const INK = "#0C0A07";
const CREAM = "#F3E7D0";
const CREAM_DIM = "rgba(232,214,184,0.68)";
const CREAM_FAINT = "rgba(232,214,184,0.45)";

const HERO = require("@/assets/onboarding/the-burning-bush.webp");

export default function SpecialOfferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSubscribed = useAppStore((s) => s.setSubscribed);
  const { t } = useTranslation();

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    getOfferings()
      .then((offering) => {
        if (offering?.availablePackages) {
          setPackages(offering.availablePackages);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const yearly = packages.find(
    (p) =>
      p.identifier === "$rc_annual" ||
      p.identifier === "yearly_offer" ||
      p.product?.identifier?.startsWith(PRODUCT_IDS.yearlyOffer)
  );
  const weekly = findWeeklyOfferPackage(packages);

  const pricePerWeek = yearly?.product?.pricePerWeekString;
  const yearlyPrice = yearly?.product?.priceString;

  let discount: string | null = null;
  if (yearly?.product?.price && weekly?.product?.price) {
    const pct = Math.round(
      (1 - yearly.product.price / 52 / weekly.product.price) * 100
    );
    if (pct > 0 && pct < 100) discount = `${pct}% off`;
  }

  function close() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)" as any);
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
        close();
      } else {
        Alert.alert(t("paywall.nothingToRestore"), t("paywall.nothingToRestoreDesc"));
      }
    } catch {
      Alert.alert(t("paywall.restoreFailed"), t("paywall.restoreFailedDesc"));
    } finally {
      setRestoring(false);
    }
  }

  async function claim() {
    if (purchasing || !yearly) return;

    setPurchasing(true);
    try {
      const success = await purchasePackage(yearly);
      if (success) {
        setSubscribed(true);
        router.replace("/post-purchase" as any);
        return;
      }
    } catch (e: any) {
      Alert.alert(
        t("specialOffer.purchaseFailed"),
        e?.message ?? t("specialOffer.purchaseError")
      );
    } finally {
      setPurchasing(false);
    }
  }

  const missingPackage = loaded && (!yearly || !pricePerWeek || !yearlyPrice);

  useEffect(() => {
    if (missingPackage) close();
    // close is stable for our purposes (router instance changes are rare).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingPackage]);

  // While offerings are loading (or we're bouncing back because the
  // yearly_offer package isn't configured yet) render a spinner so we never
  // flash hardcoded prices.
  if (!loaded || missingPackage) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={GOLD} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Backdrop />

      <Pressable
        style={[styles.closeBtn, { top: insets.top - 6 }]}
        onPress={close}
        hitSlop={16}
        disabled={purchasing}
      >
        <Ionicons name="close" size={24} color="rgba(232,214,184,0.32)" />
      </Pressable>

      <View style={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={styles.title}>{t("specialOffer.title")}</Text>
          <Text style={styles.subtitle}>{t("specialOffer.subtitle")}</Text>
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(120).duration(520)} style={styles.cardWrap}>
          <Seal />

          <View style={styles.card}>
            <LinearGradient
              colors={["#221B12", "#151109", "#0F0C08"]}
              locations={[0, 0.55, 1]}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={["rgba(212,169,74,0.22)", "rgba(212,169,74,0)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.6 }}
              style={StyleSheet.absoluteFill}
            />

            {discount ? (
              <Animated.View entering={FadeIn.delay(360).duration(400)} style={styles.discountRow}>
                <Text style={styles.discountText}>{t("specialOffer.discountPrefix")}</Text>
                <View style={styles.discountPill}>
                  <Text style={styles.discountPillText}>{discount}</Text>
                </View>
                <Text style={styles.discountText}>{t("specialOffer.discountSuffix")}</Text>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeIn.delay(360).duration(400)} style={styles.discountRow}>
                <Text style={styles.discountText}>{t("specialOffer.limitedTime")}</Text>
              </Animated.View>
            )}

            <Animated.View entering={FadeInUp.delay(440).duration(480)} style={styles.priceRow}>
              <Text style={styles.price}>{pricePerWeek}</Text>
              <Text style={styles.priceUnit}>/week</Text>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(560).duration(400)} style={styles.lowestRow}>
              <View style={styles.rule} />
              <Text style={styles.lowest}>{t("specialOffer.lowestPrice")}</Text>
              <View style={styles.rule} />
            </Animated.View>
          </View>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeInUp.delay(620).duration(500)}>
          <View style={styles.commitRow}>
            <Ionicons name="checkmark-circle" size={16} color={GOLD} />
            <Text style={styles.commitText}>{t("specialOffer.noCommitment")}</Text>
          </View>

          <GoldCta label={t("specialOffer.claimOffer")} onPress={claim} busy={purchasing} />

          <Text style={styles.billing}>
            {t("specialOffer.billedYearly", { price: yearlyPrice })}
          </Text>

          <View style={styles.legalRow}>
            <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8} disabled={purchasing}>
              <Text style={styles.legalLink}>{t("paywall.terms")}</Text>
            </Pressable>
            <Text style={styles.legalDot}>·</Text>
            <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8} disabled={purchasing}>
              <Text style={styles.legalLink}>{t("paywall.privacyPolicy")}</Text>
            </Pressable>
            <Text style={styles.legalDot}>·</Text>
            <Pressable onPress={handleRestore} hitSlop={8} disabled={purchasing || restoring}>
              {restoring ? (
                <ActivityIndicator size="small" color={CREAM_FAINT} />
              ) : (
                <Text style={styles.legalLink}>{t("paywall.restore")}</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

/** Dim cover at the top, slow Ken Burns, fading into ink. */
function Backdrop() {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.08, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);
  const zoom = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.backdrop} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, zoom]}>
        <Image source={HERO} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Animated.View>
      <LinearGradient
        colors={["rgba(12,10,7,0.35)", "rgba(12,10,7,0.7)", INK]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

/** Gold gift seal that sits on the card's top edge and breathes softly. */
function Seal() {
  const glow = useSharedValue(0.4);
  useEffect(() => {
    glow.value = withRepeat(
      withTiming(0.85, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);
  const s = useAnimatedStyle(() => ({ shadowOpacity: glow.value }));

  return (
    <Animated.View style={[styles.seal, s]}>
      <LinearGradient
        colors={[GOLD_LIGHT, GOLD, GOLD_DARK]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sealFill}
      >
        <Ionicons name="gift" size={26} color="#1A1408" />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: INK },
  center: { justifyContent: "center", alignItems: "center" },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_H * 0.6,
    overflow: "hidden",
  },

  closeBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: SCREEN_H * 0.2,
  },
  header: { alignItems: "center", marginBottom: 44 },
  title: {
    fontFamily: fonts.heading,
    fontSize: 40,
    lineHeight: 46,
    color: CREAM,
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.md,
    color: CREAM_DIM,
    textAlign: "center",
    letterSpacing: 0.2,
  },

  cardWrap: { alignItems: "center" },
  seal: {
    position: "absolute",
    top: -30,
    zIndex: 2,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  sealFill: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  card: {
    width: "100%",
    paddingTop: 50,
    paddingBottom: 26,
    paddingHorizontal: 20,
    borderRadius: 26,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212,169,74,0.45)",
  },

  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 14,
  },
  discountText: { fontFamily: fonts.body, fontSize: fontSize.md, color: CREAM_DIM },
  discountPill: {
    backgroundColor: "rgba(212,169,74,0.16)",
    borderWidth: 1,
    borderColor: "rgba(212,169,74,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  discountPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: GOLD_LIGHT,
    letterSpacing: 0.3,
  },

  priceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 14 },
  price: {
    fontFamily: fonts.heading,
    fontSize: 54,
    lineHeight: 60,
    color: GOLD_LIGHT,
    textShadowColor: "rgba(212,169,74,0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  priceUnit: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.lg,
    color: CREAM_DIM,
    marginLeft: 4,
  },

  lowestRow: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%" },
  rule: { flex: 1, height: 1, backgroundColor: "rgba(212,169,74,0.3)" },
  lowest: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: GOLD,
  },

  commitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 14,
  },
  commitText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: "rgba(232,214,184,0.8)" },

  billing: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: CREAM_FAINT,
    textAlign: "center",
    marginTop: 12,
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  legalLink: { fontFamily: fonts.body, fontSize: 11, color: CREAM_FAINT },
  legalDot: { fontSize: 11, color: CREAM_FAINT },
});
