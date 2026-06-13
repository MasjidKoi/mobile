import { Pressable, View } from "react-native";

import { Text } from "./Text";

/**
 * Snackbar from the Mobile Components kit: a dark bar with a message and an
 * optional action. Presentational — the consumer handles placement/timing.
 */
export type SnackbarProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function Snackbar({ message, actionLabel, onAction, className }: SnackbarProps) {
  return (
    <View
      className={`flex-row items-center gap-3 rounded-sm bg-content-primary px-4 py-3${
        className ? ` ${className}` : ""
      }`}
    >
      <Text className="flex-1 text-sm font-regular text-on-inverse">{message}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} accessibilityRole="button">
          {/* Lighter gold for legibility on the dark surface. */}
          <Text className="text-sm font-semibold text-[#D9B65C]">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default Snackbar;
