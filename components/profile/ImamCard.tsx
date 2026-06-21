import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Card, SectionHeader, Text } from "@/components";
import type { ImamModel } from "@/lib/masjids/profile/facilityPresenter";
import { useColors } from "@/lib/theme/useColors";

/** Imam section (design 20): name, qualifications, languages — partials collapse. */
export function ImamCard({ imam }: { imam: ImamModel }) {
  const { t } = useTranslation();
  const c = useColors();

  return (
    <View className="gap-2.5">
      <SectionHeader title={t("masjid.profile.imam")} />
      <Card>
        <View className="flex-row items-center gap-3 p-4">
          <View className="h-[38px] w-[38px] items-center justify-center rounded-full bg-primary-soft">
            <Feather name="user" size={18} color={c.primary} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-content-primary">{imam.name}</Text>
            {imam.qualifications ? (
              <Text className="text-[12px] font-regular text-content-secondary">
                {imam.qualifications}
              </Text>
            ) : null}
            {imam.languages ? (
              <Text className="text-[12px] font-regular text-content-muted">
                {t("masjid.profile.languages")}: {imam.languages}
              </Text>
            ) : null}
          </View>
        </View>
      </Card>
    </View>
  );
}

export default ImamCard;
