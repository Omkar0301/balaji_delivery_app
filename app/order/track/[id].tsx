import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { MOCK_LIVE_ORDER } from '../../../src/data/mockData';
import { useToast } from '../../../src/context/ToastContext';
import { ProgressiveImage } from '../../../src/components/feedback/ProgressiveImage';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';
import { Radius } from '../../../src/theme/radius';
import { Shadows } from '../../../src/theme/shadows';
import { formatCurrency } from '../../../src/utils/formatters';
import { PressableScale } from '../../../src/components/common/PressableScale';
import { AppLottie } from '../../../src/components/common/AppLottie';
import { LottieAssets } from '../../../src/assets/lottie';

export default function LiveTrackingScreen() {
  const insets = useSafeAreaInsets();
  const order = MOCK_LIVE_ORDER;
  const { showInfo, showSuccess } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const [haloAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(haloAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [haloAnim]);

  const haloScale = haloAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.4],
  });

  const haloOpacity = haloAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 0.4, 0],
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showSuccess('Delivery status updated');
    }, 600);
  }, [showSuccess]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.backRow}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </Pressable>
        <Text style={styles.headerTitle}>Morning Delivery Status</Text>
        <Pressable
          onPress={() => router.push({ pathname: '/order/invoice/[id]', params: { id: order.id } })}
          style={styles.invoiceIcon}
        >
          <View style={styles.invoiceRow}>
            <MaterialIcons name="receipt-long" size={16} color={Colors.primary} />
            <Text style={styles.invoiceIconText}>Bill</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xxxl + insets.bottom + 16 }]}
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
        {/* Delivery ETA Card */}
        <View style={styles.etaCard}>
          <View style={styles.etaRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.etaHeader}>
                <View style={styles.pulsingBadge}>
                  <View style={styles.pulseContainer}>
                    <Animated.View
                      style={[
                        styles.haloDot,
                        { transform: [{ scale: haloScale }], opacity: haloOpacity },
                      ]}
                    />
                    <View style={styles.pulseDot} />
                  </View>
                  <Text style={styles.pulseText}>OUT FOR MORNING DELIVERY</Text>
                </View>
                <Text style={styles.orderId}>{order.orderNumber}</Text>
              </View>
              <Text style={styles.etaTime}>Arriving by 9:30 AM</Text>
              <Text style={styles.etaSlot}>Tomorrow Morning Delivery (8:00 AM – 12:00 PM)</Text>
            </View>
            <AppLottie source={LottieAssets.deliveryScooter} size={64} autoPlay loop />
          </View>
        </View>

        {/* Delivery Partner Profile */}
        {order.partner && (
          <View style={styles.partnerCard}>
            <ProgressiveImage
              uri={order.partner.photoUrl}
              style={styles.partnerPhoto}
              borderRadius={28}
              fallbackEmoji="👨‍🌾"
            />
            <View style={styles.partnerInfo}>
              <View style={styles.partnerNameRow}>
                <Text style={styles.partnerName}>{order.partner.name}</Text>
                <View style={styles.ratingBadge}>
                  <MaterialIcons name="star" size={11} color="#92400E" />
                  <Text style={styles.ratingText}>{order.partner.rating}</Text>
                </View>
              </View>
              <Text style={styles.vehicleText}>
                {order.partner.vehicleType} • {order.partner.vehicleNumber}
              </Text>
              <Text style={styles.deliveryCountText}>
                {order.partner.completedDeliveries}+ morning deliveries completed
              </Text>
            </View>

            <PressableScale
              onPress={() => showInfo(`Calling rider ${order.partner?.name || 'Suresh'} (+91 9876543210)...`)}
              activeScale={0.88}
              style={styles.callButton}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <MaterialIcons name="call" size={20} color={Colors.primary} />
            </PressableScale>
          </View>
        )}

        {/* 4-Step Vertical Tracker Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineHeader}>HARVEST TO DOORSTEP PROGRESS</Text>

          {order.trackingSteps.map((step, index) => {
            const isLast = index === order.trackingSteps.length - 1;
            return (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.indicatorCol}>
                  <View
                    style={[
                      styles.circle,
                      step.isCompleted && styles.circleCompleted,
                      step.isActive && styles.circleActive,
                    ]}
                  >
                    {step.isCompleted && <MaterialIcons name="check" size={13} color="#FFFFFF" />}
                    {step.isActive && (
                      <View style={styles.timelineHaloContainer}>
                        <Animated.View
                          style={[
                            styles.timelineHalo,
                            { transform: [{ scale: haloScale }], opacity: haloOpacity },
                          ]}
                        />
                        <View style={styles.activeInnerDot} />
                      </View>
                    )}
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.line,
                        step.isCompleted ? styles.lineCompleted : styles.linePending,
                      ]}
                    />
                  )}
                </View>

                <View style={styles.timelineContent}>
                  <View style={styles.stepTitleRow}>
                    <Text
                      style={[
                        styles.stepTitle,
                        step.isActive && styles.stepTitleActive,
                        step.isCompleted && styles.stepTitleCompleted,
                      ]}
                    >
                      {step.title}
                    </Text>
                    {step.timestamp && (
                      <Text style={styles.timestampText}>{step.timestamp}</Text>
                    )}
                  </View>
                  <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Items in this delivery */}
        <View style={styles.itemsCard}>
          <Text style={styles.itemsHeading}>ITEMS IN THIS CRATE ({order.items.length})</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemQty}>
                {item.quantity} × {item.selectedWeight.label}
              </Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.selectedWeight.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Customer Support CTA */}
        <View style={styles.supportRow}>
          <PressableScale
            onPress={() => showInfo('Calling Balaji Fresh support desk (+91 9876543210)...')}
            activeScale={0.97}
            style={styles.supportButton}
          >
            <View style={styles.supportContent}>
              <MaterialIcons name="support-agent" size={20} color={Colors.primary} />
              <Text style={styles.supportButtonText}>Need Help? Contact Customer Support</Text>
            </View>
          </PressableScale>
        </View>
      </ScrollView>
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  invoiceIcon: {
    padding: Spacing.xs,
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  invoiceIconText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: Typography.caption.fontSize,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  etaCard: {
    backgroundColor: '#0A4A14',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  etaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  pulsingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(163, 246, 156, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  pulseContainer: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  haloDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A3F69C',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A3F69C',
  },
  pulseText: {
    color: '#A3F69C',
    fontSize: 9,
    fontWeight: '800',
  },
  orderId: {
    color: '#CBD5E1',
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
  },
  etaTime: {
    color: '#FFFFFF',
    fontSize: Typography.display.fontSize,
    fontWeight: '800',
    marginVertical: 4,
  },
  etaSlot: {
    color: '#E2E8F0',
    fontSize: Typography.caption.fontSize,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  partnerPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
  },
  partnerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  partnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partnerName: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  vehicleText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deliveryCountText: {
    fontSize: Typography.micro.fontSize,
    color: Colors.textMuted,
    marginTop: 2,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    fontSize: 20,
  },
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  timelineHeader: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: Spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 64,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  circleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
  },
  completedCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  timelineHaloContainer: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timelineHalo: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  activeInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: Colors.primary,
  },
  linePending: {
    backgroundColor: Colors.border,
  },
  timelineContent: {
    flex: 1,
    marginLeft: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  stepTitleActive: {
    fontWeight: '800',
    color: Colors.primary,
  },
  stepTitleCompleted: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timestampText: {
    fontSize: Typography.micro.fontSize,
    color: Colors.textMuted,
  },
  stepSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  itemsHeading: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemName: {
    flex: 1,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemQty: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  supportRow: {
    marginTop: Spacing.sm,
  },
  supportButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportButtonText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: Typography.body.fontSize,
  },
});
