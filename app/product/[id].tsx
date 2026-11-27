import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { productService } from '../../src/services/productService';
import { useCartContext } from '../../src/context/CartContext';
import { useToast } from '../../src/context/ToastContext';
import { ProgressiveImage } from '../../src/components/feedback/ProgressiveImage';
import { ErrorState } from '../../src/components/common/ErrorState';
import { LoadingState } from '../../src/components/common/LoadingState';
import { Product, WeightOption } from '../../src/types/product';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';
import { formatCurrency, formatDiscountPercentage } from '../../src/utils/formatters';
import { PressableScale } from '../../src/components/common/PressableScale';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(null);

  const { getCartItem, addItem, updateQuantity, totalItemCount, itemTotal } = useCartContext();
  const { showSuccess } = useToast();
  const insets = useSafeAreaInsets();
  const [scrollY] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    productService
      .getProductById(id)
      .then((res) => {
        if (!mounted) return;
        setProduct(res.data);
        setError(null);
        setSelectedWeight(
          res.data.weightOptions[0] || {
            id: 'default',
            label: '1 unit',
            weightInGrams: 1000,
            price: res.data.basePrice,
            mrp: res.data.baseMrp,
          }
        );
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        const apiErr = err as { message?: string };
        setError(apiErr?.message || 'Unable to load product details');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading || !product || !selectedWeight) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcons name="arrow-back" size={20} color={Colors.primary} />
              <Text style={styles.backButtonText}>Back</Text>
            </View>
          </Pressable>
        </View>
        {error ? (
          <ErrorState message={error} onRetry={() => router.replace(`/product/${id}`)} />
        ) : (
          <LoadingState message="Loading product details..." />
        )}
      </SafeAreaView>
    );
  }

  const cartItem = getCartItem(product.id, selectedWeight.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  const discount = formatDiscountPercentage(selectedWeight.mrp, selectedWeight.price);
  const imageScale = scrollY.interpolate({
    inputRange: [-160, 0],
    outputRange: [1.3, 1],
    extrapolateRight: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(tabs)/cart')}
          style={styles.cartButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={`Cart with ${totalItemCount} items`}
        >
          <MaterialIcons name="shopping-bag" size={24} color={Colors.primary} />
          {totalItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItemCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 130 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: Platform.OS !== 'web' }
        )}
      >
        {/* Product Hero Image */}
        <View style={styles.imageCard}>
          <Animated.View style={{ transform: [{ scale: imageScale }], width: '100%', height: '100%' }}>
            <ProgressiveImage
              uri={product.imageUrl}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </Animated.View>
          {product.harvestTime && (
            <View style={[styles.harvestTag, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <MaterialIcons name="eco" size={13} color={Colors.primary} />
              <Text style={styles.harvestTagText}>{product.harvestTime}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Product Details Header */}
        <View style={styles.infoCard}>
          <View style={styles.originRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcons name="location-on" size={14} color={Colors.primary} />
              <Text style={styles.originText}>{product.origin}</Text>
            </View>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>{product.grade}</Text>
            </View>
          </View>

          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.regionalName}>{product.regionalName}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(selectedWeight.price)}</Text>
            {selectedWeight.mrp > selectedWeight.price && (
              <Text style={styles.mrp}>{formatCurrency(selectedWeight.mrp)}</Text>
            )}
            <Text style={styles.portionUnit}>({selectedWeight.label})</Text>
          </View>
        </View>

        {/* Portion / Weight Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT PACK SIZE / વજન પસંદ કરો</Text>
          <View style={styles.weightsGrid}>
            {product.weightOptions.map((weight) => {
              const isSelected = weight.id === selectedWeight.id;
              return (
                <Pressable
                  key={weight.id}
                  onPress={() => setSelectedWeight(weight)}
                  style={[styles.weightBox, isSelected && styles.weightBoxSelected]}
                >
                  {weight.isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>POPULAR</Text>
                    </View>
                  )}
                  <Text style={[styles.weightLabel, isSelected && styles.weightLabelSelected]}>
                    {weight.label}
                  </Text>
                  <Text style={[styles.weightPrice, isSelected && styles.weightPriceSelected]}>
                    {formatCurrency(weight.price)}
                  </Text>
                  {weight.mrp > weight.price && (
                    <Text style={styles.weightMrp}>{formatCurrency(weight.mrp)}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Bottom Area Container */}
      <View style={styles.bottomAreaContainer}>
        {totalItemCount > 0 && (
          <Pressable
            onPress={() => router.push('/(tabs)/cart')}
            style={({ pressed }) => [
              styles.cartNotificationStrip,
              pressed && styles.cartNotificationStripPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`View cart with ${totalItemCount} items, total ${formatCurrency(itemTotal)}`}
          >
            <View style={styles.stripLeft}>
              <MaterialIcons name="shopping-bag" size={18} color="#FFFFFF" />
              <Text style={styles.stripText}>
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in cart ({formatCurrency(itemTotal)})
              </Text>
            </View>
            <View style={[styles.stripCta, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <Text style={styles.stripCtaText}>View Cart</Text>
              <MaterialIcons name="arrow-forward" size={14} color={Colors.primary} />
            </View>
          </Pressable>
        )}

        {/* Sticky Bottom Bar */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(Spacing.md, insets.bottom + 6) }]}>
          <View style={styles.bottomPriceContainer}>
            <Text style={styles.bottomLabel}>Selected Total</Text>
            <Text style={styles.bottomPrice}>{formatCurrency(selectedWeight.price)}</Text>
          </View>

          {currentQuantity > 0 ? (
            <View style={styles.stepperContainer}>
              <Pressable
                onPress={() => updateQuantity(cartItem!.id, -1)}
                style={styles.stepperBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </Pressable>
              <Text style={styles.stepperValue}>{currentQuantity}</Text>
              <Pressable
                onPress={() => updateQuantity(cartItem!.id, 1)}
                style={styles.stepperBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </Pressable>
            </View>
          ) : (
            <PressableScale
              onPress={() => {
                addItem(product, selectedWeight, 1);
                showSuccess(`Added ${selectedWeight.label} ${product.name} to morning cart`);
              }}
              activeScale={0.97}
              style={styles.addCartBtn}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialIcons name="add-shopping-cart" size={18} color="#FFFFFF" />
                <Text style={styles.addCartBtnText}>ADD TO CART</Text>
              </View>
            </PressableScale>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    paddingVertical: Spacing.xs,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  cartButton: {
    position: 'relative',
    padding: Spacing.xs,
  },
  cartButtonText: {
    fontSize: 22,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: Colors.secondary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  imageCard: {
    width: '100%',
    height: 240,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  harvestTag: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(13, 99, 27, 0.9)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  harvestTagText: {
    color: '#FFFFFF',
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
  },
  discountTag: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  discountTagText: {
    color: '#FFFFFF',
    fontSize: Typography.caption.fontSize,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  originRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  originText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  gradeBadge: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  gradeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '800',
  },
  title: {
    fontSize: Typography.h1.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  regionalName: {
    fontSize: Typography.body.fontSize,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: Spacing.sm,
  },
  price: {
    fontSize: Typography.display.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  mrp: {
    fontSize: Typography.body.fontSize,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  portionUnit: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: Spacing.md,
  },
  weightsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  weightBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    position: 'relative',
  },
  weightBoxSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  weightLabel: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  weightLabelSelected: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  weightPrice: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  weightPriceSelected: {
    color: Colors.primaryDark,
    fontWeight: '900',
  },
  weightMrp: {
    fontSize: 11,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  bottomAreaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    ...Shadows.lg,
  },
  cartNotificationStrip: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  cartNotificationStripPressed: {
    opacity: 0.92,
  },
  stripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stripText: {
    color: '#FFFFFF',
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  stripCta: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  stripCtaText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  bottomBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceContainer: {},
  bottomLabel: {
    fontSize: Typography.micro.fontSize,
    color: Colors.textMuted,
  },
  bottomPrice: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addCartBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCartBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: Typography.body.fontSize,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 48,
    paddingHorizontal: Spacing.sm,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  stepperValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: Typography.bodyLarge.fontSize,
    paddingHorizontal: Spacing.md,
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
