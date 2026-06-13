import { type ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { Text } from "./Text";

/**
 * Section header from the Content & Community kit: a title with an optional
 * trailing action (e.g. a "see all" link). Generic — pass the link as
 * `action`.
 */
export type SectionHeaderProps = ViewProps & {
  title: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ title, action, className, ...props }: SectionHeaderProps) {
  return (
    <View
      className={`flex-row items-center justify-between${className ? ` ${className}` : ""}`}
      {...props}
    >
      <Text className="text-heading font-semibold text-content-primary">{title}</Text>
      {action}
    </View>
  );
}

export default SectionHeader;
