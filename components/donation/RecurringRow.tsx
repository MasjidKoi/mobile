import { Feather } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/** A reminder schedule row in the recurring manager (53). */
export type RecurringRowProps = {
  title: string;
  meta: string;
  active: boolean;
  toggleLabel: string;
  onToggle: () => void;
  onCancel?: () => void;
  className?: string;
};

export function RecurringRow({
  title,
  meta,
  active,
  toggleLabel,
  onToggle,
  onCancel,
  className,
}: RecurringRowProps) {
  const c = useColors();
  return (
    <View
      className={`flex-row items-center gap-3 rounded-md border border-border bg-surface px-3.5 py-3${
        className ? ` ${className}` : ""
      }`}
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${
          active ? "bg-primary-soft" : "bg-background"
        }`}
      >
        <Feather name="repeat" size={16} color={active ? c.primary : c["text-muted"]} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="body" numberOfLines={1} className="font-medium">
          {title}
        </Text>
        <Text variant="caption" className="text-content-secondary">
          {meta}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onToggle}
        className={`rounded-full px-3 py-1.5 ${active ? "bg-background" : "bg-primary"}`}
      >
        <Text variant="caption" className={`font-semibold ${active ? "text-content-secondary" : "text-on-inverse"}`}>
          {toggleLabel}
        </Text>
      </Pressable>
      {onCancel ? (
        <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={10}>
          <Feather name="trash-2" size={16} color={c["text-muted"]} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default RecurringRow;
