import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  ViewToken,
  ScrollView,
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
  interpolate,
  Extrapolation,
  FadeIn,
  SlideInUp,
} from "react-native-reanimated";
import { storage, StorageKeys } from "@/lib/storage";
import { coverUrl } from "@/lib/content";
import { colors, fonts, fontSize, spacing } from "@/lib/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const ACCENT = "#C49A3C";
const ACCENT_DARK = "#A67C2E";
const CARD_BG = "rgba(255,255,255,0.88)";
const CARD_BORDER = "rgba(255,255,255,0.5)";
const OPTION_SELECTED_BORDER = "#5B8DBE";
const OPTION_SELECTED_TEXT = "#2E6BA4";

const BACKGROUNDS = [
  coverUrl("creation"),
  coverUrl("creation"),
  coverUrl("noahs-ark"),
  coverUrl("noahs-ark"),
  coverUrl("joseph-in-egypt"),
  coverUrl("joseph-in-egypt"),
  coverUrl("crossing-the-red-sea"),
  coverUrl("crossing-the-red-sea"),
  coverUrl("birth-of-jesus"),
];

const Q1_OPTIONS = [
  "None of it",
  "I know some stories",
  "Most of it",
  "Every page!",
];

const Q1_COMMENTS: Record<string, string> = {
  "None of it":
    "Perfect — Bible Tea makes it easy to jump in. No prior knowledge needed, just press play.",
  "I know some stories":
    "Great start! You'll hear those stories in a way that hits completely different.",
  "Most of it":
    "You've got a great foundation. Bible Tea brings fresh perspectives you haven't heard before.",
  "Every page!":
    "Impressive! You'll love how our narrators bring these stories to life with a modern twist.",
};

const Q2_OPTIONS = [
  "Listen to Bible stories",
  "Learn about characters",
  "Build a daily habit",
  "Explore my faith",
  "Just curious",
];

const Q2_COMMENTS: Record<string, string> = {
  "Listen to Bible stories":
    "You're in the right place — short audio stories you can listen to anytime, anywhere.",
  "Learn about characters":
    "We've got deep dives on everyone from Moses to Mary. You'll meet them like never before.",
  "Build a daily habit":
    "One story a day. Track your streak, build consistency, grow your understanding.",
  "Explore my faith":
    "Bible Tea is a judgment-free zone. Explore at your own pace, on your own terms.",
  "Just curious":
    "Curiosity is the best starting point. Let's show you what Bible Tea is all about.",
};

interface FeatureSlide {
  title: string;
  body: string;
}

const FEATURE_SLIDES: FeatureSlide[] = [
  {
    title: "Listen to Bible stories\nlike never before",
    body: "Gen Z narrators bring ancient stories to life with modern language — short audio sessions you can enjoy anywhere.",
  },
  {
    title: "Meet the characters\nbehind the stories",
    body: "Deep dives into biblical figures — their struggles, wins, and why they still matter today.",
  },
  {
    title: "Told in a modern\nand relatable way",
    body: "No stiff language, no judgment. Just real stories that actually hit different.",
  },
];

const REVIEWS = [
  {
    text: "It's like listening to a friend tell you Bible stories over coffee. I'm hooked.",
    name: "Sarah K.",
  },
  {
    text: "Finally, a Bible app that doesn't feel like homework. The narrators are amazing.",
    name: "James T.",
  },
];

type Step =
  | "welcome"
  | "q1"
  | "q1comment"
  | "q2"
  | "q2comment"
  | "features"
  | "reviews";

const STEP_ORDER: Step[] = [
  "welcome",
  "q1",
  "q1comment",
  "q2",
  "q2comment",
  "features",
  "reviews",
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stepIdx, setStepIdx] = useState(0);
  const [q1Answer, setQ1Answer] = useState<string | null>(null);
  const [q2Answer, setQ2Answer] = useState<string | null>(null);
  const [featureIdx, setFeatureIdx] = useState(0);
  const featureListRef = useRef<FlatList>(null);

  const fadeAnim = useSharedValue(1);
  const step = STEP_ORDER[stepIdx];
  const bgUri = BACKGROUNDS[stepIdx] ?? BACKGROUNDS[0];

  function animateTransition(next: () => void) {
    fadeAnim.value = withTiming(0, { duration: 150 }, () => {
      fadeAnim.value = withTiming(1, { duration: 250 });
    });
    setTimeout(next, 160);
  }

  function goNext() {
    animateTransition(() => setStepIdx((i) => Math.min(i + 1, STEP_ORDER.length - 1)));
  }

  function goBack() {
    if (stepIdx > 0) {
      animateTransition(() => setStepIdx((i) => i - 1));
    }
  }

  function completeOnboarding() {
    // DEV: stay on onboarding for polishing — restore router.replace("/paywall") when done
    storage.set(StorageKeys.HAS_ONBOARDED, true);
    setStepIdx(0);
    setQ1Answer(null);
    setQ2Answer(null);
    setFeatureIdx(0);
  }

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [
      {
        translateY: interpolate(
          fadeAnim.value,
          [0, 1],
          [10, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const onFeatureViewChange = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setFeatureIdx(viewableItems[0].index);
      }
    },
    [],
  );

  function renderContent() {
    switch (step) {
      case "welcome":
        return (
          <View style={styles.centeredContent}>
            <Text style={styles.logoEmoji}>☕</Text>
            <Text style={styles.logoTitle}>Bible Tea</Text>
            <Text style={styles.welcomeSub}>
              Spill the tea.{"\n"}Read the Bible.
            </Text>
          </View>
        );

      case "q1":
        return (
          <View style={styles.questionContent}>
            <Text style={styles.stepLabel}>Question 1 of 2</Text>
            <Text style={styles.questionTitle}>
              How much of the Bible{"\n"}have you read?
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
              {Q1_COMMENTS[q1Answer!] ?? Q1_COMMENTS["None of it"]}
            </Text>
          </View>
        );

      case "q2":
        return (
          <View style={styles.questionContent}>
            <Text style={styles.stepLabel}>Question 2 of 2</Text>
            <Text style={styles.questionTitle}>
              What brings you to{"\n"}Bible Tea?
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
          <View style={styles.commentContent}>
            <Text style={styles.commentText}>
              {Q2_COMMENTS[q2Answer!] ?? Q2_COMMENTS["Just curious"]}
            </Text>
          </View>
        );

      case "features":
        return (
          <View style={styles.featuresContent}>
            <FlatList
              ref={featureListRef}
              data={FEATURE_SLIDES}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              onViewableItemsChanged={onFeatureViewChange}
              viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
              renderItem={({ item }) => (
                <View style={styles.featureSlide}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <View style={styles.featureCard}>
                    <Text style={styles.featureBody}>{item.body}</Text>
                  </View>
                </View>
              )}
            />
            <View style={styles.dotsRow}>
              {FEATURE_SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === featureIdx && styles.dotActive]}
                />
              ))}
            </View>
          </View>
        );

      case "reviews":
        return (
          <View style={styles.reviewsContent}>
            <Text style={styles.reviewsTitle}>People love Bible Tea</Text>
            <Text style={styles.starsRow}>⭐⭐⭐⭐⭐</Text>
            {REVIEWS.map((r, i) => (
              <View key={i} style={styles.reviewCard}>
                <Text style={styles.reviewText}>"{r.text}"</Text>
                <Text style={styles.reviewName}>— {r.name}</Text>
              </View>
            ))}
          </View>
        );
    }
  }

  const isDisabled =
    (step === "q1" && !q1Answer) || (step === "q2" && !q2Answer);
  const isLast = step === "reviews";
  const showBack = stepIdx > 0;

  const btnLabel =
    step === "welcome"
      ? "Get Started"
      : step === "features"
        ? "Next"
        : isLast
          ? "Continue"
          : "Continue";

  return (
    <View style={styles.root}>
      <Image
        source={{ uri: bgUri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={500}
      />
      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.25)",
          "rgba(0,0,0,0.6)",
          "rgba(0,0,0,0.8)",
        ]}
        locations={[0, 0.3, 0.6, 1]}
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

      <Animated.View
        style={[
          styles.content,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + spacing.lg },
          contentStyle,
        ]}
      >
        <View style={styles.contentInner}>{renderContent()}</View>

        <View style={styles.bottomArea}>
          <Pressable
            style={[styles.ctaBtn, isDisabled && styles.ctaBtnDisabled]}
            onPress={isLast ? completeOnboarding : goNext}
            disabled={isDisabled}
          >
            <Text style={styles.ctaBtnText}>{btnLabel}</Text>
          </Pressable>
        </View>
      </Animated.View>
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
  centeredContent: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  logoTitle: {
    fontFamily: fonts.heading,
    fontSize: 42,
    color: colors.accent,
    textAlign: "center",
  },
  welcomeSub: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.lg,
    color: "#fff",
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 26,
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
    borderColor: OPTION_SELECTED_BORDER,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  optionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.md,
    color: "#1A1A2E",
  },
  optionTextSelected: {
    color: OPTION_SELECTED_TEXT,
    fontFamily: fonts.bodySemiBold,
  },

  // Comments
  commentContent: {
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
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
  featuresContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: spacing.md,
  },
  featureSlide: {
    width: SCREEN_W,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  featureTitle: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: "#fff",
    lineHeight: 38,
    marginBottom: spacing.lg,
  },
  featureCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  featureBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: "#1A1A2E",
    lineHeight: 24,
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
