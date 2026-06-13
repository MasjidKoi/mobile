import { type ReactNode } from "react";
import { View } from "react-native";

import { Colors } from "@/constants/theme";

/**
 * Map marker from the Map & Discovery kit: a rounded head with a downward
 * tail. Generic over its `icon` node; `selected` enlarges it and inverts the
 * fill. Pass an icon sized/colored for the state (primary on default, white on
 * selected).
 */
export type MapPinProps = {
  icon?: ReactNode;
  selected?: boolean;
  className?: string;
};

export function MapPin({ icon, selected = false, className }: MapPinProps) {
  return (
    <View className={`items-center${className ? ` ${className}` : ""}`}>
      <View
        className={`items-center justify-center rounded-full border-2 ${
          selected ? "h-11 w-11 border-on-inverse bg-primary" : "h-9 w-9 border-primary bg-surface"
        }`}
        style={
          selected
            ? { shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 }
            : { shadowColor: "#182420", shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }
        }
      >
        {icon}
      </View>
      <View
        style={{
          width: 0,
          height: 0,
          marginTop: -1,
          borderLeftWidth: selected ? 7 : 6,
          borderRightWidth: selected ? 7 : 6,
          borderTopWidth: selected ? 9 : 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: Colors.primary,
        }}
      />
    </View>
  );
}

export default MapPin;
