/**
 * Balaji Fresh Design System - Botanical Color Tokens
 * Derived from Stitch Design System with Material Design 3 tokens
 * High-contrast WCAG AAA compliant tokens
 */
export const Colors = {
  // Primary (Botanical Leaf Green)
  primary: '#0D631B',
  primaryContainer: '#E8F5E9', // Light botanical mint tint (High contrast with dark green text)
  primaryFixed: '#C8E6C9',
  primaryFixedDim: '#A3F69C',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#0A4A14',
  onPrimaryFixed: '#002204',
  onPrimaryFixedVariant: '#005312',
  primaryLight: '#1B6D24',
  primaryDark: '#0A4A14',

  // Secondary (Harvest Orange & Deal Spark)
  secondary: '#855300',
  secondaryContainer: '#FEA619',
  secondaryFixed: '#FFDDB8',
  secondaryFixedDim: '#FFB95F',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#684000',
  onSecondaryFixed: '#2A1700',
  onSecondaryFixedVariant: '#653E00',

  // Tertiary (Fresh Farm Harvest & Verification)
  tertiary: '#006329',
  tertiaryContainer: '#E6F4EA',
  tertiaryFixed: '#7FFC97',
  tertiaryFixedDim: '#62DF7D',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#005320',
  onTertiaryFixed: '#002109',
  onTertiaryFixedVariant: '#005320',

  // Surfaces & Canvas (Anti-glare Crisp Daylight Off-White)
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  background: '#F8FAF5',
  surfaceBright: '#F8FAF5',
  surfaceDim: '#D8DBD6',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F2F4EF',
  surfaceContainer: '#ECEFEA',
  surfaceContainerHigh: '#E7E9E4',
  surfaceContainerHighest: '#E1E3DE',
  surfaceVariant: '#E1E3DE',
  surfaceTint: '#1B6D24',

  // Text & On-Surfaces
  textPrimary: '#191C1A',
  textSecondary: '#40493D',
  textMuted: '#707A6C',
  onSurface: '#191C1A',
  onSurfaceVariant: '#40493D',
  onBackground: '#191C1A',
  inverseSurface: '#2E312E',
  inverseOnSurface: '#EFF1EC',
  inversePrimary: '#88D982',

  // Outlines & Borders
  border: '#E2E8F0',
  outline: '#707A6C',
  outlineVariant: '#BFCABA',

  // Semantic Status
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',
  onErrorContainer: '#93000A',
  success: '#1B6D24',
  successContainer: '#DCFCE7',
  onSuccessContainer: '#15803D',
  warning: '#FEA619',
  info: '#0284C7',

  // Scrim & Overlay
  scrim: '#000000',
  shadow: '#000000',
  backdropBlur: 'rgba(255, 255, 255, 0.92)',
} as const;

export type ColorToken = keyof typeof Colors;
