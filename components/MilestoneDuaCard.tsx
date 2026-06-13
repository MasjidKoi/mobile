import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

/**
 * Milestone dua card from the Ibadah & Gamification kit: a celebratory card on
 * the brand background with a centered title and a dua/hadith quote.
 */
export type MilestoneDuaCardProps = {
  icon?: ReactNode;
  title: string;
  text: string;
  className?: string;
};

export function MilestoneDuaCard({ icon, title, text, className }: MilestoneDuaCardProps) {
  return (
    <View
      className={`items-center gap-2.5 rounded-lg bg-primary p-[18px]${
        className ? ` ${className}` : ""
      }`}
    >
      {icon}
      <Text className="text-center text-base font-bold text-on-inverse">{title}</Text>
      <Text className="max-w-[300px] text-center text-caption font-regular text-on-inverse-muted">
        {text}
      </Text>
    </View>
  );
}

export default MilestoneDuaCard;
