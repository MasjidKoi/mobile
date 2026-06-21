import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Button, Text } from "@/components";
import { RatingInput } from "@/components/review";
import { useColors } from "@/lib/theme/useColors";

/**
 * 88 Review Prompt — a bottom sheet offered right after a successful check-in
 * (the check-in result routes here). Picking a star pre-selects the rating and
 * carries it into the full write screen; "Not now" dismisses to the profile.
 */
export default function ReviewPromptScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const params = useLocalSearchParams<{ id: string; masjidName?: string }>();
  const masjidId = params.id;
  const [rating, setRating] = useState(0);

  const write = (stars: number) =>
    router.replace({
      pathname: "/review/[id]",
      params: { id: masjidId, ...(stars > 0 ? { rating: String(stars) } : {}) },
    });

  return (
    <View className="flex-1 justify-end">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("community.reviews.notNow")}
        className="absolute inset-0 bg-scrim"
        onPress={() => router.back()}
      />
      <View className="items-center gap-3 rounded-t-2xl bg-surface px-6 pb-8 pt-3">
        <View className="h-1 w-9 rounded-full bg-border" />
        <View
          className="items-center justify-center rounded-full"
          style={{ height: 52, width: 52, backgroundColor: c["accent-gold-soft"] }}
        >
          <Feather name="star" size={26} color={c["accent-gold"]} />
        </View>
        <Text variant="heading" className="text-center">
          {t("community.reviews.promptTitle")}
        </Text>
        <Text
          variant="caption"
          className="max-w-[300px] text-center text-content-secondary"
        >
          {t("community.reviews.promptBody", {
            masjid: params.masjidName || t("common.brand"),
          })}
        </Text>
        <View className="py-1.5">
          {/* Pick a rating here; it carries into the form via "Write a review". */}
          <RatingInput value={rating} onChange={setRating} size={34} />
        </View>
        <View className="w-full gap-2.5 pt-1">
          <Button label={t("community.reviews.writeCta")} onPress={() => write(rating)} />
          <Button
            variant="text"
            label={t("community.reviews.notNow")}
            onPress={() => router.back()}
          />
        </View>
      </View>
    </View>
  );
}
