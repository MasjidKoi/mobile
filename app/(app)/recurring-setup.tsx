import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Banner, Button, Last10NightsCard, SegmentedControl, Text } from "@/components";
import { AmountField } from "@/components/donation";
import { useCreateRecurring } from "@/hooks/useRecurringSchedules";
import { useMasjid } from "@/hooks/useMasjid";
import type { RecurringFrequency, RecurringScheduleCreate } from "@/lib/donations/types";
import { DONATION_MAX, DONATION_MIN } from "@/lib/forms/schemas";
import { useColors } from "@/lib/theme/useColors";

/**
 * 46 Recurring Setup / 47 Last 10 Nights. `preset=last10` switches to the
 * nightly Ramadan variant. Recurring is a **reminder**, not an auto-charge — the
 * note makes that explicit. Reached post-auth (from the success nudge), scoped
 * to a masjid or campaign.
 */
export default function RecurringSetupScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { masjidId, campaignId, amount, preset } = useLocalSearchParams<{
    masjidId: string;
    campaignId?: string;
    amount?: string;
    preset?: string;
  }>();
  const masjid = useMasjid(masjidId);
  const create = useCreateRecurring();

  const nightly = preset === "last10";
  const [frequency, setFrequency] = useState<RecurringFrequency>(nightly ? "nightly" : "weekly");
  const [amountText, setAmountText] = useState(amount ? String(Math.round(Number(amount)) || "") : "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inFlight = useRef(false);

  const amt = Number(amountText) || 0;
  const amountValid = amt >= DONATION_MIN && amt <= DONATION_MAX;

  const submit = async () => {
    if (inFlight.current) return;
    if (!amountValid) {
      setErrorMsg(t(amt > DONATION_MAX ? "validation.amount_too_high" : "validation.amount_too_low"));
      return;
    }
    inFlight.current = true;
    setErrorMsg(null);
    const body: RecurringScheduleCreate = campaignId
      ? { campaign_id: campaignId, amount: amt, frequency }
      : { masjid_id: masjidId, amount: amt, frequency };
    try {
      await create.mutateAsync(body);
      router.replace("/recurring");
    } catch {
      setErrorMsg(t("donation.checkout.error"));
    } finally {
      inFlight.current = false;
    }
  };

  const backButton = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
      <Feather name="arrow-left" size={24} color={c["text-primary"]} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar title={nightly ? t("donation.recurring.last10Title") : t("donation.recurring.setupTitle")} left={backButton} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="gap-lg px-5 py-3 pb-6" keyboardShouldPersistTaps="handled">
          {/* Masjid header */}
          <View className="flex-row items-center gap-3 rounded-md border border-border bg-surface p-3.5">
            <View className="h-11 w-11 items-center justify-center rounded-lg bg-primary-soft">
              <Feather name="home" size={20} color={c.primary} />
            </View>
            <Text variant="body" numberOfLines={1} className="flex-1 font-semibold">
              {masjid.data?.name ?? t("common.brand")}
            </Text>
          </View>

          {nightly ? (
            <Banner
              variant="info"
              icon={<Feather name="moon" size={15} color={c.primary} />}
              message={t("donation.recurring.last10Caption")}
            />
          ) : (
            <View className="gap-2.5">
              <Text variant="caption" className="text-content-secondary">
                {t("donation.recurring.frequencyLabel")}
              </Text>
              <SegmentedControl
                value={frequency}
                onChange={(k) => setFrequency(k as RecurringFrequency)}
                options={[
                  { key: "weekly", label: t("donation.recurring.weekly") },
                  { key: "monthly", label: t("donation.recurring.monthly") },
                ]}
              />
            </View>
          )}

          {/* Amount */}
          <View className="gap-2.5">
            <Text variant="caption" className="text-content-secondary">
              {t("donation.recurring.amountLabel")}
            </Text>
            <AmountField
              value={amountText}
              onChange={(v) => {
                setAmountText(v);
                setErrorMsg(null);
              }}
            />
          </View>

          {/* Reminder-only disclosure — the core mental model for recurring */}
          <Banner
            variant="warning"
            icon={<Feather name="bell" size={15} color="#8A6A1F" />}
            message={t("donation.recurring.reminderNote")}
          />

          {/* Switch to the Last-10-Nights nightly variant */}
          {!nightly ? (
            <Last10NightsCard
              icon={<Feather name="moon" size={20} color={c["on-inverse"]} />}
              title={t("donation.recurring.last10Title")}
              subtitle={t("donation.recurring.last10Caption")}
              action={
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: "/recurring-setup",
                      params: { masjidId, ...(campaignId ? { campaignId } : {}), ...(amountText ? { amount: amountText } : {}), preset: "last10" },
                    })
                  }
                  className="rounded-full bg-surface/20 px-3 py-1.5"
                >
                  <Feather name="arrow-right" size={16} color={c["on-inverse"]} />
                </Pressable>
              }
            />
          ) : null}

          {errorMsg ? <Text variant="caption" className="text-error">{errorMsg}</Text> : null}
        </ScrollView>
        <View className="border-t border-border bg-surface px-4 pb-2 pt-3">
          <Button
            label={
              create.isPending
                ? t("donation.recurring.creating")
                : nightly
                  ? t("donation.recurring.last10Cta")
                  : t("donation.recurring.cta", { frequency: t(`donation.recurring.${frequency}`) })
            }
            leftIcon={<Feather name="repeat" size={16} color={c["on-inverse"]} />}
            disabled={!amountValid || create.isPending}
            onPress={() => void submit()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
