import { View } from "react-native";

import { SegmentedControl, type SegmentedControlOption } from "./SegmentedControl";
import { Text } from "./Text";

/**
 * Per-masjid notification mode row from the Content & Community kit: the masjid
 * name beside a compact icon-only segmented control (e.g. digest / instant /
 * mute). Generic over the `options` and bound via `mode` / `onChange`.
 */
export type NotifModeRowProps = {
  masjid: string;
  mode: string;
  options: SegmentedControlOption[];
  onChange?: (key: string) => void;
  className?: string;
};

export function NotifModeRow({ masjid, mode, options, onChange, className }: NotifModeRowProps) {
  return (
    <View
      className={`flex-row items-center gap-3 rounded-md border border-border bg-surface px-[14px] py-3${
        className ? ` ${className}` : ""
      }`}
    >
      <Text className="flex-1 text-sm font-semibold text-content-primary">{masjid}</Text>
      <SegmentedControl options={options} value={mode} onChange={onChange} fill={false} />
    </View>
  );
}

export default NotifModeRow;
