import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Button, EmptyState, Fab, GoalCard, Text } from "@/components";
import { useGoals, useToggleGoalCompletion } from "@/hooks/useGoals";
import { dhakaToday } from "@/lib/journal/dates";
import { isQuranProgress, type Goal } from "@/lib/goals/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

/** 106 Goals List — active goals with inline check-off for recurring ones. */
export default function GoalsListScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useLoginGate();
  const { data, isLoading } = useGoals("active");
  const goals = data?.items ?? [];

  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title={t("goals.title")} left={<BackButton />} />
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="target" size={28} color={c.primary} />}
            title={t("goals.guest.title")}
            caption={t("goals.guest.subtitle")}
            action={<Button label={t("goals.guest.cta")} onPress={() => requireAuth(() => {}, "generic")} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("goals.title")} left={<BackButton />} />
      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : goals.length === 0 ? (
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            variant="plain"
            icon={<Feather name="target" size={26} color={c.primary} />}
            title={t("goals.empty.title")}
            caption={t("goals.empty.subtitle")}
            action={<Button label={t("goals.newGoal")} onPress={() => router.push("/goals/templates")} />}
          />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-3 px-4 py-3 pb-24">
          {goals.map((g) => (
            <GoalListItem key={g.goal_id} goal={g} />
          ))}
        </ScrollView>
      )}

      <Fab
        icon={<Feather name="plus" size={24} color={c["on-inverse"]} />}
        onPress={() => router.push("/goals/templates")}
        style={{ position: "absolute", right: 20, bottom: 28 }}
      />
    </SafeAreaView>
  );
}

function GoalListItem({ goal }: { goal: Goal }) {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const toggle = useToggleGoalCompletion(goal.goal_id);
  const open = () => router.push({ pathname: "/goals/[id]", params: { id: goal.goal_id } });

  if (isQuranProgress(goal.progress)) {
    const p = goal.progress;
    return (
      <Pressable accessibilityRole="button" onPress={open}>
        <GoalCard
          icon={<Feather name="book-open" size={18} color={c.primary} />}
          title={goal.title}
          subtitle={t("goals.kind.quran_quantity")}
          value={p.percent / 100}
          doneLabel={t("goals.progress.percent", { percent: f.number(p.percent) })}
          leftLabel={
            p.is_complete
              ? t("goals.progress.complete")
              : t("goals.progress.remaining", {
                  amount: f.number(p.remaining),
                  unit: t(`goals.units.${goal.unit ?? "pages"}`),
                })
          }
        />
      </Pressable>
    );
  }

  // Recurring goal — inline check-off.
  const p = goal.progress;
  return (
    <View className="gap-3 rounded-lg border border-border bg-surface p-4">
      <Pressable accessibilityRole="button" onPress={open} className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-sm bg-primary-soft">
          <Feather name="repeat" size={18} color={c.primary} />
        </View>
        <View className="flex-1 gap-px">
          <Text variant="body" className="font-semibold">
            {goal.title}
          </Text>
          <Text variant="caption" className="text-content-secondary">
            {t(`goals.recurrence.${goal.recurrence ?? "daily"}`)} · {t("goals.progress.streak", { n: f.number(p.current_streak) })}
          </Text>
        </View>
      </Pressable>
      <Button
        variant={p.done_this_period ? "secondary" : "primary"}
        label={p.done_this_period ? t("goals.checkOffUndo") : t("goals.checkOff")}
        leftIcon={
          <Feather
            name={p.done_this_period ? "check-circle" : "circle"}
            size={16}
            color={p.done_this_period ? c.primary : c["on-inverse"]}
          />
        }
        onPress={() =>
          toggle.mutate({
            done: p.done_this_period,
            // Undo removes the day the completion was actually recorded (weekly
            // goals may have been checked off on an earlier day this week), not today.
            date: p.done_this_period ? p.last_completed_on ?? dhakaToday() : dhakaToday(),
          })
        }
      />
    </View>
  );
}
