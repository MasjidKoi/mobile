import { type ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

import { Text } from "./Text";

/**
 * Location/sort dropdown pill from the Map & Discovery kit. Generic: a `label`
 * with optional leading `icon` and `trailing` node (e.g. a chevron).
 */
export type NearControlProps = PressableProps & {
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function NearControl({ label, icon, trailing, className, ...props }: NearControlProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-[14px] py-2${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      {icon}
      <Text className="text-caption font-semibold text-content-primary">{label}</Text>
      {trailing}
    </Pressable>
  );
}

export default NearControl;
