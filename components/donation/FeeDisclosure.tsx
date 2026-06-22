import { Feather } from "@expo/vector-icons";
import { View } from "react-native";

import { Text } from "@/components";
import { useColors } from "@/lib/theme/useColors";

/**
 * Fee transparency row on the amount screen (35) — e.g. "মসজিদ পাবে ~৳488 ·
 * প্ল্যাটফর্ম ফি বাদে". The estimate comes from `CheckoutInitResponse.estimated_net`.
 */
export type FeeDisclosureProps = {
  message: string;
  className?: string;
};

export function FeeDisclosure({ message, className }: FeeDisclosureProps) {
  const c = useColors();
  return (
    <View
      className={`flex-row items-center gap-2 rounded-md bg-primary-soft px-3.5 py-2.5${
        className ? ` ${className}` : ""
      }`}
    >
      <Feather name="info" size={15} color={c.primary} />
      <Text variant="caption" className="flex-1 text-primary">
        {message}
      </Text>
    </View>
  );
}

export default FeeDisclosure;
