import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components";
import { useFormat } from "@/lib/i18n/format";
import { orderAdminPhotos } from "@/lib/masjids/photos";
import type { PhotoResponse } from "@/lib/masjids/types";
import { useColors } from "@/lib/theme/useColors";

const COVER_HEIGHT = 230;
const OVERLAY = "rgba(0,0,0,0.35)";
// Design 20/21/34: floating header controls are near-opaque white circles with a
// dark glyph, legible over both a photo and the empty (grey) cover.
const CONTROL_BG = "rgba(255,255,255,0.92)";
const CONTROL_FG = "#182420";

/** A circular control that floats over the cover (design header). */
function OverlayButton({
  icon,
  label,
  onPress,
  size = 20,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={{ backgroundColor: CONTROL_BG }}
      className="h-[38px] w-[38px] items-center justify-center rounded-full"
    >
      <Feather name={icon} size={size} color={CONTROL_FG} />
    </Pressable>
  );
}

/** Back (left) + Share/More (right) controls, pinned below the status bar. */
function HeaderControls({
  onBack,
  onShare,
  onMore,
  top,
}: {
  onBack: () => void;
  onShare: () => void;
  onMore: () => void;
  top: number;
}) {
  const { t } = useTranslation();
  return (
    <View
      pointerEvents="box-none"
      className="absolute left-4 right-4 flex-row items-center justify-between"
      style={{ top }}
    >
      <OverlayButton icon="arrow-left" label={t("common.close")} onPress={onBack} />
      <View className="flex-row items-center gap-2">
        <OverlayButton icon="share-2" label={t("common.share")} onPress={onShare} size={18} />
        <OverlayButton icon="more-horizontal" label={t("common.more")} onPress={onMore} />
      </View>
    </View>
  );
}

export type ProfileCoverProps = {
  photos: PhotoResponse[];
  onBack: () => void;
  onOpenGallery: (index: number) => void;
  onAddPhoto: () => void;
  onShare: () => void;
  onMore: () => void;
};

/**
 * Profile header media: the admin cover photo with a gallery counter that opens
 * the full-screen viewer (design 20). When a masjid has no photos it shows the
 * sparse empty cover with an "Add photo" CTA (design 21). Both variants carry
 * the floating Back / Share / More controls.
 */
export function ProfileCover({
  photos,
  onBack,
  onOpenGallery,
  onAddPhoto,
  onShare,
  onMore,
}: ProfileCoverProps) {
  const { t } = useTranslation();
  const f = useFormat();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const backTop = insets.top + 8;

  // Cover first (is_cover wins), then by display order — same order the gallery uses.
  const ordered = useMemo(() => orderAdminPhotos(photos), [photos]);
  const cover = ordered[0];

  if (!cover) {
    return (
      <View
        style={{ height: 180 + insets.top, paddingTop: insets.top, backgroundColor: c.border }}
        className="items-center justify-center gap-2 px-6"
      >
        <HeaderControls onBack={onBack} onShare={onShare} onMore={onMore} top={backTop} />
        <Feather name="image" size={26} color={c["text-muted"]} />
        <Text className="text-caption font-medium text-content-secondary">
          {t("masjid.profile.noPhotos")}
        </Text>
        <Button variant="secondary" label={t("masjid.profile.addPhoto")} onPress={onAddPhoto} />
      </View>
    );
  }

  return (
    <Pressable onPress={() => onOpenGallery(0)} style={{ height: COVER_HEIGHT }}>
      <Image
        source={{ uri: cover.url }}
        style={{ width: "100%", height: COVER_HEIGHT }}
        contentFit="cover"
        transition={150}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.45)", "transparent"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 88 }}
        pointerEvents="none"
      />
      <HeaderControls onBack={onBack} onShare={onShare} onMore={onMore} top={backTop} />
      {ordered.length > 1 ? (
        <View
          style={{ backgroundColor: OVERLAY }}
          className="absolute bottom-3 right-3 flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
        >
          <Feather name="camera" size={13} color="#FFFFFF" />
          <Text className="text-[12px] font-semibold text-white">
            {`${f.number(1)}/${f.number(ordered.length)}`}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default ProfileCover;
