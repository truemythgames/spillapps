import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  FlatList,
  ViewToken,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolation,
  runOnJS,
  Easing,
  FadeIn,
  SlideInUp,
} from "react-native-reanimated";
let StoreReview: any = null;
try { StoreReview = require("expo-store-review"); } catch {}
import { storage, StorageKeys } from "@/lib/storage";
import { colors, fonts, fontSize, spacing } from "@/lib/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const ACCENT = colors.primary;
const ACCENT_DARK = colors.primaryDark;
const CARD_BG = "rgba(255,255,255,0.88)";
const CARD_BORDER = "rgba(255,255,255,0.5)";

const LOCAL_COVERS = {
  "building-the-pyramids": require("@/assets/onboarding/building-the-pyramids.webp"),
  "the-trojan-horse": require("@/assets/onboarding/the-trojan-horse.webp"),
  "ides-of-march": require("@/assets/onboarding/ides-of-march.webp"),
  "tutankhamuns-tomb": require("@/assets/onboarding/tutankhamuns-tomb.webp"),
  "vikings-raid-lindisfarne": require("@/assets/onboarding/vikings-raid-lindisfarne.webp"),
  "joan-of-arc": require("@/assets/onboarding/joan-of-arc.webp"),
  "napoleons-rise": require("@/assets/onboarding/napoleons-rise.webp"),
  "hiroshima-and-nagasaki": require("@/assets/onboarding/hiroshima-and-nagasaki.webp"),
  "moon-landing": require("@/assets/onboarding/moon-landing.webp"),
} as const;

const HERO_IMAGE = require("@/assets/onboarding/teastories.webp");

const SCREENSHOTS = {
  home: require("@/assets/onboarding/screenshot-home.webp"),
  stories: require("@/assets/onboarding/screenshot-stories.webp"),
  chat: require("@/assets/onboarding/screenshot-chat.webp"),
} as const;

const BACKGROUNDS = [
  HERO_IMAGE,                                  // welcome
  LOCAL_COVERS["building-the-pyramids"],       // q1
  LOCAL_COVERS["the-trojan-horse"],            // q1comment
  LOCAL_COVERS["ides-of-march"],               // q2
  LOCAL_COVERS["tutankhamuns-tomb"],           // q2comment
  LOCAL_COVERS["vikings-raid-lindisfarne"],    // feature1
  LOCAL_COVERS["joan-of-arc"],                 // reviews
  LOCAL_COVERS["napoleons-rise"],              // feature2
  LOCAL_COVERS["hiroshima-and-nagasaki"],      // feature3
  LOCAL_COVERS["moon-landing"],                // rate
];

const Q1_OPTIONS = [
  "Barely paid attention in class",
  "I know the highlights",
  "I read history for fun",
  "Don't test me, I'll win",
];

const Q1_COMMENTS: Record<string, string> = {
  "Barely paid attention in class":
    "Perfect — History Tea makes it easy to jump in. No textbooks, no dates to memorize, just press play.",
  "I know the highlights":
    "Great start! You'll hear the stories behind the stories you already know.",
  "I read history for fun":
    "You're going to love how we tell these. Same events, none of the dry textbook energy.",
  "Don't test me, I'll win":
    "Then you already know history is the best soap opera ever written. Welcome home.",
};

const Q2_OPTIONS = [
  "Listen to history stories",
  "Meet the wildest characters",
  "Build a daily habit",
  "Sound smart at dinner parties",
  "Just curious",
];

const Q2_COMMENTS: Record<string, string> = {
  "Listen to history stories":
    "You're in the right place — short audio stories you can listen to anytime, anywhere.",
  "Meet the wildest characters":
    "From Cleopatra to Genghis Khan to Napoleon — history's most chaotic personalities, all in one place.",
  "Build a daily habit":
    "One story a day. Track your streak, build consistency, become the most interesting person in any room.",
  "Sound smart at dinner parties":
    "Honestly the most respectable use of an app. You'll have a wild fact for every occasion.",
  "Just curious":
    "Curiosity is how every great historian started. Let's show you what History Tea is all about.",
};

interface FeatureSlide {
  title: string;
  image: number;
}

const FEATURE_SLIDES: FeatureSlide[] = [
  {
    title: "History like you've\nnever heard it told",
    image: SCREENSHOTS.home,
  },
  {
    title: "Every era, every legend —\nall in one place",
    image: SCREENSHOTS.stories,
  },
  {
    title: "The past, finally\nin your language",
    image: SCREENSHOTS.chat,
  },
];

const REVIEWS = [
  {
    text: "I never thought I'd binge history on my commute. This app changed that.",
    name: "Mia R.",
  },
  {
    text: "The narrators actually make you feel like you're IN the room when Caesar gets stabbed. Obsessed.",
    name: "Daniel P.",
  },
];

type Step =
  | "welcome"
  | "q1"
  | "q1comment"
  | "q2"
  | "q2comment"
  | "feature1"
  | "feature2"
  | "feature3"
  | "reviews"
  | "rate";

const STEP_ORDER: Step[] = [
  "welcome",
  "q1",
  "q1comment",
  "q2",
  "q2comment",
  "feature1",
  "reviews",
  "feature2",
  "feature3",
  "rate",
];

const SHOWCASE_STEPS: Step[] = ["feature1", "reviews", "feature2", "feature3", "rate"];
const SHOWCASE_START_IDX = STEP_ORDER.indexOf("feature1");

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stepIdx, setStepIdx] = useState(0);
  const [q1Answer, setQ1Answer] = useState<string | null>(null);
  const [q2Answer, setQ2Answer] = useState<string | null>(null);
  const [showcaseIdx, setShowcaseIdx] = useState(0);
  const showcaseRef = useRef<FlatList>(null);

  const fadeAnim = useSharedValue(1);
  const slideAnim = useSharedValue(0);
  const ctaScale = useSharedValue(1);
  const reviewPrompted = useRef(false);
  const step = STEP_ORDER[stepIdx];
  const inShowcase = stepIdx >= SHOWCASE_START_IDX;
  const showcaseStep = inShowcase ? SHOWCASE_STEPS[showcaseIdx] : null;
  const currentStep = inShowcase ? showcaseStep! : step;
  const bgIdx = inShowcase ? SHOWCASE_START_IDX + showcaseIdx : stepIdx;
  const bgUri = BACKGROUNDS[bgIdx] ?? BACKGROUNDS[0];

  if (showcaseStep === "rate" && !reviewPrompted.current) {
    reviewPrompted.current = true;
    setTimeout(async () => {
      try {
        if (StoreReview && await StoreReview.hasAction()) {
          await StoreReview.requestReview();
        }
      } catch {}
    }, 600);
  }

  function animateTransition(next: () => void) {
    const OUT = 180;
    const IN = 260;
    const EASE_OUT = Easing.out(Easing.cubic);
    const EASE_IN = Easing.out(Easing.cubic);
    fadeAnim.value = withTiming(0, { duration: OUT, easing: EASE_OUT });
    slideAnim.value = withTiming(-18, { duration: OUT, easing: EASE_OUT }, (finished) => {
      if (!finished) return;
      runOnJS(next)();
      slideAnim.value = 24;
      fadeAnim.value = withTiming(1, { duration: IN, easing: EASE_IN });
      slideAnim.value = withTiming(0, { duration: IN, easing: EASE_IN });
    });
  }

  function bumpCta() {
    ctaScale.value = withSequence(
      withTiming(0.94, { duration: 90, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 8, stiffness: 260 }),
    );
  }

  function goNext() {
    if (inShowcase) {
      if (showcaseIdx < SHOWCASE_STEPS.length - 1) {
        showcaseRef.current?.scrollToIndex({ index: showcaseIdx + 1, animated: true });
      } else {
        completeOnboarding();
      }
    } else if (stepIdx === SHOWCASE_START_IDX - 1) {
      animateTransition(() => setStepIdx(SHOWCASE_START_IDX));
    } else {
      animateTransition(() => setStepIdx((i) => Math.min(i + 1, STEP_ORDER.length - 1)));
    }
  }

  function goBack() {
    if (inShowcase && showcaseIdx > 0) {
      showcaseRef.current?.scrollToIndex({ index: showcaseIdx - 1, animated: true });
    } else if (inShowcase && showcaseIdx === 0) {
      animateTransition(() => {
        setStepIdx(SHOWCASE_START_IDX - 1);
        setShowcaseIdx(0);
      });
    } else if (stepIdx > 0) {
      animateTransition(() => setStepIdx((i) => i - 1));
    }
  }

  function completeOnboarding() {
    storage.set(StorageKeys.HAS_ONBOARDED, true);
    router.replace("/paywall");
  }

  const onShowcaseViewChange = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setShowcaseIdx(viewableItems[0].index);
      }
    },
    [],
  );

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const ctaAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  function renderShowcasePage(pageStep: Step) {
    switch (pageStep) {
      case "feature1":
      case "feature2":
      case "feature3": {
        const idx = pageStep === "feature1" ? 0 : pageStep === "feature2" ? 1 : 2;
        const slide = FEATURE_SLIDES[idx];
        return (
          <View style={styles.featureView}>
            <Text style={styles.featureTitle}>{slide.title}</Text>
            <View style={styles.phoneFrame}>
              <Image
                source={slide.image}
                style={styles.phoneScreen}
                contentFit="cover"
              />
            </View>
          </View>
        );
      }
      case "reviews":
        return (
          <View style={styles.reviewsContent}>
            <Text style={styles.reviewsTitle}>Don't just take our word for it</Text>
            <Text style={styles.starsRow}>⭐⭐⭐⭐⭐</Text>
            {REVIEWS.map((r, i) => (
              <View key={i} style={styles.reviewCard}>
                <Text style={styles.reviewText}>"{r.text}"</Text>
                <Text style={styles.reviewName}>— {r.name}</Text>
              </View>
            ))}
          </View>
        );
      case "rate":
        return (
          <View style={styles.rateContent}>
            <Text style={styles.rateTitle}>Rate the App</Text>
            <Text style={styles.starsRowLarge}>⭐⭐⭐⭐⭐</Text>
            <View style={styles.rateCard}>
              <Text style={styles.reviewText}>
                "I put this on during my morning walk and now I know more about
                Genghis Khan than I ever needed to. Worth it."
              </Text>
              <Text style={styles.reviewName}>— Priya S.</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  }

  function renderContent() {
    switch (step) {
      case "welcome":
        return (
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeSpacer} />
            <Text style={styles.welcomeSub}>
              Spill the tea.{"\n"}Learn the history.
            </Text>
          </View>
        );

      case "q1":
        return (
          <View style={styles.questionContent}>
            <Text style={styles.stepLabel}>Question 1 of 2</Text>
            <Text style={styles.questionTitle}>
              How much history{"\n"}do you actually know?
            </Text>
            <View style={styles.optionsContainer}>
              {Q1_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.optionPill,
                    q1Answer === opt && styles.optionPillSelected,
                  ]}
                  onPress={() => setQ1Answer(opt)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      q1Answer === opt && styles.optionTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case "q1comment":
        return (
          <View style={styles.commentContent}>
            <Text style={styles.commentText}>
              {Q1_COMMENTS[q1Answer!] ?? Q1_COMMENTS["Barely paid attention in class"]}
            </Text>
          </View>
        );

      case "q2":
        return (
          <View style={styles.questionContent}>
            <Text style={styles.stepLabel}>Question 2 of 2</Text>
            <Text style={styles.questionTitle}>
              What brings you to{"\n"}History Tea?
            </Text>
            <View style={styles.optionsContainer}>
              {Q2_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.optionPill,
                    q2Answer === opt && styles.optionPillSelected,
                  ]}
                  onPress={() => setQ2Answer(opt)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      q2Answer === opt && styles.optionTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case "q2comment":
        return (
          <View style={styles.commentContentTop}>
            <Text style={styles.commentText}>
              {Q2_COMMENTS[q2Answer!] ?? Q2_COMMENTS["Just curious"]}
            </Text>
          </View>
        );

      default:
        return null;
    }
  }

  const isDisabled =
    (step === "q1" && !q1Answer) || (step === "q2" && !q2Answer);
  const isLastShowcase = showcaseIdx === SHOWCASE_STEPS.length - 1;
  const showBack = inShowcase ? true : stepIdx > 0;
  const btnLabel = step === "welcome"
    ? "Get Started"
    : inShowcase && isLastShowcase
      ? "Continue"
      : "Next";

  return (
    <View style={styles.root}>
      <Image
        source={bgUri}
        style={StyleSheet.absoluteFill}
        contentFit={currentStep === "welcome" ? "contain" : "cover"}
        contentPosition={currentStep === "welcome" ? "center" : "center"}
        transition={420}
      />
      <LinearGradient
        colors={
          currentStep === "welcome"
            ? ["transparent", "transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.85)"]
            : ["transparent", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]
        }
        locations={currentStep === "welcome" ? [0, 0.5, 0.75, 1] : [0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {showBack && (
        <Pressable
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={goBack}
          hitSlop={12}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
      )}

      {inShowcase ? (
        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View style={styles.contentInner}>
            <FlatList
              ref={showcaseRef}
              data={SHOWCASE_STEPS}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              onViewableItemsChanged={onShowcaseViewChange}
              viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
              renderItem={({ item }) => (
                <View style={styles.showcasePage}>
                  {renderShowcasePage(item)}
                </View>
              )}
            />
          </View>

          <View style={styles.bottomArea}>
            <View style={styles.progressDots}>
              {SHOWCASE_STEPS.map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.progressDot,
                    i === showcaseIdx && styles.progressDotActive,
                    i < showcaseIdx && styles.progressDotDone,
                  ]}
                />
              ))}
            </View>
            <Animated.View style={ctaAnimStyle}>
              <Pressable
                style={styles.ctaBtn}
                onPress={() => {
                  bumpCta();
                  isLastShowcase ? completeOnboarding() : goNext();
                }}
              >
                <Text style={styles.ctaBtnText}>{btnLabel}</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      ) : (
        <Animated.View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 56,
              paddingBottom: insets.bottom + spacing.lg,
            },
            contentStyle,
          ]}
        >
          <View style={styles.contentInner}>{renderContent()}</View>

          <View style={styles.bottomArea}>
            <Animated.View style={ctaAnimStyle}>
              <Pressable
                style={[styles.ctaBtn, isDisabled && styles.ctaBtnDisabled]}
                onPress={() => {
                  bumpCta();
                  goNext();
                }}
                disabled={isDisabled}
              >
                <Text style={styles.ctaBtnText}>{btnLabel}</Text>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A0F",
  },
  content: {
    flex: 1,
  },
  contentInner: {
    flex: 1,
    justifyContent: "center",
  },
  bottomArea: {
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
    marginTop: -2,
  },

  // Welcome
  welcomeContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
  },
  welcomeSpacer: {
    flex: 1,
  },
  welcomeSub: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: spacing.md,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // Questions
  questionContent: {
    paddingHorizontal: spacing.lg,
  },
  stepLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  questionTitle: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: "#fff",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    gap: 10,
  },
  optionPill: {
    backgroundColor: CARD_BG,
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionPillSelected: {
    borderColor: ACCENT,
    borderWidth: 3,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ scale: 1.03 }],
  },
  optionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.md,
    color: "#1A1A2E",
  },
  optionTextSelected: {
    color: "#1A1A2E",
    fontFamily: fonts.bodySemiBold,
  },

  // Comments
  commentContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  commentContentTop: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  commentText: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: "#fff",
    textAlign: "center",
    lineHeight: 36,
  },

  // Features
  showcasePage: {
    width: SCREEN_W,
    flex: 1,
    justifyContent: "center",
  },
  featureView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  featureTitle: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: "#fff",
    lineHeight: 38,
    textAlign: "center",
    marginBottom: spacing.lg,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  phoneFrame: {
    width: SCREEN_W * 0.58,
    aspectRatio: 9 / 19.5,
    backgroundColor: "#000",
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#444",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  phoneScreen: {
    width: "100%",
    height: "100%",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 24,
  },

  // Reviews
  reviewsContent: {
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  reviewsTitle: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  starsRow: {
    fontSize: 24,
    marginBottom: spacing.xl,
  },
  reviewCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginBottom: 12,
    width: "100%",
  },
  reviewText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: "#1A1A2E",
    lineHeight: 22,
    textAlign: "center",
  },
  reviewName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: "#555",
    textAlign: "center",
    marginTop: spacing.sm,
  },

  // Rate
  rateContent: {
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  rateTitle: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: "#fff",
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  starsRowLarge: {
    fontSize: 36,
    letterSpacing: 8,
    marginBottom: spacing.xl,
  },
  rateCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    width: "100%",
  },

  // Progress dots
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  progressDotActive: {
    backgroundColor: "#fff",
    width: 20,
  },
  progressDotDone: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  // CTA
  ctaBtn: {
    backgroundColor: ACCENT,
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: "center",
  },
  ctaBtnDisabled: {
    opacity: 0.4,
  },
  ctaBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: "#fff",
  },
});
