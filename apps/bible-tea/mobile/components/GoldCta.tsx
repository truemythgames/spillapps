import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { fonts, fontSize } from "@/lib/theme";

export const GOLD = "#E8C35A";
export const GOLD_LIGHT = "#F6E08A";
export const GOLD_DARK = "#D4A94A";
export const CTA_INK = "#1A1408";

type Props = {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The one gold button: gradient, bevel, breathing glow, periodic light sweep,
 * spring press and a medium haptic. Used on every sales surface.
 */
export function GoldCta({ label, onPress, busy, disabled, style }: Props) {
  const [w, setW] = useState(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.35);
  const sweep = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(0.75, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    sweep.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(1600, withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) })),
      ),
      -1,
      false,
    );
  }, []);

  const wrap = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));
  const shine = useAnimatedStyle(() => ({
    transform: [{ translateX: -w * 0.6 + sweep.value * (w * 1.6) }, { skewX: "-20deg" }],
  }));

  const inactive = busy || disabled;

  return (
    <Animated.View style={[styles.glow, wrap, style]}>
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        onPressIn={() => {
          scale.value = withSpring(0.965, { damping: 14, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 10, stiffness: 260 });
        }}
        disabled={inactive}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        style={[styles.cta, inactive && styles.disabled]}
      >
        <LinearGradient
          colors={[GOLD_LIGHT, GOLD, GOLD_DARK]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bevel} pointerEvents="none" />
        {w > 0 && !inactive && (
          <Animated.View style={[styles.shine, { width: w * 0.35 }, shine]} pointerEvents="none">
            <LinearGradient
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
        {busy ? (
          <ActivityIndicator color={CTA_INK} />
        ) : (
          <View style={styles.row}>
            <Text style={styles.text} numberOfLines={1}>
              {label}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={CTA_INK} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    borderRadius: 18,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 10,
  },
  cta: {
    borderRadius: 18,
    minHeight: 58,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  bevel: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
    borderBottomColor: "rgba(0,0,0,0.18)",
  },
  shine: { position: "absolute", top: -10, bottom: -10, left: 0 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  disabled: { opacity: 0.75 },
  text: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: CTA_INK,
    letterSpacing: 0.3,
  },
});
