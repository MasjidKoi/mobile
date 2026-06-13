import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

/**
 * Inline banner from the Map & Discovery kit. Generic with two tones:
 *   - info    (soft green) — e.g. travel/away-from-home notice
 *   - warning (soft gold)  — e.g. offline notice
 * The `icon` node is passed in and colored by the consumer to match the tone.
 */
export type BannerVariant = "info" | "warning";

const BANNER: Record<BannerVariant, { bg: string; text: string }> = {
  info: { bg: "bg-primary-soft", text: "text-primary" },
  warning: { bg: "bg-accent-gold-soft", text: "text-[#8A6A1F]" },
};

export type BannerProps = {
  variant?: BannerVariant;
  icon?: ReactNode;
  message: string;
  className?: string;
};

export function Banner({ variant = "info", icon, message, className }: BannerProps) {
  const v = BANNER[variant];
  return (
    <View
      className={`flex-row items-center gap-2.5 rounded-sm px-[14px] py-2.5 ${v.bg}${
        className ? ` ${className}` : ""
      }`}
    >
      {icon}
      <Text className={`flex-1 text-caption font-medium ${v.text}`}>{message}</Text>
    </View>
  );
}

export default Banner;
