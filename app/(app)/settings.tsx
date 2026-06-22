import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Card, SettingsRow, Text } from "@/components";
import { useFormat } from "@/lib/i18n/format";
import { bytesToDisplay, getCacheSummary } from "@/lib/settings/cache";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useColors } from "@/lib/theme/useColors";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <View className="px-1">
        <Text className="text-caption font-semibold text-content-muted">
          {title}
        </Text>
      </View>
      <Card>{children}</Card>
    </View>
  );
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const queryClient = useQueryClient();
  const { preference } = useTheme();

  // Walking the whole query cache is not free; the hub re-renders on i18n/theme
  // ticks, so derive the size once per queryClient identity.
  const cacheBytes = useMemo(
    () => getCacheSummary(queryClient).totalBytes,
    [queryClient],
  );
  const { value: cacheValue, unit: cacheUnit } = bytesToDisplay(cacheBytes);
  const storageValue = `${f.number(cacheValue)} ${cacheUnit}`;

  const themeValue = t(`settings.appearance.${preference}`);
  const langValue =
    i18n.language === "ar"
      ? t("settings.language.arabic")
      : i18n.language === "en"
        ? t("settings.language.english")
        : t("settings.language.bengali");

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("settings.hub.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-5 px-4 pb-6 pt-2">
        <Section title={t("settings.hub.general")}>
          <SettingsRow
            icon="sun"
            tileColor={c.primary}
            label={t("settings.hub.appearance")}
            value={themeValue}
            onPress={() => router.push("/appearance")}
          />
          <SettingsRow
            icon="globe"
            tileColor={c["accent-gold"]}
            label={t("settings.hub.language")}
            value={langValue}
            onPress={() => router.push("/language")}
          />
          <SettingsRow
            icon="bell"
            tileColor={c.error}
            label={t("settings.hub.notifications")}
            onPress={() => router.push("/notifications")}
          />
        </Section>

        <Section title={t("settings.hub.data")}>
          <SettingsRow
            icon="database"
            tileColor={c["text-secondary"]}
            label={t("settings.hub.storage")}
            value={storageValue}
            onPress={() => router.push("/storage")}
          />
          <SettingsRow
            icon="shield"
            tileColor={c["surface-inverse"]}
            label={t("settings.hub.privacy")}
            onPress={() => router.push("/privacy")}
          />
        </Section>

        <Section title={t("settings.hub.other")}>
          <SettingsRow
            icon="info"
            tileColor={c["text-muted"]}
            label={t("settings.hub.about")}
            onPress={() => router.push("/about")}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
