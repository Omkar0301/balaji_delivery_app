import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useCartContext } from '../../src/context/CartContext';
import { useToast } from '../../src/context/ToastContext';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';
import { formatCurrency } from '../../src/utils/formatters';
import { PressableScale } from '../../src/components/common/PressableScale';
import { AppLottie } from '../../src/components/common/AppLottie';
import { LottieAssets } from '../../src/assets/lottie';
import { GooglePayIcon, PhonePeIcon, PaytmIcon } from '../../src/components/common/PaymentBrandIcons';

export default function PaymentScreen() {
  const { bill, clearCart } = useCartContext();
  const { showSuccess } = useToast();
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<'gpay' | 'phonepe' | 'paytm' | 'cod'>('gpay');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      clearCart();
      showSuccess('Order confirmed! Morning delivery scheduled');
      router.replace('/order/confirmed');
    }, 800);
  };

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
        <Text style={styles.headerTitle}>Select Payment Method</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        {/* Payable Banner */}
        <View style={styles.payableCard}>
          <Text style={styles.payableLabel}>AMOUNT TO PAY</Text>
          <Text style={styles.payableAmount}>{formatCurrency(bill.totalPayable)}</Text>
          <Text style={styles.payableSlot}>Guaranteed Morning Delivery (8:00 AM – 12:00 PM)</Text>
        </View>

        {/* Instant UPI Options */}
        <Text style={styles.sectionTitle}>RECOMMENDED FAST UPI</Text>

        <View style={styles.methodsContainer}>
          {[
            {
              id: 'gpay',
              title: 'Google Pay UPI',
              sub: 'Instant payment verification',
              bgColor: '#E8F0FE',
              icon: <GooglePayIcon size={24} />,
            },
            {
              id: 'phonepe',
              title: 'PhonePe UPI',
              sub: 'Zero gateway surcharge',
              bgColor: '#F3E8FF',
              icon: <PhonePeIcon size={24} />,
            },
            {
              id: 'paytm',
              title: 'Paytm UPI',
              sub: 'Instant receipt generation',
              bgColor: '#E0F4FF',
              icon: <PaytmIcon size={24} />,
            },
          ].map((m) => {
            const isSelected = selectedMethod === m.id;
            return (
              <PressableScale
                key={m.id}
                onPress={() => setSelectedMethod(m.id as 'gpay' | 'phonepe' | 'paytm' | 'cod')}
                activeScale={0.98}
                style={[styles.methodCard, isSelected && styles.methodCardActive]}
              >
                <View
                  style={[
                    styles.methodIconBox,
                    { backgroundColor: isSelected ? '#FFFFFF' : m.bgColor },
                    isSelected && styles.methodIconBoxActive,
                  ]}
                >
                  {m.icon}
                </View>
                <View style={styles.methodText}>
                  <Text style={[styles.methodTitle, isSelected && styles.methodTitleActive]}>
                    {m.title}
                  </Text>
                  <Text style={styles.methodSub}>{m.sub}</Text>
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </PressableScale>
            );
          })}
        </View>

        {/* Cash / Pay on Delivery */}
        <Text style={styles.sectionTitle}>PAY ON ARRIVAL</Text>

        <PressableScale
          onPress={() => setSelectedMethod('cod')}
          activeScale={0.98}
          style={[styles.methodCard, selectedMethod === 'cod' && styles.methodCardActive]}
        >
          <View
            style={[
              styles.methodIconBox,
              { backgroundColor: selectedMethod === 'cod' ? '#FFFFFF' : '#E8F5E9' },
              selectedMethod === 'cod' && styles.methodIconBoxActive,
            ]}
          >
            <MaterialIcons name="payments" size={22} color={Colors.primary} />
          </View>
          <View style={styles.methodText}>
            <Text style={[styles.methodTitle, selectedMethod === 'cod' && styles.methodTitleActive]}>
              Cash / UPI on Delivery
            </Text>
            <Text style={styles.methodSub}>Pay delivery rider after inspecting produce freshness</Text>
          </View>
          <View style={[styles.radioCircle, selectedMethod === 'cod' && styles.radioCircleActive]}>
            {selectedMethod === 'cod' && <View style={styles.radioInner} />}
          </View>
        </PressableScale>

        {/* Security & Verification Pledge */}
        <View style={styles.securityBox}>
          <MaterialIcons name="verified-user" size={20} color={Colors.primary} />
          <Text style={styles.securityText}>
            100% Secure Transaction. 256-bit encryption. Zero cancellation charges before 5:00 AM.
          </Text>
        </View>
      </ScrollView>

      {/* Pay CTA */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(Spacing.md, insets.bottom + 8) }]}>
        <PressableScale
          onPress={handlePlaceOrder}
          disabled={loading}
          activeScale={0.98}
          style={styles.payButton}
        >
          {loading ? (
            <View style={styles.payButtonContent}>
              <AppLottie source={LottieAssets.freshLoader} size={22} autoPlay loop />
              <Text style={styles.payButtonText}>Processing Order...</Text>
            </View>
          ) : (
            <View style={styles.payButtonContent}>
              <MaterialIcons name="lock" size={18} color="#FFFFFF" />
              <Text style={styles.payButtonText}>
                Pay {formatCurrency(bill.totalPayable)} & Confirm Order
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          )}
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
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 110,
  },
  payableCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  payableLabel: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.6,
  },
  payableAmount: {
    fontSize: Typography.display.fontSize,
    fontWeight: '800',
    color: Colors.primary,
    marginVertical: 4,
  },
  payableSlot: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  methodsContainer: {
    gap: 10,
    marginBottom: Spacing.lg,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  methodCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
  },
  methodIconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  methodIconBoxActive: {
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  methodText: {
    flex: 1,
  },
  methodTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  methodTitleActive: {
    color: Colors.primaryDark,
  },
  methodSub: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: 10,
    marginTop: Spacing.lg,
  },
  securityText: {
    flex: 1,
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    lineHeight: 18,
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
    ...Shadows.lg,
  },
  payButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '800',
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
