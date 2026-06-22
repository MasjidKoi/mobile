import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button, CampaignCard, SectionHeader } from "@/components";
import { useFormat } from "@/lib/i18n/format";
import type { CampaignResponse } from "@/lib/masjids/profile-api";
import { useColors } from "@/lib/theme/useColors";

export type CampaignsSectionProps = {
  campaigns: CampaignResponse[];
  /** Navigate to the (Phase 6) donate flow for this campaign. */
  onDonate: (campaignId: string) => void;
};

/**
 * Active fundraising campaigns on the profile (design 20 donate area). Each
 * card's CTA routes to the donate flow (a stub until Phase 6 fills it in).
 * Renders nothing when there are no active campaigns.
 */
export function CampaignsSection({ campaigns, onDonate }: CampaignsSectionProps) {
  const { t } = useTranslation();
  const f = useFormat();
  const c = useColors();

  if (campaigns.length === 0) return null;

  return (
    <View className="gap-2.5">
      <SectionHeader title={t("masjid.profile.campaigns")} />
      <View className="gap-2.5">
        {campaigns.map((cam) => {
          // `|| 0` guards a malformed/empty decimal string from rendering "৳NaN".
          const raised = Number(cam.raised_amount) || 0;
          const target = Number(cam.target_amount) || 0;
          return (
            <CampaignCard
              key={cam.campaign_id}
              name={cam.title}
              daysLabel={t("masjid.campaign.daysLeft", {
                formatted: f.number(Math.max(0, cam.days_remaining)),
              })}
              percentLabel={`${f.number(Math.round(cam.progress_pct))}%`}
              value={Math.min(1, Math.max(0, cam.progress_pct / 100))}
              raisedLabel={t("masjid.campaign.raised", {
                raised: f.currency(raised),
                target: f.currency(target),
              })}
              action={
                <Button
                  variant="text"
                  label={t("masjid.campaign.donate")}
                  rightIcon={<Feather name="arrow-right" size={15} color={c.primary} />}
                  onPress={() => onDonate(cam.campaign_id)}
                />
              }
            />
          );
        })}
      </View>
    </View>
  );
}

export default CampaignsSection;
