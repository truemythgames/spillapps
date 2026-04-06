import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { coverUrl } from "@/lib/content";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";
import { LinearGradient } from "expo-linear-gradient";

const CHAT_TOPICS = [
  {
    id: "verse",
    title: "Spill a verse\nfor what I'm feeling",
    image: coverUrl("the-good-samaritan"),
  },
  {
    id: "advice",
    title: "What would\nGod say about...",
    image: coverUrl("solomons-wisdom"),
  },
  {
    id: "explain",
    title: "Break down\na Bible passage",
    image: coverUrl("the-ten-commandments"),
  },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  function handleTopic(topicId: string) {
    router.push({ pathname: "/chat", params: { topic: topicId } });
  }

  function handleFreeChat() {
    router.push({ pathname: "/chat", params: { topic: "free" } });
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Chat</Text>

      <Text style={styles.subtitle}>Select a topic or start a new chat</Text>

      {/* Topic cards */}
      <View style={styles.cards}>
        {CHAT_TOPICS.map((topic) => (
          <Pressable key={topic.id} style={styles.card} onPress={() => handleTopic(topic.id)}>
            <Image source={{ uri: topic.image }} style={styles.cardImage} contentFit="cover" />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.cardGradient}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{topic.title}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Free chat button */}
      <Pressable style={styles.freeBtn} onPress={handleFreeChat}>
        <Text style={styles.freeBtnText}>Just chat with me</Text>
      </Pressable>
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

  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  cards: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  card: {
    height: 160,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xl,
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  freeBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  freeBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
});
