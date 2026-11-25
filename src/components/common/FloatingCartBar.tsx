import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartContext } from '../../context/CartContext';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { Shadows } from '../../theme/shadows';
import { Motion } from '../../theme/motion';
import { formatCurrency } from '../../utils/formatters';
import { PressableScale } from './PressableScale';

export interface FloatingCartBarProps {
  bottomOffset?: number;
  inTabs?: boolean;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ bottomOffset, inTabs = false }) => {
  const { totalItemCount, itemTotal } = useCartContext();
  const insets = useSafeAreaInsets();

  const [mounted, setMounted] = useState(totalItemCount > 0);
  const [translateY] = useState(() => new Animated.Value(totalItemCount > 0 ? 0 : 80));
  const [opacity] = useState(() => new Animated.Value(totalItemCount > 0 ? 1 : 0));
  const [badgeScale] = useState(() => new Animated.Value(1));
  const prevCount = useRef(totalItemCount);

  if (totalItemCount > 0 && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (totalItemCount > 0) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          ...Motion.spring.gentle,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: Motion.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();

      if (prevCount.current !== totalItemCount) {
        badgeScale.setValue(1);
        Animated.sequence([
          Animated.spring(badgeScale, {
            toValue: 1.35,
            ...Motion.spring.snappy,
          }),
          Animated.spring(badgeScale, {
            toValue: 1.0,
            ...Motion.spring.bouncy,
          }),
        ]).start();
      }
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 80,
          duration: Motion.duration.fast,
          easing: Motion.easing.exit,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: Motion.duration.fast,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMounted(false);
      });
    }
    prevCount.current = totalItemCount;
  }, [totalItemCount, translateY, opacity, badgeScale]);

  if (!mounted && totalItemCount === 0) {
    return null;
  }

  // Inside Tab screens, the view sits above the tab bar.
  // In Stack screens (like /catalog or /search), it must sit above the system navigation bar (insets.bottom).
  const offset = inTabs
    ? (bottomOffset !== undefined ? bottomOffset : 12)
    : (bottomOffset !== undefined ? bottomOffset + insets.bottom : Math.max(14, insets.bottom + 8));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: offset,
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="box-none"
    >
      <PressableScale
        onPress={() => router.push('/(tabs)/cart')}
        activeScale={0.98}
        style={styles.cartBar}
        accessibilityRole="button"
        accessibilityLabel={`View cart with ${totalItemCount} items, total ${formatCurrency(itemTotal)}`}
      >
        <View style={styles.leftSection}>
          <View style={styles.bagCircle}>
            <MaterialIcons name="shopping-bag" size={20} color="#FFFFFF" />
            <Animated.View style={[styles.badgeCount, { transform: [{ scale: badgeScale }] }]}>
              <Text style={styles.badgeCountText}>{totalItemCount}</Text>
            </Animated.View>
          </View>
          <View style={styles.textGroup}>
            <Text style={styles.itemCountText}>
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in cart
            </Text>
            <Text style={styles.totalPriceText}>
              {formatCurrency(itemTotal)} • 8 AM – 12 PM
            </Text>
          </View>
        </View>

        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>View Cart</Text>
          <MaterialIcons name="arrow-forward" size={16} color={Colors.primary} />
        </View>
      </PressableScale>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 999,
  },
  cartBar: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  bagCircle: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCount: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#FEA619',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeCountText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  textGroup: {
    flex: 1,
  },
  itemCountText: {
    color: '#A3F69C',
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
  },
  totalPriceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  ctaText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: Typography.caption.fontSize,
  },
});
