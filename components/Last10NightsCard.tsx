import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

/**
 * "Last 10 Nights" nudge card from the Donation kit: a brand-background row
 * with an icon, title + subtitle, and a light CTA. Pass the CTA as `action`.
 */
export type Last10NightsCardProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export function Last10NightsCard({ icon, title, subtitle, action, className }: Last10NightsCardProps) {
  return (
    <View
      className={`flex-row items-center gap-3 rounded-lg bg-primary px-4 py-3.5${
        className ? ` ${className}` : ""
      }`}
    >
      {icon}
      <View className="flex-1 gap-px">
        <Text className="text-body font-bold text-on-inverse">{title}</Text>
        {subtitle ? (
          <Text className="text-[12px] font-regular text-on-inverse-muted">{subtitle}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export default Last10NightsCard;
