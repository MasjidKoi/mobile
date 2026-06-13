import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

/**
 * Streak card from the Ibadah & Gamification kit: a flame badge, the current
 * streak with its unit and longest run, an optional freeze count, and an
 * optional gentle "mercy" note. Icons passed as nodes.
 */
export type StreakCardProps = {
  streak: number | string;
  unit: string;
  longest?: string;
  flameIcon?: ReactNode;
  freezeLabel?: string;
  freezeIcon?: ReactNode;
  mercy?: string;
  mercyIcon?: ReactNode;
  className?: string;
};

export function StreakCard({
  streak,
  unit,
  longest,
  flameIcon,
  freezeLabel,
  freezeIcon,
  mercy,
  mercyIcon,
  className,
}: StreakCardProps) {
  return (
    <View
      className={`gap-3 rounded-lg border border-border bg-surface p-[18px]${
        className ? ` ${className}` : ""
      }`}
    >
      <View className="flex-row items-center gap-3.5">
        <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-primary-soft">
          {flameIcon}
        </View>
        <View className="flex-1 gap-px">
          <View className="flex-row items-end gap-1.5">
            <Text className="text-[30px] font-bold text-content-primary">{streak}</Text>
            <Text className="text-sm font-medium text-content-secondary" style={{ marginBottom: 4 }}>
              {unit}
            </Text>
          </View>
          {longest ? (
            <Text className="text-caption font-regular text-content-muted">{longest}</Text>
          ) : null}
        </View>
        {freezeLabel ? (
          <View className="flex-row items-center gap-1.5 rounded-full bg-[#E8F0F5] px-3 py-1.5">
            {freezeIcon}
            <Text className="text-caption font-bold text-[#4A7FA5]">{freezeLabel}</Text>
          </View>
        ) : null}
      </View>
      {mercy ? (
        <View className="flex-row items-center gap-2 rounded-sm bg-primary-soft px-3 py-2.5">
          {mercyIcon}
          <Text className="flex-1 text-caption font-regular text-primary">{mercy}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default StreakCard;
