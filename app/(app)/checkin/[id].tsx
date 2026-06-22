import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Button, Text } from "@/components";
import type { CheckInBadge } from "@/lib/checkins/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

type CheckInStatus = "success" | "too_far" | "error";

/** 89 Check-in Success / 90 Check-in Too Far. The profile performs the POST and
 * routes here with the outcome; success also offers a review prompt (88). */
export default function CheckInResultScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const params = useLocalSearchParams<{
    id: string;
    status: CheckInStatus;
    checkedInAt?: string;
    masjidName?: string;
    badges?: string;
  }>();
  const masjidId = params.id;
  const status = params.status ?? "error";

  const badges = useMemo<CheckInBadge[]>(() => {
    if (!params.badges) return [];
    try {
      return JSON.parse(params.badges) as CheckInBadge[];
    } catch {
      return [];
    }
  }, [params.badges]);

  const success = status === "success";
  const tooFar = status === "too_far";

  const icon = success ? "check-circle" : tooFar ? "map-pin" : "alert-circle";
  const tone = success ? c.primary : c["accent-gold"];
  const title = t(
    success ? "community.checkin.successTitle" : tooFar ? "community.checkin.tooFarTitle" : "community.checkin.errorTitle",
  );
  const caption = success
    ? params.masjidName
      ? t("community.checkin.successAt", { masjid: params.masjidName })
      : t("community.checkin.successCaption")
    : tooFar
      ? t("community.checkin.tooFarCaption", { meters: f.number(100) })
      : t("community.checkin.errorCaption");

  // Presented as a transparentModal: a scrim dims the profile behind, with the
  // outcome card anchored to the bottom on success (89) and centered otherwise (90).
  return (
    <View className={`flex-1 bg-scrim px-4 ${success ? "justify-end pb-10" : "justify-center"}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.done")}
        className="absolute inset-0"
        onPress={() => router.back()}
      />
      <View className="gap-4 rounded-2xl bg-surface p-6">
        <View className="items-center gap-3">
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: success ? c["primary-soft"] : c["accent-gold-soft"] }}
          >
            <Feather name={icon} size={30} color={tone} />
          </View>
          <View className="items-center gap-1.5">
            <Text variant="title" className="text-center">
              {title}
            </Text>
            <Text variant="body" className="text-center text-content-secondary">
              {caption}
            </Text>
            {success && params.checkedInAt ? (
              <Text variant="caption" className="text-content-muted">
                {f.time(new Date(params.checkedInAt))}
              </Text>
            ) : null}
          </View>
        </View>

        {/* New gamification badges (minimal — full gallery is Phase 9). */}
        {badges.length > 0 ? (
          <View className="gap-2 rounded-md border border-border bg-background p-4">
            <Text variant="caption" className="font-semibold text-content-secondary">
              {t("community.checkin.newBadges")}
            </Text>
            {badges.map((b) => (
              <View key={b.badge_id} className="flex-row items-center gap-2.5">
                <Feather name="award" size={18} color={c["accent-gold"]} />
                <Text variant="body" className="flex-1 font-medium">
                  {t(`community.checkin.badge.${b.badge_type}`)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="gap-2">
          {success ? (
            <Button
              label={t("community.checkin.review")}
              leftIcon={<Feather name="edit-3" size={16} color={c["on-inverse"]} />}
              onPress={() =>
                router.replace({
                  pathname: "/review-prompt/[id]",
                  params: { id: masjidId, masjidName: params.masjidName ?? "" },
                })
              }
            />
          ) : tooFar ? (
            <Button label={t("community.checkin.retry")} onPress={() => router.back()} />
          ) : null}
          <Button variant="text" label={t("common.done")} onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}
