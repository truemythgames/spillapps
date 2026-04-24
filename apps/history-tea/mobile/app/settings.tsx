import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import { usePlayerStore } from "@/stores/player";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const signOut = useAuthStore((s) => s.signOut);
  const { speakers, selectedSpeaker, setSpeaker, isSubscribed, likedStoryIds, streak, progressMap } =
    useAppStore();

  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;
  const startedCount = Object.keys(progressMap).length;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* User info or sign-in prompt */}
      {isAuthenticated && user ? (
        <View style={styles.userRow}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarLetter}>
                {(user.name ?? user.email ?? "?")[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name ?? "Friend"}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      ) : (
        <Pressable style={styles.signInCard} onPress={() => router.push("/login")}>
          <View style={styles.signInIcon}>
            <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.signInTitle}>Sign in to sync</Text>
            <Text style={styles.signInDesc}>
              Save your progress, streaks, and likes across devices
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{streak.current_streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{startedCount}</Text>
          <Text style={styles.statLabel}>Started</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{likedStoryIds.length}</Text>
          <Text style={styles.statLabel}>Liked</Text>
        </View>
      </View>

      {/* Subscription */}
      {!isSubscribed && (
        <Pressable style={styles.subCard} onPress={() => router.push("/paywall")}>
          <Text style={styles.subTitle}>Go Premium</Text>
          <Text style={styles.subDesc}>Unlock all 40+ stories and new ones every week</Text>
        </Pressable>
      )}

      {/* Speaker selection */}
      {speakers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Narrator</Text>
          <View style={styles.speakerList}>
            {speakers.map((speaker: any) => (
              <Pressable
                key={speaker.id}
                style={[
                  styles.speakerCard,
                  selectedSpeaker?.id === speaker.id && styles.speakerCardActive,
                ]}
                onPress={() => setSpeaker(speaker)}
              >
                <Text style={styles.speakerName}>{speaker.name}</Text>
                <Text style={styles.speakerBio}>{speaker.bio}</Text>
                {selectedSpeaker?.id === speaker.id && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedText}>Selected</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Playback speed */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playback Speed</Text>
        <View style={styles.speedRow}>
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => {
            const current = usePlayerStore.getState().playbackSpeed;
            return (
              <Pressable
                key={speed}
                style={[styles.speedBtn, current === speed && styles.speedBtnActive]}
                onPress={() => usePlayerStore.getState().setSpeed(speed)}
              >
                <Text style={[styles.speedText, current === speed && styles.speedTextActive]}>
                  {speed}x
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Sign out */}
      {isAuthenticated && (
        <View style={styles.section}>
          <Pressable style={styles.signOutBtn} onPress={() => signOut()}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontFamily: fonts.bodyBold, fontSize: fontSize.xxl, color: colors.background },
  userInfo: { flex: 1 },
  userName: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.text },
  userEmail: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  signInCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.primary + "15",
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + "40",
  },
  signInIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  signInTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.primary },
  signInDesc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  statNumber: { fontFamily: fonts.bodyBold, fontSize: fontSize.xl, color: colors.text },
  statLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  subCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  subTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.primary },
  subDesc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },

  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionTitle: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.text, marginBottom: spacing.md },

  speakerList: { gap: spacing.sm },
  speakerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  speakerCardActive: { borderColor: colors.primary },
  speakerName: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.text },
  speakerBio: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  selectedBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.sm,
  },
  selectedText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, color: colors.background },

  speedRow: { flexDirection: "row", gap: spacing.sm },
  speedBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  speedBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  speedText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.textSecondary },
  speedTextActive: { color: colors.background },

  signOutBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error + "40",
  },
  signOutText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.error },
});
