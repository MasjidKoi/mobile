import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { RatingSummary, SectionHeader, Text } from "@/components";
import { useFormat } from "@/lib/i18n/format";

export type ReviewsSlotProps = {
  averageRating: number | null;
  total: number;
};

/**
 * Reviews slot (design 20). Phase 5 reserves the section: it shows the
 * aggregate rating when reviews exist, otherwise a "be the first" prompt. The
 * full review list + write-review land in Phase 8 — hence the "coming soon"
 * note rather than rendered review cards.
 */
export function ReviewsSlot({ averageRating, total }: ReviewsSlotProps) {
  const { t } = useTranslation();
  const f = useFormat();

  return (
    <View className="gap-2.5">
      <SectionHeader title={t("masjid.profile.reviews")} />
      {averageRating != null && total > 0 ? (
        <View className="gap-1.5">
          <RatingSummary
            rating={averageRating}
            countLabel={t("masjid.reviews.count", { formatted: f.number(total) })}
          />
          <Text className="text-[12px] font-regular text-content-muted">
            {t("masjid.reviews.comingSoon")}
          </Text>
        </View>
      ) : (
        <Text className="text-caption font-regular text-content-secondary">
          {t("masjid.reviews.empty")}
        </Text>
      )}
    </View>
  );
}

export default ReviewsSlot;
