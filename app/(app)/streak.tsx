import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Button, Card, Dialog, Row, Text } from "@/components";
import { useStreak } from "@/hooks/useStreak";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/** 97 Streak Detail (+ 99 Freeze Applied dialog). */
export default function StreakDetailScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { data, isLoading } = useStreak();
  const [freezeDialog, setFreezeDialog] = useState(false);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("streak.title")} left={<BackButton />} />
      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-md px-4 py-3 pb-10">
          {/* Hero — current streak on a solid-green block */}
          <View className="items-center gap-1.5 rounded-lg bg-primary px-4 py-[22px]">
            <MaterialCommunityIcons name="fire" size={40} color="#FFFFFF" />
            <Text className="font-bold" style={{ color: "#FFFFFF", fontSize: 46, lineHeight: 52 }}>
              {f.number(data?.current ?? 0)}
            </Text>
            <Text className="text-base font-medium" style={{ color: "#FFFFFFCC" }}>
              {t("journal.streakLabel")}
            </Text>
            {data && data.longest > 0 ? (
              <View className="mt-0.5 rounded-full px-3 py-1" style={{ backgroundColor: "#FFFFFF26" }}>
                <Text className="text-caption font-semibold" style={{ color: "#FFFFFF" }}>
                  {`${t("streak.longest")} ${f.number(data.longest)} ${t("streak.dayUnit")}`}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Streak rule */}
          <View className="flex-row items-center gap-2.5 rounded-md bg-primary-soft px-3.5 py-3">
            <Feather name="info" size={16} color={c.primary} />
            <Text className="flex-1 text-caption font-medium text-primary">{t("streak.rule")}</Text>
          </View>

          {/* Freezes */}
          <Card>
            <Row
              icon={<MaterialCommunityIcons name="snowflake" size={18} color="#4A7FA5" />}
              title={t("streak.freezesHeld", { n: f.number(data?.freezes_held ?? 0) })}
              subtitle={t("streak.freezesExplain")}
            />
            {data && data.freezes_applied > 0 ? (
              <Row
                icon={<Feather name="check-circle" size={18} color={c.primary} />}
                title={t("streak.freezesApplied", { n: f.number(data.freezes_applied) })}
                trailing={<Feather name="chevron-right" size={20} color={c["text-muted"]} />}
                onPress={() => setFreezeDialog(true)}
              />
            ) : null}
          </Card>

          <Card>
            <Row
              icon={<Feather name="moon" size={18} color={c.primary} />}
              title={t("streak.exemptCta")}
              subtitle={t("streak.exempt.subtitle")}
              trailing={<Feather name="chevron-right" size={20} color={c["text-muted"]} />}
              onPress={() => router.push("/exempt-mode")}
            />
          </Card>
        </ScrollView>
      )}

      {/* 99 Freeze Applied — centered snowflake celebration. */}
      <Dialog visible={freezeDialog} onClose={() => setFreezeDialog(false)}>
        <View className="items-center gap-3">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#E8F0F5]">
            <MaterialCommunityIcons name="snowflake" size={32} color="#4A7FA5" />
          </View>
          <Text className="text-center text-[19px] font-semibold text-content-primary">
            {t("streak.freezeApplied.title")}
          </Text>
          <Text className="text-center text-body font-regular text-content-secondary">
            {t("streak.freezeApplied.body")}
          </Text>
          {data && data.freezes_applied > 0 ? (
            <View className="flex-row items-center gap-1.5 rounded-full bg-[#E8F0F5] px-3 py-1.5">
              <MaterialCommunityIcons name="snowflake" size={13} color="#4A7FA5" />
              <Text className="text-caption font-semibold text-[#4A7FA5]">
                {t("streak.freezeApplied.chip", { n: f.number(data.freezes_applied) })}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="pt-2">
          <Button label={t("streak.freezeApplied.ok")} onPress={() => setFreezeDialog(false)} />
        </View>
      </Dialog>
    </SafeAreaView>
  );
}
