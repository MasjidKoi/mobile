import { type ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { Text } from "./Text";

/**
 * Icon + body + trailing row from the Donation kit. Generic — backs both the
 * Donation History row (primary tone, amount/status trailing) and the
 * Recurring Schedule row (gold tone, pause trailing). `iconTone` tints the
 * icon circle; `trailing` is any node.
 */
export type IconRowTone = "primary" | "gold";

export type IconRowProps = ViewProps & {
  icon?: ReactNode;
  iconTone?: IconRowTone;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  className?: string;
};

export function IconRow({
  icon,
  iconTone = "primary",
  title,
  subtitle,
  trailing,
  className,
  ...props
}: IconRowProps) {
  return (
    <View
      className={`flex-row items-center gap-3 rounded-md border border-border bg-surface px-3.5 py-3${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      <View
        className={`h-[38px] w-[38px] items-center justify-center rounded-full ${
          iconTone === "gold" ? "bg-accent-gold-soft" : "bg-primary-soft"
        }`}
      >
        {icon}
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-content-primary">{title}</Text>
        {subtitle ? (
          <Text className="text-[12px] font-regular text-content-muted">{subtitle}</Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

export default IconRow;
