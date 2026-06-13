import { type ReactNode } from "react";
import { Pressable, type PressableProps, View } from "react-native";

import { Text } from "./Text";

/**
 * Masjid list row from the Map & Discovery kit: a thumbnail, the name with an
 * optional verified mark, supporting meta, and a row of facility icons.
 * Generic over its nodes (`thumb`, `verified`, `facilities`, `trailing`).
 */
export type MasjidRowProps = PressableProps & {
  name: string;
  meta?: string;
  thumb?: ReactNode;
  verified?: ReactNode;
  facilities?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function MasjidRow({
  name,
  meta,
  thumb,
  verified,
  facilities,
  trailing,
  className,
  ...props
}: MasjidRowProps) {
  return (
    <Pressable
      className={`flex-row items-center gap-3 rounded-md border border-border bg-surface p-3 active:bg-primary-soft${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-sm bg-primary-soft">
        {thumb}
      </View>
      <View className="flex-1 gap-[5px]">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-body font-semibold text-content-primary">{name}</Text>
          {verified}
        </View>
        {meta ? (
          <Text className="text-caption font-regular text-content-secondary">{meta}</Text>
        ) : null}
        {facilities ? <View className="flex-row items-center gap-2">{facilities}</View> : null}
      </View>
      {trailing}
    </Pressable>
  );
}

export default MasjidRow;
