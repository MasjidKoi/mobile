import { Pressable, View } from "react-native";

import { Text } from "./Text";

/**
 * Numeric stepper from the Ibadah & Gamification kit: −, a value, and +.
 * Generic and controlled via `value` / `onChange`, clamped to `min`/`max`.
 * `format` renders the value (e.g. with a unit).
 */
export type StepperProps = {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  className?: string;
};

export function Stepper({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  format,
  className,
}: StepperProps) {
  const text = format ? format(value) : String(value);
  return (
    <View className={`flex-row items-center${className ? ` ${className}` : ""}`}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange?.(Math.max(min, value - step))}
        className="h-[34px] w-[34px] items-center justify-center rounded-l-sm bg-[#EDEFEC]"
      >
        <Text className="text-content-secondary" style={{ fontSize: 18, lineHeight: 18 }}>
          −
        </Text>
      </Pressable>
      <View className="h-[34px] w-14 items-center justify-center border-y border-[#EDEFEC] bg-surface">
        <Text className="text-body font-bold text-content-primary">{text}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange?.(Math.min(max, value + step))}
        className="h-[34px] w-[34px] items-center justify-center rounded-r-sm bg-primary"
      >
        <Text className="text-on-inverse" style={{ fontSize: 18, lineHeight: 18 }}>
          +
        </Text>
      </Pressable>
    </View>
  );
}

export default Stepper;
