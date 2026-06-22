import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, EmptyState, SectionHeader, Text } from "@/components";
import { RecurringRow } from "@/components/donation";
import { useMasjid } from "@/hooks/useMasjid";
import {
  useCancelRecurring,
  useRecurringSchedules,
  useUpdateRecurring,
} from "@/hooks/useRecurringSchedules";
import type { RecurringSchedule } from "@/lib/donations/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/** A single schedule row — resolves the masjid name (cached) for its own row. */
function ScheduleRow({
  schedule,
  onToggle,
  onCancel,
}: {
  schedule: RecurringSchedule;
  onToggle: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const f = useFormat();
  const masjid = useMasjid(schedule.masjid_id);
  const active = schedule.status === "active";
  return (
    <RecurringRow
      title={masjid.data?.name ?? t("common.brand")}
      meta={`${t(`donation.recurring.${schedule.frequency}`)} · ${f.currency(Number(schedule.amount) || 0)}`}
      active={active}
      toggleLabel={active ? t("donation.recurring.pause") : t("donation.recurring.resume")}
      onToggle={onToggle}
      onCancel={onCancel}
    />
  );
}

/** 53 Recurring Manager — list + pause/resume/cancel of reminder schedules. */
export default function RecurringManagerScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const q = useRecurringSchedules();
  const update = useUpdateRecurring();
  const cancel = useCancelRecurring();

  const items = q.data?.items ?? [];
  // Rough monthly-equivalent across active reminders (weekly≈4, nightly≈30).
  const monthlyEst = items
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      const a = Number(s.amount) || 0;
      return sum + (s.frequency === "monthly" ? a : s.frequency === "weekly" ? a * 4 : a * 30);
    }, 0);

  const backButton = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
      <Feather name="arrow-left" size={24} color={c["text-primary"]} />
    </Pressable>
  );
  const newButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("donation.recurring.newCta")}
      onPress={() => router.push("/explore")}
      hitSlop={12}
    >
      <Feather name="plus" size={22} color={c.primary} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("donation.recurring.managerTitle")} left={backButton} right={newButton} />
      {q.isLoading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="repeat" size={26} color={c.primary} />}
            title={t("donation.recurring.emptyTitle")}
            caption={t("donation.recurring.emptyCaption")}
          />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-3 px-4 py-3 pb-8">
          {monthlyEst > 0 ? (
            <View className="rounded-md bg-primary-soft px-4 py-3">
              <Text variant="caption" className="text-content-secondary">
                {t("donation.recurring.estMonthly", { amount: f.currency(Math.round(monthlyEst)) })}
              </Text>
            </View>
          ) : null}
          <SectionHeader title={t("donation.recurring.managerTitle")} />
          <View className="gap-2">
            {items.map((s) => (
              <ScheduleRow
                key={s.schedule_id}
                schedule={s}
                onToggle={() =>
                  update.mutate({
                    id: s.schedule_id,
                    body: { status: s.status === "active" ? "paused" : "active" },
                  })
                }
                onCancel={() => cancel.mutate(s.schedule_id)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
