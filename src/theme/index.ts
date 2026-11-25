import { Colors } from './colors';
import { Typography } from './typography';
import { Spacing } from './spacing';
import { Radius } from './radius';
import { Shadows } from './shadows';
import { Motion } from './motion';

export const theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  radius: Radius,
  shadows: Shadows,
  motion: Motion,
} as const;

export type Theme = typeof theme;

export { Colors, Typography, Spacing, Radius, Shadows, Motion };
