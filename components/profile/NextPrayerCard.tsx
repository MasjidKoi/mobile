import { View } from "react-native";

import { Text } from "@/components";

export type NextPrayerCardProps = {
  /** "Next prayer" kicker. */
  kicker: string;
  prayerName: string;
  prayerTime: string;
  /** e.g. "1h 23m" — empty hides the countdown side. */
  countdownLabel: string;
};

/**
 * The next-prayer block above the times table (design 20). Built here because
 * `MasjidTimesSection` renders only the table + Jumu'ah; the profile composes
 * this from `usePrayerClock`, exactly like the Home hero.
 */
export function NextPrayerCard({ kicker, prayerName, prayerTime, countdownLabel }: NextPrayerCardProps) {
  return (
    <View className="flex-row items-center justify-between rounded-lg bg-primary-soft px-4 py-3.5">
      <View className="gap-0.5">
        <Text className="text-[12px] font-medium text-content-secondary">{kicker}</Text>
        <Text className="text-heading font-bold text-content-primary">
          {prayerName} · {prayerTime}
        </Text>
      </View>
      {countdownLabel ? (
        <Text className="text-body font-semibold text-primary">{countdownLabel}</Text>
      ) : null}
    </View>
  );
}

export default NextPrayerCard;
