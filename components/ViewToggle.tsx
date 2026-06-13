import { type ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Text } from "./Text";

/**
 * Segmented control from the Map & Discovery kit (e.g. Map / List). Generic
 * and items-driven; the active segment gets the brand fill. `icon` is a render
 * function so it can recolor for the active state.
 */
export type ViewToggleOption = {
  key: string;
  label: string;
  icon?: (active: boolean) => ReactNode;
};

export type ViewToggleProps = {
  options: ViewToggleOption[];
  value: string;
  onChange?: (key: string) => void;
  className?: string;
};

export function ViewToggle({ options, value, onChange, className }: ViewToggleProps) {
  return (
    <View
      className={`flex-row rounded-full border border-border bg-surface p-[3px]${
        className ? ` ${className}` : ""
      }`}
      style={{
        shadowColor: "#182420",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange?.(opt.key)}
            className={`flex-row items-center gap-1.5 rounded-full px-4 py-[7px]${
              active ? " bg-primary" : ""
            }`}
          >
            {opt.icon?.(active)}
            <Text
              className={`text-caption ${
                active ? "font-semibold text-on-inverse" : "font-medium text-content-secondary"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default ViewToggle;
