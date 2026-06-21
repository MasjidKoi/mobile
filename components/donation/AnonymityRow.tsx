import { Feather } from "@expo/vector-icons";
import { View } from "react-native";

import { Switch, Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/** "Donate anonymously" toggle row (35). Defaults from the user's saved pref. */
export type AnonymityRowProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  hint?: string;
  className?: string;
};

export function AnonymityRow({ value, onValueChange, label, hint, className }: AnonymityRowProps) {
  const c = useColors();
  return (
    <View
      className={`flex-row items-center gap-3 rounded-md border border-border bg-surface px-4 py-3.5${
        className ? ` ${className}` : ""
      }`}
    >
      <Feather name={value ? "eye-off" : "eye"} size={18} color={c["text-secondary"]} />
      <View className="flex-1 gap-0.5">
        <Text variant="body" className="font-medium">
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" className="text-content-secondary">
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default AnonymityRow;
