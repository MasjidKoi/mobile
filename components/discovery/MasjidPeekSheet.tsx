import { Feather, Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { useFormat } from "@/lib/i18n/format";
import { presentFacilities } from "@/lib/masjids/facilities";
import type { MasjidNearbyResult } from "@/lib/masjids/types";
import { useColors } from "@/lib/theme/useColors";

export type MasjidPeekSheetProps = {
  /** The selected masjid; the sheet is shown while this is non-null. */
  masjid: MasjidNearbyResult | null;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  onClose: () => void;
  onDirections: () => void;
  onViewDetails: () => void;
};

/** Pin-tap peek card (design `14 Explore — Peek Card`): name, distance, facilities, Directions + View details. */
export function MasjidPeekSheet({
  masjid,
  isFavourite,
  onToggleFavourite,
  onClose,
  onDirections,
  onViewDetails,
}: MasjidPeekSheetProps) {
  const { t } = useTranslation();
  const c = useColors();
  const f = useFormat();

  // Keep the last masjid on screen while the sheet animates closed.
  const lastRef = useRef<MasjidNearbyResult | null>(masjid);
  if (masjid) lastRef.current = masjid;
  const m = masjid ?? lastRef.current;

  return (
    <BottomSheet visible={!!masjid} onClose={onClose}>
      {m ? (
        <>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <View className="flex-row items-center gap-1.5">
                <Text variant="heading" numberOfLines={2} className="flex-1">
                  {m.name}
                </Text>
                {m.verified ? <Feather name="check-circle" size={15} color={c.primary} /> : null}
              </View>
              <Text variant="caption" className="text-content-secondary">
                {`${m.admin_region} · ${f.distance(m.distance_m)}`}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isFavourite }}
              hitSlop={10}
              onPress={onToggleFavourite}
              className="h-9 w-9 items-center justify-center"
            >
              <Ionicons
                name={isFavourite ? "heart" : "heart-outline"}
                size={22}
                color={isFavourite ? c.error : c["text-muted"]}
              />
            </Pressable>
          </View>

          {presentFacilities(m).length ? (
            <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1.5">
              {presentFacilities(m).map((facility) => (
                <View key={facility.key} className="flex-row items-center gap-1">
                  <Feather name={facility.icon} size={13} color={c["text-secondary"]} />
                  <Text variant="caption" className="text-content-secondary">
                    {t(facility.labelKey)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View className="flex-row gap-2.5">
            <Button
              variant="secondary"
              label={t("discovery.directions")}
              leftIcon={<Feather name="navigation" size={16} color={c["text-primary"]} />}
              onPress={onDirections}
              className="flex-1"
            />
            <Button
              label={t("discovery.viewDetails")}
              onPress={onViewDetails}
              className="flex-1"
            />
          </View>
        </>
      ) : null}
    </BottomSheet>
  );
}

export default MasjidPeekSheet;
