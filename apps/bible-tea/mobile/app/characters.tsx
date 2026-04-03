import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllCharacters, characterImageUrl, coverUrl } from "@/lib/content";
import { colors, fonts, fontSize, spacing, radius } from "@/lib/theme";

export default function CharactersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const characters = getAllCharacters();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Bible Characters</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {characters.map((char) => (
          <Pressable
            key={char.id}
            style={styles.card}
            onPress={() => router.push(`/character/${char.name}` as any)}
          >
            <Image
              source={{ uri: characterImageUrl(char.id) }}
              placeholder={{ uri: coverUrl(char.storyIds[0]) }}
              style={styles.avatar}
              contentFit="cover"
            />
            <Text style={styles.name}>{char.name}</Text>
            <Text style={styles.sub} numberOfLines={1}>{char.subtitle}</Text>
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
    gap: spacing.md,
  },
  card: {
    width: "29%",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.surfaceBorder },
  name: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs, textAlign: "center" },
  sub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, textAlign: "center" },
});
