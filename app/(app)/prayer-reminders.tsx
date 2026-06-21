import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Card, Row, SectionHeader, Switch, Text } from "@/components";
import { useHomeTimes } from "@/hooks/useHomeTimes";
import { useReminderPrefs } from "@/hooks/useReminderPrefs";
import { useFormat } from "@/lib/i18n/format";
import { registerDevice } from "@/lib/notifications/device";
import {
  getNotificationStatus,
  requestNotificationPermission,
  type NotificationPermission,
} from "@/lib/notifications/permissions";
import { REMINDER_OFFSETS, type ReminderOffset } from "@/lib/notifications/settingsStore";
import { openAppSettings } from "@/lib/permissions";
import { azanTime, iqamahTime, PRAYER_ORDER } from "@/lib/prayer/clock";
import { formatBareClock } from "@/lib/prayer/format";
import { useColors } from "@/lib/theme/useColors";

export default function PrayerRemindersScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { prefs, setPrefs } = useReminderPrefs();
  const { times } = useHomeTimes();
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

  // Sub-line shown under every prayer row, on or off: "{source} · {time}". Fajr
  // anchors to its azan; the others to iqamah (falling back to azan if the
  // masjid hasn't set an iqamah). Times come from the home-times resolver.
  const prayerSub = (prayer: (typeof PRAYER_ORDER)[number]): string | undefined => {
    const source = prayer === "fajr" ? t("reminders.sourceAzan") : t("reminders.sourceJamaat");
    if (!times) return source;
    const hhmm = prayer === "fajr" ? azanTime(times, prayer) : iqamahTime(times, prayer) ?? azanTime(times, prayer);
    if (!hhmm) return source;
    return t("reminders.perPrayerSub", { source, time: f.localizeDigits(formatBareClock(hhmm)) });
  };

  // Cycle through the offset presets on tap (5 → 10 → 15 → 30 → 5).
  const cycleOffset = () => {
    const i = REMINDER_OFFSETS.indexOf(prefs.offsetMinutes);
    const next = REMINDER_OFFSETS[(i + 1) % REMINDER_OFFSETS.length] as ReminderOffset;
    setPrefs({ offsetMinutes: next });
  };

  const pickOffset = () => {
    Alert.alert(t("reminders.offset"), undefined, [
      ...REMINDER_OFFSETS.map((o) => ({
        text: t("reminders.offsetValue", { minutes: f.number(o) }),
        onPress: () => setPrefs({ offsetMinutes: o }),
      })),
      { text: t("common.cancel"), style: "cancel" as const },
    ]);
  };

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
              subtitle={prayerSub(prayer)}
              onPress={() => void togglePrayer(prayer)}
              trailing={
                <Switch value={prefs.perPrayer[prayer]} onValueChange={() => void togglePrayer(prayer)} />
              }
            />
          ))}
        </Card>

        {/* General */}
        <SectionHeader title={t("reminders.general")} className="mt-1" />
        <Card>
          <Row
            title={t("reminders.offset")}
            value={t("reminders.offsetValue", { minutes: f.number(prefs.offsetMinutes) })}
            onPress={pickOffset}
            onLongPress={cycleOffset}
            trailing={chevron}
          />
          <Row
            title={t("reminders.azanMoment")}
            subtitle={t("reminders.azanMomentSub")}
            onPress={() => setPrefs({ azanMoment: !prefs.azanMoment })}
            trailing={<Switch value={prefs.azanMoment} onValueChange={(v) => setPrefs({ azanMoment: v })} />}
          />
          <Row
            title={t("reminders.azanSound")}
            value={t(`azanSound.optionsShort.${prefs.azanSound}`)}
            onPress={() => router.push("/azan-sound")}
            trailing={chevron}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
