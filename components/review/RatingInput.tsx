import { Pressable, View } from "react-native";

import { Text } from "../Text";

/**
 * Interactive star picker for the write-review form. The display-only `Stars`
 * can't capture input, so this renders five tappable ★ glyphs (same glyph/tone
 * as `Stars` for visual consistency). 0 = unrated.
 */
export type RatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  className?: string;
};

export function RatingInput({ value, onChange, size = 36, className }: RatingInputProps) {
  return (
    <View className={`flex-row gap-2${className ? ` ${className}` : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          accessibilityRole="button"
          accessibilityLabel={`${n}`}
          accessibilityState={{ selected: n <= value }}
          hitSlop={6}
          onPress={() => onChange(n)}
        >
          <Text
            style={{ fontSize: size, lineHeight: size * 1.1 }}
            className={n <= value ? "text-accent-gold" : "text-border"}
          >
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default RatingInput;
