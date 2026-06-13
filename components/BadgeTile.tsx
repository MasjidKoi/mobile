import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

/**
 * Achievement badge tile from the Ibadah & Gamification kit. Three states:
 *   - earned   — gold border + soft-gold icon circle
 *   - progress — plain border, optional progress label
 *   - locked   — same as progress but dimmed
 * Icon passed as a node.
 */
export type BadgeTileState = "earned" | "progress" | "locked";

export type BadgeTileProps = {
  icon?: ReactNode;
  name: string;
  tier: string;
  progress?: string;
  state?: BadgeTileState;
  /** Tier-progression dots (●●○) — `earned` of `total` filled. */
  tiers?: { total: number; earned: number };
  className?: string;
};

export function BadgeTile({
  icon,
  name,
  tier,
  progress,
  state = "progress",
  tiers,
  className,
}: BadgeTileProps) {
  const earned = state === "earned";
  return (
    <View
      className={`items-center gap-2 rounded-md bg-surface px-2.5 py-4 ${
        earned ? "border-[1.5px] border-accent-gold" : "border border-border"
      }${state === "locked" ? " opacity-60" : ""}${className ? ` ${className}` : ""}`}
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-full ${
          earned ? "bg-accent-gold-soft" : "bg-[#EDEFEC]"
        }`}
      >
        {icon}
      </View>
      <Text className="text-center text-caption font-semibold text-content-primary">{name}</Text>
      {tiers ? (
        <View className="flex-row items-center gap-[5px]">
          {Array.from({ length: tiers.total }, (_, i) => (
            <View
              key={i}
              className={`h-[9px] w-[9px] rounded-full ${
                i < tiers.earned ? "bg-accent-gold" : "border-[1.5px] border-border bg-surface"
              }`}
            />
          ))}
        </View>
      ) : null}
      <Text className={`text-center text-micro ${earned ? "text-[#8A6A1F]" : "text-content-muted"}`}>
        {tier}
      </Text>
      {progress ? (
        <Text className="text-center text-micro font-medium text-content-secondary">{progress}</Text>
      ) : null}
    </View>
  );
}

export default BadgeTile;
