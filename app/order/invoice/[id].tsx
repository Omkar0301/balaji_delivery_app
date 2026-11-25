import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { MOCK_LIVE_ORDER, MOCK_USER } from '../../../src/data/mockData';
import { useToast } from '../../../src/context/ToastContext';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';
import { Radius } from '../../../src/theme/radius';
import { Motion } from '../../../src/theme/motion';
import { formatCurrency } from '../../../src/utils/formatters';
import { PressableScale } from '../../../src/components/common/PressableScale';

export default function OrderInvoiceScreen() {
  const insets = useSafeAreaInsets();
  const order = MOCK_LIVE_ORDER;
  const { showSuccess } = useToast();

  const [stampScale] = useState(() => new Animated.Value(0.4));
  const [stampOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(stampScale, {
        toValue: 1,
        ...Motion.spring.bouncy,
      }),
      Animated.timing(stampOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [stampScale, stampOpacity]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          activeScale={0.92}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </PressableScale>
        <Text style={styles.headerTitle}>Vendor Tax Invoice</Text>
        <PressableScale
          onPress={() => showSuccess('Tax invoice saved to device storage')}
          activeScale={0.92}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialIcons name="file-download" size={18} color={Colors.primary} />
            <Text style={styles.downloadText}>Save</Text>
          </View>
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xxxl + insets.bottom + 16 }]} showsVerticalScrollIndicator={false}>
        {/* Vendor Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Header & Vendor Registration */}
          <View style={styles.taxHeader}>
            <Text style={styles.companyTitle}>BALAJI ENTERPRISE FRESH PRODUCE</Text>
            <Text style={styles.taxSub}>Balaji Enterprise Wholesale Fulfillment Hub, Surat 395009</Text>
            <Text style={styles.taxSub}>FSSAI Lic No: 10723026000412 • GSTIN: 24AABCB1234F1Z1</Text>
          </View>

          <View style={styles.dashedLine} />

          {/* Invoice Meta */}
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>INVOICE NO.</Text>
              <Text style={styles.metaValue}>{order.orderNumber}-INV</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.metaLabel}>WEIGHED TIMESTAMP</Text>
              <Text style={styles.metaValue}>20-Nov-2026 4:42 AM</Text>
            </View>
          </View>

          <View style={styles.customerBox}>
            <Text style={styles.customerLabel}>BILL TO / CUSTOMER DETAILS</Text>
            <Text style={styles.customerName}>{MOCK_USER.fullName}</Text>
            <Text style={styles.customerAddress}>
              {order.address.flatNumber}, {order.address.buildingName}, {order.address.street}, {order.address.city}
            </Text>
            <Text style={styles.customerPhone}>Phone: +91 {MOCK_USER.phone}</Text>
          </View>

          <View style={styles.dashedLine} />

          {/* Electronic Weighment Table */}
          <Text style={styles.tableHeading}>CALIBRATED WEIGHMENT BREAKDOWN</Text>

          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colHeader, { flex: 2 }]}>Commodity</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Gross Wt</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Rate/kg</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: 'right' }]}>Total</Text>
          </View>

          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.rowTitle}>{item.product.name}</Text>
                <Text style={styles.rowRegional}>{item.product.regionalName}</Text>
              </View>
              <Text style={[styles.rowVal, { flex: 1, textAlign: 'center' }]}>
                {item.selectedWeight.label}
              </Text>
              <Text style={[styles.rowVal, { flex: 1, textAlign: 'center' }]}>
                ₹{item.product.basePrice}
              </Text>
              <Text style={[styles.rowVal, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>
                {formatCurrency(item.selectedWeight.price * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={styles.dashedLine} />

          {/* Totals Calculation */}
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Commodity Net Total</Text>
            <Text style={styles.calcVal}>{formatCurrency(order.totalAmount)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Perforated Food Pouch Packaging</Text>
            <Text style={styles.freeGreen}>FREE (₹0)</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Early Morning Insulated Delivery</Text>
            <Text style={styles.freeGreen}>FREE (₹0)</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total (UPI Paid)</Text>
            <Text style={styles.totalVal}>{formatCurrency(order.totalAmount)}</Text>
          </View>

          <Animated.View
            style={[
              styles.stampBox,
              {
                opacity: stampOpacity,
                transform: [{ scale: stampScale }, { rotate: '-2.5deg' }],
              },
            ]}
          >
            <MaterialIcons name="verified" size={16} color={Colors.primary} />
            <Text style={styles.stampText}>
              DIGITAL WEIGHT CERTIFIED • BALAJI ENTERPRISE
            </Text>
          </Animated.View>
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
  downloadText: {
    color: Colors.primary,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  receiptCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  taxHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  companyTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '800',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  taxSub: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginVertical: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  customerBox: {
    backgroundColor: Colors.surfaceMuted,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  customerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  customerName: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  customerAddress: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  customerPhone: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tableHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  colHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceMuted,
  },
  rowTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rowRegional: {
    fontSize: 10,
    color: Colors.primary,
  },
  rowVal: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  calcLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  calcVal: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  freeGreen: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  totalVal: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '800',
    color: Colors.primary,
  },
  stampBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryContainer,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    gap: 8,
    marginTop: Spacing.lg,
  },
  stampIcon: {
    fontSize: 16,
  },
  stampText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
});
