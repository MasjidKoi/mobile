import { View } from "react-native";

import { Text } from "./Text";

/**
 * Compact stat card from the Donation kit (dashboard totals): a label over a
 * value. Use several side-by-side — each flexes to fill its row.
 */
export type StatCardProps = {
  label: string;
  value: string;
  className?: string;
};

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <View
      className={`flex-1 gap-0.5 rounded-md border border-border bg-surface px-3.5 py-3${
        className ? ` ${className}` : ""
      }`}
    >
      <Text className="text-[12px] font-regular text-content-muted">{label}</Text>
      <Text className="text-heading font-bold text-content-primary">{value}</Text>
    </View>
  );
}

export default StatCard;
