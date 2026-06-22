import { Feather } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { StatusBadge, Text, type StatusTone } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/** A donation row in the dashboard history list (49). */
export type DonationHistoryRowProps = {
  title: string;
  dateLabel: string;
  amountLabel: string;
  statusLabel: string;
  statusTone: StatusTone;
  onPress?: () => void;
  className?: string;
};

export function DonationHistoryRow({
  title,
  dateLabel,
  amountLabel,
  statusLabel,
  statusTone,
  onPress,
  className,
}: DonationHistoryRowProps) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-md border border-border bg-surface px-3.5 py-3${
        className ? ` ${className}` : ""
      }`}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
        <Feather name="heart" size={15} color={c.primary} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="body" numberOfLines={1} className="font-medium">
          {title}
        </Text>
        <Text variant="caption" className="text-content-secondary">
          {dateLabel}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text variant="body" className="font-semibold">
          {amountLabel}
        </Text>
        <StatusBadge tone={statusTone} label={statusLabel} />
      </View>
    </Pressable>
  );
}

export default DonationHistoryRow;
