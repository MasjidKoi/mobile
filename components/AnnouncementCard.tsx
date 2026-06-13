import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

/**
 * Feed announcement from the Content & Community kit: a masjid avatar + name +
 * timestamp header, a title, and body text. Generic over its content;
 * `avatar` is passed as a node inside the soft-green circle.
 */
export type AnnouncementCardProps = {
  masjid: string;
  time: string;
  title: string;
  body: string;
  avatar?: ReactNode;
  className?: string;
};

export function AnnouncementCard({
  masjid,
  time,
  title,
  body,
  avatar,
  className,
}: AnnouncementCardProps) {
  return (
    <View
      className={`gap-2.5 rounded-md border border-border bg-surface p-4${
        className ? ` ${className}` : ""
      }`}
    >
      <View className="flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-primary-soft">
          {avatar}
        </View>
        <Text className="flex-1 text-caption font-semibold text-content-primary">{masjid}</Text>
        <Text className="text-[12px] font-regular text-content-muted">{time}</Text>
      </View>
      <Text className="text-body font-semibold text-content-primary">{title}</Text>
      <Text className="text-sm font-regular text-content-secondary">{body}</Text>
    </View>
  );
}

export default AnnouncementCard;
