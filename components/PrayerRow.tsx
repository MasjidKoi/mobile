import { type ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { Text } from "./Text";

/**
 * Prayer time row from the Style Guide: an optional leading icon + prayer name
 * on the left, the time in brand green on the right.
 */
export type PrayerRowProps = ViewProps & {
  name: string;
  time: string;
  icon?: ReactNode;
  className?: string;
};

export function PrayerRow({ name, time, icon, className, ...props }: PrayerRowProps) {
  return (
    <View
      className={`flex-row items-center justify-between rounded-md border border-border bg-surface px-4 py-[14px]${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className="text-body font-semibold text-content-primary">{name}</Text>
      </View>
      <Text className="text-body font-semibold text-primary">{time}</Text>
    </View>
  );
}

export default PrayerRow;
