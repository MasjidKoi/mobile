import { Feather } from "@expo/vector-icons";
import { type ReactNode } from "react";
import { Pressable, type PressableProps, View } from "react-native";

import { useColors } from "@/lib/theme/useColors";

import { Text } from "./Text";

/**
 * Settings list row from the Pencil "Set Row" component: a colored rounded tile
 * (white glyph) + label, an optional inline `value` or custom `valueNode` (e.g.
 * a "Soon" badge), and a trailing chevron. Place inside a <Card> for dividers.
 *
 * `tileColor` paints the tile and the glyph is rendered white on top. For a
 * destructive row (sign out), pass `tone="danger"`: the label turns red and the
 * chevron is dropped by default.
 */
export type SettingsRowProps = PressableProps & {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  tileColor?: string;
  value?: string;
  valueNode?: ReactNode;
  showChevron?: boolean;
  tone?: "default" | "danger";
};

export function SettingsRow({
  icon,
  label,
  tileColor,
  value,
  valueNode,
  showChevron,
  tone = "default",
  disabled,
  ...props
}: SettingsRowProps) {
  const c = useColors();
  const danger = tone === "danger";
  const tileBg = tileColor ?? (danger ? c.error : c["text-secondary"]);
  const chevron = showChevron ?? !danger;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={`flex-row items-center gap-3 px-4 py-[14px] active:bg-primary-soft${
        disabled ? " opacity-50" : ""
      }`}
      {...props}
    >
      <View
        className="h-[30px] w-[30px] items-center justify-center rounded-lg"
        style={{ backgroundColor: tileBg }}
      >
        <Feather name={icon} size={17} color={c["on-inverse"]} />
      </View>
      <Text className={`flex-1 text-body font-regular ${danger ? "text-error" : "text-content-primary"}`}>
        {label}
      </Text>
      {value ? <Text className="text-caption font-regular text-content-muted">{value}</Text> : null}
      {valueNode}
      {chevron ? <Feather name="chevron-right" size={16} color={c["text-muted"]} /> : null}
    </Pressable>
  );
}

export default SettingsRow;
