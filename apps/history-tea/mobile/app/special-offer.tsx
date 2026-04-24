import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/stores/app";
import {
  getOfferings,
  purchasePackage,
  PRODUCT_IDS,
  type PurchasesPackage,
} from "@/lib/purchases";

export default function SpecialOfferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setSubscribed = useAppStore((s) => s.setSubscribed);

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

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
      p.identifier === "yearly_offer" ||
      p.product?.identifier === PRODUCT_IDS.yearlyOffer
  );
  const weekly = packages.find(
    (p) =>
      p.identifier === "weekly_offer" ||
      p.product?.identifier === PRODUCT_IDS.weeklyOffer
  );

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

  async function claim() {
    if (purchasing || !yearly) return;

    setPurchasing(true);
    try {
      const success = await purchasePackage(yearly);
      if (success) {
        setSubscribed(true);
        close();
      }
    } catch (e: any) {
      Alert.alert(
        "Purchase failed",
        e?.message ?? "Something went wrong. Please try again."
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
        <ActivityIndicator color="#1A1A1A" />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Pressable
        style={[styles.closeBtn, { top: insets.top + 8 }]}
        onPress={close}
        hitSlop={16}
      >
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>One-time Offer</Text>
          <Text style={styles.subtitle}>You will never see this again</Text>
        </View>

        <View style={styles.cardWrap}>
          <View style={styles.giftCircle}>
            <Text style={styles.giftIcon}>🎁</Text>
          </View>

          <LinearGradient
            colors={["#DCE6F2", "#E8DCEF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {discount ? (
              <View style={styles.discountRow}>
                <Text style={styles.discountText}>Here's an </Text>
                <View style={styles.discountPill}>
                  <Text style={styles.discountPillText}>{discount}</Text>
                </View>
                <Text style={styles.discountText}> discount 🙌</Text>
              </View>
            ) : (
              <View style={styles.discountRow}>
                <Text style={styles.discountText}>Limited-time price 🙌</Text>
              </View>
            )}

            <View style={styles.pricePill}>
              <Text style={styles.priceText}>{pricePerWeek}/week</Text>
            </View>

            <Text style={styles.lowest}>Lowest price ever</Text>
          </LinearGradient>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.commitRow}>
          <Text style={styles.commitCheck}>✓</Text>
          <Text style={styles.commitText}>No commitment, cancel anytime</Text>
        </View>

        <Pressable
          style={[styles.cta, purchasing && styles.ctaDisabled]}
          onPress={claim}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.ctaText}>Claim my limited time offer</Text>
          )}
        </Pressable>

        <Text style={styles.billing}>
          billed yearly at {yearlyPrice} per year
        </Text>
      </View>
    </View>
  );
}

const CREAM = "#FBF1E5";
const INK = "#1A1A1A";
const MUTED = "#8A8A8A";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CREAM,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    right: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
  closeText: {
    color: INK,
    fontSize: 22,
    fontWeight: "400",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: INK,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: MUTED,
    textAlign: "center",
  },
  cardWrap: {
    alignItems: "center",
    position: "relative",
    marginTop: 24,
  },
  giftCircle: {
    position: "absolute",
    top: -24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  giftIcon: {
    fontSize: 28,
  },
  card: {
    width: "100%",
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: "center",
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 18,
  },
  discountText: {
    fontSize: 16,
    color: INK,
  },
  discountPill: {
    backgroundColor: INK,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  discountPillText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  pricePill: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 12,
  },
  priceText: {
    fontSize: 24,
    fontWeight: "700",
    color: INK,
  },
  lowest: {
    fontSize: 14,
    color: MUTED,
  },
  footer: {
    paddingHorizontal: 24,
  },
  commitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  commitCheck: {
    color: INK,
    fontSize: 16,
    marginRight: 8,
  },
  commitText: {
    color: INK,
    fontSize: 15,
    fontWeight: "500",
  },
  cta: {
    backgroundColor: INK,
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 10,
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  billing: {
    color: MUTED,
    fontSize: 13,
    textAlign: "center",
  },
});
