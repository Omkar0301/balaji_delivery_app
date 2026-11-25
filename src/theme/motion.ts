import { Easing, Platform } from 'react-native';

const isNative = Platform.OS !== 'web';

/**
 * Balaji Fresh Botanical Motion System
 * Designed for organic, responsive, 60/120 FPS native-thread animations.
 */
export const Motion = {
  // Standard Durations (ms)
  duration: {
    instant: 100,
    fast: 180,
    standard: 280,
    deliberate: 400,
  },

  // Native Spring Configurations (tension / friction)
  spring: {
    snappy: {
      tension: 140,
      friction: 9,
      useNativeDriver: isNative,
    },
    bouncy: {
      tension: 80,
      friction: 7,
      useNativeDriver: isNative,
    },
    gentle: {
      tension: 45,
      friction: 8,
      useNativeDriver: isNative,
    },
  },

  // Easing Curves
  easing: {
    entrance: Easing.out(Easing.cubic),
    exit: Easing.in(Easing.cubic),
    standard: Easing.bezier(0.2, 0, 0, 1),
  },
} as const;

export type MotionToken = typeof Motion;
