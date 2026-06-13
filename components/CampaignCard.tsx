import { type ReactNode } from "react";
import { View } from "react-native";

import { ProgressBar } from "./ProgressBar";
import { Text } from "./Text";

/**
 * Fundraising campaign card from the Donation kit: name + days-left, a percent
 * badge, a progress bar, and a raised/goal line with an action. Generic —
 * `action` is the donate CTA (active) or a funded badge (funded). `value` 0–1.
 */
export type CampaignCardProps = {
  name: string;
  daysLabel?: string;
  percentLabel?: string;
  value: number;
  raisedLabel: string;
  action?: ReactNode;
  className?: string;
};

export function CampaignCard({
  name,
  daysLabel,
  percentLabel,
  value,
  raisedLabel,
  action,
  className,
}: CampaignCardProps) {
  return (
    <View
      className={`gap-3 rounded-lg border border-border bg-surface p-4${
        className ? ` ${className}` : ""
      }`}
    >
      <View className="flex-row items-center gap-2.5">
        <View className="flex-1 gap-px">
          <Text className="text-body font-semibold text-content-primary">{name}</Text>
          {daysLabel ? (
            <Text className="text-[12px] font-regular text-content-muted">{daysLabel}</Text>
          ) : null}
        </View>
        {percentLabel ? (
          <View className="rounded-full bg-accent-gold-soft px-2.5 py-1">
            <Text className="text-[12px] font-semibold text-[#8A6A1F]">{percentLabel}</Text>
          </View>
        ) : null}
      </View>
      <ProgressBar value={value} />
      <View className="flex-row items-center justify-between">
        <Text className="text-caption font-semibold text-content-primary">{raisedLabel}</Text>
        {action}
      </View>
    </View>
  );
}

export default CampaignCard;
