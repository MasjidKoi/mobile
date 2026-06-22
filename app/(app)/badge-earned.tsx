import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, MilestoneDuaCard, Text } from "@/components";
import { BADGE_META, type BadgeType } from "@/lib/badges/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/** 105 Badge Earned — celebration modal. Reached from the badge-celebration
 * watcher on Journal Today with the freshly-earned `type` + `tier`. */
export default function BadgeEarnedScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { type, tier } = useLocalSearchParams<{ type: string; tier: string }>();
  const badgeType = type as BadgeType;
  const meta = BADGE_META[badgeType];
  const name = meta ? t(`badges.families.${meta.key}.name`) : t("badges.title");

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-5 px-lg">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-accent-gold-soft">
          <Feather name={meta?.icon ?? "award"} size={44} color="#8A6A1F" />
        </View>
        <View className="items-center gap-1.5">
          <Text variant="title" className="text-center">
            {t("badges.earnedModal.title")}
          </Text>
          <Text variant="body" className="text-center text-content-secondary">
            {t("badges.earnedModal.body", { name, tier: f.number(Number(tier) || 1) })}
          </Text>
        </View>
        <MilestoneDuaCard
          icon={<Feather name="star" size={24} color={c["on-inverse"]} />}
          title={name}
          text={meta ? t(`badges.families.${meta.key}.criteria`) : ""}
        />
      </View>

      <View className="gap-2 px-4 pb-2">
        <Button
          label={t("badges.earnedModal.cta")}
          onPress={() =>
            router.replace({ pathname: "/badges/[type]", params: { type: badgeType } })
          }
        />
        <Button variant="text" label={t("badges.earnedModal.dismiss")} onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}
