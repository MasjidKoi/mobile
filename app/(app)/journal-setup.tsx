import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Card, Row, SectionHeader, Switch, Text } from "@/components";
import { useGamificationPrefs } from "@/hooks/useGamificationPrefs";
import {
  getNotificationStatus,
  requestNotificationPermission,
  type NotificationPermission,
} from "@/lib/notifications/permissions";
import { openAppSettings } from "@/lib/permissions";

/** 111 Journal Setup — gamification nudge preferences (local; drives NudgeScheduler). */
export default function JournalSetupScreen() {
  const { t } = useTranslation();
  const { prefs, setPrefs } = useGamificationPrefs();
  const [status, setStatus] = useState<NotificationPermission>("undetermined");

  useEffect(() => {
    void getNotificationStatus().then(setStatus);
  }, []);

  const ensurePermission = async () => {
    if (status === "undetermined") {
      const next = await requestNotificationPermission();
      setStatus(next);
    }
  };

  const toggleMaster = async (v: boolean) => {
    if (v) await ensurePermission();
    setPrefs({ enabled: v });
  };

  const sub = (key: "dailyLog" | "streakAtRisk" | "weeklyReflection") => ({
    value: prefs[key],
    disabled: !prefs.enabled,
    onValueChange: (v: boolean) => setPrefs({ [key]: v }),
  });

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("journal.setup.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-md px-4 py-2 pb-8">
        {status === "denied" ? (
          <Pressable
            onPress={openAppSettings}
            className="flex-row items-center gap-2.5 rounded-md bg-accent-gold-soft px-3.5 py-3"
          >
            <Feather name="bell-off" size={16} color="#8A6A1F" />
            <Text className="flex-1 text-caption font-medium text-[#8A6A1F]">
              {t("journal.setup.permissionNeeded")}
            </Text>
          </Pressable>
        ) : null}

        <SectionHeader title={t("journal.setup.section")} />
        <Card>
          <Row
            title={t("journal.setup.master")}
            trailing={<Switch value={prefs.enabled} onValueChange={(v) => void toggleMaster(v)} />}
            onPress={() => void toggleMaster(!prefs.enabled)}
          />
          <Row
            title={t("journal.setup.dailyLog")}
            subtitle={t("journal.setup.dailyLogHint")}
            trailing={<Switch {...sub("dailyLog")} />}
            onPress={() => prefs.enabled && setPrefs({ dailyLog: !prefs.dailyLog })}
          />
          <Row
            title={t("journal.setup.streakAtRisk")}
            subtitle={t("journal.setup.streakAtRiskHint")}
            trailing={<Switch {...sub("streakAtRisk")} />}
            onPress={() => prefs.enabled && setPrefs({ streakAtRisk: !prefs.streakAtRisk })}
          />
          <Row
            title={t("journal.setup.weeklyReflection")}
            subtitle={t("journal.setup.weeklyReflectionHint")}
            trailing={<Switch {...sub("weeklyReflection")} />}
            onPress={() => prefs.enabled && setPrefs({ weeklyReflection: !prefs.weeklyReflection })}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
