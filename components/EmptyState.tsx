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
  className?: string;
};

export function EmptyState({ icon, title, caption, action, className }: EmptyStateProps) {
  return (
    <View
      className={`items-center gap-3 rounded-lg border border-border bg-surface px-6 py-7${
        className ? ` ${className}` : ""
      }`}
    >
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
