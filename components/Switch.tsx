import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

/**
 * Toggle switch from the Content & Community kit. Controlled via `value` /
 * `onValueChange`; the knob animates between states (built-in Animated, no
 * extra deps).
 *
 * Geometry is set in explicit pixels via `style` — NOT Tailwind `w-*`/`h-*`
 * classes, which don't resolve to the expected px under this NativeWind spacing
 * scale (the track came out ~38px, not 44). The track clips the knob to its
 * rounded pill, so a travel computed against the wrong width shaved the knob's
 * right edge in the "on" state. Driving width/knob/travel from the constants
 * below keeps the knob concentric with the end caps (PAD clearance all round).
 */
export type SwitchProps = {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
};

const PAD = 4;
const KNOB = 20;
const TRACK_H = KNOB + PAD * 2; // 28
const TRACK_W = 46;
const TRAVEL = TRACK_W - KNOB - PAD * 2; // 18

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
      style={{ width: TRACK_W, height: TRACK_H, borderRadius: TRACK_H / 2, padding: PAD }}
      className={`justify-center ${value ? "bg-primary" : "bg-[#D6DBD7]"}${
        disabled ? " opacity-50" : ""
      }${className ? ` ${className}` : ""}`}
    >
      <Animated.View
        style={{
          width: KNOB,
          height: KNOB,
          borderRadius: KNOB / 2,
          transform: [{ translateX: x }],
        }}
        className="bg-surface"
      />
    </Pressable>
  );
}

export default Switch;
