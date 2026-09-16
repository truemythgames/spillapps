import { Platform } from "react-native";
import { withLayoutContext, useRouter, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  createNavigatorFactory,
  TabRouter,
  useNavigationBuilder,
  type ParamListBase,
  type TabActionHelpers,
  type TabNavigationState,
} from "@react-navigation/native";
import { BottomTabs, BottomTabsScreen } from "react-native-screens";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/app";

const GATED_TABS = new Set(["explore", "playlists", "prayers", "profile"]);
const TAB_ORDER = ["index", "explore", "prayers", "playlists", "profile"] as const;
const CREAM = "#E8D6B8";

const IOS_ICONS: Record<string, { default: string; selected: string }> = {
  index: { default: "house", selected: "house.fill" },
  explore: { default: "book", selected: "book.fill" },
  prayers: { default: "heart", selected: "heart.fill" },
  playlists: { default: "safari", selected: "safari.fill" },
  profile: { default: "sparkles", selected: "sparkles" },
};

const ANDROID_ICONS: Record<
  string,
  { default: keyof typeof Ionicons.glyphMap; selected: keyof typeof Ionicons.glyphMap }
> = {
  index: { default: "home-outline", selected: "home" },
  explore: { default: "book-outline", selected: "book" },
  prayers: { default: "heart-outline", selected: "heart" },
  playlists: { default: "compass-outline", selected: "compass" },
  profile: { default: "chatbubble-ellipses-outline", selected: "chatbubble-ellipses" },
};

type TabOptions = {
  title?: string;
  tabBarLabel?: string;
};

function NativeBottomTabNavigator({
  id,
  initialRouteName,
  children,
  layout,
  screenListeners,
  screenOptions,
  backBehavior,
}: any) {
  const router = useRouter();
  const isSubscribed = useAppStore((s) => s.isSubscribed);

  const { state, navigation, descriptors, NavigationContent } =
    useNavigationBuilder<
      TabNavigationState<ParamListBase>,
      any,
      TabActionHelpers<ParamListBase>,
      TabOptions,
      any
    >(TabRouter, {
      id,
      initialRouteName,
      children,
      layout,
      screenListeners,
      screenOptions,
      backBehavior,
    });

  return (
    <NavigationContent>
      <BottomTabs
        tabBarMinimizeBehavior="never"
        tabBarControllerMode="tabBar"
        tabBarTintColor={CREAM}
        onNativeFocusChange={(e) => {
          const route = state.routes.find((r) => r.key === e.nativeEvent.tabKey);
          if (!route) return;
          if (GATED_TABS.has(route.name) && !isSubscribed) {
            router.push("/paywall");
            return;
          }
          navigation.emit({ type: "tabPress", target: route.key } as any);
          if (state.routes[state.index]?.key !== route.key) {
            navigation.navigate(route.name);
          }
        }}
      >
        {state.routes.map((route, index) => {
          const { options, render } = descriptors[route.key];
          const icons = IOS_ICONS[route.name] ?? IOS_ICONS.index;
          return (
            <BottomTabsScreen
              key={route.key}
              tabKey={route.key}
              isFocused={state.index === index}
              title={options.tabBarLabel ?? options.title ?? route.name}
              icon={{ ios: { type: "sfSymbol", name: icons.default } }}
              selectedIcon={{ type: "sfSymbol", name: icons.selected }}
            >
              {render()}
            </BottomTabsScreen>
          );
        })}
      </BottomTabs>
    </NavigationContent>
  );
}

const NativeTabs = withLayoutContext(
  createNavigatorFactory(NativeBottomTabNavigator)().Navigator,
);

function useTabLabels() {
  const { t } = useTranslation();
  return {
    index: t("tabs.home"),
    explore: t("tabs.stories"),
    prayers: t("tabs.prayers"),
    playlists: t("tabs.discover"),
    profile: t("tabs.chat"),
  } as Record<(typeof TAB_ORDER)[number], string>;
}

function IosTabLayout() {
  const labels = useTabLabels();
  return (
    <NativeTabs>
      {TAB_ORDER.map((name) => (
        <NativeTabs.Screen
          key={name}
          name={name}
          options={{ title: labels[name], tabBarLabel: labels[name] }}
        />
      ))}
    </NativeTabs>
  );
}

function AndroidTabLayout() {
  const labels = useTabLabels();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isSubscribed = useAppStore((s) => s.isSubscribed);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CREAM,
        tabBarInactiveTintColor: "rgba(232,214,184,0.45)",
        tabBarStyle: {
          backgroundColor: "#0F0D0B",
          borderTopColor: "rgba(232,214,184,0.14)",
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      {TAB_ORDER.map((name) => {
        const icons = ANDROID_ICONS[name];
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: labels[name],
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? icons.selected : icons.default}
                  size={22}
                  color={color}
                />
              ),
            }}
            listeners={{
              tabPress: (e) => {
                if (GATED_TABS.has(name) && !isSubscribed) {
                  e.preventDefault();
                  router.push("/paywall");
                }
              },
            }}
          />
        );
      })}
    </Tabs>
  );
}

export default function TabLayout() {
  return Platform.OS === "ios" ? <IosTabLayout /> : <AndroidTabLayout />;
}
