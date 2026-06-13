import { type ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

import { Text } from "./Text";

/**
 * Core button from the Style Guide. Three variants:
 *   - primary:   filled brand green, white label
 *   - secondary: surface with border
 *   - text:      label-only (ghost)
 * Pass `leftIcon`/`rightIcon` as nodes (e.g. a lucide icon) — the row reserves
 * the gap automatically.
 */
export type ButtonVariant = "primary" | "secondary" | "text";

const CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-primary active:bg-primary-pressed px-[28px] py-[14px]",
  secondary: "bg-surface border border-border active:bg-primary-soft px-[28px] py-[14px]",
  text: "active:opacity-60 px-4 py-[14px]",
};

const LABEL: Record<ButtonVariant, string> = {
  primary: "text-on-inverse",
  secondary: "text-content-primary",
  text: "text-primary",
};

export type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
};

export function Button({
  label,
  variant = "primary",
  leftIcon,
  rightIcon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={`flex-row items-center justify-center gap-sm rounded-md ${CONTAINER[variant]}${
        disabled ? " opacity-50" : ""
      }${className ? ` ${className}` : ""}`}
      {...props}
    >
      {leftIcon}
      <Text className={`text-base font-semibold ${LABEL[variant]}`}>{label}</Text>
      {rightIcon}
    </Pressable>
  );
}

export default Button;
