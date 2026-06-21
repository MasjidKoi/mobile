import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

import { useColors } from "@/lib/theme/useColors";

/**
 * AppBar back affordance — a chevron that pops the stack. Shared so the icon,
 * tap target, hit-slop, and screen-reader label stay consistent across screens
 * (pass to `<AppBar left={<BackButton />} />`).
 */
export function BackButton({ onPress }: { onPress?: () => void }) {
  const { t } = useTranslation();
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("common.back")}
      onPress={onPress ?? (() => router.back())}
      hitSlop={8}
      className="h-9 w-9 items-center justify-center"
    >
      <Feather name="chevron-left" size={24} color={c["text-primary"]} />
    </Pressable>
  );
}

export default BackButton;
