import { type ReactNode } from "react";
import { View } from "react-native";

import { Stars } from "./Stars";
import { Text } from "./Text";

/**
 * User review from the Content & Community kit: avatar (or initials), name +
 * date, a star rating, and the review text. Generic over its content.
 */
export type ReviewCardProps = {
  name: string;
  date: string;
  rating: number;
  text: string;
  initials?: string;
  avatar?: ReactNode;
  className?: string;
};

export function ReviewCard({
  name,
  date,
  rating,
  text,
  initials,
  avatar,
  className,
}: ReviewCardProps) {
  return (
    <View
      className={`gap-2 rounded-md border border-border bg-surface p-4${
        className ? ` ${className}` : ""
      }`}
    >
      <View className="flex-row items-center gap-2.5">
        {avatar ??
          (initials ? (
            <View className="h-8 w-8 items-center justify-center rounded-full bg-accent-gold-soft">
              <Text className="text-caption font-bold text-[#8A6A1F]">{initials}</Text>
            </View>
          ) : null)}
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-semibold text-content-primary">{name}</Text>
          <Text className="text-[12px] font-regular text-content-muted">{date}</Text>
        </View>
        <Stars rating={rating} size={13} />
      </View>
      <Text className="text-sm font-regular text-content-secondary">{text}</Text>
    </View>
  );
}

export default ReviewCard;
