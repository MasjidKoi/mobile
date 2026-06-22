import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Card, ProgressBar, Row, Text } from "@/components";
import { useBadgeFamily } from "@/hooks/useBadges";
import { BADGE_META, type BadgeType } from "@/lib/badges/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/** 104 Badge Detail — earning criteria, progress, and earned tiers for a family. */
export default function BadgeDetailScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { type } = useLocalSearchParams<{ type: string }>();
  const badgeType = type as BadgeType;
  const meta = BADGE_META[badgeType];
  const { data: family, isLoading } = useBadgeFamily(badgeType);

  if (isLoading || !meta) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title={t("badges.title")} left={<BackButton />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const earned = (family?.current_tier ?? 0) > 0;
  const progressValue =
    family && family.next_threshold ? family.current_value / family.next_threshold : 1;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t(`badges.families.${meta.key}.name`)} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-10">
        {/* Hero */}
        <View className="items-center gap-2 py-2">
          <View
            className="h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: earned ? c["accent-gold-soft"] : "#EDEFEC" }}
          >
            <Feather name={meta.icon} size={36} color={earned ? "#8A6A1F" : c["text-muted"]} />
          </View>
          <Text variant="heading">{t(`badges.families.${meta.key}.name`)}</Text>
        </View>

        {/* Progress to next tier */}
        <Card>
          <View className="gap-2 p-4">
            <View className="flex-row items-center justify-between">
              <Text variant="caption" className="font-semibold text-content-secondary">
                {family?.next_threshold != null
                  ? t("badges.detail.nextTier", { threshold: f.number(family.next_threshold) })
                  : t("badges.detail.maxed")}
              </Text>
              {family ? (
                <Text variant="caption" className="text-content-muted">
                  {t("badges.progress", {
                    current: f.number(family.current_value),
                    target: f.number(family.next_threshold ?? family.current_value),
                  })}
                </Text>
              ) : null}
            </View>
            <ProgressBar value={progressValue} />
          </View>
        </Card>

        {/* Criteria */}
        <View className="gap-1.5">
          <Text variant="caption" className="font-semibold text-content-secondary">
            {t("badges.detail.criteria")}
          </Text>
          <Text variant="body" className="text-content-secondary">
            {t(`badges.families.${meta.key}.criteria`)}
          </Text>
        </View>

        {/* Tiers */}
        <Card>
          {meta.thresholds.map((threshold, i) => {
            const tier = i + 1;
            const earnedEntry = family?.earned.find((e) => e.tier === tier);
            return (
              <Row
                key={tier}
                icon={
                  <Feather
                    name={earnedEntry ? "check-circle" : "circle"}
                    size={18}
                    color={earnedEntry ? c.primary : c["text-muted"]}
                  />
                }
                title={`${t("badges.tierLabel", { tier: f.number(tier) })} · ${f.number(threshold)}`}
                value={earnedEntry ? t("badges.detail.earnedOn", { date: f.date(new Date(earnedEntry.earned_at)) }) : undefined}
              />
            );
          })}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
