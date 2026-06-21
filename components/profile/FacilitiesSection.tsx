import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { FacilityChip, SectionHeader, Text } from "@/components";
import { useFormat } from "@/lib/i18n/format";
import type { FacilityPresentation } from "@/lib/masjids/profile/facilityPresenter";
import { useColors } from "@/lib/theme/useColors";

/**
 * Facilities + capacity section (design 20). Renders every facility as a chip —
 * present (brand fill) or absent (faded) — so "no parking" reads as information,
 * not a gap. The capacity line shows whichever of male/female/parking figures
 * exist. Driven entirely by the pure `FacilityPresenter` model.
 */
export function FacilitiesSection({ presentation }: { presentation: FacilityPresentation }) {
  const { t } = useTranslation();
  const f = useFormat();
  const c = useColors();

  if (!presentation.hasFacilities) return null;

  return (
    <View className="gap-2.5">
      <SectionHeader title={t("masjid.profile.facilities")} />
      <View className="flex-row flex-wrap gap-2">
        {presentation.chips.map((chip) => (
          <FacilityChip
            key={chip.key}
            label={t(chip.labelKey)}
            present={chip.present}
            icon={
              <Feather
                name={chip.icon as keyof typeof Feather.glyphMap}
                size={13}
                color={chip.present ? c.primary : c["text-muted"]}
              />
            }
          />
        ))}
      </View>
      {presentation.hasCapacity ? (
        <View className="flex-row flex-wrap items-center gap-x-1.5">
          <Feather name="users" size={14} color={c["text-muted"]} />
          {presentation.capacityParts.map((part, i) => (
            <Text key={part.key} className="text-caption font-medium text-content-secondary">
              {i > 0 ? "· " : ""}
              {t(part.labelKey)} {f.number(part.value)}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default FacilitiesSection;
