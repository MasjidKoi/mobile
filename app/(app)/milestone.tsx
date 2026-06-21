import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/** 100 Milestone — a full-bleed green celebration when the streak crosses a
 * threshold. Presented as a modal; `days` comes from the watcher on Journal Today.
 * White-on-green content uses inline colours (NativeWind text-colour utilities
 * are unreliable against the Text variant default). */
export default function MilestoneScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { days } = useLocalSearchParams<{ days: string }>();
  const count = Number(days) || 0;

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-primary">
      <View className="flex-1 items-center justify-center gap-[18px] px-lg">
        <View
          className="h-[100px] w-[100px] items-center justify-center rounded-full"
          style={{ backgroundColor: "#FFFFFF26" }}
        >
          <MaterialCommunityIcons name="fire" size={48} color="#FFFFFF" />
        </View>
        <Text className="font-bold" style={{ color: "#FFFFFF", fontSize: 28, lineHeight: 34 }}>
          {t("streak.milestone.kicker")}
        </Text>
        <Text className="text-base font-medium" style={{ color: "#FFFFFFCC" }}>
          {t("streak.milestone.title", { days: f.number(count) })}
        </Text>

        <View
          className="mt-1 w-full items-center gap-2.5 rounded-lg p-[18px]"
          style={{ backgroundColor: "#FFFFFF1A" }}
        >
          <MaterialCommunityIcons name="star-four-points" size={22} color="#F4EDDB" />
          <Text
            className="max-w-[300px] text-center text-caption font-regular"
            style={{ color: "#FFFFFFE6" }}
          >
            {t("streak.milestone.body")}
          </Text>
        </View>
      </View>

      <View className="px-4 pb-2">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="items-center justify-center rounded-md bg-surface py-[14px] active:opacity-90"
        >
          <Text className="text-base font-semibold" style={{ color: c.primary }}>
            {t("streak.milestone.cta")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
