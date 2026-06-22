import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";

import { SectionHeader, Text } from "@/components";
import type { CommunityPhotoPublic } from "@/lib/masjids/profile-api";
import { useColors } from "@/lib/theme/useColors";

const TILE = 108;

export type VisitorPhotoStripProps = {
  photos: CommunityPhotoPublic[];
  onAddPhoto: () => void;
  onOpenPhoto: (index: number) => void;
  /** Called when the strip nears its end, to page in more. */
  onEndReached?: () => void;
};

/**
 * "Photos from visitors" strip (design 20) — approved community photos in a
 * horizontal lazy rail, kept visually separate from the admin gallery. Always
 * leads with an "Add photo" tile so contributing is one tap.
 */
export function VisitorPhotoStrip({
  photos,
  onAddPhoto,
  onOpenPhoto,
  onEndReached,
}: VisitorPhotoStripProps) {
  const { t } = useTranslation();
  const c = useColors();

  return (
    <View className="gap-2.5">
      <SectionHeader title={t("masjid.profile.visitorPhotos")} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 4 }}
        onScroll={({ nativeEvent }) => {
          const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
          if (contentOffset.x + layoutMeasurement.width >= contentSize.width - TILE) {
            onEndReached?.();
          }
        }}
        scrollEventThrottle={200}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("masjid.profile.addPhoto")}
          onPress={onAddPhoto}
          style={{ width: TILE, height: TILE }}
          className="items-center justify-center gap-1 rounded-md border border-dashed border-border bg-surface"
        >
          <Feather name="camera" size={20} color={c.primary} />
          <Text className="text-[11px] font-medium text-content-secondary">
            {t("masjid.profile.addPhoto")}
          </Text>
        </Pressable>
        {photos.map((photo, i) => (
          <Pressable
            key={photo.photo_id}
            accessibilityRole="imagebutton"
            onPress={() => onOpenPhoto(i)}
            style={{ width: TILE, height: TILE }}
            className="overflow-hidden rounded-md"
          >
            <Image
              source={{ uri: photo.url }}
              style={{ width: TILE, height: TILE }}
              contentFit="cover"
              transition={150}
            />
          </Pressable>
        ))}
      </ScrollView>
      <Text className="text-[12px] font-regular text-content-muted">
        {t("masjid.profile.visitorPhotosNote")}
      </Text>
    </View>
  );
}

export default VisitorPhotoStrip;
