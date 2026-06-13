import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

/**
 * Facility tag from the Content & Community kit. `present` shows the brand fill
 * with a check; absent dims to a muted, faded chip. Generic over the type
 * `icon` node.
 */
export type FacilityChipProps = {
  label: string;
  icon?: ReactNode;
  present?: boolean;
  className?: string;
};

export function FacilityChip({ label, icon, present = true, className }: FacilityChipProps) {
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-sm px-3 py-[7px] ${
        present ? "border border-primary bg-primary-soft" : "border border-border bg-surface opacity-[0.65]"
      }${className ? ` ${className}` : ""}`}
    >
      {present ? <Text className="text-[13px] font-bold text-primary">✓</Text> : null}
      {icon}
      <Text className={`text-caption font-medium ${present ? "text-primary" : "text-content-muted"}`}>
        {label}
      </Text>
    </View>
  );
}

export default FacilityChip;
