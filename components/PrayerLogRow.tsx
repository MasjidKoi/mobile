import { Pressable, View } from "react-native";

import { Text } from "./Text";

/**
 * One-tap prayer log from the Ibadah & Gamification kit: a title with an
 * acknowledged count, then a tappable circle per prayer. Generic over the
 * `prayers` list; bound via `onToggle`.
 */
export type PrayerLogPrayer = {
  key: string;
  label: string;
  logged?: boolean;
};

export type PrayerLogRowProps = {
  title: string;
  prayers: PrayerLogPrayer[];
  onToggle?: (key: string) => void;
  className?: string;
};

export function PrayerLogRow({ title, prayers, onToggle, className }: PrayerLogRowProps) {
  const done = prayers.filter((p) => p.logged).length;
  return (
    <View
      className={`gap-3.5 rounded-lg border border-border bg-surface p-4${
        className ? ` ${className}` : ""
      }`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-body font-semibold text-content-primary">{title}</Text>
        <View className="rounded-full bg-accent-gold-soft px-2.5 py-[3px]">
          <Text className="text-[12px] font-semibold text-[#8A6A1F]">
            {done}/{prayers.length}
          </Text>
        </View>
      </View>
      <View className="flex-row items-start justify-between">
        {prayers.map((p) => (
          <Pressable
            key={p.key}
            accessibilityRole="button"
            accessibilityState={{ selected: !!p.logged }}
            onPress={() => onToggle?.(p.key)}
            className="items-center gap-1.5"
          >
            <View
              className={`h-11 w-11 items-center justify-center rounded-full ${
                p.logged ? "bg-primary" : "border-[1.5px] border-border bg-surface"
              }`}
            >
              {p.logged ? (
                <Text className="text-on-inverse" style={{ fontSize: 18, lineHeight: 18 }}>
                  ✓
                </Text>
              ) : null}
            </View>
            <Text
              className={`text-[12px] ${
                p.logged ? "font-semibold text-primary" : "font-medium text-content-muted"
              }`}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default PrayerLogRow;
