import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/** One equal-width action in the profile header row. */
function Action({
  icon,
  label,
  onPress,
  active,
  disabled,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  const c = useColors();
  const tint = active ? c["on-inverse"] : c["text-primary"];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
      disabled={disabled}
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-md py-3 ${
        active ? "bg-primary" : "border border-border bg-surface"
      }${disabled ? " opacity-50" : ""}`}
    >
      <Feather name={icon} size={16} color={tint} />
      <Text className={`text-caption font-semibold ${active ? "text-on-inverse" : "text-content-primary"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export type ProfileActionsProps = {
  onDirections: () => void;
  isFollowing: boolean;
  onToggleFollow: () => void;
  followPending?: boolean;
};

/**
 * The profile header action row: Directions + Follow. (Share is deferred until
 * the backend share/OG work lands, so the affordance is intentionally omitted
 * rather than shipped as a dead tap.)
 */
export function ProfileActions({
  onDirections,
  isFollowing,
  onToggleFollow,
  followPending,
}: ProfileActionsProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row gap-2">
      <Action icon="navigation" label={t("masjid.profile.directions")} onPress={onDirections} />
      <Action
        icon={isFollowing ? "check" : "plus"}
        label={isFollowing ? t("masjid.profile.following") : t("masjid.profile.follow")}
        onPress={onToggleFollow}
        active={isFollowing}
        disabled={followPending}
      />
    </View>
  );
}

export default ProfileActions;
