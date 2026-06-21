import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppBar,
  BackButton,
  Button,
  Card,
  Dialog,
  Switch,
  Text,
} from "@/components";
import type { AppLanguage } from "@/lib/i18n";
import {
  applyLanguageWithRestart,
  needsRestart,
  setAppLanguage,
} from "@/lib/i18n/language";
import { useNumerals } from "@/lib/i18n/numerals";
import { useColors } from "@/lib/theme/useColors";

const LANGS: { key: AppLanguage; nameKey: string; subKey: string }[] = [
  {
    key: "bn",
    nameKey: "settings.language.bengali",
    subKey: "settings.language.bengaliNative",
  },
  {
    key: "en",
    nameKey: "settings.language.english",
    subKey: "settings.language.englishNative",
  },
  {
    key: "ar",
    nameKey: "settings.language.arabic",
    subKey: "settings.language.arabicNative",
  },
];

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { enabled, setEnabled } = useNumerals();
  const [pending, setPending] = useState<AppLanguage | null>(null);

  const current = i18n.language;

  const onSelect = (lang: AppLanguage) => {
    if (lang === current) return;
    if (needsRestart(lang)) {
      setPending(lang);
      return;
    }
    void setAppLanguage(lang);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("settings.language.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-6 px-4 pb-6 pt-3">
        {/* Language */}
        <View className="gap-2.5">
          <View className="px-0.5">
            <Text className="text-caption font-semibold text-content-muted">
              {t("settings.language.languageSection")}
            </Text>
          </View>
          <Card>
            {LANGS.map((l) => {
              const selected = current === l.key;
              return (
                <Pressable
                  key={l.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(l.key)}
                  className="flex-row items-center gap-3 px-4 py-[13px] active:bg-primary-soft"
                >
                  <View className="flex-1 gap-0.5">
                    <Text
                      className={`text-[16px] ${selected ? "font-semibold" : "font-regular"} text-content-primary`}
                    >
                      {t(l.nameKey)}
                    </Text>
                    <Text className="text-caption font-regular text-content-muted">
                      {t(l.subKey)}
                    </Text>
                  </View>
                  {selected ? (
                    <Feather name="check" size={20} color={c.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </Card>
        </View>

        {/* Bengali numerals — only meaningful in the Bengali UI (PRD #22). */}
        {current === "bn" ? (
          <View className="gap-2.5">
            <View className="px-0.5">
              <Text className="text-caption font-semibold text-content-muted">
                {t("settings.language.numeralsSection")}
              </Text>
            </View>
            <View className="flex-row items-center gap-3 rounded-md border border-border bg-surface px-4 py-3">
              <Feather name="globe" size={18} color={c["text-secondary"]} />
              <View className="flex-1 gap-0.5">
                <Text className="text-body font-regular text-content-primary">
                  {t("settings.language.numeralsTitle")}
                </Text>
                <Text className="text-caption font-regular text-content-muted">
                  {t("settings.language.numeralsHint")}
                </Text>
              </View>
              <Switch value={enabled} onValueChange={setEnabled} />
            </View>
            <View className="px-0.5">
              <Text className="text-micro font-regular text-content-muted">
                {t("settings.language.numeralsNote")}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Arabic restart prompt (screen 63). */}
      <Dialog visible={pending !== null} onClose={() => setPending(null)}>
        <View className="items-center gap-2">
          <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-primary-soft">
            <Feather name="repeat" size={22} color={c.primary} />
          </View>
          <Text className="text-[18px] font-bold text-content-primary">
            {t("settings.language.restartTitle")}
          </Text>
          <Text className="text-center text-body font-regular text-content-secondary">
            {t("settings.language.restartBody")}
          </Text>
        </View>
        <View className="gap-2.5 pt-2">
          <Button
            label={t("settings.language.restartConfirm")}
            onPress={() => {
              const target = pending;
              setPending(null);
              if (target) void applyLanguageWithRestart(target);
            }}
          />
          <Button
            variant="text"
            label={t("common.cancel")}
            onPress={() => setPending(null)}
          />
        </View>
      </Dialog>
    </SafeAreaView>
  );
}
