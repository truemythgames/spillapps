import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useNetInfo } from "@react-native-community/netinfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAppStore, type Playlist } from "@/stores/app";
import { useGate } from "@/lib/useGate";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";
import { sizedMedia } from "@/lib/content";
import { Skeleton, SkeletonText } from "@/components/Skeleton";
import { WidgetCard } from "@/components/WidgetPrompt";
import { CoverImage } from "@/components/CoverImage";
import { VerseOfTheDayCard } from "@/components/VerseShareCard";
import { everydayWordPlaylist, homePlaylistRows } from "@/lib/home-playlists";

const CARD_WIDTH = 150;
const CARD_IMAGE_HEIGHT = 150;
const CARD_STRIDE = CARD_WIDTH + spacing.md;
const CARD_COVER_W = 360;
const HERO_COVER_W = 800;

function SectionHeader({ title, label }: { title: string; label?: string }) {
  return (
    <View style={styles.sectionHeader}>
      {label ? <Text style={styles.sectionLabel}>{label}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const StoryCard = React.memo(function StoryCard({
  story,
  onPress,
  retryKey,
}: {
  story: any;
  onPress: () => void;
  retryKey?: number;
}) {
  return (
    <Pressable style={styles.storyCard} onPress={onPress}>
      <View style={[styles.cardImageWrap, { backgroundColor: colors.surfaceLight, borderRadius: radius.md }]}>
        <CoverImage
          uri={story.cover_image_url}
          storyId={story.id}
          displayWidth={CARD_COVER_W}
          retryKey={retryKey}
          style={styles.cardImage}
          contentFit="cover"
          transition={0}
        />
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {story.title}
      </Text>
      <Text style={styles.cardRef} numberOfLines={1}>
        {story.bibleRef}
      </Text>
    </Pressable>
  );
});

const PlaylistRow = React.memo(function PlaylistRow({
  playlist,
  coverEpoch,
  onPressStory,
}: {
  playlist: Playlist;
  coverEpoch: number;
  onPressStory: (id: string) => void;
}) {
  const { t } = useTranslation();
  const renderItem = useCallback(
    ({ item }: { item: Playlist["stories"][number] }) => (
      <StoryCard
        story={item}
        retryKey={coverEpoch}
        onPress={() => onPressStory(item.id)}
      />
    ),
    [coverEpoch, onPressStory],
  );

  return (
    <View style={styles.section}>
      <SectionHeader
        title={playlist.name}
        label={playlist.id.startsWith("everyday-word-") ? t("home.today") : undefined}
      />
      <FlatList
        horizontal
        data={playlist.stories}
        keyExtractor={(item) => item.id}
        extraData={coverEpoch}
        renderItem={renderItem}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={3}
        removeClippedSubviews={false}
        getItemLayout={(_, index) => ({
          length: CARD_STRIDE,
          offset: CARD_STRIDE * index,
          index,
        })}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
});

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
  const { t } = useTranslation();
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
        {t("home.noConnection")}
      </Text>
      <Text style={{ fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, textAlign: "center", paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
        {t("home.noConnectionDesc")}
      </Text>
      <Pressable
        style={{ backgroundColor: colors.accent, paddingHorizontal: 32, paddingVertical: 14, borderRadius: radius.lg, opacity: retrying ? 0.7 : 1 }}
        onPress={handleRetry}
        disabled={retrying}
      >
        {retrying ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.background }}>{t("common.retry")}</Text>
        )}
      </Pressable>
    </View>
  );
}

function SkeletonHome({ paddingTop }: { paddingTop: number }) {
  const { t } = useTranslation();
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120, paddingTop }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("home.title")}</Text>
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
  const { t } = useTranslation();
  const { guardedPush } = useGate();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { storyOfTheDay, playlists, stories, loadInitialData, loadRemoteData, isLoading } =
    useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [coverEpoch, setCoverEpoch] = useState(0);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRemoteData();
      setCoverEpoch((n) => n + 1);
    } finally { setRefreshing(false); }
  }, [loadRemoteData]);

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
    const everyday = everydayWordPlaylist(stories, t("home.everydayWord"));
    return homePlaylistRows(playlists, everyday);
  }, [playlists, stories, t]);

  React.useEffect(() => {
    if (stories.length === 0) loadInitialData();
  }, []);

  useEffect(() => {
    const firstRow = sortedPlaylists[0]?.stories.slice(0, 6) ?? [];
    const urls = firstRow
      .map((s) => s.cover_image_url)
      .filter((u): u is string => !!u)
      .map((u) => sizedMedia(u, CARD_COVER_W));
    if (storyOfTheDay?.cover_image_url) {
      urls.unshift(sizedMedia(storyOfTheDay.cover_image_url, HERO_COVER_W));
    }
    if (urls.length) ExpoImage.prefetch(urls);
  }, [sortedPlaylists, storyOfTheDay]);

  const openStory = useCallback(
    (id: string) => guardedPush(`/story/${id}`),
    [guardedPush],
  );

  const { isConnected } = useNetInfo();

  if (!hasData) {
    if (isLoading) {
      return <SkeletonHome paddingTop={insets.top} />;
    }
    return <OfflineScreen paddingTop={insets.top} onRetry={loadInitialData} />;
  }

  const listHeader = (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("home.title")}</Text>
        <Pressable onPress={handleTeaTap} hitSlop={10}>
          <Text style={styles.headerTeaIcon}>🍵</Text>
        </Pressable>
      </View>

      {storyOfTheDay && (
        <Pressable
          style={styles.sotdCard}
          onPress={() => openStory(storyOfTheDay.id)}
        >
          <CoverImage
            uri={storyOfTheDay.cover_image_url}
            storyId={storyOfTheDay.id}
            displayWidth={HERO_COVER_W}
            retryKey={coverEpoch}
            style={styles.sotdImage}
            contentFit="cover"
            transition={0}
          />
          <View style={styles.sotdOverlay} />
          <View style={styles.sotdContent}>
            <Text style={styles.sotdLabel}>{t("home.storyOfTheDay")}</Text>
            <Text style={styles.sotdTitle}>{storyOfTheDay.title}</Text>
            <Text style={styles.sotdRef}>{storyOfTheDay.bibleRef}</Text>
          </View>
        </Pressable>
      )}
    </>
  );

  return (
    <FlatList
      style={styles.container}
      data={sortedPlaylists}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={listHeader}
      ListFooterComponent={
        <>
          <VerseOfTheDayCard
            storyId={storyOfTheDay?.id}
            coverImageUrl={storyOfTheDay?.cover_image_url}
          />
          <WidgetCard />
        </>
      }
      renderItem={({ item }) => (
        <PlaylistRow
          playlist={item}
          coverEpoch={coverEpoch}
          onPressStory={openStory}
        />
      )}
      initialNumToRender={3}
      maxToRenderPerBatch={2}
      windowSize={5}
      removeClippedSubviews={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
        paddingTop: insets.top,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          progressViewOffset={insets.top}
        />
      }
    />
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
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.accent,
    letterSpacing: 1.4,
    marginBottom: 4,
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
