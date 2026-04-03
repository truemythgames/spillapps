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
    title: "Find a Verse",
    placeholder: "Describe your situation...",
    greeting: "Tell me what you're going through, and I'll find a Bible verse that speaks to your situation.",
  },
  advice: {
    title: "Biblical Advice",
    placeholder: "What do you need advice on?",
    greeting: "What's on your mind? I'll share wisdom and guidance from Scripture to help you.",
  },
  explain: {
    title: "Explain the Bible",
    placeholder: "What would you like explained?",
    greeting: "Ask me about any passage, story, or concept in the Bible and I'll break it down for you.",
  },
  story: {
    title: "Ask about this story",
    placeholder: "Ask anything about this story...",
    greeting: "",
  },
  free: {
    title: "Chat",
    placeholder: "Ask anything about the Bible...",
    greeting: "Hey! Ask me anything about the Bible — stories, characters, theology, history, or how it relates to your life.",
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
    ? `I'm reading "${storyTitle}" (${storyRef || ""}). `
    : "";

  const greeting = topic === "story" && storyTitle
    ? `You're reading "${storyTitle}" (${storyRef}). Ask me anything — what it means, historical context, how it applies to your life, or anything else!`
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
      await api.streamChatMessage(
        {
          conversation_id: conversationId ?? undefined,
          topic: topic ?? "free",
          message: apiMessage,
        },
        (meta) => {
          if (meta.conversation_id) setConversationId(meta.conversation_id);
        },
        (delta) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingId ? { ...m, text: m.text + delta } : m,
            ),
          );
          scrollToEnd();
        },
        () => setLoading(false),
      );
    } catch {
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
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId
              ? { ...m, text: "Sorry, I couldn't connect. Please try again." }
              : m,
          ),
        );
      }
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
