import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Button, RatingSummary, ReviewCard, SectionHeader, Text } from "@/components";
import { useFormat } from "@/lib/i18n/format";
import type { MasjidReview } from "@/lib/masjids/profile-api";
import { useColors } from "@/lib/theme/useColors";

export type ReviewsSlotProps = {
  averageRating: number | null;
  total: number;
  /** A few most-recent reviews to preview (from the summary fetch). */
  preview?: MasjidReview[];
  /** Open the full reviews list (85/91). */
  onSeeAll: () => void;
  /** Start the write/edit flow (gated by the caller). */
  onWrite: () => void;
};

function initials(name: string | null): string {
  return (name?.trim().slice(0, 2) || "🙂").toUpperCase();
}

/**
 * Reviews slot on the masjid profile (design 20). Phase 8 fills it in: the
 * aggregate rating, a short preview of recent reviews with a "see all" link, and
 * a gated "write a review" entry. Falls back to a "be the first" prompt when
 * there are none.
 */
export function ReviewsSlot({ averageRating, total, preview, onSeeAll, onWrite }: ReviewsSlotProps) {
  const { t } = useTranslation();
  const f = useFormat();
  const c = useColors();
  const hasReviews = averageRating != null && total > 0;

  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between">
        <SectionHeader title={t("masjid.profile.reviews")} />
        {hasReviews ? (
          <Pressable accessibilityRole="button" onPress={onSeeAll} hitSlop={6}>
            <Text variant="caption" className="font-semibold text-primary">
              {t("community.reviews.seeAll")}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {hasReviews ? (
        <View className="gap-2.5">
          <RatingSummary
            rating={averageRating}
            countLabel={t("masjid.reviews.count", { formatted: f.number(total) })}
          />
          {(preview ?? []).slice(0, 2).map((r) => (
            <ReviewCard
              key={r.review_id}
              name={r.reviewer_display_name || t("community.reviews.anonymous")}
              date={f.date(new Date(r.created_at))}
              rating={r.rating}
              text={r.body ?? ""}
              initials={initials(r.reviewer_display_name)}
            />
          ))}
          <Button
            variant="secondary"
            label={t("community.reviews.writeCta")}
            leftIcon={<Feather name="edit-3" size={16} color={c.primary} />}
            onPress={onWrite}
          />
        </View>
      ) : (
        <View className="gap-2.5">
          <Text className="text-caption font-regular text-content-secondary">
            {t("masjid.reviews.empty")}
          </Text>
          <Button
            variant="secondary"
            label={t("community.reviews.writeFirstCta")}
            leftIcon={<Feather name="edit-3" size={16} color={c.primary} />}
            onPress={onWrite}
          />
        </View>
      )}
    </View>
  );
}

export default ReviewsSlot;
