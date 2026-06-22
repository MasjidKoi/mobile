import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { FilterChip } from "@/components/FilterChip";
import { SectionHeader } from "@/components/SectionHeader";
import { useColors } from "@/lib/theme/useColors";
import { FACILITIES, type FacilityKey } from "@/lib/masjids/facilities";
import type { MasjidFacilityFilters } from "@/lib/masjids/types";

export type FilterSheetProps = {
  visible: boolean;
  filters: MasjidFacilityFilters;
  onClose: () => void;
  /** Commit the drafted facility filters (parent refetches on change). */
  onApply: (filters: MasjidFacilityFilters) => void;
};

/** Facility filter sheet for Explore — drafts toggles locally, applies on "Show results". */
export function FilterSheet({ visible, filters, onClose, onApply }: FilterSheetProps) {
  const { t } = useTranslation();
  const c = useColors();
  const [draft, setDraft] = useState<MasjidFacilityFilters>(filters);

  // Reseed the draft from the committed filters each time the sheet opens.
  useEffect(() => {
    if (visible) setDraft(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const toggle = (key: FacilityKey) =>
    setDraft((d) => ({ ...d, [key]: d[key] ? undefined : true }));

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <SectionHeader title={t("discovery.facilities")} />
      <View className="flex-row flex-wrap gap-2">
        {FACILITIES.map((facility) => {
          const selected = !!draft[facility.key];
          return (
            <FilterChip
              key={facility.key}
              label={t(facility.labelKey)}
              selected={selected}
              onPress={() => toggle(facility.key)}
              icon={
                <Feather
                  name={facility.icon}
                  size={14}
                  color={selected ? c.primary : c["text-secondary"]}
                />
              }
            />
          );
        })}
      </View>
      <View className="flex-row gap-2.5 pt-1">
        <Button
          variant="secondary"
          label={t("discovery.clear")}
          onPress={() => setDraft({})}
          className="flex-1"
        />
        <Button
          label={t("discovery.apply")}
          onPress={() => {
            onApply(draft);
            onClose();
          }}
          className="flex-1"
        />
      </View>
    </BottomSheet>
  );
}

export default FilterSheet;
