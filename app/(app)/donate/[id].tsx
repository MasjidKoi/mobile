import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Banner, Button, Chip, Input, Text } from "@/components";
import { AmountField, AnonymityRow, FeeDisclosure } from "@/components/donation";
import { useCampaign } from "@/hooks/useCampaign";
import { useCreateDonation } from "@/hooks/useCreateDonation";
import { useMasjid } from "@/hooks/useMasjid";
import { openCheckout } from "@/lib/donations/checkout";
import { DONATION_CATEGORIES } from "@/lib/donations/presets";
import type { DonationCategory } from "@/lib/donations/types";
import { DONATION_MAX, DONATION_MIN } from "@/lib/forms/schemas";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";
import { useAuth } from "@/providers/AuthProvider";

/** Display-only fee estimate (backend `SSLCOMMERZ_FEE_RATE` default). The real
 *  net is reconciled from the confirmed donation; this row is labelled "~". */
const FEE_RATE = 0.025;

type Step = "amount" | "name";

/**
 * 35 Donate Amount → 36 Validation → 37 Name → SSLCommerz checkout. `id` is the
 * masjid id; `campaignId` (set from a campaign card) routes the gift to the
 * campaign endpoint and forces the `campaign` category server-side. 🔒 reached
 * only via the LoginGate, so the user is always authenticated here.
 */
export default function DonateScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { user } = useAuth();
  const { id, campaignId } = useLocalSearchParams<{ id: string; campaignId?: string }>();
  const masjid = useMasjid(id);
  const { campaign } = useCampaign(id, campaignId ?? "");
  const create = useCreateDonation();

  const [step, setStep] = useState<Step>("amount");
  const [amountText, setAmountText] = useState("");
  const [category, setCategory] = useState<DonationCategory>("general");
  const [anonymous, setAnonymous] = useState(user?.donate_anonymously_by_default ?? false);
  const [name, setName] = useState(user?.display_name ?? "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Stays true across create → browser → navigate so the CTA can't double-fire.
  const [processing, setProcessing] = useState(false);
  const inFlight = useRef(false);

  const amount = Number(amountText) || 0;
  const estimatedNet = Math.round(amount * (1 - FEE_RATE));
  const amountValid = amount >= DONATION_MIN && amount <= DONATION_MAX;

  const submit = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setProcessing(true);
    setErrorMsg(null);
    const donorName = anonymous ? null : name.trim() || null;
    try {
      const res = campaignId
        ? await create.mutateAsync({
            kind: "campaign",
            campaignId,
            body: { amount, is_anonymous: anonymous, donor_name: donorName },
          })
        : await create.mutateAsync({
            kind: "masjid",
            masjidId: id,
            body: { amount, category, is_anonymous: anonymous, donor_name: donorName },
          });
      const checkout = await openCheckout(res.gateway_url);
      router.replace({
        pathname: "/donation/[id]",
        params: { id: checkout.donationId ?? res.donation_id, status: checkout.outcome },
      });
    } catch {
      setErrorMsg(t("donation.checkout.error"));
      setProcessing(false);
    } finally {
      inFlight.current = false;
    }
  };

  // Amount CTA: validate, then either collect a name or go straight to checkout.
  const onContinue = () => {
    if (!amountValid) {
      setErrorMsg(t(amount > DONATION_MAX ? "validation.amount_too_high" : "validation.amount_too_low"));
      return;
    }
    setErrorMsg(null);
    if (!anonymous && !name.trim()) {
      setStep("name");
      return;
    }
    void submit();
  };

  const back = () => (step === "name" ? setStep("amount") : router.back());
  const closeButton = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
      <Feather name="x" size={24} color={c["text-primary"]} />
    </Pressable>
  );
  const backButton = (
    <Pressable accessibilityRole="button" onPress={back} hitSlop={12}>
      <Feather name="arrow-left" size={24} color={c["text-primary"]} />
    </Pressable>
  );

  // ---- Name step (37) ---------------------------------------------------
  if (step === "name") {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <AppBar title="" left={backButton} right={closeButton} />
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerClassName="gap-lg px-6 py-3" keyboardShouldPersistTaps="handled">
            <View className="items-center gap-2.5 pt-2">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
                <Feather name="user" size={26} color={c.primary} />
              </View>
              <Text variant="title" className="text-center">
                {t("donation.name.title")}
              </Text>
              <Text variant="body" className="text-center text-content-secondary">
                {t("donation.name.subtitle")}
              </Text>
            </View>
            <Input
              label={t("donation.name.label")}
              placeholder={t("donation.name.placeholder")}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
            />
            <Banner
              variant="info"
              icon={<Feather name="info" size={15} color={c.primary} />}
              message={t("donation.name.note")}
            />
            {errorMsg ? <Text variant="caption" className="text-error">{errorMsg}</Text> : null}
          </ScrollView>
          <View className="border-t border-border bg-surface px-4 pb-2 pt-3">
            <Button
              label={processing ? t("donation.checkout.opening") : t("donation.name.cta")}
              rightIcon={<Feather name="arrow-right" size={18} color={c["on-inverse"]} />}
              disabled={!name.trim() || processing}
              onPress={() => void submit()}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ---- Amount step (35/36) ----------------------------------------------
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar title={t("donation.title")} left={backButton} right={closeButton} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="gap-lg px-5 py-3 pb-6" keyboardShouldPersistTaps="handled">
          {/* Masjid header */}
          <View className="flex-row items-center gap-3 rounded-md border border-border bg-surface p-3.5">
            <View className="h-11 w-11 items-center justify-center rounded-lg bg-primary-soft">
              <Feather name="home" size={20} color={c.primary} />
            </View>
            <View className="flex-1">
              <Text variant="body" numberOfLines={1} className="font-semibold">
                {masjid.data?.name ?? t("common.brand")}
              </Text>
              <Text variant="caption" className="text-content-secondary">
                {t("masjid.donate.methods")}
              </Text>
            </View>
            {masjid.data?.verified ? (
              <Feather name="check-circle" size={18} color={c.primary} />
            ) : null}
          </View>

          {/* Campaign context when this gift is campaign-scoped */}
          {campaign ? (
            <View className="flex-row items-center gap-2 rounded-md bg-accent-gold-soft px-3.5 py-2.5">
              <Feather name="flag" size={14} color={c["accent-gold"]} />
              <Text variant="caption" numberOfLines={1} className="flex-1 font-medium text-accent-gold">
                {campaign.title}
              </Text>
            </View>
          ) : null}

          {/* Amount display + presets */}
          <View className="items-center gap-3">
            <Text variant="caption" className="text-content-secondary">
              {t("donation.amount.title")}
            </Text>
            <Text className="text-display font-bold text-content-primary">
              {f.currency(amount)}
            </Text>
            <AmountField
              centerPresets
              className="w-full"
              value={amountText}
              onChange={(v) => {
                setAmountText(v);
                setErrorMsg(null);
              }}
            />
          </View>

          {/* Category (masjid gifts only; campaigns force the category server-side) */}
          {!campaignId ? (
            <View className="gap-2.5">
              <Text variant="caption" className="text-content-secondary">
                {t("donation.amount.categoryOptional")}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {DONATION_CATEGORIES.map((cat) => (
                  <Chip
                    key={cat}
                    label={t(`donation.category.${cat}`)}
                    selected={category === cat}
                    onPress={() => setCategory(cat)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {amount > 0 ? (
            <FeeDisclosure message={t("donation.amount.fee", { net: f.currency(estimatedNet) })} />
          ) : null}

          <AnonymityRow
            value={anonymous}
            onValueChange={setAnonymous}
            label={t("donation.amount.anonymityLabel")}
            hint={t("donation.amount.anonymityHint")}
          />

          {errorMsg ? <Text variant="caption" className="text-error">{errorMsg}</Text> : null}
        </ScrollView>
        <View className="border-t border-border bg-surface px-4 pb-2 pt-3">
          <Button
            label={
              processing
                ? t("donation.checkout.opening")
                : t("donation.amount.cta", { amount: f.currency(amountValid ? amount : DONATION_MIN) })
            }
            leftIcon={<Feather name="heart" size={16} color={c["on-inverse"]} />}
            disabled={!amountValid || processing}
            onPress={onContinue}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
