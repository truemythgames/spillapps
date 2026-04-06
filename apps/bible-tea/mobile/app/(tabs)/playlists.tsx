import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, TextInput } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/stores/app";
import { coverUrl } from "@/lib/content";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { playlists, stories, characters, recentStories } = useAppStore();
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? stories.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase()),
      )
    : null;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Discover</Text>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stories, topics or characters"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {filtered ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Results</Text>
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>No stories found for "{query}"</Text>
          )}
          {filtered.map((s) => (
            <Pressable key={s.id} style={styles.resultRow} onPress={() => router.push(`/story/${s.id}` as any)}>
              <Image source={{ uri: s.cover_image_url }} style={styles.resultThumb} contentFit="cover" />
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={1}>{s.title}</Text>
                <Text style={styles.resultSub} numberOfLines={2}>{s.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <>
          {/* Playlists */}
          {playlists.map((pl) => (
            <View key={pl.id} style={styles.section}>
              <View style={styles.sectionRow}>
                <View>
                  <Text style={styles.sectionTitle}>{pl.name}</Text>
                  <Text style={styles.sectionSub}>
                    {pl.stories.length} stories
                  </Text>
                </View>
                <Pressable onPress={() => router.push(`/collection?type=playlist&id=${pl.id}` as any)}>
                  <Text style={styles.seeAll}>See all</Text>
                </Pressable>
              </View>
              <FlatList
                horizontal
                data={pl.stories}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable style={styles.storyCard} onPress={() => router.push(`/story/${item.id}` as any)}>
                    <Image source={{ uri: item.cover_image_url }} style={styles.storyImg} contentFit="cover" />
                    <Text style={styles.storyTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.storySub} numberOfLines={2}>{item.description}</Text>
                  </Pressable>
                )}
              />
            </View>
          ))}

          {/* Bible Characters */}
          {characters.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Bible Characters</Text>
                <Pressable onPress={() => router.push("/characters")}>
                  <Text style={styles.seeAll}>See all</Text>
                </Pressable>
              </View>
              <FlatList
                horizontal
                data={characters}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => {
                  const charCover = item.stories?.[0]?.cover_image_key
                    ? item.stories[0].cover_image_url ?? coverUrl(item.stories[0].slug ?? item.stories[0].id)
                    : coverUrl(item.id);
                  return (
                    <Pressable style={styles.charCard} onPress={() => router.push(`/character/${item.name}` as any)}>
                      <Image
                        source={{ uri: charCover }}
                        style={styles.charAvatar}
                        contentFit="cover"
                      />
                      <Text style={styles.charName}>{item.name}</Text>
                      <Text style={styles.charSub} numberOfLines={1}>{item.subtitle ?? item.title ?? ""}</Text>
                    </Pressable>
                  );
                }}
              />
            </View>
          )}

          {/* Recently Added */}
          {recentStories.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Recently Added</Text>
                <Pressable onPress={() => router.push("/collection?type=recent" as any)}>
                  <Text style={styles.seeAll}>See all</Text>
                </Pressable>
              </View>
              <FlatList
                horizontal
                data={recentStories}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable style={styles.storyCard} onPress={() => router.push(`/story/${item.id}` as any)}>
                    <Image source={{ uri: item.cover_image_url }} style={styles.storyImg} contentFit="cover" />
                    <Text style={styles.storyTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.storySub} numberOfLines={2}>{item.description}</Text>
                  </Pressable>
                )}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pageTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.hero,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: 12,
    marginLeft: 8,
  },

  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.text },
  sectionSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  seeAll: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.primary, marginTop: 4 },
  emptyText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textMuted, marginTop: spacing.md },

  storyCard: { width: 150, marginRight: spacing.md },
  storyImg: { width: 150, height: 150, borderRadius: radius.md },
  storyTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs },
  storySub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  charCard: { alignItems: "center", marginRight: spacing.lg, width: 80 },
  charAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: colors.surfaceBorder },
  charName: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs, textAlign: "center" },
  charSub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, textAlign: "center" },

  resultRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  resultThumb: { width: 60, height: 60, borderRadius: radius.sm },
  resultInfo: { flex: 1 },
  resultTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.text },
  resultSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
});
