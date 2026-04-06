import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/stores/app";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export default function CollectionScreen() {
  const { type, id } = useLocalSearchParams<{ type: string; id?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { playlists, recentStories } = useAppStore();

  let title = "";
  let stories: { id: string; title: string; description: string; cover_image_url: string | null }[] = [];

  if (type === "playlist" && id) {
    const pl = playlists.find((p) => p.id === id);
    title = pl?.name ?? "Playlist";
    stories = pl?.stories ?? [];
  } else if (type === "recent") {
    title = "Recently Added";
    stories = recentStories;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.count}>{stories.length} {stories.length === 1 ? "story" : "stories"}</Text>
        {stories.map((story) => (
          <Pressable
            key={story.id}
            style={styles.row}
            onPress={() => router.push(`/story/${story.id}` as any)}
          >
            <Image source={{ uri: story.cover_image_url }} style={styles.thumb} contentFit="cover" />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>{story.title}</Text>
              <Text style={styles.sub} numberOfLines={2}>{story.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
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
    paddingBottom: spacing.xs,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.text },

  count: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.sm },
  info: { flex: 1 },
  title: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
