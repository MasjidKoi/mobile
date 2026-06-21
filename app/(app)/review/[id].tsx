import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, BackButton, Banner, Button, Input, Text } from "@/components";
import { RatingInput } from "@/components/review";
import { useReviewUpsert } from "@/hooks/useReviews";
import { ApiError } from "@/lib/api/errors";
import { useFormat } from "@/lib/i18n/format";
import { isLowStar, LOW_STAR_MIN_BODY } from "@/lib/reviews/api";

/** 86 Write Review / 87 Write Review (low rating). `id` is the masjid id; an
 * existing review prefills via `rating`/`body` params (PUT replaces it). The
 * 1–2★-needs-20-chars rule is mirrored client-side to match the backend's 422. */
export default function WriteReviewScreen() {
  const { t } = useTranslation();
  const f = useFormat();
  const params = useLocalSearchParams<{ id: string; rating?: string; body?: string }>();
  const masjidId = params.id;
  const isEdit = params.rating != null;

  const [rating, setRating] = useState<number>(Number(params.rating) || 0);
  const [body, setBody] = useState<string>(params.body ?? "");
  const [error, setError] = useState<string | null>(null);

  const upsert = useReviewUpsert(masjidId);

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
    </SafeAreaView>
  );
}
