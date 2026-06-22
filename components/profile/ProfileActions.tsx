import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/**
 * One equal-width action in the profile header row (design 20/21/34): a vertical
 * icon-over-label tile. The first action (Directions) is the filled-green
 * primary; the rest are white with a border and a green icon.
 */
function Action({
  icon,
  label,
  onPress,
  variant,
  active,
  disabled,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  variant: "primary" | "secondary";
  active?: boolean;
  disabled?: boolean;
}) {
  const c = useColors();
  // Primary (Directions) and the active Follow state are filled green with a
  // white glyph; the resting secondary state is white with a green glyph.
  const filled = variant === "primary" || active;
  const tint = filled ? c["on-inverse"] : c.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
      disabled={disabled}
      onPress={onPress}
      className={`flex-1 items-center justify-center gap-1 rounded-xl py-2.5 ${
        filled ? "bg-primary" : "border border-border bg-surface"
      }${disabled ? " opacity-50" : ""}`}
    >
      <Feather name={icon} size={19} color={tint} />
      <Text className={`text-caption font-semibold ${filled ? "text-on-inverse" : "text-content-primary"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export type ProfileActionsProps = {
  onDirections: () => void;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onShare: () => void;
  followPending?: boolean;
};

/**
 * The profile header action row (design 20/21/34): Directions · Follow · Share,
 * three equal-width vertical tiles. Directions is the primary; Share opens the
 * OS share sheet with a link back to this masjid.
 */
export function ProfileActions({
  onDirections,
  isFollowing,
  onToggleFollow,
  onShare,
  followPending,
}: ProfileActionsProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row gap-2">
      <Action
        icon="navigation"
        label={t("masjid.profile.directions")}
        onPress={onDirections}
        variant="primary"
      />
      <Action
        icon="heart"
        label={isFollowing ? t("masjid.profile.following") : t("masjid.profile.follow")}
        onPress={onToggleFollow}
        variant="secondary"
        active={isFollowing}
        disabled={followPending}
      />
      <Action icon="share-2" label={t("common.share")} onPress={onShare} variant="secondary" />
    </View>
  );
}

export default ProfileActions;
