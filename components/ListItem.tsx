import { type ReactNode } from "react";
import { Pressable, type PressableProps, View } from "react-native";

import { Text } from "./Text";

/**
 * List row from the Mobile Components kit. Generic: optional `leading` node
 * (avatar/icon), a `title` with optional `subtitle`, and an optional
 * `trailing` node (e.g. a chevron). Press handlers via Pressable props.
 */
export type ListItemProps = PressableProps & {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  className,
  ...props
}: ListItemProps) {
  return (
    <Pressable
      className={`flex-row items-center gap-md rounded-md border border-border bg-surface px-4 py-3 active:bg-primary-soft${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      {leading}
      <View className="flex-1 gap-0.5">
        <Text className="text-body font-semibold text-content-primary">{title}</Text>
        {subtitle ? (
          <Text className="text-caption font-regular text-content-secondary">{subtitle}</Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}

export default ListItem;
