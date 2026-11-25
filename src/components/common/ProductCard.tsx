import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  LayoutAnimation,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Product } from '../../types/product';
import { useCartContext } from '../../context/CartContext';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { Shadows } from '../../theme/shadows';
import { formatCurrency } from '../../utils/formatters';
import { QuantityStepper } from './QuantityStepper';
import { ProgressiveImage } from '../feedback/ProgressiveImage';
import { PressableScale } from './PressableScale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COMPACT_CARD_WIDTH = Math.max(160, Math.min(185, Math.floor((SCREEN_WIDTH - 44) / 2)));

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({ product, compact = false, style }) => {
  const [selectedWeight, setSelectedWeight] = useState(
    product.weightOptions[0] || {
      id: 'default',
      label: '1 unit',
      weightInGrams: 1000,
      price: product.basePrice,
      mrp: product.baseMrp,
    }
  );

  const { getCartItem, addItem, updateQuantity } = useCartContext();
  const cartItem = getCartItem(product.id, selectedWeight.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    addItem(product, selectedWeight, 1);
  };

  const handleIncrement = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (cartItem) {
      updateQuantity(cartItem.id, 1);
    } else {
      handleAdd();
    }
  };

  const handleDecrement = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (cartItem) {
      updateQuantity(cartItem.id, -1);
    }
  };

  const handleCardPress = () => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id },
    });
  };

  return (
    <PressableScale
      onPress={handleCardPress}
      activeScale={0.985}
      style={[
        styles.card,
        compact ? { width: COMPACT_CARD_WIDTH, marginRight: Spacing.sm } : styles.cardFull,
        style,
      ]}
      accessibilityLabel={`${product.name}, ${selectedWeight.label}, ${formatCurrency(selectedWeight.price)}`}
    >
      {/* Top Image Container - Clean photography without badge overlays */}
      <View style={styles.imageContainer}>
        <ProgressiveImage
          uri={product.imageUrl}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Content Container with unified height structure */}
      <View style={styles.content}>
        {/* Title & Regional Name */}
        <View style={styles.titleSection}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {product.name}
          </Text>
          <Text style={styles.regionalName} numberOfLines={1} ellipsizeMode="tail">
            {product.regionalName}
          </Text>
        </View>

        {/* Weight Selector Chips - Single-row horizontal scroll guarantees identical card height */}
        <View style={styles.weightSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weightChipsScroll}
            nestedScrollEnabled={true}
          >
            {product.weightOptions.map((weight) => {
              const isSelected = weight.id === selectedWeight.id;
              return (
                <Pressable
                  key={weight.id}
                  onPress={() => setSelectedWeight(weight)}
                  style={({ pressed }) => [
                    styles.weightChip,
                    isSelected && styles.weightChipSelected,
                    pressed && styles.chipPressed,
                  ]}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Text
                    style={[
                      styles.weightChipText,
                      isSelected && styles.weightChipTextSelected,
                    ]}
                  >
                    {weight.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Price Row & Action */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(selectedWeight.price)}</Text>
            {selectedWeight.mrp > selectedWeight.price && (
              <Text style={styles.mrp}>{formatCurrency(selectedWeight.mrp)}</Text>
            )}
          </View>

          {/* Stepper or ADD CTA */}
          {currentQuantity > 0 ? (
            <QuantityStepper
              quantity={currentQuantity}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              variant="primary"
            />
          ) : (
            <PressableScale
              onPress={handleAdd}
              activeScale={0.92}
              style={styles.addButton}
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to cart`}
            >
              <Text style={styles.addButtonText}>ADD +</Text>
            </PressableScale>
          )}
        </View>
      </View>
    </PressableScale>
  );
});

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    height: 268,
    ...Shadows.level1,
  },
  cardFull: {
    width: '100%',
    height: 268,
    marginBottom: Spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 125,
    backgroundColor: '#F8FAF5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: Spacing.sm + 2,
    flex: 1,
    justifyContent: 'space-between',
  },
  titleSection: {
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  regionalName: {
    fontSize: 11,
    color: Colors.primaryDark,
    fontWeight: '600',
    marginTop: 2,
  },
  weightSection: {
    height: 28,
    marginVertical: 4,
    justifyContent: 'center',
  },
  weightChipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  weightChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  chipPressed: {
    opacity: 0.75,
  },
  weightChipSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  weightChipText: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  weightChipTextSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    flexShrink: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  mrp: {
    fontSize: 11,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addButton: {
    minWidth: 74,
    height: 32,
    backgroundColor: Colors.primary, // Solid botanical green
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  addButtonText: {
    color: '#FFFFFF', // High-contrast, pure white bold text
    fontWeight: '900',
    fontSize: 12.5,
    letterSpacing: 0.6,
  },
  stepperContainer: {
    minWidth: 74,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 4,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  stepperButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  stepperButtonPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.9 }],
  },
  stepperButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  stepperQuantity: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    marginHorizontal: 3,
  },
});
