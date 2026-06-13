import { type ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Colors } from "@/constants/theme";

/**
 * Floating action button from the Mobile Components kit. Generic over its
 * `icon` node; carries the brand drop shadow. Override placement via
 * `className` (e.g. "absolute bottom-6 right-6").
 */
export type FabProps = Omit<PressableProps, "style"> & {
  icon: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const SHADOW: ViewStyle = {
  shadowColor: Colors.primary,
  shadowOpacity: 0.25,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
};

export function Fab({ icon, className, style, ...props }: FabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-14 w-14 items-center justify-center rounded-lg bg-primary active:bg-primary-pressed${
        className ? ` ${className}` : ""
      }`}
      style={style ? [SHADOW, style] : SHADOW}
      {...props}
    >
      {icon}
    </Pressable>
  );
}

export default Fab;
