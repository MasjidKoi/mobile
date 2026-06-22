# Accessibility checklist (MasjidKoi mobile)

Accessibility, like i18n and theming, is a **foundation** — applied per screen as
they're built, not a settings feature. Use this list when wiring each screen.

## Touch targets
- [ ] Interactive elements are **≥ 44×44 pt** hit area. Use `hitSlop` to extend
      small visual controls (icons, dots) without growing their footprint.

## Contrast (WCAG AA)
- [ ] Body/label text ≥ **4.5:1** against its background; large text ≥ **3:1**.
- [ ] Verify in **both** light and dark palettes (tokens flip via ThemeProvider).
- [ ] Never hardcode hex in components — use semantic tokens so contrast is
      managed centrally in `constants/tokens.ts`.

## Dynamic type / font scaling
- [ ] Layouts tolerate OS font scaling — avoid fixed heights that clip text.
- [ ] Bengali needs generous line-height (matras/reph stack above the glyph);
      keep ~1.4×+ as the type ramp already does.

## Screen reader
- [ ] Every actionable element sets `accessibilityRole` (`button`, `link`, …) and
      a meaningful `accessibilityLabel` (don't rely on icon-only affordances).
- [ ] Selection/disabled state exposed via `accessibilityState`.
- [ ] Decorative images are hidden from the reader (`accessibilityElementsHidden`
      / `importantForAccessibility="no"`).
- [ ] Numbers/times announced through `LocaleFormat` so Bengali numerals read
      correctly.

## RTL (Arabic)
- [ ] Prefer logical styles (`ms-`/`me-`, `start`/`end`) over `left`/`right`.
- [ ] Don't mirror directional glyphs that shouldn't flip (e.g. the Qibla compass).
- [ ] Switching to Arabic forces RTL and requires an app restart (Phase 7).

## Motion
- [ ] Respect reduce-motion for non-essential animation
      (`AccessibilityInfo.isReduceMotionEnabled`).
