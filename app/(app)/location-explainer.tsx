import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import {
  PermissionExplainer,
  type PermissionBenefit,
} from "@/components/permissions/PermissionExplainer";
import { useColors } from "@/lib/theme/useColors";

const ICONS: (keyof typeof Feather.glyphMap)[] = ["map-pin", "navigation", "shield"];

/**
 * 10 Location Explainer. Built now and previewable; the live OS permission
 * request + city-picker fallback are wired at point-of-use in Phase 3 (map).
 */
export default function LocationExplainer() {
  const { t } = useTranslation();
  const c = useColors();
  const texts = t("permissions.location.benefits", { returnObjects: true }) as string[];
  const benefits: PermissionBenefit[] = ICONS.map((icon, i) => ({ icon, text: texts[i] ?? "" }));

  const close = () => router.back();

  return (
    <PermissionExplainer
      illustration={
        <View className="h-44 items-center justify-center rounded-2xl border border-border bg-primary-soft">
          <Feather name="map-pin" size={48} color={c.primary} />
        </View>
      }
      title={t("permissions.location.title")}
      benefits={benefits}
      primaryLabel={t("permissions.location.enable")}
      secondaryLabel={t("permissions.location.pickCity")}
      onPrimary={close}
      onSecondary={close}
      onClose={close}
    />
  );
}
