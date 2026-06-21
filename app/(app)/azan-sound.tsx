import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Card, Row, SectionHeader, Switch, Text } from "@/components";
import { useReminderPrefs } from "@/hooks/useReminderPrefs";
import type { AzanSoundId } from "@/lib/notifications/settingsStore";
import { AZAN_SOUNDS, previewAzanSound, stopAzanPreview } from "@/lib/notifications/sounds";
import { useColors } from "@/lib/theme/useColors";

export default function AzanSoundScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { prefs, setPrefs } = useReminderPrefs();

  useEffect(() => () => stopAzanPreview(), []);

  const back = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
      <Feather name="arrow-left" size={22} color={c["text-primary"]} />
    </Pressable>
  );

  // Solid green play button shown on every sound row (preview is a no-op until
  // the bundled azan clip ships, but the affordance matches the design).
  const playButton = (id: AzanSoundId) => (
    <Pressable
      accessibilityLabel={t("azanSound.preview")}
      onPress={() => previewAzanSound(id)}
      className="h-8 w-8 items-center justify-center rounded-full bg-primary"
    >
      <Feather name="play" size={14} color={c["on-inverse"]} />
    </Pressable>
  );

  const selectMark = (isSelected: boolean) => (
    <View
      className={`h-6 w-6 items-center justify-center rounded-full ${
        isSelected ? "bg-primary" : "border border-border"
      }`}
    >
      {isSelected ? <Feather name="check" size={14} color={c["on-inverse"]} /> : null}
    </View>
  );

  const soundRow = (id: AzanSoundId, title: string, selected: AzanSoundId, onSelect: (id: AzanSoundId) => void) => {
    const isSelected = id === selected;
    return (
      <Row
        title={title}
        onPress={() => {
          onSelect(id);
          previewAzanSound(id);
        }}
        trailing={
          <View className="flex-row items-center gap-3">
            {playButton(id)}
            {selectMark(isSelected)}
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("azanSound.title")} left={back} />
      <ScrollView contentContainerClassName="gap-md px-4 py-2 pb-8">
        <SectionHeader title={t("azanSound.allPrayers")} />
        <Card>
          {AZAN_SOUNDS.map((opt) =>
            soundRow(opt.id, t(opt.nameKey), prefs.azanSound, (id) => setPrefs({ azanSound: id })),
          )}
        </Card>

        <SectionHeader title={t("azanSound.fajrSection")} className="mt-1" />
        <Card>
          <Row
            title={t("azanSound.fajrSeparate")}
            subtitle={t("azanSound.fajrSeparateSub")}
            onPress={() => setPrefs({ fajrSeparate: !prefs.fajrSeparate })}
            trailing={<Switch value={prefs.fajrSeparate} onValueChange={(v) => setPrefs({ fajrSeparate: v })} />}
          />
          {prefs.fajrSeparate
            ? soundRow("mecca", t("azanSound.fajrSoftName"), prefs.fajrAzanSound, (id) =>
                setPrefs({ fajrAzanSound: id }),
              )
            : null}
        </Card>

        <Text variant="micro" className="px-1">
          {t("azanSound.disclaimer")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
