import { Platform, ViewStyle } from 'react-native';

const level1 = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: {
    elevation: 2,
  },
  default: {},
});

const level2 = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#0D631B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  android: {
    elevation: 4,
  },
  default: {},
});

const level3 = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#191C1A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  android: {
    elevation: 8,
  },
  default: {},
});

/**
 * Cross-platform Elevation & Shadow tokens
 */
export const Shadows = {
  level0: {} as ViewStyle,
  level1,
  level2,
  level3,

  // Convenience aliases
  sm: level1,
  md: level2,
  lg: level3,
} as const;
