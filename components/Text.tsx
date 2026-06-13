import { Text as RNText, type TextProps } from "react-native";

import type { TypographyToken } from "@/constants/theme";

/**
 * Typed text component implementing the Style Guide type ramp. Each variant
 * sets the right Hind Siliguri weight (via font family), size + line-height,
 * and a sensible default colour. Override any of it with `className`.
 *
 *   <Text variant="display">মসজিদ কই?</Text>
 *   <Text variant="caption" className="text-primary">Resend in 60s</Text>
 */
export type TextVariant = TypographyToken;

const VARIANT_CLASS: Record<TextVariant, string> = {
  display: "font-bold text-display text-content-primary",
  title: "font-semibold text-title text-content-primary",
  heading: "font-semibold text-heading text-content-primary",
  body: "font-regular text-body text-content-primary",
  caption: "font-medium text-caption text-content-secondary",
  micro: "font-regular text-micro text-content-muted",
};

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  className?: string;
};

export function Text({ variant = "body", className, ...props }: AppTextProps) {
  return (
    <RNText
      className={`${VARIANT_CLASS[variant]}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

export default Text;
