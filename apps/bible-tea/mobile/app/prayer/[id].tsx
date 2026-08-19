import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { usePlayerStore } from "@/stores/player";
import { useAppStore } from "@/stores/app";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";
import { api } from "@/lib/api";
import { isSamePrayerPlayer, prayerAliasIds, prayerPlayerId } from "@/lib/storage";

interface Speaker {
  key: string;
  name: string;
  audioUrl: string;
  durationSeconds?: number;
}

export default function PrayerScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { currentStory, currentSpeaker, isPlaying, play, pause, resume } = usePlayerStore();
  const selectedSpeaker = useAppStore((s) => s.selectedSpeaker);

  const [prayer, setPrayer] = useState<any>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);
  const [relatedStories, setRelatedStories] = useState<any[]>([]);
  const [relatedCharacters, setRelatedCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getPrayer(id).then((data) => {
      if (cancelled) return;
      setPrayer(data.prayer);
      setRelatedStories(data.related_stories ?? []);
      setRelatedCharacters(data.related_characters ?? []);

      if (data.audio_versions?.length) {
        const mapped: Speaker[] = data.audio_versions.map((a: any) => ({
          key: a.speaker_id,
          name: a.speaker_name,
          audioUrl: a.audio_url,
          durationSeconds: Number(a.duration_seconds) || 0,
        }));
        setSpeakers(mapped);

        const preferred = selectedSpeaker?.id
          ? mapped.find((s) => s.key === selectedSpeaker.id)
          : null;
        setActiveSpeaker(preferred ?? mapped[0]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    return () => { cancelled = true; };
  }, [id]);

  const isThisLoaded = isSamePrayerPlayer(currentStory?.id, prayer, id);
  const isThisPraying = isThisLoaded && isPlaying;

  const handlePlay = () => {
    if (!activeSpeaker) return;

    const sameSpeaker = currentSpeaker?.id === activeSpeaker.key;
    if (isThisLoaded && sameSpeaker) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
      return;
    }

    const prayerStory = {
      id: prayerPlayerId(prayer, id),
      title: prayer?.title ?? "Prayer",
      description: prayer?.category_name ?? "",
      cover_image_url: null,
      duration_seconds:
        activeSpeaker.durationSeconds || prayer?.duration_seconds || 0,
      progressAliases: prayerAliasIds(prayer, id),
    };
    const speaker = { id: activeSpeaker.key, name: activeSpeaker.name };
    play(prayerStory, speaker, activeSpeaker.audioUrl);
    router.push("/player");
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!prayer) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20, alignItems: "center", justifyContent: "center" }]}>
        <Text style={styles.errorText}>Prayer not found</Text>
      </View>
    );
  }

  const transcriptBody = (prayer.transcript ?? "").replace(/^#[^\n]*\n\n?/, "").trim();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {prayer.category_name}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.prayerTitle}>{prayer.title}</Text>

        {/* Speaker selector */}
        {speakers.length > 1 && (
          <View style={styles.speakerRow}>
            {speakers.map((sp) => (
              <Pressable
                key={sp.key}
                style={[
                  styles.speakerChip,
                  activeSpeaker?.key === sp.key && styles.speakerChipActive,
                ]}
                onPress={() => {
                  setActiveSpeaker(sp);
                  if (isThisLoaded) {
                    play(
                      {
                        id: prayerPlayerId(prayer, id),
                        title: prayer?.title ?? "Prayer",
                        description: prayer?.category_name ?? "",
                        cover_image_url: null,
                        duration_seconds: sp.durationSeconds || prayer?.duration_seconds || 0,
                        progressAliases: prayerAliasIds(prayer, id),
                      },
                      { id: sp.key, name: sp.name },
                      sp.audioUrl
                    );
                  }
                }}
              >
                <Text
                  style={[
                    styles.speakerChipText,
                    activeSpeaker?.key === sp.key && styles.speakerChipTextActive,
                  ]}
                >
                  {sp.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Play button */}
        <Pressable style={styles.playButton} onPress={handlePlay}>
          <Ionicons
            name={isThisPraying ? "pause" : "play"}
            size={22}
            color={colors.background}
          />
          <Text style={styles.playButtonText}>
            {isThisPraying ? "Pause" : "Listen"}
          </Text>
        </Pressable>

        {/* Full prayer text */}
        {transcriptBody.length > 0 && (
          <View style={styles.transcriptSection}>
            <Text style={styles.transcriptText}>{transcriptBody}</Text>
          </View>
        )}

        {/* Related stories */}
        {relatedStories.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>{t("prayers.relatedStories")}</Text>
            {relatedStories.map((story: any) => (
              <Pressable
                key={story.id}
                style={styles.relatedItem}
                onPress={() => router.push(`/story/${story.slug ?? story.id}` as any)}
              >
                <Ionicons name="book-outline" size={18} color={colors.primary} />
                <Text style={styles.relatedItemText}>{story.title}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Related characters */}
        {relatedCharacters.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>{t("prayers.relatedCharacters")}</Text>
            {relatedCharacters.map((ch: any) => (
              <Pressable
                key={ch.id}
                style={styles.relatedItem}
                onPress={() => router.push(`/character/${encodeURIComponent(ch.slug ?? ch.id ?? ch.name)}` as any)}
              >
                <Ionicons name="person-outline" size={18} color={colors.accent} />
                <Text style={styles.relatedItemText}>{ch.name}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    flex: 1,
    textAlign: "center",
  },
  prayerTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  speakerRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  speakerChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  speakerChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  speakerChipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  speakerChipTextActive: {
    color: colors.background,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    marginBottom: spacing.xl,
  },
  playButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.background,
  },
  transcriptSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  transcriptText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 26,
  },
  relatedSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  relatedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  relatedItemText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
