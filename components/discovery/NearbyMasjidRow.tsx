import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable } from "react-native";

import { MasjidRow } from "@/components/MasjidRow";
import { useColors } from "@/lib/theme/useColors";
import { useFormat } from "@/lib/i18n/format";
import { presentFacilities } from "@/lib/masjids/facilities";
import type { MasjidNearbyResult } from "@/lib/masjids/types";

export type NearbyMasjidRowProps = {
  masjid: MasjidNearbyResult;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  onPress: () => void;
};

/** A nearby result wired into the kit's `MasjidRow`: thumbnail, verified mark, distance meta, facility icons, favourite toggle. */
export function NearbyMasjidRow({
  masjid,
  isFavourite,
  onToggleFavourite,
  onPress,
}: NearbyMasjidRowProps) {
  const c = useColors();
  const f = useFormat();
  const facilities = presentFacilities(masjid).slice(0, 4);

  return (
    <MasjidRow
      name={masjid.name}
      meta={`${masjid.admin_region} · ${f.distance(masjid.distance_m)}`}
      onPress={onPress}
      thumb={
        masjid.cover_photo_url ? (
          <Image
            source={{ uri: masjid.cover_photo_url }}
            style={{ width: 64, height: 64 }}
            contentFit="cover"
          />
        ) : (
          <Feather name="home" size={24} color={c.primary} />
        )
      }
      verified={
        masjid.verified ? (
          <Feather name="check-circle" size={14} color={c.primary} />
        ) : null
      }
      facilities={facilities.map((facility) => (
        <Feather key={facility.key} name={facility.icon} size={13} color={c["text-muted"]} />
      ))}
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isFavourite }}
          hitSlop={10}
          onPress={onToggleFavourite}
          className="h-8 w-8 items-center justify-center"
        >
          <Ionicons
            name={isFavourite ? "heart" : "heart-outline"}
            size={20}
            color={isFavourite ? c.error : c["text-muted"]}
          />
        </Pressable>
      }
    />
  );
}

export default NearbyMasjidRow;
