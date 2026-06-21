import { Feather } from "@expo/vector-icons";
import { type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

export type PermissionBenefit = {
  icon: keyof typeof Feather.glyphMap;
  text: string;
};

export type PermissionExplainerProps = {
  /** Optional illustration card above the title. */
  illustration?: ReactNode;
  title: string;
  benefits: PermissionBenefit[];
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  onClose: () => void;
};

/**
 * Reusable pre-permission explainer (designs 10 Location / 12 Notification):
 * a close affordance, an illustration, a title, a list of benefit rows, and a
 * primary "enable" CTA over a secondary fallback. Generic — the caller supplies
 * copy + the OS-permission wiring (deferred to the consuming phase).
 */
export function PermissionExplainer({
  illustration,
  title,
  benefits,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onClose,
}: PermissionExplainerProps) {
  const c = useColors();

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-surface">
      <View className="flex-row justify-end px-lg py-2">
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={12}>
          <Feather name="x" size={24} color={c["text-secondary"]} />
        </Pressable>
      </View>

      <View className="gap-5 px-lg pt-2">
        {illustration}
        <Text variant="title" className="text-[22px]">
          {title}
        </Text>
        <View className="gap-3.5">
          {benefits.map((b) => (
            <View key={b.icon} className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-primary-soft">
                <Feather name={b.icon} size={18} color={c.primary} />
              </View>
              <Text variant="body" className="flex-1 text-content-secondary">
                {b.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="flex-1" />

      <View className="gap-2.5 px-lg pb-3">
        <Button label={primaryLabel} onPress={onPrimary} />
        <Button variant="text" label={secondaryLabel} onPress={onSecondary} />
      </View>
    </SafeAreaView>
  );
}

export default PermissionExplainer;
