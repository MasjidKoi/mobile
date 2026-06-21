import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "../Text";

/**
 * "মসজিদকই" wordmark with the crescent-and-star brand mark. Used in the
 * onboarding chrome; light by default so it reads over dark photography, but
 * `tint` can be overridden for use on light auth screens.
 */
export type BrandLockupProps = {
  /** Colour of the mark glyph + wordmark. Default white. */
  tint?: string;
  className?: string;
};

export function BrandLockup({ tint = "#FFFFFF", className }: BrandLockupProps) {
  const { t } = useTranslation();
  return (
    <View className={`flex-row items-center gap-sm${className ? ` ${className}` : ""}`}>
      <View className="h-[27px] w-[27px] items-center justify-center rounded-sm border border-white/25 bg-white/10">
        <MaterialCommunityIcons name="star-crescent" size={15} color={tint} />
      </View>
      <Text className="font-bold text-heading" style={{ color: tint }}>
        {t("common.brand")}
      </Text>
    </View>
  );
}

export default BrandLockup;
