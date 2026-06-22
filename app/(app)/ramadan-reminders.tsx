import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Card, Row, Switch, Text } from "@/components";
import { useHomeTimes } from "@/hooks/useHomeTimes";
import { useReminderPrefs } from "@/hooks/useReminderPrefs";
import { useFormat } from "@/lib/i18n/format";
import { azanTime, parseHHMM } from "@/lib/prayer/clock";
import { formatBareClock } from "@/lib/prayer/format";
import { useColors } from "@/lib/theme/useColors";

export default function RamadanRemindersScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { prefs, setPrefs } = useReminderPrefs();
  const { times } = useHomeTimes();
  const r = prefs.ramadan;

  const back = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
      <Feather name="arrow-left" size={22} color={c["text-primary"]} />
    </Pressable>
  );

  // Ramadan anchors derive from today's prayer times: sehri = Fajr azan − 30 min,
  // sehri-ends = Fajr azan exactly, iftar = Maghrib azan − 10 min. Returns the
  // localized bare clock, or null when times aren't available yet.
  const anchorClock = (prayer: "fajr" | "maghrib", deltaMin: number): string | null => {
    if (!times) return null;
    const hhmm = azanTime(times, prayer);
    if (!hhmm) return null;
    const d = parseHHMM(hhmm, new Date());
    d.setMinutes(d.getMinutes() + deltaMin);
    return f.localizeDigits(formatBareClock(`${d.getHours()}:${d.getMinutes()}`));
  };

  const sub = (text: string, time: string | null): string =>
    time ? t("ramadanReminders.subWithTime", { text, time }) : text;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("ramadanReminders.title")} left={back} />
      <ScrollView contentContainerClassName="gap-md px-4 py-2 pb-8">
        {/* Auto-mode explainer */}
        <View className="flex-row items-center gap-3 rounded-lg bg-primary px-4 py-3.5">
          <MaterialCommunityIcons name="moon-waning-crescent" size={22} color={c["on-inverse"]} />
          <View className="flex-1 gap-0.5">
            <Text className="text-body font-bold text-on-inverse">{t("ramadanReminders.autoTitle")}</Text>
            <Text className="text-caption text-on-inverse-muted">{t("ramadanReminders.autoSubtitle")}</Text>
          </View>
        </View>

        <Card>
          <Row
            icon={<Feather name="sunrise" size={18} color={c["text-secondary"]} />}
            title={t("ramadanReminders.sehri")}
            subtitle={sub(t("ramadanReminders.sehriSub"), anchorClock("fajr", -30))}
            onPress={() => setPrefs({ ramadan: { sehri: !r.sehri } })}
            trailing={<Switch value={r.sehri} onValueChange={(v) => setPrefs({ ramadan: { sehri: v } })} />}
          />
          <Row
            icon={<Feather name="clock" size={18} color={c["text-secondary"]} />}
            title={t("ramadanReminders.sehriEnd")}
            subtitle={sub(t("ramadanReminders.sehriEndSub"), anchorClock("fajr", 0))}
            onPress={() => setPrefs({ ramadan: { sehriEnd: !r.sehriEnd } })}
            trailing={<Switch value={r.sehriEnd} onValueChange={(v) => setPrefs({ ramadan: { sehriEnd: v } })} />}
          />
          <Row
            icon={<Feather name="sunset" size={18} color={c["text-secondary"]} />}
            title={t("ramadanReminders.iftar")}
            subtitle={sub(t("ramadanReminders.iftarSub"), anchorClock("maghrib", -10))}
            onPress={() => setPrefs({ ramadan: { iftar: !r.iftar } })}
            trailing={<Switch value={r.iftar} onValueChange={(v) => setPrefs({ ramadan: { iftar: v } })} />}
          />
        </Card>

        <Text variant="micro" className="px-1">
          {t("ramadanReminders.note")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
