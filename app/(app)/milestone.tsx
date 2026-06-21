import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, MilestoneDuaCard, Text } from "@/components";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/** 100 Milestone — a full-screen celebration when the streak crosses a
 * threshold. Presented as a modal; `days` comes from the watcher on Journal Today. */
export default function MilestoneScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { days } = useLocalSearchParams<{ days: string }>();
  const count = Number(days) || 0;

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-6 px-lg">
        <View className="items-center gap-2">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-primary-soft">
            <Feather name="zap" size={44} color={c.primary} />
          </View>
          <Text variant="display" className="text-[44px] text-primary">
            {f.number(count)}
          </Text>
        </View>

        <MilestoneDuaCard
          icon={<Feather name="award" size={26} color={c["on-inverse"]} />}
          title={t("streak.milestone.title", { days: f.number(count) })}
          text={t("streak.milestone.body")}
        />
      </View>

      <View className="px-4 pb-2">
        <Button label={t("streak.milestone.cta")} onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}
