import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Banner, BottomSheet, Button, Chip, EmptyState, StatCard, Text } from "@/components";
import { DonationHistoryRow } from "@/components/donation";
import { useDonationSummary, useMyDonations } from "@/hooks/useDonations";
import { ApiError } from "@/lib/api/errors";
import { DONATION_CATEGORIES, donationStatusTone } from "@/lib/donations/presets";
import type { DonationCategory, DonationStatus } from "@/lib/donations/types";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

const STATUS_CHIPS: (DonationStatus | undefined)[] = [undefined, "completed", "pending"];
type CategoryFilter = DonationCategory | "campaign";

/** 49 Donations Dashboard (+ 50 filters sheet, 54 empty, 55 offline). */
export default function DonationsDashboardScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();

  const [status, setStatus] = useState<DonationStatus | undefined>(undefined);
  const [category, setCategory] = useState<CategoryFilter | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState<CategoryFilter | undefined>(undefined);
  const [downloading, setDownloading] = useState(false);

  const summary = useDonationSummary();
  const q = useMyDonations({ status, category });
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const offline =
    q.isError && q.failureReason instanceof ApiError && q.failureReason.isNetworkError;

  const downloadAnnual = async () => {
    if (downloading || !summary.data) return;
    setDownloading(true);
    try {
      const { shareAnnualReport } = await import("@/lib/donations/receipt");
      await shareAnnualReport(summary.data.year);
    } catch {
      // Sharing was unavailable or the export failed — non-fatal.
    } finally {
      setDownloading(false);
    }
  };

  const statusLabel = (s: DonationStatus) => t(`donation.status.${s}`);

  const header = (
    <View className="gap-4 pb-2">
      {/* Summary */}
      <View className="gap-3 rounded-lg border border-border bg-surface p-4">
        <View className="gap-0.5">
          <Text variant="caption" className="text-content-secondary">
            {t("donation.dashboard.lifetime")}
          </Text>
          <Text className="text-display font-bold text-content-primary">
            {f.currency(Number(summary.data?.lifetime_total ?? 0))}
          </Text>
        </View>
        <View className="flex-row gap-2.5">
          <StatCard
            label={t("donation.dashboard.thisYear")}
            value={f.currency(Number(summary.data?.this_year_total ?? 0))}
          />
          <StatCard
            label={t("donation.dashboard.masjids")}
            value={f.number(summary.data?.per_masjid.length ?? 0)}
          />
        </View>
      </View>

      {/* Recurring giving row */}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/recurring")}
        className="flex-row items-center gap-3 rounded-md border border-border bg-surface px-4 py-3"
      >
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-soft">
          <Feather name="repeat" size={15} color={c.primary} />
        </View>
        <Text variant="body" className="flex-1 font-medium">
          {t("donation.dashboard.recurringRow")}
        </Text>
        <Feather name="chevron-right" size={18} color={c["text-muted"]} />
      </Pressable>

      {/* Status quick-filters + filter sheet trigger */}
      <View className="flex-row items-center gap-2">
        {STATUS_CHIPS.map((s) => (
          <Chip
            key={s ?? "all"}
            label={s ? statusLabel(s) : t("donation.dashboard.filterAll")}
            selected={status === s}
            onPress={() => setStatus(s)}
          />
        ))}
        <View className="flex-1" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("donation.filters.title")}
          onPress={() => {
            setDraftCategory(category);
            setSheetOpen(true);
          }}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface"
        >
          <Feather name="sliders" size={16} color={category ? c.primary : c["text-secondary"]} />
        </Pressable>
      </View>

      {offline ? (
        <Banner
          variant="warning"
          icon={<Feather name="wifi-off" size={15} color="#8A6A1F" />}
          message={t("donation.dashboard.offline")}
        />
      ) : null}
    </View>
  );

  const backButton = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
      <Feather name="arrow-left" size={24} color={c["text-primary"]} />
    </Pressable>
  );
  const downloadButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("donation.dashboard.annualReport")}
      onPress={() => void downloadAnnual()}
      hitSlop={12}
    >
      {downloading ? (
        <ActivityIndicator color={c.primary} />
      ) : (
        <Feather name="download" size={22} color={c["text-primary"]} />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title={t("donation.dashboard.title")} left={backButton} right={downloadButton} />
      <FlatList
        data={items}
        keyExtractor={(d) => d.donation_id}
        contentContainerClassName="gap-2 px-4 py-3 pb-8"
        ListHeaderComponent={header}
        ListHeaderComponentStyle={{ marginBottom: 4 }}
        renderItem={({ item }) => (
          <DonationHistoryRow
            title={item.masjid_name}
            dateLabel={f.date(new Date(item.created_at))}
            amountLabel={f.currency(Number(item.gross_amount) || 0)}
            statusLabel={statusLabel(item.status)}
            statusTone={donationStatusTone(item.status)}
            onPress={() =>
              router.push({ pathname: "/donation/[id]", params: { id: item.donation_id } })
            }
          />
        )}
        ListEmptyComponent={
          q.isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : offline ? null : (
            <View className="items-center px-6 py-12">
              <EmptyState
                icon={<Feather name="heart" size={26} color={c.primary} />}
                title={t("donation.dashboard.emptyTitle")}
                caption={t("donation.dashboard.emptyCaption")}
                action={
                  <Button
                    variant="text"
                    label={t("donation.dashboard.emptyCta")}
                    onPress={() => router.push("/explore")}
                  />
                }
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

      {/* 50 History Filters */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Text variant="title">{t("donation.filters.title")}</Text>
        <Text variant="caption" className="text-content-secondary">
          {t("donation.filters.category")}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Chip
            label={t("donation.filters.all")}
            selected={!draftCategory}
            onPress={() => setDraftCategory(undefined)}
          />
          {[...DONATION_CATEGORIES, "campaign" as const].map((cat) => (
            <Chip
              key={cat}
              label={t(`donation.category.${cat}`)}
              selected={draftCategory === cat}
              onPress={() => setDraftCategory(cat)}
            />
          ))}
        </View>
        <View className="flex-row gap-2.5 pt-1">
          <Button
            variant="secondary"
            label={t("donation.filters.clear")}
            className="flex-1"
            onPress={() => {
              setDraftCategory(undefined);
              setCategory(undefined);
              setSheetOpen(false);
            }}
          />
          <Button
            label={t("donation.filters.apply")}
            className="flex-1"
            onPress={() => {
              setCategory(draftCategory);
              setSheetOpen(false);
            }}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
