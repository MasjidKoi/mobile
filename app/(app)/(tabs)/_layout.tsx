import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { NavBar, type NavBarItem } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/** Tab route name → Feather icon (Lucide-equivalent; the design uses Lucide). */
const TAB_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  home: "home",
  explore: "map",
  feed: "file-text",
  profile: "user",
};

/**
 * The 4-tab shell. Drives the existing presentational `NavBar` as a custom
 * tabBar (Home · Explore · Feed · Profile), padding for the home-indicator
 * inset below it.
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  const c = useColors();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation, insets }) => {
        const items: NavBarItem[] = state.routes
          .filter((route) => TAB_ICON[route.name])
          .map((route) => ({
            key: route.name,
            label: t(`nav.${route.name}`),
            icon: (active) => (
              <Feather
                name={TAB_ICON[route.name]}
                size={22}
                color={active ? c.primary : c["text-muted"]}
              />
            ),
          }));
        const activeKey = state.routes[state.index]?.name ?? "home";
        return (
          <View className="bg-surface" style={{ paddingBottom: insets.bottom }}>
            <NavBar
              items={items}
              activeKey={activeKey}
              onChange={(key) => navigation.navigate(key as never)}
            />
          </View>
        );
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
