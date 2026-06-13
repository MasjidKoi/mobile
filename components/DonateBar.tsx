import { type ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { Text } from "./Text";

/**
 * Sticky donate bar from the Content & Community kit: a label + payment hint on
 * the left and an action on the right. Generic — pass the CTA as `action`
 * (typically a <Button />).
 */
export type DonateBarProps = ViewProps & {
  label: string;
  hint: string;
  action?: ReactNode;
  className?: string;
};

export function DonateBar({ label, hint, action, className, ...props }: DonateBarProps) {
  return (
    <View
      className={`flex-row items-center gap-3 border-t border-border bg-surface px-4 py-3${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      <View className="flex-1 gap-px">
        <Text className="text-[12px] font-regular text-content-secondary">{label}</Text>
        <Text className="text-sm font-semibold text-content-primary">{hint}</Text>
      </View>
      {action}
    </View>
  );
}

export default DonateBar;
