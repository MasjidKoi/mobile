import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Card, Row, SectionHeader, SegmentedControl, Switch, Text } from "@/components";
import { useReminderPrefs } from "@/hooks/useReminderPrefs";
import { useFormat } from "@/lib/i18n/format";
import { registerDevice } from "@/lib/notifications/device";
import {
  getNotificationStatus,
  requestNotificationPermission,
  type NotificationPermission,
} from "@/lib/notifications/permissions";
import { REMINDER_OFFSETS, type ReminderOffset } from "@/lib/notifications/settingsStore";
import { azanSoundOption } from "@/lib/notifications/sounds";
import { openAppSettings } from "@/lib/permissions";
import { PRAYER_ORDER } from "@/lib/prayer/clock";
import { useColors } from "@/lib/theme/useColors";

export default function PrayerRemindersScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { prefs, setPrefs } = useReminderPrefs();
  const [status, setStatus] = useState<NotificationPermission>("undetermined");

  useEffect(() => {
    void getNotificationStatus().then(setStatus);
  }, []);

  // Request the OS permission the first time the user enables anything, and
  // register the push token once it's granted (the login-time registration
  // may have run before the user ever granted notifications).
  const ensurePermission = async () => {
    if (status === "undetermined") {
      const next = await requestNotificationPermission();
      setStatus(next);
      if (next === "granted") void registerDevice();
    }
  };

  const togglePrayer = async (prayer: (typeof PRAYER_ORDER)[number]) => {
    await ensurePermission();
    setPrefs({ perPrayer: { [prayer]: !prefs.perPrayer[prayer] } });
  };

  const back = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
      <Feather name="arrow-left" size={22} color={c["text-primary"]} />
    </Pressable>
  );

  const chevron = <Feather name="chevron-right" size={20} color={c["text-muted"]} />;
  const offsetSub = t("reminders.reminderBefore", { minutes: f.number(prefs.offsetMinutes) });

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("reminders.title")} left={back} />
      <ScrollView contentContainerClassName="gap-md px-4 py-2 pb-8">
        {status === "denied" ? (
          <Pressable
            onPress={openAppSettings}
            className="flex-row items-center gap-2.5 rounded-md bg-accent-gold-soft px-3.5 py-3"
          >
            <Feather name="bell-off" size={16} color="#8A6A1F" />
            <Text className="flex-1 text-caption font-medium text-[#8A6A1F]">{t("reminders.permissionDenied")}</Text>
            <Text className="text-caption font-semibold text-[#8A6A1F]">{t("reminders.enableInSettings")}</Text>
          </Pressable>
        ) : null}

        {/* Per-prayer toggles */}
        <SectionHeader title={t("reminders.perPrayer")} />
        <Card>
          {PRAYER_ORDER.map((prayer) => (
            <Row
              key={prayer}
              title={t(`prayers.${prayer}`)}
              subtitle={prefs.perPrayer[prayer] ? offsetSub : undefined}
              onPress={() => void togglePrayer(prayer)}
              trailing={
                <Switch value={prefs.perPrayer[prayer]} onValueChange={() => void togglePrayer(prayer)} />
              }
            />
          ))}
        </Card>

        {/* Global offset */}
        <SectionHeader title={t("reminders.general")} className="mt-1" />
        <View className="gap-2 rounded-md border border-border bg-surface px-4 py-3.5">
          <Text className="text-body font-medium text-content-primary">{t("reminders.offset")}</Text>
          <SegmentedControl
            value={String(prefs.offsetMinutes)}
            onChange={(key) => setPrefs({ offsetMinutes: Number(key) as ReminderOffset })}
            options={REMINDER_OFFSETS.map((o) => ({ key: String(o), label: `${f.number(o)} ${t("units.min")}` }))}
          />
        </View>

        <Card>
          <Row
            title={t("reminders.azanMoment")}
            subtitle={t("reminders.azanMomentSub")}
            onPress={() => setPrefs({ azanMoment: !prefs.azanMoment })}
            trailing={<Switch value={prefs.azanMoment} onValueChange={(v) => setPrefs({ azanMoment: v })} />}
          />
          <Row
            title={t("reminders.azanSound")}
            value={t(azanSoundOption(prefs.azanSound).nameKey)}
            onPress={() => router.push("/azan-sound")}
            trailing={chevron}
          />
          <Row
            icon={<Feather name="moon" size={18} color={c["accent-gold"]} />}
            title={t("ramadanReminders.title")}
            onPress={() => router.push("/ramadan-reminders")}
            trailing={chevron}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
