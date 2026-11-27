import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, LayoutAnimation } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useCartContext } from '../../src/context/CartContext';
import { useAuthContext } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { BillSummaryCard } from '../../src/components/common/BillSummaryCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { QuantityStepper } from '../../src/components/common/QuantityStepper';
import { ProgressiveImage } from '../../src/components/feedback/ProgressiveImage';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';
import { formatCurrency } from '../../src/utils/formatters';
import { PressableScale } from '../../src/components/common/PressableScale';
import { LottieAssets } from '../../src/assets/lottie';

export default function CartScreen() {
  const { items, totalItemCount, bill, updateQuantity, clearCart, refreshCart } =
    useCartContext();
  const { user, isLoggedIn } = useAuthContext();
  const { showSuccess, showInfo } = useToast();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const defaultAddress = user?.savedAddresses.find((a) => a.isDefault) || user?.savedAddresses[0];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCart();
      showSuccess('Morning cart pricing synchronized');
    } finally {
      setRefreshing(false);
    }
  }, [refreshCart, showSuccess]);

  const handleProceedToPay = () => {
    if (!isLoggedIn) {
      showInfo('Please sign in to place your morning order');
      router.push('/(auth)/login');
      return;
    }
    if (!defaultAddress) {
      showInfo('Please add a delivery address first');
      router.push('/address/add');
      return;
    }
    router.push('/checkout/payment');
  };

  const handleClearCart = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    clearCart();
    showInfo('Cart items cleared');
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateQuantity(id, delta);
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <EmptyState
          lottieSource={LottieAssets.emptyCart}
          title="Your Cart is Empty"
          description="Explore fresh vegetables, fruits, pepper and dry fruits delivered straight to your home."
          actionLabel="Shop Farm Fresh Produce"
          onAction={() => router.push('/(tabs)')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Cart & Checkout</Text>
          <Text style={styles.headerSubtitle}>
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} ready for morning harvest
          </Text>
        </View>
        <Pressable onPress={handleClearCart} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.clearCartText}>Clear All</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Address Preview Pill */}
        {defaultAddress && (
          <View style={styles.previewCard}>
            <View style={styles.previewIconBox}>
              <MaterialIcons name="location-on" size={20} color={Colors.primary} />
            </View>
            <View style={styles.previewTextBox}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {defaultAddress.flatNumber}, {defaultAddress.buildingName}
              </Text>
              <Text style={styles.previewSubtitle} numberOfLines={1}>
                {defaultAddress.street}, {defaultAddress.city}
              </Text>
            </View>
            <Pressable onPress={() => router.push('/address/add')}>
              <Text style={styles.changeLink}>Edit</Text>
            </Pressable>
          </View>
        )}

        {/* Cart Items List */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionHeading}>VEGETABLE BASKET</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <ProgressiveImage
                uri={item.product.imageUrl}
                style={styles.itemImage}
                borderRadius={Radius.sm}
              />

              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.itemRegional}>{item.product.regionalName}</Text>
                <Text style={styles.itemWeightTag}>{item.selectedWeight.label}</Text>

                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.selectedWeight.price * item.quantity)}
                  </Text>
                  {item.selectedWeight.mrp > item.selectedWeight.price && (
                    <Text style={styles.itemMrp}>
                      {formatCurrency(item.selectedWeight.mrp * item.quantity)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Stepper */}
              <QuantityStepper
                quantity={item.quantity}
                onIncrement={() => handleUpdateQuantity(item.id, 1)}
                onDecrement={() => handleUpdateQuantity(item.id, -1)}
              />
            </View>
          ))}
        </View>

        {/* Bill Summary */}
        <BillSummaryCard bill={bill} />
      </ScrollView>

      {/* Sticky Bottom Checkout Footer */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(Spacing.md, insets.bottom) }]}>
        <View>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerTotal}>{formatCurrency(bill.totalPayable)}</Text>
        </View>
        <PressableScale
          onPress={handleProceedToPay}
          activeScale={0.98}
          style={styles.checkoutButton}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Pay →</Text>
        </PressableScale>
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
  headerTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clearCartText: {
    color: Colors.error,
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 110,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  previewTextBox: {
    flex: 1,
  },
  previewTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  previewSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginTop: 1,
  },
  changeLink: {
    fontSize: Typography.caption.fontSize,
    color: Colors.primary,
    fontWeight: '800',
    paddingHorizontal: Spacing.xs,
  },
  itemsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.sm,
    ...Shadows.sm,
  },
  sectionHeading: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemImage: {
    width: 54,
    height: 54,
    borderRadius: Radius.md,
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  itemName: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemRegional: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  itemWeightTag: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  itemPrice: {
    fontSize: Typography.body.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  itemMrp: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.lg,
  },
  footerLabel: {
    fontSize: Typography.micro.fontSize,
    color: Colors.textMuted,
  },
  footerTotal: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '800',
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    height: 48,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: Typography.body.fontSize,
  },
});
