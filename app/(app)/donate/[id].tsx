import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Button, EmptyState } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/**
 * Stub donation route — the navigable target for the profile's Donate bar and
 * campaign cards (Phase 5). The full donate flow (amount → SSLCommerz → return)
 * is filled in by Phase 6. Created now so those CTAs land somewhere real.
 */
export default function DonateStub() {
  const { t } = useTranslation();
  const c = useColors();
  // `id` = masjid id; `campaignId` set when launched from a campaign card.
  useLocalSearchParams<{ id: string; campaignId?: string }>();

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar
        title={t("masjid.donate.label")}
        left={
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={24} color={c["text-primary"]} />
          </Pressable>
        }
      />
      <View className="flex-1 items-center justify-center px-lg">
        <EmptyState
          icon={<Feather name="heart" size={28} color={c.primary} />}
          title={t("shell.comingSoon")}
          caption={t("masjid.donate.comingSoon")}
          action={<Button variant="text" label={t("common.close")} onPress={() => router.back()} />}
        />
      </View>
    </SafeAreaView>
  );
}
