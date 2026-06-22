import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { NearestMasjidCard } from "@/components/NearestMasjidCard";
import { useRecentMasjids } from "@/hooks/useRecentMasjids";
import { useFormat } from "@/lib/i18n/format";
import type { MasjidNearbyResult } from "@/lib/masjids/types";
import { useColors } from "@/lib/theme/useColors";

export type NearestMasjidCardLiveProps = {
  /** The nearest masjid, derived by the parent from its already-loaded results. */
  masjid: MasjidNearbyResult | null;
};

/**
 * The nearest masjid hero. Fed by the parent's existing nearby results (no extra
 * fetch). Phase 3 ships it distance-first (the prominent metric is the
 * distance); Phase 4's PrayerClock will layer the jamaat countdown onto the same
 * `NearestMasjidCard`. Renders nothing until a nearest masjid is known.
 */
export function NearestMasjidCardLive({ masjid }: NearestMasjidCardLiveProps) {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();
  const { recordView } = useRecentMasjids();

  if (!masjid) return null;

  return (
    <NearestMasjidCard
      kicker={t("discovery.nearestKicker")}
      name={masjid.name}
      prayerLabel={masjid.admin_region}
      countdown={f.distance(masjid.distance_m)}
      statusLabel={t("discovery.viewDetails")}
      statusIcon={<Feather name="arrow-up-right" size={13} color={c["accent-gold-soft"]} />}
      arrow={<Feather name="arrow-up-right" size={18} color={c["on-inverse-muted"]} />}
      onPress={() => {
        recordView(masjid.masjid_id);
        router.push({ pathname: "/masjid/[id]", params: { id: masjid.masjid_id } });
      }}
    />
  );
}

export default NearestMasjidCardLive;
