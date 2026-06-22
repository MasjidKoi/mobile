import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppBar,
  BackButton,
  BottomSheet,
  Button,
  Card,
  Row,
  Text,
} from "@/components";
import { useFormat } from "@/lib/i18n/format";
import {
  bytesToDisplay,
  clearCache,
  getCacheSummary,
  type CacheSummary,
} from "@/lib/settings/cache";
import { useColors } from "@/lib/theme/useColors";

/** Visual reference ceiling for the usage bar (decorative). */
const BAR_MAX_BYTES = 50 * 1024 * 1024;

export default function StorageScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const queryClient = useQueryClient();
  const [summary, setSummary] = useState<CacheSummary | null>(null);
  const [confirm, setConfirm] = useState(false);

  const refresh = useCallback(() => {
    setSummary(getCacheSummary(queryClient));
  }, [queryClient]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const sizeText = (bytes: number) => {
    const { value, unit } = bytesToDisplay(bytes);
    return `${f.number(value)} ${unit}`;
  };

  const total = summary?.totalBytes ?? 0;
  const fillPct = Math.min(100, Math.round((total / BAR_MAX_BYTES) * 100));

  const onClear = async () => {
    await clearCache(queryClient);
    refresh();
    setConfirm(false);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("settings.storage.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-5 px-4 pb-6 pt-3">
        {/* Summary */}
        <View className="gap-3 rounded-md border border-border bg-surface p-[18px]">
          <View className="flex-row items-end justify-between">
            <Text className="text-caption font-medium text-content-secondary">
              {t("settings.storage.totalUsed")}
            </Text>
            <Text variant="title" className="font-bold">
              {sizeText(total)}
            </Text>
          </View>
          <View className="h-2.5 overflow-hidden rounded-full bg-border">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${fillPct}%` }}
            />
          </View>
        </View>

        {/* Per-category breakdown */}
        <Card>
          {summary?.categories.map((cat) => (
            <Row
              key={cat.key}
              icon={
                <Feather
                  name={cat.icon as keyof typeof Feather.glyphMap}
                  size={18}
                  color={c["text-secondary"]}
                />
              }
              title={t(cat.labelKey)}
              subtitle={
                cat.lastSync
                  ? t("settings.storage.lastSync", {
                      when: f.date(new Date(cat.lastSync)),
                    })
                  : t("settings.storage.neverSynced")
              }
              value={sizeText(cat.bytes)}
            />
          ))}
        </Card>

        {/* Clear */}
        <Pressable
          accessibilityRole="button"
          onPress={() => setConfirm(true)}
          className="flex-row items-center justify-center gap-2 rounded-md border border-error bg-surface px-4 py-3 active:opacity-70"
        >
          <Feather name="trash-2" size={17} color={c.error} />
          <Text className="text-body font-semibold text-error">
            {t("settings.storage.clear")}
          </Text>
        </Pressable>

        <View className="px-0.5">
          <Text className="text-micro font-regular text-content-muted">
            {t("settings.storage.note")}
          </Text>
        </View>
      </ScrollView>

      {/* Clear confirm (screen 67) */}
      <BottomSheet visible={confirm} onClose={() => setConfirm(false)}>
        <View className="items-center gap-2">
          <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-error-soft">
            <Feather name="trash-2" size={22} color={c.error} />
          </View>
          <Text className="text-[18px] font-bold text-content-primary">
            {t("settings.storage.confirmTitle")}
          </Text>
          <Text className="text-center text-body font-regular text-content-secondary">
            {t("settings.storage.confirmBody", { size: sizeText(total) })}
          </Text>
        </View>
        <View className="gap-2.5 pt-2">
          <Button
            label={t("settings.storage.clearConfirm")}
            onPress={() => void onClear()}
          />
          <Button
            variant="text"
            label={t("common.cancel")}
            onPress={() => setConfirm(false)}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
