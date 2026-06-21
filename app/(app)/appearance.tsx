import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, SegmentedControl, Text } from "@/components";
import { FONT_STEPS, type FontStep } from "@/lib/theme/fontScale";
import { useFontScale } from "@/lib/theme/FontScaleProvider";
import {
  type ColorSchemePreference,
  useTheme,
} from "@/lib/theme/ThemeProvider";
import { useColors } from "@/lib/theme/useColors";

/** Fixed swatches that *represent* light/dark, so they never flip with the theme. */
const LIGHT = "#FFFFFF";
const DARK = "#10110F";

const THEME_OPTIONS: { key: ColorSchemePreference; labelKey: string }[] = [
  { key: "system", labelKey: "settings.appearance.system" },
  { key: "light", labelKey: "settings.appearance.light" },
  { key: "dark", labelKey: "settings.appearance.dark" },
];

const FONT_LABEL: Record<FontStep, string> = {
  default: "settings.appearance.fontDefault",
  large: "settings.appearance.fontLarge",
  xlarge: "settings.appearance.fontXLarge",
};

export default function AppearanceScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { preference, setPreference } = useTheme();
  const { step, setStep } = useFontScale();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("settings.appearance.title")} left={<BackButton />} />
      <ScrollView contentContainerClassName="gap-7 px-4 pb-6 pt-3">
        {/* Theme */}
        <View className="gap-3">
          <View className="px-0.5">
            <Text className="text-caption font-semibold text-content-muted">
              {t("settings.appearance.theme")}
            </Text>
          </View>
          <View className="flex-row gap-2.5">
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={t(opt.labelKey)}
                  onPress={() => setPreference(opt.key)}
                  className={`flex-1 gap-2 rounded-md bg-surface p-2.5 ${
                    active ? "border-2 border-primary" : "border border-border"
                  }`}
                >
                  <View className="h-[58px] flex-row overflow-hidden rounded-lg border border-border">
                    {opt.key === "system" ? (
                      <>
                        <View
                          className="flex-1"
                          style={{ backgroundColor: LIGHT }}
                        />
                        <View
                          className="flex-1"
                          style={{ backgroundColor: DARK }}
                        />
                      </>
                    ) : (
                      <View
                        className="flex-1"
                        style={{
                          backgroundColor: opt.key === "dark" ? DARK : LIGHT,
                        }}
                      />
                    )}
                  </View>
                  <View className="flex-row items-center justify-center gap-1.5">
                    <Text
                      className={`text-caption ${active ? "font-semibold text-primary" : "font-medium text-content-secondary"}`}
                    >
                      {t(opt.labelKey)}
                    </Text>
                    {active ? (
                      <Feather name="check" size={14} color={c.primary} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Font size */}
        <View className="gap-3">
          <View className="px-0.5">
            <Text className="text-caption font-semibold text-content-muted">
              {t("settings.appearance.fontSize")}
            </Text>
          </View>
          <SegmentedControl
            value={step}
            onChange={(key) => setStep(key as FontStep)}
            options={FONT_STEPS.map((s) => ({
              key: s,
              label: t(FONT_LABEL[s]),
            }))}
          />
          {/* Live preview — scales with the selected step via <Text>. */}
          <View className="gap-1.5 rounded-md border border-border bg-surface p-4">
            <Text className="text-micro font-semibold text-content-muted">
              {t("settings.appearance.previewLabel")}
            </Text>
            <Text variant="heading" className="font-semibold">
              {t("settings.appearance.previewTitle")}
            </Text>
            <Text variant="body" className="text-content-secondary">
              {t("settings.appearance.previewBody")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
