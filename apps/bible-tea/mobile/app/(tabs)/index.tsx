import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useNetInfo } from "@react-native-community/netinfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppStore } from "@/stores/app";
import { useGate } from "@/lib/useGate";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";
import { Skeleton, SkeletonText } from "@/components/Skeleton";

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
      <View style={[styles.cardImageWrap, { backgroundColor: colors.surfaceLight, borderRadius: radius.md }]}>
        {story.cover_image_url ? (
          <Image
            source={{ uri: story.cover_image_url }}
            style={styles.cardImage}
            contentFit="cover"
            transition={300}
          />
        ) : null}
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

function SkeletonCard() {
  return (
    <View style={styles.storyCard}>
      <Skeleton width={CARD_WIDTH} height={CARD_IMAGE_HEIGHT} />
      <SkeletonText width={120} style={{ marginTop: spacing.sm }} />
      <SkeletonText width={80} height={11} style={{ marginTop: 6 }} />
    </View>
  );
}

function OfflineScreen({ paddingTop, onRetry }: { paddingTop: number; onRetry: () => void }) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  }, [onRetry]);

  return (
    <View style={[styles.container, { paddingTop, justifyContent: "center", alignItems: "center" }]}>
      <Text style={{ fontSize: 48, marginBottom: spacing.md }}>{'📡'}</Text>
      <Text style={[styles.headerTitle, { textAlign: "center", marginBottom: spacing.sm }]}>
        No connection
      </Text>
      <Text style={{ fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, textAlign: "center", paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
        Check your internet and try again
      </Text>
      <Pressable
        style={{ backgroundColor: colors.accent, paddingHorizontal: 32, paddingVertical: 14, borderRadius: radius.lg, opacity: retrying ? 0.7 : 1 }}
        onPress={handleRetry}
        disabled={retrying}
      >
        {retrying ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.background }}>Retry</Text>
        )}
      </Pressable>
    </View>
  );
}

function SkeletonHome({ paddingTop }: { paddingTop: number }) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120, paddingTop }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bible Tea</Text>
        <Text style={styles.headerTeaIcon}>🍵</Text>
      </View>

      <View style={[styles.sotdCard, { backgroundColor: colors.surface }]}>
        <Skeleton width="100%" height={220} borderRadius={0} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonText width={180} height={20} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonText width={140} height={20} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </View>
    </ScrollView>
  );
}

// Hidden gesture: 7 quick taps on the tea icon opens the reviewer unlock screen.
const UNLOCK_TAP_COUNT = 7;
const UNLOCK_TAP_WINDOW_MS = 3000;

export default function HomeScreen() {
  const { guardedPush } = useGate();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { storyOfTheDay, playlists, stories, loadInitialData, isLoading } =
    useAppStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasData = stories.length > 0;

  const tapTimestamps = useRef<number[]>([]);
  const handleTeaTap = useCallback(() => {
    const now = Date.now();
    const recent = tapTimestamps.current.filter(
      (t) => now - t < UNLOCK_TAP_WINDOW_MS
    );
    recent.push(now);
    tapTimestamps.current = recent;

    if (recent.length >= UNLOCK_TAP_COUNT) {
      tapTimestamps.current = [];
      router.push("/unlock" as any);
    }
  }, [router]);

  const sortedPlaylists = useMemo(() => {
    const copy = [...playlists];
    copy.sort((a, b) => {
      const aStart = a.name.toLowerCase().includes("start here") ? 0 : 1;
      const bStart = b.name.toLowerCase().includes("start here") ? 0 : 1;
      return aStart - bStart;
    });
    return copy;
  }, [playlists]);

  React.useEffect(() => {
    if (stories.length === 0) loadInitialData();
  }, []);

  useEffect(() => {
    if (hasData) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [hasData]);

  const { isConnected } = useNetInfo();

  if (!hasData) {
    if (isConnected === false || !isLoading) {
      return <OfflineScreen paddingTop={insets.top} onRetry={loadInitialData} />;
    }
    return <SkeletonHome paddingTop={insets.top} />;
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
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
        <Pressable onPress={handleTeaTap} hitSlop={10}>
          <Text style={styles.headerTeaIcon}>🍵</Text>
        </Pressable>
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
              transition={400}
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

      {/* Playlist sections or skeleton placeholders */}
      {sortedPlaylists.length > 0 ? (
        sortedPlaylists.map((playlist) => (
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
        ))
      ) : (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}><SkeletonText width={180} height={20} /></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </ScrollView>
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}><SkeletonText width={140} height={20} /></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </ScrollView>
          </View>
        </>
      )}
    </ScrollView>
    </Animated.View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: 10,
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.hero,
    color: colors.text,
  },
  headerTeaIcon: {
    fontSize: 28,
  },

  sotdCard: {
    marginBottom: spacing.xl,
    overflow: "hidden",
    height: 220,
    backgroundColor: colors.surfaceLight,
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

  horizontalList: {
    paddingHorizontal: spacing.lg,
  },

  storyCard: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
  },
  cardImageWrap: {
    position: "relative",
    width: CARD_WIDTH,
    height: CARD_IMAGE_HEIGHT,
    overflow: "hidden",
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_IMAGE_HEIGHT,
    borderRadius: radius.md,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
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
