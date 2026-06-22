import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Button, Card, Dialog, ProgressBar, Row, StatusBadge, Text } from "@/components";
import { useDeleteGoal, useGoal, useToggleGoalCompletion, useUpdateGoal } from "@/hooks/useGoals";
import { dhakaToday, parseIso } from "@/lib/journal/dates";
import { isQuranProgress } from "@/lib/goals/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/** 108 Goal Detail (e.g. Khatm) — progress, pace, and lifecycle controls. */
export default function GoalDetailScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const goalId = id ?? "";
  const { data: goal, isLoading } = useGoal(goalId);
  const update = useUpdateGoal(goalId);
  const del = useDeleteGoal();
  const toggle = useToggleGoalCompletion(goalId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading || !goal) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title={t("goals.title")} left={<BackButton />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const paused = goal.status === "paused";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={goal.title} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-10">
        {goal.status !== "active" ? (
          <View className="flex-row">
            <StatusBadge tone="pending" label={t(`goals.status.${goal.status}`)} />
          </View>
        ) : null}

        {isQuranProgress(goal.progress) ? (
          <Card>
            <View className="gap-3 p-4">
              <View className="flex-row items-center justify-between">
                <Text variant="title" className="text-primary">
                  {t("goals.progress.percent", { percent: f.number(goal.progress.percent) })}
                </Text>
                <Text variant="caption" className="text-content-muted">
                  {t("badges.progress", {
                    current: f.number(goal.progress.current_amount),
                    target: f.number(goal.progress.target_amount),
                  })}{" "}
                  {t(`goals.units.${goal.unit ?? "pages"}`)}
                </Text>
              </View>
              <ProgressBar value={goal.progress.percent / 100} />
              <View className="flex-row flex-wrap gap-x-4 gap-y-1 pt-1">
                {!goal.progress.is_complete ? (
                  <>
                    <Text variant="caption" className="text-content-secondary">
                      {t("goals.progress.pace", {
                        amount: f.number(goal.progress.daily_pace),
                        unit: t(`goals.units.${goal.unit ?? "pages"}`),
                      })}
                    </Text>
                    <Text variant="caption" className="text-content-secondary">
                      {t("goals.progress.daysLeft", { n: f.number(goal.progress.days_remaining) })}
                    </Text>
                  </>
                ) : (
                  <Text variant="caption" className="font-semibold text-primary">
                    {t("goals.progress.complete")}
                  </Text>
                )}
                {goal.end_date ? (
                  <Text variant="caption" className="text-content-muted">
                    {t("goals.detail.estComplete", { date: f.date(parseIso(goal.end_date)) })}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
        ) : (
          <Card>
            <View className="gap-3 p-4">
              <Text variant="body" className="font-semibold">
                {t("goals.progress.streak", { n: f.number(goal.progress.current_streak) })}
              </Text>
              <Text variant="caption" className="text-content-secondary">
                {t(`goals.recurrence.${goal.recurrence ?? "daily"}`)}
              </Text>
              <Button
                variant={goal.progress.done_this_period ? "secondary" : "primary"}
                label={goal.progress.done_this_period ? t("goals.checkOffUndo") : t("goals.checkOff")}
                leftIcon={
                  <Feather
                    name={goal.progress.done_this_period ? "check-circle" : "circle"}
                    size={16}
                    color={goal.progress.done_this_period ? c.primary : c["on-inverse"]}
                  />
                }
                onPress={() =>
                  isQuranProgress(goal.progress)
                    ? undefined
                    : toggle.mutate({
                        done: goal.progress.done_this_period,
                        // Undo must remove the day the completion was actually
                        // recorded (e.g. a weekly goal checked off earlier this
                        // week), not today — else the DELETE targets a date with
                        // no completion and the check-off can't be cleared.
                        date: goal.progress.done_this_period
                          ? goal.progress.last_completed_on ?? dhakaToday()
                          : dhakaToday(),
                      })
                }
              />
            </View>
          </Card>
        )}

        {/* Lifecycle */}
        <Card>
          <Row
            icon={<Feather name={paused ? "play" : "pause"} size={18} color={c["text-secondary"]} />}
            title={paused ? t("goals.detail.resume") : t("goals.detail.pause")}
            onPress={() => update.mutate({ status: paused ? "active" : "paused" })}
          />
          <Row
            icon={<Feather name="slash" size={18} color={c["text-secondary"]} />}
            title={t("goals.detail.abandon")}
            onPress={() => update.mutate({ status: "abandoned" })}
          />
          <Row
            icon={<Feather name="trash-2" size={18} color={c.error} />}
            title={t("goals.detail.delete")}
            onPress={() => setDeleteOpen(true)}
          />
        </Card>
      </ScrollView>

      <Dialog
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t("goals.detail.delete")}
        description={t("goals.detail.deleteConfirm")}
      >
        <View className="flex-row justify-end gap-2 pt-1">
          <Button variant="text" label={t("common.cancel")} onPress={() => setDeleteOpen(false)} />
          <Button
            variant="text"
            label={t("goals.detail.delete")}
            onPress={() => del.mutate(goalId, { onSuccess: () => router.back() })}
          />
        </View>
      </Dialog>
    </SafeAreaView>
  );
}
