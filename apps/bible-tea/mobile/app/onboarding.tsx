import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  ViewToken,
  Image as RNImage,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { storage, StorageKeys } from "@/lib/storage";
import { fonts, fontSize, spacing } from "@/lib/theme";
import { requestATT } from "@/lib/analytics";
import { markReviewAfterOnboarding } from "@/lib/review";
import { getVerseOfTheDay } from "@/lib/daily-verses";
const { width: SCREEN_W } = Dimensions.get("window");

const INK = "#0F0D0B";
const CREAM = "#E8D6B8";
const CREAM_DIM = "rgba(232,214,184,0.62)";
const GOLD = "#D4A94A";
const GOLD_DARK = "#A67C2E";
const GLASS = "rgba(18,16,12,0.58)";
const GLASS_BORDER = "rgba(232,214,184,0.22)";
const WHITE_CARD = "rgba(255,255,255,0.9)";

const LOCAL_COVERS = {
  creation: require("@/assets/onboarding/creation.webp"),
  "noahs-ark": require("@/assets/onboarding/noahs-ark.webp"),
  "joseph-in-egypt": require("@/assets/onboarding/joseph-in-egypt.webp"),
  "david-and-goliath": require("@/assets/onboarding/david-and-goliath.webp"),
  "daniel-and-the-lions-den": require("@/assets/onboarding/daniel-and-the-lions-den.webp"),
  "samson-and-delilah": require("@/assets/onboarding/samson-and-delilah.webp"),
  "feeding-5000": require("@/assets/onboarding/feeding-5000.webp"),
  "the-crucifixion": require("@/assets/onboarding/the-crucifixion.webp"),
  "birth-of-jesus": require("@/assets/onboarding/birth-of-jesus.webp"),
  moses: require("@/assets/onboarding/moses.webp"),
  "crossing-the-red-sea": require("@/assets/onboarding/crossing-the-red-sea.webp"),
} as const;

const HERO_IMAGE = require("@/assets/onboarding/teastories.webp");

const SCREENSHOTS = {
  home: require("@/assets/onboarding/screenshot-home.webp"),
  discover: require("@/assets/onboarding/screenshot-discover.webp"),
  chat: require("@/assets/onboarding/screenshot-chat.webp"),
} as const;

const SCREENSHOTS_ES = {
  home: require("@/assets/onboarding/screenshot-home-es.png"),
  discover: require("@/assets/onboarding/screenshot-discover-es.png"),
  chat: require("@/assets/onboarding/screenshot-chat-es.png"),
} as const;

type Step =
  | "welcome"
  | "q1"
  | "q1comment"
  | "q2"
  | "q2comment"
  | "q3"
  | "q4"
  | "brewing"
  | "plan"
  | "feature1"
  | "feature2"
  | "feature3"
  | "reviews";

const STEP_ORDER: Step[] = [
  "welcome",
  "q1",
  "q1comment",
  "q2",
  "q2comment",
  "q3",
  "q4",
  "feature1",
  "reviews",
  "feature2",
  "feature3",
  "brewing",
  "plan",
];

const BACKGROUNDS: Record<Step, number> = {
  welcome: HERO_IMAGE,
  q1: LOCAL_COVERS["crossing-the-red-sea"],
  q1comment: LOCAL_COVERS["noahs-ark"],
  q2: LOCAL_COVERS["noahs-ark"],
  q2comment: LOCAL_COVERS["joseph-in-egypt"],
  q3: LOCAL_COVERS["birth-of-jesus"],
  q4: LOCAL_COVERS["moses"],
  brewing: LOCAL_COVERS["feeding-5000"],
  plan: LOCAL_COVERS["david-and-goliath"],
  feature1: LOCAL_COVERS["david-and-goliath"],
  reviews: LOCAL_COVERS["daniel-and-the-lions-den"],
  feature2: LOCAL_COVERS["samson-and-delilah"],
  feature3: LOCAL_COVERS["the-crucifixion"],
};

const SHOWCASE_STEPS: Step[] = ["feature1", "reviews", "feature2", "feature3"];
const SHOWCASE_START_IDX = STEP_ORDER.indexOf("feature1");
const BREWING_IDX = STEP_ORDER.indexOf("brewing");
const PLAN_IDX = STEP_ORDER.indexOf("plan");
// Progress covers the questions only
const PROGRESS_STEPS = STEP_ORDER.slice(1, SHOWCASE_START_IDX);

/* ---------- pieces ---------- */

type Fit = "cover" | "contain";

/**
 * Backdrop that cross-dissolves between covers while one slow zoom keeps
 * running underneath — the zoom never resets, so a change reads as a
 * dissolve, not a cut.
 */
const BACKDROP_FADE_MS = 1100;

/** Bundled PNG-style decode — on screen from the first frame, no expo-image fade. */
function WelcomeHero() {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.06, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);
  const zoom = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, zoom]}>
      <RNImage
        source={HERO_IMAGE}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        fadeDuration={0}
      />
    </Animated.View>
  );
}

function Backdrop({ source }: { source: number }) {
  const scale = useSharedValue(1);
  const [layers, setLayers] = useState<{ key: number; source: number }[]>([
    { key: 0, source },
  ]);
  const keyRef = useRef(0);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.08, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  useEffect(() => {
    const top = layers[layers.length - 1];
    if (top.source === source) return;
    keyRef.current += 1;
    const next = { key: keyRef.current, source };
    setLayers((l) => [...l.slice(-1), next]);
    const id = setTimeout(() => setLayers((l) => l.slice(-1)), BACKDROP_FADE_MS + 100);
    return () => clearTimeout(id);
  }, [source]);

  const zoom = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, zoom]}>
      {layers.map((l) => (
        <Animated.View
          key={l.key}
          entering={FadeIn.duration(BACKDROP_FADE_MS).easing(Easing.inOut(Easing.quad))}
          exiting={FadeOut.duration(BACKDROP_FADE_MS).easing(Easing.inOut(Easing.quad))}
          style={StyleSheet.absoluteFill}
        >
          <Image
            source={l.source}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={0}
            priority="high"
          />
        </Animated.View>
      ))}
    </Animated.View>
  );
}

function ProgressBar({ index, total }: { index: number; total: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming((index + 1) / total, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [index, total]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, fill]} />
    </View>
  );
}

function Option({
  label,
  icon,
  selected,
  onPress,
  delay,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  delay: number;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(420)}>
      <Animated.View style={style}>
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            scale.value = withSequence(
              withTiming(0.97, { duration: 80 }),
              withSpring(1, { damping: 9, stiffness: 260 }),
            );
            onPress();
          }}
          style={[styles.option, selected && styles.optionSelected]}
        >
          {icon ? (
            <Ionicons
              name={icon}
              size={20}
              color={selected ? INK : CREAM}
              style={{ marginRight: spacing.sm }}
            />
          ) : null}
          <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
          <View style={[styles.optionDot, selected && styles.optionDotOn]}>
            {selected && <Ionicons name="checkmark" size={14} color={INK} />}
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function Question({
  label,
  title,
  options,
  answer,
  onSelect,
}: {
  label: string;
  title: string;
  options: { label: string; icon?: keyof typeof Ionicons.glyphMap }[];
  answer: string | null;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={styles.block}>
      <Animated.Text entering={FadeIn.duration(400)} style={styles.kicker}>
        {label}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(60).duration(480)} style={styles.title}>
        {title}
      </Animated.Text>
      <View style={{ gap: 10, marginTop: spacing.xl }}>
        {options.map((o, i) => (
          <Option
            key={o.label}
            label={o.label}
            icon={o.icon}
            selected={answer === o.label}
            onPress={() => onSelect(o.label)}
            delay={160 + i * 60}
          />
        ))}
      </View>
    </View>
  );
}

function Comment({ text }: { text: string }) {
  return (
    <View style={[styles.block, { alignItems: "center" }]}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.rule} />
      <Animated.Text entering={FadeInDown.delay(120).duration(560)} style={styles.comment}>
        {text}
      </Animated.Text>
    </View>
  );
}

function Brewing({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const items = [t("onboarding.brewItem1"), t("onboarding.brewItem2"), t("onboarding.brewItem3")];
  const [done, setDone] = useState(0);
  const bar = useSharedValue(0);

  useEffect(() => {
    bar.value = withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.cubic) });
    const ts = [
      setTimeout(() => {
        setDone(1);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 900),
      setTimeout(() => {
        setDone(2);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 2000),
      setTimeout(() => {
        setDone(3);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 3100),
      setTimeout(onDone, 3900),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const fill = useAnimatedStyle(() => ({ width: `${bar.value * 100}%` }));

  return (
    <View style={styles.block}>
      <Animated.Text entering={FadeInDown.duration(500)} style={styles.title}>
        {t("onboarding.brewTitle")}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={styles.sub}>
        {t("onboarding.brewSub")}
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.glass}>
        {items.map((label, i) => {
          const isDone = i < done;
          const isActive = i === done;
          return (
            <View
              key={label}
              style={[styles.brewRow, i < items.length - 1 && styles.brewRowLine]}
            >
              <View style={[styles.brewDot, isDone && styles.brewDotDone]}>
                {isDone ? (
                  <Animated.View entering={ZoomIn.springify().damping(11)}>
                    <Ionicons name="checkmark" size={14} color={INK} />
                  </Animated.View>
                ) : isActive ? (
                  <Pulse />
                ) : null}
              </View>
              <Text style={[styles.brewText, (isDone || isActive) && styles.brewTextOn]}>
                {label}
              </Text>
            </View>
          );
        })}
        <View style={styles.brewTrack}>
          <Animated.View style={[styles.brewFill, fill]} />
        </View>
      </Animated.View>
    </View>
  );
}

function Pulse() {
  const o = useSharedValue(0.3);
  useEffect(() => {
    o.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, []);
  const s = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.pulse, s]} />;
}

function Plan({
  level,
  focus,
  time,
  stories,
}: {
  level: string;
  focus: string;
  time: string;
  stories: string;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "es" ? "es" : "en";
  const verse = useMemo(() => getVerseOfTheDay(new Date(), lang), [lang]);

  const rows = [
    { k: t("onboarding.planLevel"), v: level, icon: "book-outline" as const },
    { k: t("onboarding.planFocus"), v: focus, icon: "compass-outline" as const },
    { k: t("onboarding.planTime"), v: time, icon: "time-outline" as const },
    { k: t("onboarding.planStories"), v: stories, icon: "library-outline" as const },
  ];

  return (
    <View style={styles.block}>
      <Animated.Text entering={FadeIn.duration(400)} style={styles.kicker}>
        {t("onboarding.planLabel")}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(60).duration(480)} style={styles.title}>
        {t("onboarding.planTitle")}
      </Animated.Text>

      <Animated.View entering={FadeInUp.delay(180).duration(520)} style={styles.planWrap}>
        <LinearGradient
          colors={["#12110F", "#2A221C", "#5A4634"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.planCard}
        >
          {rows.map((r, i) => (
            <Animated.View
              key={r.k}
              entering={FadeInDown.delay(260 + i * 80).duration(400)}
              style={[styles.planRow, i < rows.length - 1 && styles.planRowLine]}
            >
              <Ionicons name={r.icon} size={18} color={GOLD} />
              <View style={{ flex: 1 }}>
                <Text style={styles.planK}>{r.k}</Text>
                <Text style={styles.planV}>{r.v}</Text>
              </View>
            </Animated.View>
          ))}

          <Animated.View entering={FadeInDown.delay(540).duration(420)} style={styles.planVerse}>
            <Text style={styles.planK}>{t("onboarding.planVerse")}</Text>
            <Text style={styles.planVerseText} numberOfLines={3}>
              “{verse.text}”
            </Text>
            <Text style={styles.planVerseRef}>{verse.ref}</Text>
          </Animated.View>
        </LinearGradient>

        <Animated.Text entering={FadeIn.delay(640).duration(400)} style={styles.planDaily}>
          {t("onboarding.planDaily")}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

/* ---------- screen ---------- */

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();

  const Q1 = [1, 2, 3, 4].map((n) => t(`onboarding.q1Opt${n}`));
  const Q1_COMMENTS: Record<string, string> = Object.fromEntries(
    [1, 2, 3, 4].map((n) => [t(`onboarding.q1Opt${n}`), t(`onboarding.q1Comment${n}`)]),
  );
  const Q2 = [1, 2, 3, 4, 5].map((n) => t(`onboarding.q2Opt${n}`));
  const Q2_COMMENTS: Record<string, string> = Object.fromEntries(
    [1, 2, 3, 4, 5].map((n) => [t(`onboarding.q2Opt${n}`), t(`onboarding.q2Comment${n}`)]),
  );
  const Q3: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: t("onboarding.q3Opt1"), icon: "sunny-outline" },
    { label: t("onboarding.q3Opt2"), icon: "car-outline" },
    { label: t("onboarding.q3Opt3"), icon: "moon-outline" },
  ];
  const Q4: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: t("onboarding.q4Opt1"), icon: "shield-outline" },
    { label: t("onboarding.q4Opt2"), icon: "sunny-outline" },
    { label: t("onboarding.q4Opt3"), icon: "flame-outline" },
    { label: t("onboarding.q4Opt4"), icon: "flower-outline" },
    { label: t("onboarding.q4Opt5"), icon: "sparkles-outline" },
  ];

  const shots = i18n.language === "es" ? SCREENSHOTS_ES : SCREENSHOTS;
  const FEATURES = [
    { title: t("onboarding.feature1"), image: shots.home },
    { title: t("onboarding.feature2"), image: shots.discover },
    { title: t("onboarding.feature3"), image: shots.chat },
  ];
  const REVIEWS = [
    { text: t("onboarding.review1"), name: t("onboarding.review1Name") },
    { text: t("onboarding.review2"), name: t("onboarding.review2Name") },
  ];

  const [stepIdx, setStepIdx] = useState(0);
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [q4, setQ4] = useState<string | null>(null);
  const [showcaseIdx, setShowcaseIdx] = useState(0);
  const showcaseRef = useRef<FlatList>(null);

  const ctaScale = useSharedValue(1);

  const step = STEP_ORDER[stepIdx];
  const inShowcase = stepIdx >= SHOWCASE_START_IDX && stepIdx < BREWING_IDX;
  const currentStep: Step = inShowcase ? SHOWCASE_STEPS[showcaseIdx] : step;
  const bg = BACKGROUNDS[currentStep];
  const progressIdx = PROGRESS_STEPS.indexOf(step);

  // Step content cross-dissolves via keyed entering/exiting below; nothing to wait for.
  function transition(next: () => void) {
    next();
  }

  function bumpCta() {
    ctaScale.value = withSequence(
      withTiming(0.95, { duration: 80 }),
      withSpring(1, { damping: 9, stiffness: 260 }),
    );
  }

  async function goNext() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === "welcome") await requestATT();
    if (inShowcase) {
      if (showcaseIdx < SHOWCASE_STEPS.length - 1) {
        showcaseRef.current?.scrollToIndex({ index: showcaseIdx + 1, animated: true });
      } else {
        transition(() => setStepIdx(BREWING_IDX));
      }
      return;
    }
    if (step === "plan") {
      completeOnboarding();
      return;
    }
    if (stepIdx === SHOWCASE_START_IDX - 1) {
      transition(() => setStepIdx(SHOWCASE_START_IDX));
    } else {
      transition(() => setStepIdx((i) => Math.min(i + 1, STEP_ORDER.length - 1)));
    }
  }

  function goBack() {
    if (step === "plan") return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    if (inShowcase && showcaseIdx > 0) {
      showcaseRef.current?.scrollToIndex({ index: showcaseIdx - 1, animated: true });
    } else if (inShowcase) {
      transition(() => {
        setStepIdx(SHOWCASE_START_IDX - 1);
        setShowcaseIdx(0);
      });
    } else if (stepIdx > 0) {
      transition(() => setStepIdx((i) => i - 1));
    }
  }

  function completeOnboarding() {
    storage.set(StorageKeys.HAS_ONBOARDED, true);
    markReviewAfterOnboarding();
    router.replace("/paywall");
  }

  const brewDone = useCallback(() => {
    transition(() => setStepIdx(PLAN_IDX));
  }, []);

  // Comment screens read themselves out, then move on — no button.
  const isComment = step === "q1comment" || step === "q2comment";
  useEffect(() => {
    if (!isComment) return;
    const id = setTimeout(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      transition(() => setStepIdx((i) => Math.min(i + 1, STEP_ORDER.length - 1)));
    }, 2000);
    return () => clearTimeout(id);
  }, [step]);

  const onShowcaseViewChange = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setShowcaseIdx(viewableItems[0].index);
    }
  }, []);

  const ctaStyle = useAnimatedStyle(() => ({ transform: [{ scale: ctaScale.value }] }));

  const swipe = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .onEnd((e) => {
      if (step === "brewing" || step === "q1comment" || step === "q2comment") return;
      if (e.translationX < -50) runOnJS(goNext)();
      else if (e.translationX > 50 && step !== "plan") runOnJS(goBack)();
    });

  function renderShowcase(pageStep: Step) {
    if (pageStep === "reviews") {
      return (
        <View style={[styles.block, { alignItems: "center" }]}>
          <Animated.Text entering={FadeInDown.duration(420)} style={styles.title}>
            {t("onboarding.reviewsTitle")}
          </Animated.Text>
          <Animated.Text entering={FadeIn.delay(80)} style={styles.stars}>
            ⭐⭐⭐⭐⭐
          </Animated.Text>
          {REVIEWS.map((r, i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(140 + i * 90).duration(420)}
              style={styles.reviewCard}
            >
              <Text style={styles.reviewText}>"{r.text}"</Text>
              <Text style={styles.reviewName}>— {r.name}</Text>
            </Animated.View>
          ))}
        </View>
      );
    }
    const idx = pageStep === "feature1" ? 0 : pageStep === "feature2" ? 1 : 2;
    const f = FEATURES[idx];
    return (
      <View style={[styles.block, { alignItems: "center" }]}>
        <Animated.Text entering={FadeInDown.duration(450)} style={[styles.title, { marginBottom: spacing.lg }]}>
          {f.title}
        </Animated.Text>
        <Animated.View entering={FadeInUp.delay(80).duration(520)} style={styles.phone}>
          <Image source={f.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        </Animated.View>
      </View>
    );
  }

  function renderStep() {
    switch (step) {
      case "welcome":
        return (
          <View style={styles.welcome}>
            <Animated.Text entering={FadeInUp.duration(800)} style={styles.welcomeText}>
              {t("onboarding.welcome")}
            </Animated.Text>
          </View>
        );
      case "q1":
        return (
          <Question
            label={t("onboarding.q1Label")}
            title={t("onboarding.q1Title")}
            options={Q1.map((label) => ({ label }))}
            answer={q1}
            onSelect={setQ1}
          />
        );
      case "q1comment":
        return <Comment text={Q1_COMMENTS[q1 ?? ""] ?? t("onboarding.q1Comment1")} />;
      case "q2":
        return (
          <Question
            label={t("onboarding.q2Label")}
            title={t("onboarding.q2Title")}
            options={Q2.map((label) => ({ label }))}
            answer={q2}
            onSelect={setQ2}
          />
        );
      case "q2comment":
        return <Comment text={Q2_COMMENTS[q2 ?? ""] ?? t("onboarding.q2Comment5")} />;
      case "q3":
        return (
          <Question
            label={t("onboarding.q3Label")}
            title={t("onboarding.q3Title")}
            options={Q3}
            answer={q3}
            onSelect={setQ3}
          />
        );
      case "q4":
        return (
          <Question
            label={t("onboarding.q4Label")}
            title={t("onboarding.q4Title")}
            options={Q4}
            answer={q4}
            onSelect={setQ4}
          />
        );
      case "brewing":
        return <Brewing key="brew" onDone={brewDone} />;
      case "plan":
        return (
          <Plan
            level={q1 ?? Q1[0]}
            focus={q2 ?? Q2[0]}
            time={q3 ?? Q3[0].label}
            stories={q4 ?? Q4[0].label}
          />
        );
      default:
        return null;
    }
  }

  const disabled =
    (step === "q1" && !q1) ||
    (step === "q2" && !q2) ||
    (step === "q3" && !q3) ||
    (step === "q4" && !q4);
  const hideCta = step === "brewing" || isComment;
  const showBack =
    inShowcase || (stepIdx > 0 && step !== "brewing" && step !== "plan");
  const cta =
    step === "welcome"
      ? t("onboarding.getStarted")
      : step === "plan"
        ? t("onboarding.continue")
        : t("onboarding.next");

  const overlay: readonly [string, string, string, string] =
    currentStep === "welcome"
      ? ["transparent", "transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.9)"]
      : currentStep === "brewing" || currentStep === "plan"
        ? ["rgba(10,8,6,0.55)", "rgba(10,8,6,0.7)", "rgba(10,8,6,0.86)", "rgba(10,8,6,0.95)"]
        : ["rgba(10,8,6,0.1)", "rgba(10,8,6,0.35)", "rgba(10,8,6,0.72)", "rgba(10,8,6,0.9)"];

  return (
    <View style={styles.root}>
      <WelcomeHero />
      {currentStep !== "welcome" && <Backdrop source={bg} />}
      <LinearGradient
        colors={overlay}
        locations={currentStep === "welcome" ? [0, 0.5, 0.75, 1] : [0, 0.3, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      {progressIdx >= 0 && (
        <View style={[styles.progressWrap, { top: insets.top + 14 }]}>
          <ProgressBar index={progressIdx} total={PROGRESS_STEPS.length} />
        </View>
      )}

      {showBack && (
        <Pressable style={[styles.back, { top: insets.top + 34 }]} onPress={goBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={CREAM} />
        </Pressable>
      )}

      {inShowcase ? (
        <View style={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.inner}>
            <FlatList
              ref={showcaseRef}
              data={SHOWCASE_STEPS}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(s) => s}
              onViewableItemsChanged={onShowcaseViewChange}
              viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
              renderItem={({ item }) => <View style={styles.page}>{renderShowcase(item)}</View>}
            />
          </View>
          <View style={styles.bottom}>
            <View style={styles.dots}>
              {SHOWCASE_STEPS.map((s, i) => (
                <View
                  key={s}
                  style={[styles.dot, i === showcaseIdx && styles.dotOn, i < showcaseIdx && styles.dotDone]}
                />
              ))}
            </View>
            <Animated.View style={ctaStyle}>
              <Cta
                label={cta}
                onPress={() => {
                  bumpCta();
                  goNext();
                }}
              />
            </Animated.View>
          </View>
        </View>
      ) : (
        <GestureDetector gesture={swipe}>
          <Animated.View
            style={[
              styles.content,
              { paddingTop: insets.top + 72, paddingBottom: insets.bottom + spacing.lg },
            ]}
          >
            <View style={styles.inner}>
              <Animated.View
                key={step}
                entering={FadeIn.duration(520).delay(120).easing(Easing.out(Easing.cubic))}
                exiting={FadeOut.duration(320).easing(Easing.in(Easing.cubic))}
                style={styles.stepLayer}
              >
                {renderStep()}
              </Animated.View>
            </View>
            <View style={styles.bottom}>
              {!hideCta && (
                <Animated.View style={ctaStyle}>
                  <Cta
                    label={cta}
                    disabled={disabled}
                    onPress={() => {
                      bumpCta();
                      goNext();
                    }}
                  />
                </Animated.View>
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
}

function Cta({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [{ opacity: disabled ? 0.35 : pressed ? 0.9 : 1 }]}>
      <LinearGradient
        colors={[GOLD, GOLD_DARK]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cta}
      >
        <Text style={styles.ctaText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  content: { flex: 1 },
  inner: { flex: 1, justifyContent: "center" },
  stepLayer: { flex: 1, justifyContent: "center" },
  bottom: { paddingHorizontal: spacing.lg, minHeight: 60 },
  block: { paddingHorizontal: spacing.lg },
  page: { width: SCREEN_W, flex: 1, justifyContent: "center" },

  progressWrap: { position: "absolute", left: spacing.lg, right: spacing.lg, zIndex: 20 },
  progressTrack: { height: 3, borderRadius: 2, backgroundColor: "rgba(232,214,184,0.18)", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: GOLD, borderRadius: 2 },

  back: {
    position: "absolute",
    left: 14,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(18,16,12,0.5)",
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    justifyContent: "center",
    alignItems: "center",
  },

  welcome: { flex: 1, justifyContent: "flex-end", paddingHorizontal: spacing.lg },
  welcomeText: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: "#fff",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: spacing.md,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  kicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: CREAM_DIM,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.md,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: "#fff",
    textAlign: "center",
    lineHeight: 42,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: CREAM_DIM,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  rule: { width: 44, height: 2, backgroundColor: GOLD, marginBottom: spacing.lg },
  comment: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: "#fff",
    textAlign: "center",
    lineHeight: 37,
    paddingHorizontal: spacing.sm,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  optionSelected: { backgroundColor: CREAM, borderColor: CREAM },
  optionText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: "#fff" },
  optionTextSelected: { color: INK, fontFamily: fonts.bodySemiBold },
  optionDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "rgba(232,214,184,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionDotOn: { borderColor: INK, backgroundColor: "transparent" },

  glass: {
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  brewRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: 16 },
  brewRowLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(232,214,184,0.16)" },
  brewDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(232,214,184,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  brewDotDone: { backgroundColor: CREAM, borderColor: CREAM },
  pulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD },
  brewText: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.md, color: "rgba(255,255,255,0.5)" },
  brewTextOn: { color: "#fff", fontFamily: fonts.bodyMedium },
  brewTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(232,214,184,0.14)",
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  brewFill: { height: "100%", backgroundColor: GOLD },

  planWrap: { marginTop: spacing.xl },
  planCard: {
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(232,214,184,0.18)",
  },
  planRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: 13 },
  planRowLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(232,214,184,0.16)" },
  planK: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: CREAM_DIM, letterSpacing: 1.4, textTransform: "uppercase" },
  planV: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: "#fff", marginTop: 2 },
  planVerse: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(232,214,184,0.16)",
  },
  planVerseText: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: "#fff", lineHeight: 25, marginTop: 6 },
  planVerseRef: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: CREAM, marginTop: 6 },
  planDaily: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: CREAM_DIM,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 20,
  },

  phone: {
    width: SCREEN_W * 0.56,
    aspectRatio: 9 / 19.5,
    backgroundColor: "#000",
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(232,214,184,0.35)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 16,
  },
  stars: { fontSize: 22, marginTop: spacing.sm, marginBottom: spacing.lg },
  reviewCard: {
    backgroundColor: WHITE_CARD,
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    width: "100%",
  },
  reviewText: { fontFamily: fonts.body, fontSize: fontSize.md, color: "#1A1A2E", lineHeight: 22, textAlign: "center" },
  reviewName: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: "#555", textAlign: "center", marginTop: spacing.sm },

  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: spacing.md },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(232,214,184,0.25)" },
  dotOn: { backgroundColor: GOLD, width: 20 },
  dotDone: { backgroundColor: "rgba(232,214,184,0.55)" },

  cta: { borderRadius: 50, paddingVertical: 17, alignItems: "center" },
  ctaText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: INK },
});
