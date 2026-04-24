import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [playlist, setPlaylist] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  async function loadPlaylist() {
    try {
      const data = await api.getPlaylist(id);
      setPlaylist(data.playlist);
      setStories(data.stories);
    } catch (err) {
      console.error("Failed to load playlist:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={styles.header}>
            {playlist?.cover_image_url ? (
              <Image
                source={{ uri: playlist.cover_image_url }}
                style={styles.playlistCover}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.playlistCover,
                  { backgroundColor: colors.surfaceLight },
                ]}
              />
            )}
            <Text style={styles.playlistTitle}>{playlist?.name}</Text>
            <Text style={styles.playlistDesc}>{playlist?.description}</Text>
            <Text style={styles.storyCount}>{stories.length} stories</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            style={styles.storyRow}
            onPress={() => router.push(`/story/${item.id}`)}
          >
            <Text style={styles.indexText}>{index + 1}</Text>
            {item.cover_image_url ? (
              <Image
                source={{ uri: item.cover_image_url }}
                style={styles.storyThumb}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.storyThumb,
                  { backgroundColor: colors.surfaceLight },
                ]}
              />
            )}
            <View style={styles.storyInfo}>
              <Text style={styles.storyTitle}>{item.title}</Text>
              <Text style={styles.storyMeta}>
                {item.season_name} • {Math.ceil(item.duration_seconds / 60)} min
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  backBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  playlistCover: {
    width: 200,
    height: 200,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  playlistTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: "center",
  },
  playlistDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  storyCount: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  indexText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    width: 24,
    textAlign: "center",
  },
  storyThumb: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
  },
  storyInfo: {
    flex: 1,
  },
  storyTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  storyMeta: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
