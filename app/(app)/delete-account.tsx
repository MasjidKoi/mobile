import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Card, ExportDialogs, Text } from "@/components";
import { useDataExport } from "@/hooks/useDataExport";
import { useColors } from "@/lib/theme/useColors";

const CONSEQUENCES = [
  "settings.delete.c0",
  "settings.delete.c1",
  "settings.delete.c2",
  "settings.delete.c3",
] as const;

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const exp = useDataExport();

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar title={t("settings.delete.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="grow gap-5 px-4 pb-5 pt-4">
        {/* Header */}
        <View className="items-center gap-3 px-2 py-1">
          <View className="h-[60px] w-[60px] items-center justify-center rounded-full bg-error-soft">
            <Feather name="alert-triangle" size={26} color={c.error} />
          </View>
          <Text variant="title" className="font-bold">
            {t("settings.delete.consequencesTitle")}
          </Text>
          <Text className="text-center text-body font-regular text-content-secondary">
            {t("settings.delete.consequencesSub")}
          </Text>
        </View>

        {/* Consequences */}
        <Card>
          {CONSEQUENCES.map((key) => (
            <View
              key={key}
              className="flex-row items-center gap-3 px-4 py-[13px]"
            >
              <Feather name="x-circle" size={18} color={c.error} />
              <Text className="flex-1 text-body font-regular text-content-primary">
                {t(key)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Inline export offer */}
        <Pressable
          accessibilityRole="button"
          onPress={() => void exp.run()}
          className="flex-row items-center gap-3 rounded-md bg-primary-soft px-4 py-3.5 active:opacity-80"
        >
          <Feather name="download" size={18} color={c.primary} />
          <View className="flex-1 gap-0.5">
            <Text className="text-caption font-semibold text-primary">
              {t("settings.delete.exportOfferTitle")}
            </Text>
            <Text className="text-caption font-regular text-content-secondary">
              {t("settings.delete.exportOfferSub")}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={c.primary} />
        </Pressable>

        <View className="grow" />

        {/* Actions */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/delete-confirm")}
          className="items-center rounded-md bg-error px-4 py-3.5 active:opacity-90"
        >
          <Text className="text-body font-semibold text-on-inverse">
            {t("settings.delete.continue")}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="items-center rounded-md bg-surface px-4 py-3 active:bg-primary-soft"
        >
          <Text className="text-body font-semibold text-content-secondary">
            {t("settings.delete.cancel")}
          </Text>
        </Pressable>
      </ScrollView>

      <ExportDialogs
        state={exp.state}
        onCancel={exp.cancel}
        onRetry={() => void exp.run()}
      />
    </SafeAreaView>
  );
}
