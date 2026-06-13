import { type ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { Text } from "./Text";

/**
 * Top app bar from the Mobile Components kit. Generic: pass a `title` and
 * optional `left`/`right` nodes (e.g. a back button, overflow menu).
 */
export type AppBarProps = ViewProps & {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export function AppBar({ title, left, right, className, ...props }: AppBarProps) {
  return (
    <View
      className={`h-16 flex-row items-center gap-md bg-background px-4${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      {left}
      <Text variant="heading" className="flex-1" numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

export default AppBar;
