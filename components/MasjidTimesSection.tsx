import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { usePrayerTableRows } from "@/hooks/usePrayerClock";
import { formatClockString } from "@/lib/prayer/format";
import type { JumahResponse, PrayerTimeResponse } from "@/lib/prayer/types";
import { useColors } from "@/lib/theme/useColors";

import { Card } from "./Card";
import { PrayerTable } from "./PrayerTable";
import { Row } from "./Row";
import { SectionHeader } from "./SectionHeader";
import { Text } from "./Text";

/**
 * The masjid prayer-times block: an optional context chips row (region·distance
 * + madhhab), today's azan/iqamah table, the Jumu'ah schedule, and the
 * published-times disclaimer. Built for the Home tab and **reused by the Phase 5
 * masjid profile** (design "07 Masjid — Times Section"). Pass already-fetched
 * `times`/`jumah` (Home resolves them via `useHomeTimes`; Profile via
 * `usePrayerTimes`). `regionLabel`/`distanceLabel` are optional — the chips row
 * is omitted gracefully when neither region nor madhhab is available.
 */
export type MasjidTimesSectionProps = {
  times: PrayerTimeResponse | null;
  jumah?: JumahResponse | null;
  /** Header label for the table (e.g. the Hijri date). */
  dateLabel: string;
  /** Optional region/area name for the location chip (e.g. "ধানমন্ডি"). */
  regionLabel?: string | null;
  /** Optional pre-formatted distance for the location chip (e.g. "৪০০ মি"). */
  distanceLabel?: string | null;
  showJumah?: boolean;
  /** Hide the published-times disclaimer (e.g. on the Home tab). */
  showDisclaimer?: boolean;
  className?: string;
};

/**
 * Jumu'ah rows mapped to the design's খুতবা শুরু / ১ম জামাত / ২য় জামাত.
 * NOTE: the backend (JumahResponse) models two khutbahs (azan + start) but has
 * NO dedicated "jamaat/congregation" field. We render the real fields in
 * chronological order with truthful labels — 1st azan, khutbah start, then the
 * 2nd congregation (when a masjid runs two) labelled "২য় জামাত". The design's
 * "১ম জামাত" can't be derived from azan+khutbah-start alone (it would need a
 * backend jamaat column); we never mislabel the azan as a jamaat. Null fields
 * drop out gracefully.
 */
function jumahRows(jumah: JumahResponse): { key: string; labelKey: string; time: string }[] {
  const fields: { key: string; labelKey: string; value: string | null }[] = [
    { key: "azan1", labelKey: "jumuah.azan1", value: jumah.khutbah_1_azan },
    { key: "khutbahStart", labelKey: "jumuah.khutbahStart", value: jumah.khutbah_1_start },
    { key: "jamaat2", labelKey: "jumuah.jamaat2", value: jumah.khutbah_2_start ?? jumah.khutbah_2_azan },
  ];
  return fields
    .filter((f) => !!f.value)
    .map((f) => ({ key: f.key, labelKey: f.labelKey, time: f.value as string }));
}

export function MasjidTimesSection({
  times,
  jumah,
  dateLabel,
  regionLabel,
  distanceLabel,
  showJumah = true,
  showDisclaimer = true,
  className,
}: MasjidTimesSectionProps) {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const rows = usePrayerTableRows(times);
  const jrows = jumah ? jumahRows(jumah) : [];

  const madhab = times?.madhab;
  const madhabLabel = madhab ? t(`auth.madhab.${madhab}`, { defaultValue: "" }) : "";
  const showLocationChip = !!regionLabel;
  const showMadhabChip = !!madhabLabel;

  return (
    <View className={`gap-4${className ? ` ${className}` : ""}`}>
      {showLocationChip || showMadhabChip ? (
        <View className="flex-row flex-wrap items-center gap-2">
          {showLocationChip ? (
            <View className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
              <Feather name="map-pin" size={13} color={c["text-muted"]} />
              <Text className="text-caption font-medium text-content-secondary">
                {regionLabel}
                {distanceLabel ? ` · ${distanceLabel}` : ""}
              </Text>
            </View>
          ) : null}
          {showMadhabChip ? (
            <View className="rounded-full bg-accent-gold-soft px-3 py-1.5">
              <Text className="text-caption font-semibold" style={{ color: c["accent-gold"] }}>
                {t("masjid.profile.madhhabCalc", { madhab: madhabLabel })}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <PrayerTable
        date={dateLabel}
        rows={rows}
        azanLabel={t("prayerClock.azan")}
        iqamahLabel={t("prayerClock.iqamah")}
      />

      {showJumah && jrows.length > 0 ? (
        <View className="gap-2">
          <SectionHeader title={t("jumuah.scheduleTitle")} />
          <Card>
            {jrows.map((r) => (
              <Row key={r.key} title={t(r.labelKey)} value={formatClockString(r.time, i18n.language)} />
            ))}
          </Card>
        </View>
      ) : null}

      {showDisclaimer ? (
        <Text variant="micro" className="px-1 text-content-muted">
          {t("masjid.profile.publishedTimesNote")}
        </Text>
      ) : null}
    </View>
  );
}

export default MasjidTimesSection;
