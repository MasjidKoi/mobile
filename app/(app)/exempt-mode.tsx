import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Button, Chip, SectionHeader, Stepper, Text } from "@/components";
import { useExemptMode } from "@/hooks/useStreak";
import { addDays, dhakaToday, parseIso } from "@/lib/journal/dates";
import { EXEMPT_REASONS, type ExemptReason } from "@/lib/journal/exemptStore";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

const MAX_DAYS = 14;

/** 98 Exempt Mode — mark a forward range of days as protected (server) with a
 * private reason (device-local). Anchored at today so finalized days aren't hit. */
export default function ExemptModeScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const exempt = useExemptMode();

  const [reason, setReason] = useState<ExemptReason>("menstruation");
  const [days, setDays] = useState(7);

  const start = dhakaToday();
  const end = addDays(start, days - 1);

  const apply = () => {
    exempt.mutate({ start, end, reason }, { onSuccess: () => router.back() });
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("streak.exempt.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-8">
        {/* Intro explainer */}
        <View className="flex-row gap-3 rounded-lg bg-primary-soft p-4">
          <Feather name="calendar" size={20} color={c.primary} />
          <View className="flex-1 gap-1">
            <Text variant="body" className="font-semibold text-primary">
              {t("streak.exempt.introTitle")}
            </Text>
            <Text variant="caption" className="text-content-secondary">
              {t("streak.exempt.introBody")}
            </Text>
          </View>
        </View>

        <Text variant="body" className="text-content-secondary">
          {t("streak.exempt.subtitle")}
        </Text>

        <SectionHeader title={t("streak.exempt.reason")} />
        <View className="flex-row flex-wrap gap-2">
          {EXEMPT_REASONS.map((r) => (
            <Chip
              key={r}
              label={t(`streak.exempt.reasons.${r}`)}
              selected={reason === r}
              onPress={() => setReason(r)}
            />
          ))}
        </View>

        <SectionHeader title={t("streak.exempt.to")} className="mt-1" />
        <View className="flex-row items-center justify-between rounded-md border border-border bg-surface px-4 py-3">
          <View className="flex-1 gap-0.5">
            <Text variant="body" className="font-medium">
              {t("streak.dayUnit")}
            </Text>
            <Text variant="caption" className="text-content-muted">
              {f.date(parseIso(start))} – {f.date(parseIso(end))}
            </Text>
          </View>
          <Stepper value={days} min={1} max={MAX_DAYS} onChange={setDays} format={(v) => f.number(v)} />
        </View>

        <View className="flex-row items-center gap-2 rounded-md bg-primary-soft px-3.5 py-3">
          <Feather name="lock" size={15} color={c.primary} />
          <Text className="flex-1 text-caption font-medium text-primary">{t("streak.exempt.privacy")}</Text>
        </View>

        <Button
          label={exempt.isPending ? t("common.continue") : t("streak.exempt.apply")}
          disabled={exempt.isPending}
          onPress={apply}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
