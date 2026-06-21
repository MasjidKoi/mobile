import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Button, Input, ReflectionCard, Text } from "@/components";
import { useWeeklyReflection } from "@/hooks/useWeeklyReflection";
import { parseIso } from "@/lib/journal/dates";
import { hasReflectionContent } from "@/lib/reflection/compute";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/** 110 Weekly Reflection — auto stats from this week's journal + free-text saved
 * into the week-end entry's note (no backend reflections endpoint). */
export default function WeeklyReflectionScreen() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { week, stats, reflection, isLoading, save } = useWeeklyReflection();

  // Narrow weekday label for the chart (UTC-anchored to match parseIso's date).
  const dayLabel = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, { weekday: "narrow", timeZone: "UTC" }).format(
        parseIso(dateStr),
      );
    } catch {
      return dateStr.slice(8);
    }
  };

  const [insights, setInsights] = useState(reflection.insights);
  const [gratitude, setGratitude] = useState(reflection.gratitude);
  const [nextWeek, setNextWeek] = useState(reflection.nextWeek);

  // Sync once the stored reflection loads.
  useEffect(() => {
    setInsights(reflection.insights);
    setGratitude(reflection.gratitude);
    setNextWeek(reflection.nextWeek);
  }, [reflection.insights, reflection.gratitude, reflection.nextWeek]);

  const quranSummary = Object.entries(stats.quranByUnit)
    .map(([unit, n]) => `${f.number(n)} ${t(`journal.units.${unit}`)}`)
    .join(" · ");

  const onSave = () => {
    save.mutate(
      { insights, gratitude, nextWeek },
      { onSuccess: () => router.back() },
    );
  };

  const dirty =
    insights !== reflection.insights ||
    gratitude !== reflection.gratitude ||
    nextWeek !== reflection.nextWeek;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("reflection.title")} left={<BackButton />} />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : stats.daysElapsed === 0 || (stats.prayersLogged === 0 && !hasReflectionContent(reflection)) ? (
        <View className="flex-1 items-center justify-center px-lg">
          <Text variant="body" className="text-center text-content-secondary">
            {t("reflection.empty")}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-10">
          {/* Auto-computed stats */}
          <ReflectionCard
            title={t("reflection.stats.prayers")}
            date={t("reflection.weekOf", { date: f.date(parseIso(week.start)) })}
            stat={t("reflection.stats.percent", { percent: f.number(stats.prayerPercent) })}
            note={t("reflection.stats.completeDays", { n: f.number(stats.completeDays) })}
          />

          {/* Per-day prayer chart: green = all 5 logged, gold = partial. */}
          <View className="gap-3 rounded-md border border-border bg-surface px-4 py-4">
            <Text variant="caption" className="font-semibold text-content-secondary">
              {t("reflection.stats.chartTitle")}
            </Text>
            <View className="flex-row items-end justify-between">
              {stats.byDay.map((d) => {
                const filled = d.count > 0;
                const barColor = !filled ? "#E4E9E5" : d.complete ? c.primary : "#B98E2F";
                const barHeight = filled ? Math.max(10, Math.round((d.count / 5) * 64)) : 6;
                return (
                  <View key={d.date} className="items-center gap-1.5">
                    <View className="justify-end" style={{ height: 64 }}>
                      <View
                        style={{ width: 22, height: barHeight, backgroundColor: barColor, borderRadius: 4 }}
                      />
                    </View>
                    <Text variant="micro">{dayLabel(d.date)}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {quranSummary ? (
            <View className="flex-row items-center justify-between rounded-md border border-border bg-surface px-4 py-3">
              <Text variant="body" className="text-content-secondary">
                {t("reflection.stats.quran")}
              </Text>
              <Text variant="body" className="font-semibold text-primary">
                {quranSummary}
              </Text>
            </View>
          ) : null}

          {/* Free-text reflection */}
          <View className="gap-1.5">
            <Text variant="caption" className="font-semibold text-content-secondary">
              {t("reflection.insights.label")}
            </Text>
            <Input
              value={insights}
              onChangeText={setInsights}
              placeholder={t("reflection.insights.placeholder")}
              multiline
              numberOfLines={3}
            />
          </View>
          <View className="gap-1.5">
            <Text variant="caption" className="font-semibold text-content-secondary">
              {t("reflection.gratitude.label")}
            </Text>
            <Input
              value={gratitude}
              onChangeText={setGratitude}
              placeholder={t("reflection.gratitude.placeholder")}
              multiline
              numberOfLines={3}
            />
          </View>
          <View className="gap-1.5">
            <Text variant="caption" className="font-semibold text-content-secondary">
              {t("reflection.nextWeek.label")}
            </Text>
            <Input
              value={nextWeek}
              onChangeText={setNextWeek}
              placeholder={t("reflection.nextWeek.placeholder")}
              multiline
              numberOfLines={3}
            />
          </View>

          <Button
            label={t("reflection.save")}
            disabled={!dirty || save.isPending}
            onPress={onSave}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
