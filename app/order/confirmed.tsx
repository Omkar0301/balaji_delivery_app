import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';
import { Motion } from '../../src/theme/motion';
import { PressableScale } from '../../src/components/common/PressableScale';
import { AppLottie } from '../../src/components/common/AppLottie';
import { LottieAssets } from '../../src/assets/lottie';
import { formatCurrency } from '../../src/utils/formatters';

export default function OrderConfirmedScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    orderId?: string;
    orderNumber?: string;
    totalAmount?: string;
    paymentMethod?: string;
    slotLabel?: string;
    addressLabel?: string;
  }>();
  const orderId = params.orderId || '';
  const orderNumber = params.orderNumber || '#BE-ORDER';
  const totalAmount = Number(params.totalAmount || 0);
  const paymentMethod = params.paymentMethod || 'UPI';
  const slotLabel = params.slotLabel || 'Tomorrow, 8:00 AM – 12:00 PM';
  const addressLabel = params.addressLabel || 'Saved Delivery Address';

  const [iconScale] = useState(() => new Animated.Value(0.2));
  const [contentTranslateY] = useState(() => new Animated.Value(25));
  const [contentOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.spring(iconScale, {
        toValue: 1,
        ...Motion.spring.bouncy,
      }),
      Animated.parallel([
        Animated.spring(contentTranslateY, {
          toValue: 0,
          ...Motion.spring.gentle,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: Motion.duration.standard,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();
  }, [iconScale, contentTranslateY, contentOpacity]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xxxl + insets.bottom + 16 }]} showsVerticalScrollIndicator={false}>
        {/* Animated Celebration Lottie */}
        <View style={styles.lottieHero}>
          <AppLottie
            source={LottieAssets.orderConfirmed}
            size={112}
            autoPlay
            loop={false}
          />
        </View>

        <Animated.View style={{ width: '100%', alignItems: 'center', opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }}>
          <Text style={styles.title}>Order Placed Successfully!</Text>
          <Text style={styles.subtitle}>
            Your order has been allocated to Balaji Enterprise Central Fulfillment Hub.
          </Text>

          {/* Order Details Ticket */}
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.orderNumberLabel}>ORDER ID</Text>
              <Text style={styles.orderNumber}>{orderNumber}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Scheduled Delivery:</Text>
              <Text style={styles.infoValue}>{slotLabel}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Delivery Address:</Text>
              <Text style={styles.infoValue}>{addressLabel}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Status:</Text>
              <Text style={styles.paidBadge}>
                {paymentMethod === 'COD'
                  ? `CASH ON DELIVERY (${formatCurrency(totalAmount)})`
                  : `UPI (${formatCurrency(totalAmount)})`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight Verification:</Text>
              <Text style={styles.infoValue}>Slips attached on delivery</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <PressableScale
              onPress={() =>
                orderId
                  ? router.push({ pathname: '/order/track/[id]', params: { id: orderId } })
                  : router.replace('/(tabs)/orders')
              }
              activeScale={0.98}
              style={styles.trackButton}
            >
              <View style={styles.trackButtonContent}>
                <MaterialIcons name="local-shipping" size={20} color="#FFFFFF" />
                <Text style={styles.trackButtonText}>View Delivery Status</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            </PressableScale>

            <PressableScale
              onPress={() => router.replace('/(tabs)/orders')}
              activeScale={0.98}
              style={styles.ordersButton}
            >
              <View style={styles.trackButtonContent}>
                <MaterialIcons name="receipt-long" size={18} color={Colors.primary} />
                <Text style={styles.ordersButtonText}>My Orders List</Text>
              </View>
            </PressableScale>

            <PressableScale
              onPress={() => router.replace('/(tabs)')}
              activeScale={0.98}
              style={styles.homeButton}
            >
              <View style={styles.trackButtonContent}>
                <MaterialIcons name="home" size={18} color={Colors.textSecondary} />
                <Text style={styles.homeButtonText}>Return to Home</Text>
              </View>
            </PressableScale>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    alignItems: 'center',
    paddingBottom: Spacing.xxxl,
  },
  lottieHero: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  trackButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: Typography.h1.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: Spacing.md,
    lineHeight: 20,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumberLabel: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  orderNumber: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '800',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
    flex: 1,
  },
  paidBadge: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '800',
    color: Colors.primary,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  trackButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '800',
  },
  ordersButton: {
    backgroundColor: '#E8F5E9',
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ordersButtonText: {
    color: Colors.primary,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  homeButton: {
    backgroundColor: Colors.surface,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
});
