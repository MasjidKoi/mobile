import { Pressable, type PressableProps } from "react-native";

import { Text } from "./Text";

/**
 * Selectable pill from the Style Guide (used for donation amounts, filters…).
 * `selected` swaps to the soft-green fill with a brand border.
 */
export type ChipProps = PressableProps & {
  label: string;
  selected?: boolean;
  className?: string;
};

export function Chip({ label, selected = false, className, ...props }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`items-center justify-center rounded-full border px-[18px] py-[10px] ${
        selected ? "border-[1.5px] border-primary bg-primary-soft" : "border-border bg-surface"
      }${className ? ` ${className}` : ""}`}
      {...props}
    >
      <Text
        className={`text-sm ${
          selected ? "font-semibold text-primary" : "font-medium text-content-secondary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default Chip;
