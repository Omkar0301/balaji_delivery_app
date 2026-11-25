import { TextStyle } from 'react-native';
import { Colors } from './colors';

/**
 * Balaji Fresh Typography Tokens
 * Designed with Inter font characteristics and high legibility
 */
export const Typography = {
  headlineXl: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.56,
    color: Colors.onSurface,
  } as TextStyle,
  headlineLg: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.22,
    color: Colors.onSurface,
  } as TextStyle,
  headlineMd: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: -0.18,
    color: Colors.onSurface,
  } as TextStyle,
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0,
    color: Colors.onSurface,
  } as TextStyle,
  bodyMd: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0,
    color: Colors.onSurfaceVariant,
  } as TextStyle,
  bodySm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.12,
    color: Colors.onSurfaceVariant,
  } as TextStyle,
  labelLg: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.15,
    color: Colors.onSurface,
  } as TextStyle,
  labelMd: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.26,
    color: Colors.onSurface,
  } as TextStyle,
  labelSm: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.33,
    color: Colors.onSurfaceVariant,
  } as TextStyle,
  priceDisplay: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: Colors.primary,
  } as TextStyle,

  // Convenience aliases for screens
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.56,
    color: Colors.onSurface,
  } as TextStyle,
  h1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.22,
    color: Colors.onSurface,
  } as TextStyle,
  h2: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.18,
    color: Colors.onSurface,
  } as TextStyle,
  h3: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0,
    color: Colors.onSurface,
  } as TextStyle,
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0,
    color: Colors.onSurface,
  } as TextStyle,
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0,
    color: Colors.onSurfaceVariant,
  } as TextStyle,
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.12,
    color: Colors.onSurfaceVariant,
  } as TextStyle,
  micro: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.onSurfaceVariant,
  } as TextStyle,
} as const;

export type TypographyToken = keyof typeof Typography;
