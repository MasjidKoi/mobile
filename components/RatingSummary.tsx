import { type ReactNode } from "react";
import { View } from "react-native";

import { Stars } from "./Stars";
import { Text } from "./Text";

/**
 * Rating summary from the Content & Community kit: stars, the average, and an
 * optional review count. Pass a localized `countLabel` (e.g. "৩৮টি রিভিউ") or
 * a numeric `count` rendered in parentheses.
 */
export type RatingSummaryProps = {
  rating: number;
  count?: number;
  countLabel?: ReactNode;
  className?: string;
};

export function RatingSummary({ rating, count, countLabel, className }: RatingSummaryProps) {
  return (
    <View className={`flex-row items-center gap-2${className ? ` ${className}` : ""}`}>
      <Stars rating={rating} size={16} />
      <Text className="text-body font-bold text-content-primary">{rating.toFixed(1)}</Text>
      {countLabel != null ? (
        <Text className="text-caption font-regular text-content-muted">{countLabel}</Text>
      ) : count != null ? (
        <Text className="text-caption font-regular text-content-muted">({count})</Text>
      ) : null}
    </View>
  );
}

export default RatingSummary;
