import { type ReactNode } from "react";
import { Pressable, type PressableProps, View } from "react-native";

import { Text } from "./Text";

/**
 * Home hero card from the Map & Discovery kit: the nearest masjid on a brand
 * background with a prayer countdown and a status pill. Generic over its data;
 * `arrow`/`statusIcon` are passed as nodes.
 */
export type NearestMasjidCardProps = PressableProps & {
  kicker: string;
  name: string;
  prayerLabel: string;
  countdown: string;
  statusLabel: string;
  statusIcon?: ReactNode;
  arrow?: ReactNode;
  className?: string;
};

export function NearestMasjidCard({
  kicker,
  name,
  prayerLabel,
  countdown,
  statusLabel,
  statusIcon,
  arrow,
  className,
  ...props
}: NearestMasjidCardProps) {
  return (
    <Pressable
      className={`gap-3.5 rounded-lg bg-primary p-[18px]${className ? ` ${className}` : ""}`}
      {...props}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-[12px] font-semibold text-on-inverse-muted">{kicker}</Text>
        {arrow}
      </View>
      <Text className="text-[20px] font-bold text-on-inverse">{name}</Text>
      <View className="flex-row items-end justify-between">
        <View className="gap-0.5">
          <Text className="text-caption font-regular text-on-inverse-muted">{prayerLabel}</Text>
          <Text className="text-display font-bold text-on-inverse">{countdown}</Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-full bg-overlay px-3 py-1.5">
          {statusIcon}
          <Text className="text-caption font-semibold text-accent-gold-soft">{statusLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default NearestMasjidCard;
