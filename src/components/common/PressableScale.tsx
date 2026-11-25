import React, { useState } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
  Platform,
} from 'react-native';
import { Motion } from '../../theme/motion';

const AnimatedPressable =
  Platform.OS !== 'web' ? Animated.createAnimatedComponent(Pressable) : null;

export interface PressableScaleProps extends PressableProps {
  activeScale?: number;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  children?: React.ReactNode;
}

/**
 * High-performance tactile press component.
 * On Native (iOS/Android): uses Animated.createAnimatedComponent(Pressable) with 60/120 FPS native spring physics.
 * On Web: uses standard Pressable with CSS transform to avoid React Native Web ref / createAnimatedComponent crashes.
 */
export const PressableScale: React.FC<PressableScaleProps> = ({
  activeScale = 0.96,
  style,
  children,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}) => {
  const [scale] = useState(() => new Animated.Value(1));

  // On Web: use standard Pressable without forcing HTML <button> tag to avoid invalid DOM nesting errors
  if (Platform.OS === 'web') {
    const webProps = { ...props };
    delete (webProps as Record<string, unknown>).accessibilityRole;
    return (
      <Pressable
        {...webProps}
        disabled={disabled}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={(state) => [
          typeof style === 'function' ? style(state) : style,
          state.pressed && !disabled ? { transform: [{ scale: activeScale }] } : undefined,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  // On Native (Android / iOS)
  const handlePressIn = (e: GestureResponderEvent) => {
    if (!disabled) {
      Animated.spring(scale, {
        toValue: activeScale,
        ...Motion.spring.snappy,
      }).start();
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    if (!disabled) {
      Animated.spring(scale, {
        toValue: 1,
        ...Motion.spring.bouncy,
      }).start();
    }
    onPressOut?.(e);
  };

  if (!AnimatedPressable) {
    return null;
  }

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        typeof style === 'function' ? style({ pressed: false }) : style,
        { transform: [{ scale }] },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
};
