import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

/**
 * Donation success moment from the Donation kit: a check circle, the amount,
 * the recipient, an optional campaign-impact pill, and an actions row (pass
 * buttons as `actions`, e.g. receipt + done).
 */
export type SuccessCardProps = {
  amount: string;
  to: string;
  icon?: ReactNode;
  campaign?: string;
  campaignIcon?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function SuccessCard({
  amount,
  to,
  icon,
  campaign,
  campaignIcon,
  actions,
  className,
}: SuccessCardProps) {
  return (
    <View
      className={`items-center gap-3.5 rounded-lg border border-border bg-surface p-6${
        className ? ` ${className}` : ""
      }`}
    >
      <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-soft">{icon}</View>
      <Text className="text-display font-bold text-content-primary">{amount}</Text>
      <Text className="text-center text-sm font-regular text-content-secondary">{to}</Text>
      {campaign ? (
        <View className="flex-row items-center gap-1.5 rounded-full bg-accent-gold-soft px-3.5 py-1.5">
          {campaignIcon}
          <Text className="text-caption font-semibold text-[#8A6A1F]">{campaign}</Text>
        </View>
      ) : null}
      {actions ? <View className="w-full flex-row gap-2.5">{actions}</View> : null}
    </View>
  );
}

export default SuccessCard;
