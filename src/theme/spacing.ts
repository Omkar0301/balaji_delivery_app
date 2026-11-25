/**
 * Balaji Fresh 8pt Modular Spacing Scale
 */
export const Spacing = {
  spaceXs: 4,
  spaceSm: 8,
  spaceMd: 12,
  spaceLg: 16,
  spaceXl: 24,
  space2xl: 32,
  space3xl: 40,

  // Convenience aliases for screens
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Common Layout Offsets
  gutter: 12,
  margin: 16,
  minTouchTarget: 48,
  bottomClearance: 88,
} as const;

export type SpacingToken = keyof typeof Spacing;
