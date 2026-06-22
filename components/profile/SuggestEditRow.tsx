import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/**
 * The "Suggest an edit" entry row at the foot of the profile (design 20). Open
 * to guests (no login gate) — a wrong phone number reported anonymously is
 * still a fix.
 */
export function SuggestEditRow({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-md border border-border bg-surface px-4 py-3.5"
    >
      <Feather name="edit-3" size={18} color={c["text-secondary"]} />
      <View className="flex-1">
        <Text className="text-caption font-medium text-content-secondary">
          {t("masjid.suggestEdit.row")}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={c["text-muted"]} />
    </Pressable>
  );
}

export default SuggestEditRow;
