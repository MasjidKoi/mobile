import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Button, Text } from "@/components";
import { useDonation } from "@/hooks/useDonation";
import { useMasjid } from "@/hooks/useMasjid";
import { shareReceipt } from "@/lib/donations/receipt";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";

/**
 * 52 Receipt — a summary card + Open/Share. The actual PDF is the server's
 * Bearer-gated document; tapping Share downloads it and hands it to the OS sheet
 * (no embedded renderer).
 */
export default function ReceiptScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: donation, isLoading } = useDonation(id);
  const masjid = useMasjid(donation?.masjid_id);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onShare = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await shareReceipt(id);
    } catch {
      setError(t("donation.receipt.error"));
    } finally {
      setBusy(false);
    }
  };

  const backButton = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
      <Feather name="arrow-left" size={24} color={c["text-primary"]} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar title={t("donation.receipt.title")} left={backButton} />
      {isLoading && !donation ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : (
        <View className="flex-1 px-5 py-4">
          {/* Receipt summary card */}
          <View className="gap-4 rounded-lg border border-border bg-surface p-5">
            <View className="flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Feather name="heart" size={16} color={c["on-inverse"]} />
              </View>
              <Text variant="heading">{t("common.brand")}</Text>
            </View>
            <View className="items-center gap-1 border-y border-border py-5">
              <Text variant="caption" className="text-content-secondary">
                {t("donation.receipt.heading")}
              </Text>
              <Text className="text-display font-bold text-content-primary">
                {f.currency(Number(donation?.gross_amount ?? 0))}
              </Text>
              <Text variant="caption" className="text-content-secondary">
                {masjid.data?.name ?? t("common.brand")}
              </Text>
            </View>
            <View className="gap-2">
              {donation?.receipt_number ? (
                <View className="flex-row justify-between">
                  <Text variant="caption" className="text-content-secondary">
                    {t("donation.detail.receiptNumber")}
                  </Text>
                  <Text variant="caption" className="font-semibold">
                    {donation.receipt_number}
                  </Text>
                </View>
              ) : null}
              <View className="flex-row justify-between">
                <Text variant="caption" className="text-content-secondary">
                  {t("donation.detail.date")}
                </Text>
                <Text variant="caption" className="font-semibold">
                  {f.date(new Date(donation?.completed_at ?? donation?.created_at ?? Date.now()))}
                </Text>
              </View>
            </View>
            <Text variant="micro" className="text-content-muted">
              {t("donation.receipt.taxNote")}
            </Text>
          </View>

          {error ? <Text variant="caption" className="pt-3 text-error">{error}</Text> : null}
        </View>
      )}
      <View className="border-t border-border bg-surface px-4 pb-2 pt-3">
        <Button
          label={busy ? t("donation.receipt.loading") : t("donation.receipt.open")}
          leftIcon={<Feather name="share" size={16} color={c["on-inverse"]} />}
          disabled={busy || !donation}
          onPress={() => void onShare()}
        />
      </View>
    </SafeAreaView>
  );
}
