import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Banner, Button, Dialog, Input, Text } from "@/components";
import { RatingInput } from "@/components/review";
import { useReviewDelete, useReviewUpsert } from "@/hooks/useReviews";
import { ApiError } from "@/lib/api/errors";
import { useColors } from "@/lib/theme/useColors";
import { useFormat } from "@/lib/i18n/format";
import { isLowStar, LOW_STAR_MIN_BODY } from "@/lib/reviews/api";

/** 86 Write Review / 87 Write Review (low rating). `id` is the masjid id; an
 * existing review prefills via `rating`/`body` params (PUT replaces it). The
 * 1–2★-needs-20-chars rule is mirrored client-side to match the backend's 422. */
export default function WriteReviewScreen() {
  const { t } = useTranslation();
  const f = useFormat();
  const c = useColors();
  const params = useLocalSearchParams<{ id: string; rating?: string; body?: string; reviewId?: string }>();
  const masjidId = params.id;
  const isEdit = params.rating != null;
  const reviewId = params.reviewId;

  const [rating, setRating] = useState<number>(Number(params.rating) || 0);
  const [body, setBody] = useState<string>(params.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const upsert = useReviewUpsert(masjidId);
  const del = useReviewDelete(masjidId);

  const remove = () => {
    if (!reviewId) return;
    setConfirmDelete(false);
    setError(null);
    del.mutate(reviewId, {
      onSuccess: () => router.back(),
      onError: () => setError(t("community.reviews.deleteError")),
    });
  };

  const trimmed = body.trim();
  const lowStar = isLowStar(rating);
  const needsMore = lowStar && trimmed.length < LOW_STAR_MIN_BODY;
  const canSubmit = rating > 0 && !needsMore && !upsert.isPending;

  const submit = () => {
    if (!canSubmit) return;
    setError(null);
    upsert.mutate(
      { rating, body: trimmed.length > 0 ? trimmed : null },
      {
        onSuccess: () => router.back(),
        onError: (e) => {
          if (e instanceof ApiError && e.status === 422) {
            setError(t("community.reviews.lowStarHint", { min: f.number(LOW_STAR_MIN_BODY) }));
          } else {
            setError(t("community.reviews.saveError"));
          }
        },
      },
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar
        title={isEdit ? t("community.reviews.editTitle") : t("community.reviews.writeTitle")}
        left={<BackButton onPress={() => router.back()} />}
        right={
          isEdit && reviewId ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("community.reviews.delete")}
              onPress={() => setConfirmDelete(true)}
              hitSlop={12}
            >
              <Feather name="trash-2" size={20} color={c.error} />
            </Pressable>
          ) : undefined
        }
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-4 py-4 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center gap-2 py-2">
            <Text variant="body" className="text-content-secondary">
              {t("community.reviews.ratingPrompt")}
            </Text>
            <RatingInput value={rating} onChange={setRating} />
          </View>

          <Input
            label={t("community.reviews.bodyLabel")}
            value={body}
            onChangeText={setBody}
            placeholder={t("community.reviews.bodyPlaceholder")}
            multiline
            numberOfLines={5}
            maxLength={1000}
            textAlignVertical="top"
            className="min-h-[120px]"
          />

          {lowStar ? (
            <Text
              variant="caption"
              className={needsMore ? "text-error" : "text-content-muted"}
            >
              {t("community.reviews.lowStarHint", { min: f.number(LOW_STAR_MIN_BODY) })}
              {needsMore ? ` (${f.number(trimmed.length)}/${f.number(LOW_STAR_MIN_BODY)})` : ""}
            </Text>
          ) : null}

          {error ? (
            <Banner
              variant="warning"
              icon={<Feather name="alert-triangle" size={15} color="#8A6A1F" />}
              message={error}
            />
          ) : null}

          <Button
            label={isEdit ? t("community.reviews.update") : t("community.reviews.submit")}
            disabled={!canSubmit}
            onPress={submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Dialog
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t("community.reviews.deleteConfirmTitle")}
        description={t("community.reviews.deleteConfirmBody")}
      >
        <View className="flex-row justify-end gap-2 pt-1">
          <Button variant="text" label={t("common.cancel")} onPress={() => setConfirmDelete(false)} />
          <Button variant="text" label={t("community.reviews.delete")} onPress={remove} />
        </View>
      </Dialog>
    </SafeAreaView>
  );
}
