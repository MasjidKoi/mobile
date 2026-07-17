import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, BadgeTile, Button, EmptyState } from "@/components";
import { useBadges } from "@/hooks/useBadges";
import { BADGE_META, BADGE_TIER_COUNT, sortBadgeFamilies, type BadgeFamily } from "@/lib/badges/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

/** 103 Badge Gallery — rendered dynamically from the API's three families. */
export default function BadgeGalleryScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useLoginGate();
  const { data, isLoading } = useBadges();

  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title={t("badges.title")} left={<BackButton />} />
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="award" size={28} color={c.primary} />}
            title={t("badges.guest.title")}
            caption={t("badges.guest.subtitle")}
            action={<Button label={t("badges.guest.cta")} onPress={() => requireAuth(() => {}, "generic")} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const families = data ? sortBadgeFamilies(data) : [];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("badges.title")} left={<BackButton />} />
      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-4 py-3 pb-10">
          <View className="flex-row flex-wrap justify-between">
            {families.map((fam) => (
              <View key={fam.badge_type} className="mb-3 w-[48%]">
                <BadgeFamilyTile family={fam} />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function BadgeFamilyTile({ family }: { family: BadgeFamily }) {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const meta = BADGE_META[family.badge_type];
  // Unknown family (client/server skew) — skip rather than crash on meta.key/icon.
  if (!meta) return null;
  const earned = family.current_tier > 0;
  const state = earned ? "earned" : "progress";
  const tierLabel = earned
    ? t("badges.tierLabel", { tier: f.number(family.current_tier) })
    : t("badges.locked");
  const progress =
    family.next_threshold != null
      ? t("badges.progress", {
          current: f.number(family.current_value),
          target: f.number(family.next_threshold),
        })
      : t("badges.detail.maxed");

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/badges/[type]", params: { type: family.badge_type } })}
    >
      <BadgeTile
        name={t(`badges.families.${meta.key}.name`)}
        icon={<Feather name={meta.icon} size={22} color={earned ? "#8A6A1F" : c["text-muted"]} />}
        tier={tierLabel}
        state={state}
        tiers={{ total: BADGE_TIER_COUNT, earned: family.current_tier }}
        progress={progress}
      />
    </Pressable>
  );
}
