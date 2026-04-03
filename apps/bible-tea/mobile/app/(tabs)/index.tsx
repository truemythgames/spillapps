import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/stores/app";
import { useGate } from "@/lib/useGate";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

const CARD_WIDTH = 150;
const CARD_IMAGE_HEIGHT = 150;

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function StoryCard({ story, onPress }: { story: any; onPress: () => void }) {
  return (
    <Pressable style={styles.storyCard} onPress={onPress}>
      <View style={styles.cardImageWrap}>
        {story.cover_image_url ? (
          <Image
            source={{ uri: story.cover_image_url }}
            style={styles.cardImage}
            contentFit="cover"
          />
        ) : (
          <View
            style={[styles.cardImage, { backgroundColor: colors.surfaceLight }]}
          />
        )}
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {story.title}
      </Text>
      <Text style={styles.cardRef} numberOfLines={1}>
        {story.bibleRef}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { guardedPush } = useGate();
  const insets = useSafeAreaInsets();
  const { storyOfTheDay, playlists, stories, loadInitialData, isLoading } =
    useAppStore();

  React.useEffect(() => {
    if (stories.length === 0) loadInitialData();
  }, []);

  if (isLoading && stories.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={{ color: colors.textMuted, textAlign: "center" }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 120,
        paddingTop: insets.top,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bible Tea</Text>
        <Text style={styles.headerSubtitle}>
          {stories.length} stories
        </Text>
      </View>

      {/* Story of the Day */}
      {storyOfTheDay && (
        <Pressable
          style={styles.sotdCard}
          onPress={() => guardedPush(`/story/${storyOfTheDay.id}`)}
        >
          {storyOfTheDay.cover_image_url && (
            <Image
              source={{ uri: storyOfTheDay.cover_image_url }}
              style={styles.sotdImage}
              contentFit="cover"
            />
          )}
          <View style={styles.sotdOverlay} />
          <View style={styles.sotdContent}>
            <Text style={styles.sotdLabel}>STORY OF THE DAY</Text>
            <Text style={styles.sotdTitle}>{storyOfTheDay.title}</Text>
            <Text style={styles.sotdRef}>{storyOfTheDay.bibleRef}</Text>
          </View>
        </Pressable>
      )}

      {/* Playlist sections */}
      {playlists.map((playlist) => (
        <View key={playlist.id} style={styles.section}>
          <SectionHeader title={playlist.name} />
          <FlatList
            horizontal
            data={playlist.stories}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <StoryCard
                story={item}
                onPress={() => guardedPush(`/story/${item.id}`)}
              />
            )}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* Header */
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.hero,
    color: colors.primary,
  },
  headerSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },

  /* Story of the Day */
  sotdCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: radius.lg,
    overflow: "hidden",
    height: 200,
  },
  sotdImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  sotdOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sotdContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: spacing.lg,
  },
  sotdLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.accent,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  sotdTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xxl,
    color: colors.text,
    lineHeight: 32,
  },
  sotdRef: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  /* Sections */
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
  },

  /* Horizontal list */
  horizontalList: {
    paddingHorizontal: spacing.lg,
  },

  /* Story Card */
  storyCard: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
  },
  cardImageWrap: {
    position: "relative",
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_IMAGE_HEIGHT,
    borderRadius: radius.md,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.sm,
    lineHeight: 17,
  },
  cardRef: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
