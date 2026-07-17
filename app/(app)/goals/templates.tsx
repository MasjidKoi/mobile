import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, BottomSheet, Button, Card, Row, Stepper, Text } from "@/components";
import { useCreateGoalFromTemplate } from "@/hooks/useGoals";
import { addDays, dhakaToday, parseIso } from "@/lib/journal/dates";
import { GOAL_TEMPLATES, type Goal, type GoalTemplateKey } from "@/lib/goals/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

const KHATM_DEFAULT_DAYS = 30;

/** 107 Goal Templates — three presets + a custom-goal entry. */
export default function GoalTemplatesScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const create = useCreateGoalFromTemplate();
  const [dateSheet, setDateSheet] = useState<GoalTemplateKey | null>(null);
  const [days, setDays] = useState(KHATM_DEFAULT_DAYS);

  const onCreated = (goal: Goal) =>
    router.replace({ pathname: "/goals/[id]", params: { id: goal.goal_id } });

  const choose = (key: GoalTemplateKey, requiresDateRange: boolean) => {
    // Guard against a rapid double-tap firing two creates before we navigate away.
    if (create.isPending) return;
    if (requiresDateRange) {
      setDays(KHATM_DEFAULT_DAYS);
      setDateSheet(key);
      return;
    }
    create.mutate({ template: key }, { onSuccess: onCreated });
  };

  const start = dhakaToday();
  const end = addDays(start, days - 1);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("goals.templates.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-3 px-4 py-3 pb-8">
        {GOAL_TEMPLATES.map((tpl) => (
          <Pressable
            key={tpl.key}
            accessibilityRole="button"
            disabled={create.isPending}
            onPress={() => choose(tpl.key, tpl.requiresDateRange)}
            className="flex-row items-center gap-3 rounded-lg border border-border bg-surface p-4 active:bg-primary-soft"
          >
            <View className="h-11 w-11 items-center justify-center rounded-md bg-primary-soft">
              <Feather name={tpl.icon as keyof typeof Feather.glyphMap} size={20} color={c.primary} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="body" className="font-semibold">
                {t(`goals.templates.${tpl.key}.name`)}
              </Text>
              <Text variant="caption" className="text-content-secondary">
                {t(`goals.templates.${tpl.key}.desc`)}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={c["text-muted"]} />
          </Pressable>
        ))}

        <Card className="mt-1">
          <Row
            icon={<Feather name="edit-3" size={18} color={c["accent-gold"]} />}
            title={t("goals.templates.custom")}
            trailing={<Feather name="chevron-right" size={20} color={c["text-muted"]} />}
            onPress={() => router.push("/goals/new")}
          />
        </Card>
      </ScrollView>

      {/* Date range for date-bound templates (Khatm). */}
      <BottomSheet visible={dateSheet !== null} onClose={() => setDateSheet(null)}>
        <View className="gap-4">
          <Text variant="heading">{t("goals.dateRange.title")}</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 gap-0.5">
              <Text variant="body" className="font-medium">
                {t("goals.dateRange.end")}
              </Text>
              <Text variant="caption" className="text-content-muted">
                {f.date(parseIso(start))} – {f.date(parseIso(end))}
              </Text>
            </View>
            <Stepper value={days} min={7} max={60} onChange={setDays} format={(v) => f.number(v)} />
          </View>
          <Button
            label={t("goals.dateRange.confirm")}
            disabled={create.isPending}
            onPress={() => {
              if (dateSheet) {
                create.mutate(
                  { template: dateSheet, start_date: start, end_date: end },
                  { onSuccess: onCreated },
                );
                setDateSheet(null);
              }
            }}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
