import { Feather } from "@expo/vector-icons";
import { View } from "react-native";

import { Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/** "Goal reached" pill for a funded/completed campaign (45). */
export type FundedBadgeProps = {
  label: string;
  className?: string;
};

export function FundedBadge({ label, className }: FundedBadgeProps) {
  const c = useColors();
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5${
        className ? ` ${className}` : ""
      }`}
    >
      <Feather name="check-circle" size={14} color={c.primary} />
      <Text variant="caption" className="font-semibold text-primary">
        {label}
      </Text>
    </View>
  );
}

export default FundedBadge;
