import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleProp, View, ViewStyle } from 'react-native';
import LottieView, { AnimationObject } from 'lottie-react-native';

export interface AppLottieProps {
  /** Required Lottie JSON object or remote URI source */
  source: string | AnimationObject | { uri: string };
  /** Square size shorthand in dp; overridden if width/height are in style */
  size?: number;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  /** Increment or change this value to replay the animation from frame 0 */
  playTrigger?: number | boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Native (iOS / Android) Lottie wrapper with explicit container bounds and reduced-motion support.
 */
export const AppLottie: React.FC<AppLottieProps> = ({
  source,
  size = 64,
  autoPlay = true,
  loop = true,
  speed = 1,
  playTrigger,
  style,
}) => {
  const lottieRef = useRef<LottieView>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (playTrigger === undefined) return;
    if (reduceMotion) return;
    if (typeof playTrigger === 'boolean') {
      if (playTrigger) {
        lottieRef.current?.reset();
        lottieRef.current?.play();
      } else {
        lottieRef.current?.reset();
      }
    } else {
      lottieRef.current?.reset();
      lottieRef.current?.play();
    }
  }, [playTrigger, reduceMotion]);

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <LottieView
        ref={lottieRef}
        source={source}
        autoPlay={reduceMotion ? false : autoPlay}
        loop={reduceMotion ? false : loop}
        speed={speed}
        resizeMode="contain"
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
};
