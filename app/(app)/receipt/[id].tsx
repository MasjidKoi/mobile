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
import { useAuth } from "@/providers/AuthProvider";

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
  const { user } = useAuth();
  const donorName = user?.display_name?.trim() || null;

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
  const shareButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("donation.receipt.open")}
      onPress={() => void onShare()}
      hitSlop={12}
    >
      <Feather name="share" size={20} color={c["text-primary"]} />
    </Pressable>
  );
  const kvRow = (label: string, value: string) => (
    <View className="flex-row items-center justify-between gap-3">
      <Text variant="caption" className="text-content-muted">
        {label}
      </Text>
      <Text
        variant="caption"
        numberOfLines={1}
        className="flex-1 text-right font-semibold text-content-primary"
      >
        {value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar title={t("donation.receipt.title")} left={backButton} right={shareButton} />
      {isLoading && !donation ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : (
        <View className="flex-1 px-5 py-4">
          {/* 52 Receipt — official acknowledgment document */}
          <View
            className="gap-3.5 rounded-md bg-surface p-6"
            style={{
              shadowColor: "#182420",
              shadowOpacity: 0.12,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            {/* NGO header */}
            <View className="flex-row items-center gap-2.5">
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Text className="text-base font-bold" style={{ color: c["on-inverse"] }}>
                  MK
                </Text>
              </View>
              <View className="flex-1 gap-px">
                <Text className="text-[15px] font-bold text-content-primary">
                  {t("donation.receipt.ngoName")}
                </Text>
                <Text className="text-[10px] text-content-muted">{t("donation.receipt.ngoReg")}</Text>
              </View>
            </View>
            <View className="h-px bg-border" />

            {/* Title */}
            <Text className="text-center text-[16px] font-bold text-content-primary">
              {t("donation.receipt.documentTitle")}
            </Text>

            {/* Meta — receipt no + date */}
            <View className="flex-row items-center justify-between">
              <Text variant="micro" className="font-medium text-content-secondary">
                {donation?.receipt_number
                  ? `${t("donation.detail.receiptNumber")}: ${donation.receipt_number}`
                  : ""}
              </Text>
              <Text variant="micro" className="font-medium text-content-secondary">
                {`${t("donation.detail.date")}: ${f.date(
                  new Date(donation?.completed_at ?? donation?.created_at ?? Date.now()),
                )}`}
              </Text>
            </View>

            {/* Amount */}
            <View className="items-center gap-0.5 rounded-md bg-background py-3.5">
              {donorName ? (
                <Text variant="caption" className="text-content-secondary">
                  {t("donation.receipt.receivedFrom", { name: donorName })}
                </Text>
              ) : null}
              <Text className="text-[26px] font-bold" style={{ color: c.primary }}>
                {f.currency(Number(donation?.gross_amount ?? 0))}
              </Text>
            </View>

            {/* Key/value table */}
            <View className="gap-2.5">
              {kvRow(t("donation.receipt.masjidLabel"), masjid.data?.name ?? t("common.brand"))}
              {donation
                ? kvRow(t("donation.detail.category"), t(`donation.category.${donation.category}`))
                : null}
              {donation?.gateway_payment_method
                ? kvRow(t("donation.detail.method"), donation.gateway_payment_method)
                : null}
              {kvRow(t("donation.receipt.txnLabel"), donation?.donation_id ?? id)}
            </View>

            {/* Tax note */}
            <View className="flex-row items-center gap-1.5 rounded-md bg-primary-soft px-3 py-2">
              <Feather name="check-circle" size={13} color={c.primary} />
              <Text className="flex-1 text-[11px] font-medium" style={{ color: c.primary }}>
                {t("donation.receipt.taxDeductible")}
              </Text>
            </View>

            {/* Footer — disclaimer + seal */}
            <View className="flex-row items-center justify-between">
              <Text className="text-[9px] text-content-muted" style={{ maxWidth: 200 }}>
                {t("donation.receipt.computerGenerated")}
              </Text>
              <View className="h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-primary bg-surface">
                <Feather name="award" size={20} color={c.primary} />
              </View>
            </View>
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
