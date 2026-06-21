import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

/**
 * Empty state from the Map & Discovery kit: a soft-green icon circle, a title,
 * a centered caption, and an optional action (pass a <Button />). Generic.
 */
export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  caption?: string;
  action?: ReactNode;
  /** `card` (default) draws the bordered surface box, for inline/in-list use.
   * `plain` is borderless — for full-screen centered hints where a floating
   * box on the same background reads as awkward. */
  variant?: "card" | "plain";
  className?: string;
};

export function EmptyState({
  icon,
  title,
  caption,
  action,
  variant = "card",
  className,
}: EmptyStateProps) {
  const container =
    variant === "plain"
      ? "items-center gap-3 px-6"
      : "items-center gap-3 rounded-lg border border-border bg-surface px-6 py-7";
  return (
    <View className={`${container}${className ? ` ${className}` : ""}`}>
      <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
        {icon}
      </View>
      <Text className="text-base font-semibold text-content-primary">{title}</Text>
      {caption ? (
        <Text className="max-w-[280px] text-center text-sm font-regular text-content-secondary">
          {caption}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

export default EmptyState;
