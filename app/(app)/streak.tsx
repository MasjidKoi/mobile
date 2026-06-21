import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Button, Card, Dialog, Row, StatCard, Text } from "@/components";
import { useStreak } from "@/hooks/useStreak";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/** 97 Streak Detail (+ 99 Freeze Applied dialog). */
export default function StreakDetailScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { data, isLoading } = useStreak();
  const [freezeDialog, setFreezeDialog] = useState(false);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("streak.title")} left={<BackButton />} />
      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-10">
          {/* Hero stats */}
          <View className="flex-row gap-3">
            <StatCard
              className="flex-1"
              label={t("streak.current")}
              value={`${f.number(data?.current ?? 0)} ${t("streak.dayUnit")}`}
            />
            <StatCard
              className="flex-1"
              label={t("streak.longest")}
              value={`${f.number(data?.longest ?? 0)} ${t("streak.dayUnit")}`}
            />
          </View>

          {/* Streak rule */}
          <View className="flex-row items-center gap-2.5 rounded-md bg-primary-soft px-3.5 py-3">
            <Feather name="info" size={16} color={c.primary} />
            <Text className="flex-1 text-caption font-medium text-primary">{t("streak.rule")}</Text>
          </View>

          {/* Freezes */}
          <Card>
            <Row
              icon={<Feather name="shield" size={18} color="#4A7FA5" />}
              title={t("streak.freezesHeld", { n: f.number(data?.freezes_held ?? 0) })}
              subtitle={t("streak.freezesExplain")}
            />
            {data && data.freezes_applied > 0 ? (
              <Row
                icon={<Feather name="check-circle" size={18} color={c.primary} />}
                title={t("streak.freezesApplied", { n: f.number(data.freezes_applied) })}
                trailing={<Feather name="chevron-right" size={20} color={c["text-muted"]} />}
                onPress={() => setFreezeDialog(true)}
              />
            ) : null}
          </Card>

          <Button
            variant="secondary"
            label={t("streak.exemptCta")}
            leftIcon={<Feather name="calendar" size={16} color={c.primary} />}
            onPress={() => router.push("/exempt-mode")}
          />
        </ScrollView>
      )}

      {/* 99 Freeze Applied */}
      <Dialog
        visible={freezeDialog}
        onClose={() => setFreezeDialog(false)}
        title={t("streak.freezeApplied.title")}
        description={t("streak.freezeApplied.body")}
      >
        <View className="flex-row justify-end pt-1">
          <Button variant="text" label={t("streak.freezeApplied.ok")} onPress={() => setFreezeDialog(false)} />
        </View>
      </Dialog>
    </SafeAreaView>
  );
}
