import { type ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

import { Text } from "./Text";

/**
 * Toggleable filter pill from the Map & Discovery kit (facility filters,
 * distance chips). Generic: `label`, optional leading `icon`, and `selected`.
 */
export type FilterChipProps = PressableProps & {
  label: string;
  icon?: ReactNode;
  selected?: boolean;
  className?: string;
};

export function FilterChip({ label, icon, selected = false, className, ...props }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`flex-row items-center gap-1.5 rounded-full px-[14px] py-2 ${
        selected ? "border-[1.5px] border-primary bg-primary-soft" : "border border-border bg-surface"
      }${className ? ` ${className}` : ""}`}
      {...props}
    >
      {icon}
      <Text
        className={`text-caption ${
          selected ? "font-semibold text-primary" : "font-medium text-content-secondary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default FilterChip;
