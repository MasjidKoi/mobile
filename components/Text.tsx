import {
  Text as RNText,
  useWindowDimensions,
  type TextProps,
} from "react-native";

import type { TypographyToken } from "@/constants/theme";
import {
  fontSize as RAMP_SIZE,
  lineHeight as RAMP_LH,
} from "@/constants/tokens";
import { resolveFontScale } from "@/lib/theme/fontScale";
import { useFontScale } from "@/lib/theme/FontScaleProvider";

/**
 * Typed text component implementing the Style Guide type ramp. Each variant
 * sets the right Hind Siliguri weight (via font family), size + line-height,
 * and a sensible default colour. Override any of it with `className`.
 *
 *   <Text variant="display">মসজিদ কই?</Text>
 *   <Text variant="caption" className="text-primary">Resend in 60s</Text>
 *
 * Font sizing is applied as an inline style (not just the className) so the
 * in-app font-step × OS font-scale multiplier (PRD 09 #11–15) lands on every
 * `Text` uniformly. The base size is taken from the *effective* size utility —
 * the last `text-<size>` token across the variant class and any `className`
 * override (NativeWind resolves later classes last) — so callers that override
 * the size (e.g. `text-sm`) still scale from the right base.
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

/** [fontSize, lineHeight] in px for every size utility a `Text` may carry. */
const SIZE_PX: Record<string, [number, number]> = {
  // Style-guide ramp (constants/tokens.ts) — keep in sync via the spread below.
  ...Object.fromEntries(
    (Object.keys(RAMP_SIZE) as TypographyToken[]).map((k) => [
      k,
      [RAMP_SIZE[k], RAMP_LH[k]],
    ]),
  ),
  // Tailwind defaults still used by a handful of components.
  xs: [12, 16],
  sm: [14, 20],
  base: [16, 24],
  lg: [18, 28],
  xl: [20, 28],
  "2xl": [24, 32],
  "3xl": [30, 36],
};

// Matches both the named ramp/Tailwind sizes and arbitrary `text-[Npx]` values
// (used by ~50 call sites). The last size token in the class string wins, since
// NativeWind resolves later classes last.
const SIZE_RE =
  /\btext-(?:\[(\d+(?:\.\d+)?)px\]|(display|title|heading|body|caption|micro|xs|sm|base|lg|xl|2xl|3xl)\b)/g;

function effectiveSize(classes: string): [number, number] {
  let size: [number, number] | null = null;
  for (const m of classes.matchAll(SIZE_RE)) {
    if (m[1]) {
      const n = Number(m[1]);
      // ≥1.45× so Hind Siliguri's tall Bengali clusters aren't clipped at the
      // top once scaling is active (matches the ramp leading in tokens.ts).
      size = [n, Math.round(n * 1.45)];
    } else if (m[2] && SIZE_PX[m[2]]) {
      size = SIZE_PX[m[2]];
    }
  }
  return size ?? SIZE_PX.body;
}

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  className?: string;
};

export function Text({
  variant = "body",
  className,
  style,
  allowFontScaling,
  ...props
}: AppTextProps) {
  const { step } = useFontScale();
  const { fontScale } = useWindowDimensions();
  const classes = `${VARIANT_CLASS[variant]}${className ? ` ${className}` : ""}`;
  const m = resolveFontScale(step, fontScale);

  // At the no-op multiplier (default step + OS scale 1, the common case) leave
  // sizing entirely to the className so there is zero deviation from before.
  // Only when scaling is active do we fold it in via an inline size override —
  // and we disable RN's own font scaling then to avoid double-counting.
  const [baseSize, baseLh] = m === 1 ? [0, 0] : effectiveSize(classes);

  return (
    <RNText
      className={classes}
      allowFontScaling={allowFontScaling ?? m === 1}
      style={
        m === 1
          ? style
          : [{ fontSize: baseSize * m, lineHeight: baseLh * m }, style]
      }
      {...props}
    />
  );
}

export default Text;
