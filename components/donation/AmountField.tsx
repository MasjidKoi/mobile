import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Chip, Input } from "@/components";
import { AMOUNT_PRESETS } from "@/lib/donations/presets";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/**
 * Amount picker shared by the donate flow (35) and recurring setup (46): preset
 * chips + a sanitized numeric input. `onChange` always receives digits-only.
 */
export type AmountFieldProps = {
  /** Current raw amount text (digits). */
  value: string;
  /** Called with a digits-only string (preset tap or sanitized typing). */
  onChange: (next: string) => void;
  presets?: readonly number[];
  /** Center the preset row (donate screen) vs left-align (recurring setup). */
  centerPresets?: boolean;
  className?: string;
};

export function AmountField({
  value,
  onChange,
  presets = AMOUNT_PRESETS,
  centerPresets = false,
  className,
}: AmountFieldProps) {
  const { t } = useTranslation();
  const f = useFormat();
  const c = useColors();
  const amount = Number(value) || 0;

  return (
    <View className={`gap-2.5${className ? ` ${className}` : ""}`}>
      <View className={`flex-row flex-wrap gap-2${centerPresets ? " justify-center" : ""}`}>
        {presets.map((preset) => (
          <Chip
            key={preset}
            label={f.currency(preset)}
            selected={amount === preset}
            onPress={() => onChange(String(preset))}
          />
        ))}
      </View>
      <Input
        leftIcon={<Feather name="edit-2" size={16} color={c["text-muted"]} />}
        placeholder={t("donation.amount.customPlaceholder")}
        keyboardType="number-pad"
        value={value}
        onChangeText={(v) => onChange(v.replace(/[^0-9]/g, ""))}
      />
    </View>
  );
}

export default AmountField;
