import { View } from "react-native";

import { Text } from "./Text";

/**
 * Five-prayer table from the Map & Discovery kit: a header (date + Azan/Iqamah
 * columns) over prayer rows. The `current` row is highlighted. Generic over
 * the `rows` data.
 */
export type PrayerTableRow = {
  name: string;
  azan: string;
  iqamah: string;
  current?: boolean;
};

export type PrayerTableProps = {
  date: string;
  rows: PrayerTableRow[];
  azanLabel?: string;
  iqamahLabel?: string;
  className?: string;
};

export function PrayerTable({
  date,
  rows,
  azanLabel = "আজান",
  iqamahLabel = "জামাত",
  className,
}: PrayerTableProps) {
  return (
    <View
      className={`overflow-hidden rounded-lg border border-border bg-surface${
        className ? ` ${className}` : ""
      }`}
    >
      <View className="flex-row items-center bg-background px-4 py-3">
        <Text className="flex-1 text-[12px] font-semibold text-content-secondary">{date}</Text>
        <Text className="w-20 text-right text-[12px] font-semibold text-content-muted">
          {azanLabel}
        </Text>
        <Text className="w-20 text-right text-[12px] font-semibold text-content-muted">
          {iqamahLabel}
        </Text>
      </View>

      {rows.map((row, i) => (
        <View
          key={`${row.name}-${i}`}
          className={`flex-row items-center px-4 py-3${row.current ? " bg-primary-soft" : ""}`}
        >
          <Text
            className={`flex-1 text-body ${
              row.current ? "font-bold text-primary" : "font-medium text-content-primary"
            }`}
          >
            {row.name}
          </Text>
          <Text
            className={`w-20 text-right text-body ${
              row.current ? "font-semibold text-primary" : "font-regular text-content-secondary"
            }`}
          >
            {row.azan}
          </Text>
          <Text
            className={`w-20 text-right text-body ${
              row.current ? "font-bold text-primary" : "font-semibold text-content-primary"
            }`}
          >
            {row.iqamah}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default PrayerTable;
