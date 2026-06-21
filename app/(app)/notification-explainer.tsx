import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import {
  PermissionExplainer,
  type PermissionBenefit,
} from "@/components/permissions/PermissionExplainer";
import { useColors } from "@/lib/theme/useColors";

const ICONS: (keyof typeof Feather.glyphMap)[] = ["bell", "sliders", "bell-off"];

/**
 * 12 Notification Explainer. Built now and previewable; the live OS permission
 * request + push-token registration are wired at point-of-use in Phase 4
 * (prayer reminders).
 */
export default function NotificationExplainer() {
  const { t } = useTranslation();
  const c = useColors();
  const texts = t("permissions.notification.benefits", { returnObjects: true }) as string[];
  const benefits: PermissionBenefit[] = ICONS.map((icon, i) => ({ icon, text: texts[i] ?? "" }));

  const close = () => router.back();

  return (
    <PermissionExplainer
      illustration={
        <View className="h-44 items-center justify-center rounded-2xl border border-border bg-primary-soft">
          <Feather name="bell" size={48} color={c.primary} />
        </View>
      }
      title={t("permissions.notification.title")}
      benefits={benefits}
      primaryLabel={t("permissions.notification.enable")}
      secondaryLabel={t("permissions.notification.notNow")}
      onPrimary={close}
      onSecondary={close}
      onClose={close}
    />
  );
}
