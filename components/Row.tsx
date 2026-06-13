import { type ReactNode } from "react";
import { Pressable, type PressableProps, View } from "react-native";

import { Text } from "./Text";

/**
 * Generic settings/contact row from the Content & Community kit. Place inside
 * a <Card> to get dividers and rounded corners. Supports a leading `icon`, a
 * `title` with optional `subtitle` (stacked), an inline `value`, and a
 * `trailing` node (chevron, <Switch />, …).
 */
export type RowProps = PressableProps & {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  trailing?: ReactNode;
  className?: string;
};

export function Row({ icon, title, subtitle, value, trailing, className, ...props }: RowProps) {
  return (
    <Pressable
      className={`flex-row items-center gap-3 px-4 py-[13px] active:bg-primary-soft${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      {icon}
      <View className="flex-1 gap-0.5">
        <Text className="text-body font-medium text-content-primary">{title}</Text>
        {subtitle ? (
          <Text className="text-caption font-regular text-content-secondary">{subtitle}</Text>
        ) : null}
      </View>
      {value ? <Text className="text-sm font-regular text-content-muted">{value}</Text> : null}
      {trailing}
    </Pressable>
  );
}

export default Row;
