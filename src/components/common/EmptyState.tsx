import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { PressableScale } from './PressableScale';
import { AppLottie, AppLottieProps } from './AppLottie';

interface EmptyStateProps {
  icon?: string;
  lottieSource?: AppLottieProps['source'];
  lottieSize?: number;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🛒',
  lottieSource,
  lottieSize = 128,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const [bobAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -8,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bobAnim]);

  return (
    <View style={styles.container}>
      {lottieSource ? (
        <View style={styles.lottieWrap}>
          <AppLottie source={lottieSource} size={lottieSize} autoPlay loop />
        </View>
      ) : (
        <Animated.View style={{ transform: [{ translateY: bobAnim }] }}>
          <Text style={styles.icon}>{icon}</Text>
        </Animated.View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <PressableScale
          onPress={onAction}
          activeScale={0.96}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </PressableScale>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  icon: {
    fontSize: 54,
    marginBottom: Spacing.md,
  },
  lottieWrap: {
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.body.fontSize,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  buttonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.body.fontSize,
  },
});
