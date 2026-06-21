import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { usePrayerTableRows } from "@/hooks/usePrayerClock";
import { formatClockString } from "@/lib/prayer/format";
import type { JumahResponse, PrayerTimeResponse } from "@/lib/prayer/types";

import { Card } from "./Card";
import { PrayerTable } from "./PrayerTable";
import { Row } from "./Row";
import { SectionHeader } from "./SectionHeader";

/**
 * The masjid prayer-times block: today's azan/iqamah table plus the Jumu'ah
 * schedule. Built for the Home tab and **reused by the Phase 5 masjid profile**
 * (design "07 Masjid — Times Section"). Pass already-fetched `times`/`jumah`
 * (Home resolves them via `useHomeTimes`; Profile via `usePrayerTimes`).
 */
export type MasjidTimesSectionProps = {
  times: PrayerTimeResponse | null;
  jumah?: JumahResponse | null;
  /** Header label for the table (e.g. the Hijri date). */
  dateLabel: string;
  showJumah?: boolean;
  className?: string;
};

function jumahRows(jumah: JumahResponse): { key: string; labelKey: string; time: string }[] {
  const fields: { key: string; labelKey: string; value: string | null }[] = [
    { key: "azan1", labelKey: "jumuah.azan1", value: jumah.khutbah_1_azan },
    { key: "start1", labelKey: "jumuah.khutbahStart", value: jumah.khutbah_1_start },
    { key: "azan2", labelKey: "jumuah.azan2", value: jumah.khutbah_2_azan },
    { key: "start2", labelKey: "jumuah.start2", value: jumah.khutbah_2_start },
  ];
  return fields
    .filter((f) => !!f.value)
    .map((f) => ({ key: f.key, labelKey: f.labelKey, time: f.value as string }));
}

export function MasjidTimesSection({
  times,
  jumah,
  dateLabel,
  showJumah = true,
  className,
}: MasjidTimesSectionProps) {
  const { t, i18n } = useTranslation();
  const rows = usePrayerTableRows(times);
  const jrows = jumah ? jumahRows(jumah) : [];

  return (
    <View className={`gap-4${className ? ` ${className}` : ""}`}>
      <PrayerTable
        date={dateLabel}
        rows={rows}
        azanLabel={t("prayerClock.azan")}
        iqamahLabel={t("prayerClock.iqamah")}
      />

      {showJumah && jrows.length > 0 ? (
        <View className="gap-2">
          <SectionHeader title={t("prayers.jumuah")} />
          <Card>
            {jrows.map((r) => (
              <Row key={r.key} title={t(r.labelKey)} value={formatClockString(r.time, i18n.language)} />
            ))}
          </Card>
        </View>
      ) : null}
    </View>
  );
}

export default MasjidTimesSection;
