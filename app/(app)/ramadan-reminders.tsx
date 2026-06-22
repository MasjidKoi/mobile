import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Card, Row, Switch, Text } from "@/components";
import { useReminderPrefs } from "@/hooks/useReminderPrefs";
import { useColors } from "@/lib/theme/useColors";

export default function RamadanRemindersScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { prefs, setPrefs } = useReminderPrefs();
  const r = prefs.ramadan;

  const back = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
      <Feather name="arrow-left" size={22} color={c["text-primary"]} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("ramadanReminders.title")} left={back} />
      <ScrollView contentContainerClassName="gap-md px-4 py-2 pb-8">
        {/* Auto-mode explainer */}
        <View className="flex-row items-center gap-3 rounded-lg bg-primary px-4 py-3.5">
          <Feather name="moon" size={20} color={c["on-inverse"]} />
          <View className="flex-1 gap-0.5">
            <Text className="text-body font-bold text-on-inverse">{t("ramadanReminders.autoTitle")}</Text>
            <Text className="text-caption text-on-inverse-muted">{t("ramadanReminders.autoSubtitle")}</Text>
          </View>
        </View>

        <Card>
          <Row
            icon={<Feather name="coffee" size={18} color={c["accent-gold"]} />}
            title={t("ramadanReminders.sehri")}
            subtitle={t("ramadanReminders.sehriSub")}
            onPress={() => setPrefs({ ramadan: { sehri: !r.sehri } })}
            trailing={<Switch value={r.sehri} onValueChange={(v) => setPrefs({ ramadan: { sehri: v } })} />}
          />
          <Row
            icon={<Feather name="alert-circle" size={18} color={c["accent-gold"]} />}
            title={t("ramadanReminders.sehriEnd")}
            subtitle={t("ramadanReminders.sehriEndSub")}
            onPress={() => setPrefs({ ramadan: { sehriEnd: !r.sehriEnd } })}
            trailing={<Switch value={r.sehriEnd} onValueChange={(v) => setPrefs({ ramadan: { sehriEnd: v } })} />}
          />
          <Row
            icon={<Feather name="sunset" size={18} color={c["accent-gold"]} />}
            title={t("ramadanReminders.iftar")}
            subtitle={t("ramadanReminders.iftarSub")}
            onPress={() => setPrefs({ ramadan: { iftar: !r.iftar } })}
            trailing={<Switch value={r.iftar} onValueChange={(v) => setPrefs({ ramadan: { iftar: v } })} />}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
