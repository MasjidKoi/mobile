import { type ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Text } from "./Text";

/**
 * Bottom navigation bar from the Mobile Components kit. Generic and items-
 * driven — usable standalone or as a custom `tabBar` for expo-router Tabs.
 * The active tab shows a soft-green pill behind its icon. `icon` is a render
 * function so the consumer can recolor it for the active state.
 */
export type NavBarItem = {
  key: string;
  label: string;
  icon: (active: boolean) => ReactNode;
};

export type NavBarProps = {
  items: NavBarItem[];
  activeKey: string;
  onChange?: (key: string) => void;
  className?: string;
};

export function NavBar({ items, activeKey, onChange, className }: NavBarProps) {
  return (
    <View
      className={`flex-row border-t border-border bg-surface px-2 pb-[14px] pt-[10px]${
        className ? ` ${className}` : ""
      }`}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange?.(item.key)}
            className="flex-1 items-center gap-1"
          >
            <View
              className={`h-8 w-[60px] items-center justify-center rounded-lg${
                active ? " bg-primary-soft" : ""
              }`}
            >
              {item.icon(active)}
            </View>
            <Text
              className={`text-micro ${
                active ? "font-semibold text-primary" : "font-medium text-content-muted"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default NavBar;
