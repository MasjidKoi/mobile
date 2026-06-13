import { type ReactNode } from "react";
import { View } from "react-native";

import { ProgressBar } from "./ProgressBar";
import { Text } from "./Text";

/**
 * Goal card from the Ibadah & Gamification kit (e.g. a Khatm target): an icon,
 * name + pace, a progress bar, and done/remaining footers. `value` is 0–1.
 */
export type GoalCardProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  value: number;
  doneLabel: string;
  leftLabel?: string;
  className?: string;
};

export function GoalCard({ icon, title, subtitle, value, doneLabel, leftLabel, className }: GoalCardProps) {
  return (
    <View
      className={`gap-3 rounded-lg border border-border bg-surface p-4${
        className ? ` ${className}` : ""
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-sm bg-primary-soft">{icon}</View>
        <View className="flex-1 gap-px">
          <Text className="text-body font-semibold text-content-primary">{title}</Text>
          {subtitle ? (
            <Text className="text-caption font-regular text-content-secondary">{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <ProgressBar value={value} />
      <View className="flex-row items-center justify-between">
        <Text className="text-caption font-semibold text-primary">{doneLabel}</Text>
        {leftLabel ? (
          <Text className="text-caption font-regular text-content-muted">{leftLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default GoalCard;
