import { ActivityIndicator, View } from "react-native";

import { Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/** Spinner moment (40) while we poll the gateway result for a pending donation. */
export type ConfirmingStateProps = {
  title: string;
  caption?: string;
  className?: string;
};

export function ConfirmingState({ title, caption, className }: ConfirmingStateProps) {
  const c = useColors();
  return (
    <View className={`items-center gap-4${className ? ` ${className}` : ""}`}>
      <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
        <ActivityIndicator size="large" color={c.primary} />
      </View>
      <View className="items-center gap-1.5">
        <Text variant="title" className="text-center">
          {title}
        </Text>
        {caption ? (
          <Text variant="body" className="text-center text-content-secondary">
            {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default ConfirmingState;
