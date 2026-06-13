import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

/**
 * Toggle switch from the Content & Community kit. Controlled via `value` /
 * `onValueChange`; the knob animates between states (built-in Animated, no
 * extra deps).
 */
export type SwitchProps = {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
};

/** Knob travel = track(44) − knob(20) − padding(3·2). */
const TRAVEL = 18;

export function Switch({ value, onValueChange, disabled, className }: SwitchProps) {
  const x = useRef(new Animated.Value(value ? TRAVEL : 0)).current;

  useEffect(() => {
    Animated.timing(x, {
      toValue: value ? TRAVEL : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [value, x]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange?.(!value)}
      className={`h-[26px] w-11 justify-center rounded-full p-[3px] ${
        value ? "bg-primary" : "bg-[#D6DBD7]"
      }${disabled ? " opacity-50" : ""}${className ? ` ${className}` : ""}`}
    >
      <Animated.View
        style={{ transform: [{ translateX: x }] }}
        className="h-5 w-5 rounded-full bg-surface"
      />
    </Pressable>
  );
}

export default Switch;
