import { View } from "react-native";

import { Text } from "./Text";

/**
 * Map cluster bubble from the Map & Discovery kit: a brand-green circle with a
 * white ring showing the clustered count.
 */
export type ClusterBubbleProps = {
  count: number | string;
  className?: string;
};

export function ClusterBubble({ count, className }: ClusterBubbleProps) {
  return (
    <View
      className={`h-10 w-10 items-center justify-center rounded-full border-2 border-on-inverse bg-primary${
        className ? ` ${className}` : ""
      }`}
      style={{
        shadowColor: "#182420",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
    >
      <Text className="text-sm font-bold text-on-inverse">{count}</Text>
    </View>
  );
}

export default ClusterBubble;
