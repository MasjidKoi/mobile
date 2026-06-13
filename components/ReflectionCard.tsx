import { View } from "react-native";

import { Text } from "./Text";

/**
 * Weekly reflection card from the Ibadah & Gamification kit: a title + date,
 * a headline stat, and a gentle (self-comparison) note.
 */
export type ReflectionCardProps = {
  title: string;
  date: string;
  stat: string;
  note: string;
  className?: string;
};

export function ReflectionCard({ title, date, stat, note, className }: ReflectionCardProps) {
  return (
    <View
      className={`gap-2.5 rounded-lg border border-border bg-surface p-4${
        className ? ` ${className}` : ""
      }`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-body font-semibold text-content-primary">{title}</Text>
        <Text className="text-[12px] font-regular text-content-muted">{date}</Text>
      </View>
      <Text className="text-title font-bold text-primary">{stat}</Text>
      <Text className="text-caption font-regular text-content-secondary">{note}</Text>
    </View>
  );
}

export default ReflectionCard;
