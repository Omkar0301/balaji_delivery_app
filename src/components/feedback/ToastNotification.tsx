import React, { useEffect, useState, useCallback } from 'react';
import { Animated, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Radius } from '../../theme/radius';
import { Spacing } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type?: ToastType;
  message: string;
  onDismiss: (id: string) => void;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export const ToastNotification: React.FC<ToastProps> = ({
  id,
  type = 'info',
  message,
  onDismiss,
  duration = 3200,
  style,
}) => {
  const [translateY] = useState(() => new Animated.Value(-60));
  const [opacity] = useState(() => new Animated.Value(0));

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -40,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(id));
  }, [id, onDismiss, opacity, translateY]);

  useEffect(() => {
    // Animate In
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleDismiss, opacity, translateY]);

  const getIconName = (): React.ComponentProps<typeof MaterialIcons>['name'] => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        styles[type],
        {
          transform: [{ translateY }],
          opacity,
        },
        style,
      ]}
    >
      <Pressable onPress={handleDismiss} style={styles.contentRow}>
        <MaterialIcons name={getIconName()} size={18} color="#FFFFFF" />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 50,
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 99999,
    ...Shadows.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  icon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  message: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  success: {
    backgroundColor: '#0D631B',
  },
  error: {
    backgroundColor: '#BA1A1A',
  },
  warning: {
    backgroundColor: '#855300',
  },
  info: {
    backgroundColor: '#0284C7',
  },
});
