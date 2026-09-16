import { withLayoutContext, useRouter } from "expo-router";
import {
  createNavigatorFactory,
  TabRouter,
  useNavigationBuilder,
  type ParamListBase,
  type TabActionHelpers,
  type TabNavigationState,
} from "@react-navigation/native";
import { BottomTabs, BottomTabsScreen } from "react-native-screens";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/app";

const GATED_TABS = new Set(["explore", "playlists", "prayers", "profile"]);

const ICONS: Record<string, { default: string; selected: string }> = {
  index: { default: "house", selected: "house.fill" },
  explore: { default: "book", selected: "book.fill" },
  prayers: { default: "heart", selected: "heart.fill" },
  playlists: { default: "safari", selected: "safari.fill" },
  profile: { default: "sparkles", selected: "sparkles" },
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
        tabBarTintColor="#E8D6B8"
        onNativeFocusChange={(e) => {
          const route = state.routes.find(
            (r) => r.key === e.nativeEvent.tabKey,
          );
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
          const icons = ICONS[route.name] ?? ICONS.index;
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

export default function TabLayout() {
  const { t } = useTranslation();

  const labels: Record<string, string> = {
    index: t("tabs.home"),
    explore: t("tabs.stories"),
    prayers: t("tabs.prayers"),
    playlists: t("tabs.discover"),
    profile: t("tabs.chat"),
  };

  return (
    <NativeTabs>
      {(["index", "explore", "prayers", "playlists", "profile"] as const).map(
        (name) => (
          <NativeTabs.Screen
            key={name}
            name={name}
            options={{
              title: labels[name],
              tabBarLabel: labels[name],
            }}
          />
        ),
      )}
    </NativeTabs>
  );
}
