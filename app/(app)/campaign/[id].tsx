import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBar, Banner, Button, EmptyState, ProgressBar, Text } from "@/components";
import { FundedBadge } from "@/components/donation";
import { useCampaign } from "@/hooks/useCampaign";
import { useMasjid } from "@/hooks/useMasjid";
import { useFormat } from "@/lib/i18n/format";
import { useColors } from "@/lib/theme/useColors";
import { useLoginGate } from "@/providers/LoginGateProvider";

/**
 * 44 Campaign Detail / 45 Campaign Funded. `id` = campaign id, `masjidId` lets
 * us read it from the cached campaigns list (no single-campaign endpoint). The
 * donate CTA is gated and routes into the donate flow with `campaignId` set.
 */
export default function CampaignDetailScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { id, masjidId } = useLocalSearchParams<{ id: string; masjidId: string }>();
  const { campaign, isLoading } = useCampaign(masjidId, id);
  const masjid = useMasjid(masjidId);
  const { requireAuth } = useLoginGate();

  const backButton = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
      <Feather name="arrow-left" size={24} color={c["text-primary"]} />
    </Pressable>
  );

  if (isLoading && !campaign) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  if (!campaign) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <AppBar title={t("donation.campaign.label")} left={backButton} />
        <View className="flex-1 items-center justify-center px-lg">
          <EmptyState
            icon={<Feather name="flag" size={26} color={c.primary} />}
            title={t("donation.campaign.notFoundTitle")}
            caption={t("donation.campaign.notFoundCaption")}
            action={<Button variant="text" label={t("common.close")} onPress={() => router.back()} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const raised = Number(campaign.raised_amount) || 0;
  const target = Number(campaign.target_amount) || 0;
  const pct = Math.min(1, Math.max(0, campaign.progress_pct / 100));
  const funded = campaign.progress_pct >= 100 || campaign.status !== "Active";
  const canDonate = campaign.status === "Active";

  const goDonate = () =>
    requireAuth(
      () => router.push({ pathname: "/donate/[id]", params: { id: masjidId, campaignId: id } }),
      "donate",
    );

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <AppBar title={t("donation.campaign.label")} left={backButton} />
      <ScrollView contentContainerClassName="gap-4 px-5 py-3 pb-6" showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View className="h-44 overflow-hidden rounded-lg bg-primary-soft">
          {campaign.banner_url ? (
            <Image source={{ uri: campaign.banner_url }} style={{ flex: 1 }} contentFit="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Feather name="flag" size={32} color={c.primary} />
            </View>
          )}
        </View>

        {/* Title + masjid */}
        <View className="gap-1">
          <Text variant="title">{campaign.title}</Text>
          <View className="flex-row items-center gap-1.5">
            <Feather name="home" size={13} color={c["text-muted"]} />
            <Text variant="caption" className="text-content-secondary">
              {masjid.data?.name ?? t("common.brand")}
            </Text>
          </View>
        </View>

        {/* Raised + progress + stats */}
        <View className="gap-2.5 rounded-lg border border-border bg-surface p-4">
          <View className="flex-row items-end justify-between">
            <Text className="text-[26px] font-bold text-content-primary">{f.currency(raised)}</Text>
            {funded ? <FundedBadge label={t("donation.campaign.fundedBadge")} /> : null}
          </View>
          <ProgressBar value={pct} />
          <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
            <Text variant="caption" className="font-semibold text-primary">
              {t("donation.campaign.percentRaised", { pct: f.number(Math.round(campaign.progress_pct)) })}
            </Text>
            <Text variant="caption" className="text-content-secondary">
              {t("donation.campaign.raised", { raised: f.currency(raised), target: f.currency(target) })}
            </Text>
            {canDonate ? (
              <Text variant="caption" className="text-content-muted">
                · {t("donation.campaign.daysLeft", { days: f.number(Math.max(0, campaign.days_remaining)) })}
              </Text>
            ) : null}
          </View>
        </View>

        {campaign.description ? (
          <Text variant="body" className="text-content-secondary">
            {campaign.description}
          </Text>
        ) : null}

        {!canDonate ? (
          <Banner
            variant="info"
            icon={<Feather name="check-circle" size={15} color={c.primary} />}
            message={t("donation.campaign.completedNote")}
          />
        ) : null}
      </ScrollView>

      {canDonate ? (
        <View className="border-t border-border bg-surface px-4 pb-2 pt-3">
          <Button
            label={t("donation.campaign.donateCta")}
            leftIcon={<Feather name="heart" size={16} color={c["on-inverse"]} />}
            onPress={goDonate}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
