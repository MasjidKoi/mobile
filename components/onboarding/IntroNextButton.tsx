import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, type PressableProps } from "react-native";

import { Colors } from "@/constants/theme";
import { Text } from "../Text";

/**
 * Advance control for the intro carousel. A 56pt white circle with a green
 * arrow on every slide except the last, which becomes a labelled "শুরু করুন"
 * pill that finishes onboarding.
 */
export type IntroNextButtonProps = Omit<PressableProps, "children"> & {
  /** Render the labelled CTA pill instead of the bare arrow circle. */
  isLast?: boolean;
};

export function IntroNextButton({ isLast = false, ...props }: IntroNextButtonProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isLast ? t("onboarding.start") : t("common.next")}
      className={`h-14 flex-row items-center justify-center gap-sm rounded-full bg-white active:opacity-90 ${
        isLast ? "px-lg" : "w-14"
      }`}
      {...props}
    >
      {isLast && (
        <Text className="font-bold text-base text-primary">{t("onboarding.start")}</Text>
      )}
      <Feather name="arrow-right" size={isLast ? 18 : 24} color={Colors.primary} />
    </Pressable>
  );
}

export default IntroNextButton;
