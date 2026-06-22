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
      // Icon left-aligned (not centered) so the chevron sits on the screen's
      // content margin, in line with the title/content below it (the touch
      // target still extends to the right). Centering pushed it ~6px inward.
      className="h-9 w-9 items-start justify-center"
    >
      <Feather name="chevron-left" size={24} color={c["text-primary"]} />
    </Pressable>
  );
}

export default BackButton;
