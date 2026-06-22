import { View } from "react-native";

import { useColors } from "@/lib/theme/useColors";
import { Text } from "./Text";

/**
 * Star rating display from the Content & Community kit. Dependency-free —
 * uses ★ glyphs so no icon library is required. `rating` is rounded to the
 * nearest whole star.
 */
export type StarsProps = {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
};

export function Stars({ rating, max = 5, size = 16, className }: StarsProps) {
  const c = useColors();
  const filled = Math.round(rating);
  return (
    <View className={`flex-row items-center gap-0.5${className ? ` ${className}` : ""}`}>
      {Array.from({ length: max }, (_, i) => (
        <Text
          key={i}
          style={{ fontSize: size, lineHeight: size, color: i < filled ? c["accent-gold"] : c.border }}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

export default Stars;
