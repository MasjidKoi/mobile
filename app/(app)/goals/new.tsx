import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Button, Input, SegmentedControl, Stepper, Text } from "@/components";
import { useCreateGoal } from "@/hooks/useGoals";
import { customGoalSchema, zodResolver, type CustomGoalValues } from "@/lib/forms/schemas";
import type { GoalCreate } from "@/lib/goals/types";
import { addDays, dhakaToday, parseIso } from "@/lib/journal/dates";
import { QURAN_UNITS, type QuranUnit } from "@/lib/journal/types";
import { useFormat } from "@/lib/i18n/format";

const DEFAULT_DAYS = 30;

/** 109 Create Custom Goal — a single form switching between reading + habit goals. */
export default function CreateGoalScreen() {
  const { t } = useTranslation();
  const f = useFormat();
  const create = useCreateGoal();
  const today = dhakaToday();
  const [days, setDays] = useState(DEFAULT_DAYS);

  const { control, handleSubmit, watch, setValue, formState } = useForm<CustomGoalValues>({
    resolver: zodResolver(customGoalSchema),
    defaultValues: {
      title: "",
      goal_kind: "quran_quantity",
      target_amount: 50,
      unit: "pages",
      start_date: today,
      end_date: addDays(today, DEFAULT_DAYS - 1),
      recurrence: "daily",
    },
  });

  const kind = watch("goal_kind");
  const target = watch("target_amount") ?? 0;
  const unit = (watch("unit") ?? "pages") as QuranUnit;
  const recurrence = watch("recurrence") ?? "daily";
  const end = addDays(today, days - 1);
  const errors = formState.errors;

  const setDuration = (d: number) => {
    setDays(d);
    setValue("end_date", addDays(today, d - 1));
  };

  const onSubmit = handleSubmit((v) => {
    const body: GoalCreate =
      v.goal_kind === "quran_quantity"
        ? {
            goal_kind: "quran_quantity",
            title: v.title,
            target_amount: v.target_amount as number,
            unit: v.unit as QuranUnit,
            start_date: v.start_date as string,
            end_date: v.end_date as string,
          }
        : { goal_kind: "recurring", title: v.title, recurrence: v.recurrence as "daily" | "weekly" };
    create.mutate(body, {
      onSuccess: (goal) => router.replace({ pathname: "/goals/[id]", params: { id: goal.goal_id } }),
    });
  });

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("goals.create.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-8">
        {/* Name */}
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <View className="gap-1.5">
              <Input
                label={t("goals.create.name")}
                placeholder={t("goals.create.namePlaceholder")}
                value={field.value}
                onChangeText={field.onChange}
              />
              {errors.title ? (
                <Text className="text-caption text-error">{t(errors.title.message ?? "")}</Text>
              ) : null}
            </View>
          )}
        />

        {/* Type */}
        <View className="gap-1.5">
          <Text variant="caption" className="font-semibold text-content-secondary">
            {t("goals.create.type")}
          </Text>
          <SegmentedControl
            fill
            value={kind}
            onChange={(k) => setValue("goal_kind", k as CustomGoalValues["goal_kind"])}
            options={[
              { key: "quran_quantity", label: t("goals.kind.quran_quantity") },
              { key: "recurring", label: t("goals.kind.recurring") },
            ]}
          />
        </View>

        {kind === "quran_quantity" ? (
          <>
            {/* Target + unit */}
            <View className="gap-1.5">
              <Text variant="caption" className="font-semibold text-content-secondary">
                {t("goals.create.target")}
              </Text>
              <View className="flex-row items-center justify-between rounded-md border border-border bg-surface px-4 py-3">
                <Text variant="body" className="text-content-secondary">
                  {t(`goals.units.${unit}`)}
                </Text>
                <Stepper
                  value={target}
                  min={1}
                  max={10000}
                  step={1}
                  onChange={(v) => setValue("target_amount", v)}
                  format={(v) => f.number(v)}
                />
              </View>
              {errors.target_amount ? (
                <Text className="text-caption text-error">{t(errors.target_amount.message ?? "")}</Text>
              ) : null}
            </View>
            <SegmentedControl
              fill
              value={unit}
              onChange={(u) => setValue("unit", u as QuranUnit)}
              options={QURAN_UNITS.map((u) => ({ key: u, label: t(`goals.units.${u}`) }))}
            />

            {/* Duration */}
            <View className="gap-1.5">
              <Text variant="caption" className="font-semibold text-content-secondary">
                {t("goals.create.end")}
              </Text>
              <View className="flex-row items-center justify-between rounded-md border border-border bg-surface px-4 py-3">
                <Text variant="caption" className="text-content-muted">
                  {f.date(parseIso(today))} – {f.date(parseIso(end))}
                </Text>
                <Stepper value={days} min={1} max={365} onChange={setDuration} format={(v) => f.number(v)} />
              </View>
            </View>
          </>
        ) : (
          <View className="gap-1.5">
            <Text variant="caption" className="font-semibold text-content-secondary">
              {t("goals.create.frequency")}
            </Text>
            <SegmentedControl
              fill
              value={recurrence}
              onChange={(r) => setValue("recurrence", r as "daily" | "weekly")}
              options={[
                { key: "daily", label: t("goals.recurrence.daily") },
                { key: "weekly", label: t("goals.recurrence.weekly") },
              ]}
            />
          </View>
        )}

        <Button label={t("goals.create.submit")} disabled={create.isPending} onPress={onSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}
