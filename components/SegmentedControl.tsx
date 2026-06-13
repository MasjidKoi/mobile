import { type ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Text } from "./Text";

/**
 * Neutral segmented control from the Content & Community kit: a grey track with
 * a white raised active segment. Generic and items-driven. `fill` (default
 * true) stretches segments to equal width — set false for compact, icon-only
 * segments (e.g. the per-masjid notification mode). `icon` is a render function
 * so it can recolor for the active state.
 */
export type SegmentedControlOption = {
  key: string;
  label?: string;
  icon?: (active: boolean) => ReactNode;
};

export type SegmentedControlProps = {
  options: SegmentedControlOption[];
  value: string;
  onChange?: (key: string) => void;
  fill?: boolean;
  className?: string;
};

const ACTIVE_SHADOW = {
  shadowColor: "#182420",
  shadowOpacity: 0.08,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};

export function SegmentedControl({
  options,
  value,
  onChange,
  fill = true,
  className,
}: SegmentedControlProps) {
  return (
    <View className={`flex-row rounded-md bg-[#EDEFEC] p-[3px]${className ? ` ${className}` : ""}`}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange?.(opt.key)}
            className={`flex-row items-center justify-center gap-1.5 rounded-[9px] ${
              fill ? "flex-1 py-2" : "px-[10px] py-1.5"
            }${active ? " bg-surface" : ""}`}
            style={active ? ACTIVE_SHADOW : undefined}
          >
            {opt.icon?.(active)}
            {opt.label ? (
              <Text
                className={`text-sm ${
                  active ? "font-semibold text-content-primary" : "font-medium text-content-secondary"
                }`}
              >
                {opt.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default SegmentedControl;
