import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius } from '../../theme/radius';
import { Motion } from '../../theme/motion';
import { PressableScale } from './PressableScale';

export type StepperVariant = 'default' | 'primary';

export interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  variant?: StepperVariant;
  style?: StyleProp<ViewStyle>;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  variant = 'default',
  style,
}) => {
  const isPrimary = variant === 'primary';
  const [countScale] = useState(() => new Animated.Value(1));
  const [countTranslateY] = useState(() => new Animated.Value(0));
  const prevQuantity = useRef(quantity);

  useEffect(() => {
    if (prevQuantity.current !== quantity) {
      const isIncrement = quantity > prevQuantity.current;
      countTranslateY.setValue(isIncrement ? 4 : -4);
      countScale.setValue(1.22);

      Animated.parallel([
        Animated.spring(countScale, {
          toValue: 1,
          ...Motion.spring.bouncy,
        }),
        Animated.spring(countTranslateY, {
          toValue: 0,
          ...Motion.spring.snappy,
        }),
      ]).start();
      prevQuantity.current = quantity;
    }
  }, [quantity, countScale, countTranslateY]);

  return (
    <View style={[styles.container, isPrimary ? styles.primaryContainer : styles.defaultContainer, style]}>
      <PressableScale
        onPress={onDecrement}
        disabled={quantity <= min}
        activeScale={0.88}
        style={[
          styles.button,
          isPrimary ? styles.primaryButton : styles.defaultButton,
        ]}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityLabel="Decrease quantity"
      >
        <Text style={[styles.buttonText, isPrimary ? styles.primaryButtonText : styles.defaultButtonText]}>
          −
        </Text>
      </PressableScale>

      <Animated.View style={{ transform: [{ scale: countScale }, { translateY: countTranslateY }] }}>
        <Text style={[styles.quantityText, isPrimary ? styles.primaryQuantityText : styles.defaultQuantityText]}>
          {quantity}
        </Text>
      </Animated.View>

      <PressableScale
        onPress={onIncrement}
        disabled={quantity >= max}
        activeScale={0.88}
        style={[
          styles.button,
          isPrimary ? styles.primaryButton : styles.defaultButton,
        ]}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityLabel="Increase quantity"
      >
        <Text style={[styles.buttonText, isPrimary ? styles.primaryButtonText : styles.defaultButtonText]}>
          +
        </Text>
      </PressableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultContainer: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    padding: 2,
    minHeight: 32,
  },
  primaryContainer: {
    minWidth: 74,
    height: 32,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 4,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultButton: {
    width: 28,
    height: 28,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
  },
  primaryButton: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
  },
  buttonText: {
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 18,
  },
  defaultButtonText: {
    color: Colors.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  quantityText: {
    fontWeight: '800',
    fontSize: 13,
    textAlign: 'center',
  },
  defaultQuantityText: {
    minWidth: 26,
    color: Colors.textPrimary,
  },
  primaryQuantityText: {
    color: '#FFFFFF',
    marginHorizontal: 3,
  },
});
