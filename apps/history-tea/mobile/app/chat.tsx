import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const TOPIC_CONFIG: Record<string, { title: string; placeholder: string; greeting: string }> = {
  verse: {
    title: "Find a Story",
    placeholder: "Tell me what's on your mind...",
    greeting: "What are you in the mood for? Tell me what you're going through or curious about, and I'll point you to a slice of history that fits.",
  },
  advice: {
    title: "Lessons from History",
    placeholder: "What's the situation?",
    greeting: "Spill the tea — what's going on? I'll show you how figures from history navigated something similar, and what we can learn from them.",
  },
  explain: {
    title: "Break It Down",
    placeholder: "Which event, era, or person?",
    greeting: "Drop an event, era, person, or even a confusing thing you read — I'll break it down so it actually makes sense.",
  },
  story: {
    title: "Story Chat",
    placeholder: "Ask anything about this story...",
    greeting: "",
  },
  free: {
    title: "Ask a Historian",
    placeholder: "Ask me anything...",
    greeting: "Hey! Ask me literally anything about world history — wars, empires, mysteries, weird people, lost civilizations. I'm here for all of it.",
  },
};

export default function ChatConversation() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { topic, storyId, storyTitle, storyRef } = useLocalSearchParams<{
    topic: string;
    storyId?: string;
    storyTitle?: string;
    storyRef?: string;
  }>();
  const config = TOPIC_CONFIG[topic ?? "free"] ?? TOPIC_CONFIG.free;

  const storyContext = topic === "story" && storyTitle
    ? `I'm listening to "${storyTitle}" (${storyRef || ""}). `
    : "";

  const greeting = topic === "story" && storyTitle
    ? `You're on "${storyTitle}" (${storyRef}). Ask me anything — what really happened, the context behind it, the people involved, or how it shaped what came next.`
    : config.greeting;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "assistant", text: greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    scrollToEnd();

    const streamingId = (Date.now() + 1).toString();

    setMessages((prev) => [...prev, { id: streamingId, role: "assistant", text: "" }]);
    scrollToEnd();

    const apiMessage = conversationId ? msg : storyContext + msg;

    try {
      const res = await api.sendChatMessage({
        conversation_id: conversationId ?? undefined,
        topic: topic ?? "free",
        message: apiMessage,
      });
      setConversationId(res.conversation_id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId ? { ...m, text: res.message.content } : m,
        ),
      );
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? { ...m, text: "Sorry, I couldn't connect. Please try again." }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }

    scrollToEnd();
  }, [input, loading, conversationId, topic]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{config.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.botBubble]}>
            {item.role === "assistant" && (
              <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginBottom: 4 }} />
            )}
            {item.role === "assistant" && !item.text && loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.bubbleText, item.role === "user" && styles.userBubbleText]}>
                {item.text}
              </Text>
            )}
          </View>
        )}
      />

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          placeholder={config.placeholder}
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
          multiline
          blurOnSubmit
          editable={!loading}
        />
        <Pressable
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.textMuted} />
          ) : (
            <Ionicons name="arrow-up" size={20} color={input.trim() ? colors.background : colors.textMuted} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.text },

  messageList: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, flexGrow: 1 },
  bubble: {
    maxWidth: "80%",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: colors.surface,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  bubbleText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.text, lineHeight: 22 },
  userBubbleText: { color: colors.background },

  inputRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    maxHeight: 120,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Platform.OS === "ios" ? 2 : 0,
  },
  sendBtnDisabled: { backgroundColor: colors.surfaceLight },
});
