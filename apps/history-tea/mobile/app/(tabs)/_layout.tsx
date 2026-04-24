import { Tabs, useRouter } from "expo-router";
import { View, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, fontSize, TAB_BAR_HEIGHT } from "@/lib/theme";
import { useAppStore } from "@/stores/app";

const TAB_ITEMS = [
  { name: "index", label: "Home", icon: "home" as const, iconOutline: "home-outline" as const },
  { name: "explore", label: "Stories", icon: "book" as const, iconOutline: "book-outline" as const },
  { name: "playlists", label: "Discover", icon: "compass" as const, iconOutline: "compass-outline" as const },
  { name: "profile", label: "Chat", icon: "sparkles" as const, iconOutline: "sparkles-outline" as const },
] as const;

const GATED_TABS = new Set(["explore", "playlists", "profile"]);

export default function TabLayout() {
  const router = useRouter();
  const isSubscribed = useAppStore((s) => s.isSubscribed);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          tabBarItemStyle: { paddingTop: 6 },
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        {TAB_ITEMS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <View style={styles.tabIcon}>
                  <Ionicons
                    name={focused ? tab.icon : tab.iconOutline}
                    size={22}
                    color={color}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color,
                        fontFamily: focused ? fonts.bodySemiBold : fonts.body,
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
              ),
            }}
            listeners={
              GATED_TABS.has(tab.name) && !isSubscribed
                ? {
                    tabPress: (e) => {
                      e.preventDefault();
                      router.push("/paywall");
                    },
                  }
                : undefined
            }
          />
        ))}
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.surfaceBorder,
    borderTopWidth: 1,
    height: TAB_BAR_HEIGHT,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 70,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    textAlign: "center",
  },
});
