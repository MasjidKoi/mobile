import { View } from "react-native";

/**
 * Progress bar from the Ibadah/Donation kits. `value` is 0–1. Shared by
 * GoalCard and CampaignCard.
 */
export type ProgressBarProps = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View className={`h-2 overflow-hidden rounded-[4px] bg-[#EDEFEC]${className ? ` ${className}` : ""}`}>
      <View className="h-full rounded-[4px] bg-primary" style={{ width: `${pct}%` }} />
    </View>
  );
}

export default ProgressBar;
