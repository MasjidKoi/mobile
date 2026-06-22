import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppBar,
  BackButton,
  Banner,
  Button,
  Dialog,
  EmptyState,
  RatingSummary,
  ReviewCard,
  Text,
} from "@/components";
import { useReviewDelete, useReviews } from "@/hooks/useReviews";
import { isOfflineQuery } from "@/lib/api/errors";
import { initials } from "@/lib/community/format";
import { useFormat } from "@/lib/i18n/format";
import type { MasjidReview } from "@/lib/masjids/profile-api";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLoginGate } from "@/providers/LoginGateProvider";

/** 85 Reviews List / 91 Profile Community — aggregate + paginated reviews, with
 * the caller's own review surfaced for edit/delete and a gated write CTA. */
export default function ReviewsListScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { user } = useAuth();
  const { requireAuth } = useLoginGate();
  const { id: masjidId } = useLocalSearchParams<{ id: string }>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);

  const q = useReviews(masjidId);
  const del = useReviewDelete(masjidId);
  const firstPage = q.data?.pages[0];
  const all = q.data?.pages.flatMap((p) => p.items) ?? [];
  const mine = user ? all.find((r) => r.user_id === user.user_id) : undefined;
  const others = mine ? all.filter((r) => r.review_id !== mine.review_id) : all;
  const offline = isOfflineQuery(q);

  const goWrite = (review?: MasjidReview) =>
    requireAuth(
      () =>
        router.push({
          pathname: "/review/[id]",
          params: {
            id: masjidId,
            ...(review ? { rating: String(review.rating), body: review.body ?? "" } : {}),
          },
        }),
      "community",
    );

  const header = (
    <View className="gap-3 pb-2">
      {firstPage && firstPage.average_rating != null && firstPage.total > 0 ? (
        <RatingSummary
          rating={firstPage.average_rating}
          countLabel={t("masjid.reviews.count", { formatted: f.number(firstPage.total) })}
        />
      ) : null}

      {mine ? (
        <View className="gap-2 rounded-md border border-border bg-primary-soft p-4">
          <Text variant="caption" className="font-semibold text-primary">
            {t("community.reviews.yours")}
          </Text>
          <ReviewCard
            name={mine.reviewer_display_name || t("community.reviews.anonymous")}
            date={f.date(new Date(mine.created_at))}
            rating={mine.rating}
            text={mine.body ?? ""}
            initials={initials(mine.reviewer_display_name)}
            className="border-0 bg-transparent p-0"
          />
          <View className="flex-row gap-2 pt-1">
            <Button
              variant="secondary"
              label={t("community.reviews.edit")}
              className="flex-1"
              onPress={() => goWrite(mine)}
            />
            <Button
              variant="text"
              label={t("community.reviews.delete")}
              onPress={() => setConfirmDelete(true)}
            />
          </View>
        </View>
      ) : (
        <Button
          label={t("community.reviews.writeCta")}
          leftIcon={<Feather name="edit-3" size={16} color={c["on-inverse"]} />}
          onPress={() => goWrite()}
        />
      )}

      {offline ? (
        <Banner
          variant="warning"
          icon={<Feather name="wifi-off" size={15} color="#8A6A1F" />}
          message={t("community.reviews.offline")}
        />
      ) : null}

      {delError ? (
        <Banner
          variant="warning"
          icon={<Feather name="alert-triangle" size={15} color="#8A6A1F" />}
          message={delError}
        />
      ) : null}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("masjid.profile.reviews")} left={<BackButton onPress={() => router.back()} />} />
      <FlatList
        data={others}
        keyExtractor={(r) => r.review_id}
        contentContainerClassName="gap-2.5 px-4 py-3 pb-8"
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <ReviewCard
            name={item.reviewer_display_name || t("community.reviews.anonymous")}
            date={f.date(new Date(item.created_at))}
            rating={item.rating}
            text={item.body ?? ""}
            initials={initials(item.reviewer_display_name)}
          />
        )}
        ListEmptyComponent={
          q.isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : offline || mine ? null : (
            <View className="items-center px-6 py-10">
              <EmptyState
                icon={<Feather name="message-square" size={26} color={c.primary} />}
                title={t("community.reviews.emptyTitle")}
                caption={t("community.reviews.emptyCaption")}
              />
            </View>
          )
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (q.hasNextPage && !q.isFetchingNextPage) void q.fetchNextPage();
        }}
        ListFooterComponent={
          q.isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : null
        }
      />

      <Dialog
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t("community.reviews.deleteConfirmTitle")}
        description={t("community.reviews.deleteConfirmBody")}
      >
        <View className="flex-row justify-end gap-2 pt-1">
          <Button variant="text" label={t("common.cancel")} onPress={() => setConfirmDelete(false)} />
          <Button
            variant="text"
            label={t("community.reviews.delete")}
            onPress={() => {
              setConfirmDelete(false);
              if (mine) {
                setDelError(null);
                del.mutate(mine.review_id, {
                  onError: () => setDelError(t("community.reviews.deleteError")),
                });
              }
            }}
          />
        </View>
      </Dialog>
    </SafeAreaView>
  );
}
