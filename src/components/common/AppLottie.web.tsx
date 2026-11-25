import React, { useEffect, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import lottie, { AnimationItem } from 'lottie-web';

export interface AppLottieProps {
  /** Required Lottie JSON object or remote URI source */
  source: Record<string, unknown> | string | { uri: string };
  /** Square size shorthand in px; overridden if width/height are in style */
  size?: number;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  /** Increment or change this value to replay the animation from frame 0 */
  playTrigger?: number | boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Web Lottie wrapper backed by lottie-web, matching the native AppLottie API.
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const isUriObj = typeof source === 'object' && source !== null && 'uri' in source;
    const isUrlStr = typeof source === 'string';

    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: prefersReducedMotion ? false : loop,
      autoplay: prefersReducedMotion ? false : autoPlay,
      ...(isUrlStr
        ? { path: source }
        : isUriObj
          ? { path: (source as { uri: string }).uri }
          : { animationData: source }),
    });

    anim.setSpeed(speed);
    if (prefersReducedMotion) {
      anim.goToAndStop(anim.totalFrames || 0, true);
    }
    animRef.current = anim;

    return () => {
      anim.destroy();
      animRef.current = null;
    };
  }, [source, autoPlay, loop, speed]);

  useEffect(() => {
    const anim = animRef.current;
    if (!anim || playTrigger === undefined) return;
    if (typeof playTrigger === 'boolean') {
      if (playTrigger) {
        anim.goToAndPlay(0, true);
      } else {
        anim.goToAndStop(0, true);
      }
    } else {
      anim.goToAndPlay(0, true);
    }
  }, [playTrigger]);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      />
    </View>
  );
};
