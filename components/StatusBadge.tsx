import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

/**
 * Status badge from the Map & Discovery kit (submission / moderation states).
 * Generic with three tones: pending (gold), approved (green), rejected (red).
 * The `icon` node is passed in colored to match.
 */
export type StatusTone = "pending" | "approved" | "rejected";

const TONE: Record<StatusTone, { bg: string; text: string }> = {
  pending: { bg: "bg-accent-gold-soft", text: "text-[#8A6A1F]" },
  approved: { bg: "bg-primary-soft", text: "text-primary" },
  rejected: { bg: "bg-error-soft", text: "text-error" },
};

export type StatusBadgeProps = {
  tone: StatusTone;
  icon?: ReactNode;
  label: string;
  className?: string;
};

export function StatusBadge({ tone, icon, label, className }: StatusBadgeProps) {
  const t = TONE[tone];
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full px-3 py-[5px] ${t.bg}${
        className ? ` ${className}` : ""
      }`}
    >
      {icon}
      <Text className={`text-caption font-semibold ${t.text}`}>{label}</Text>
    </View>
  );
}

export default StatusBadge;
