import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { MOCK_LIVE_ORDER, MOCK_PAST_ORDERS } from '../../src/data/mockData';
import { useToast } from '../../src/context/ToastContext';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';
import { formatCurrency } from '../../src/utils/formatters';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { showSuccess } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showSuccess('Deliveries and dispatch status refreshed');
    }, 600);
  }, [showSuccess]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders & Deliveries</Text>
        <Text style={styles.subtitle}>સવારની ડિલિવરી હિસાબ • Balaji Enterprise Fresh</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.bottomClearance + insets.bottom }]}
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
        {/* Active Order Card */}
        <Text style={styles.sectionHeader}>ACTIVE MORNING DELIVERY</Text>

        <View style={styles.activeCard}>
          <View style={styles.activeTopRow}>
            <View style={styles.statusBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusBadgeText}>OUT FOR DELIVERY</Text>
            </View>
            <Text style={styles.orderNumber}>{MOCK_LIVE_ORDER.orderNumber}</Text>
          </View>

          <Text style={styles.etaText}>Arriving Tomorrow by 9:30 AM</Text>
          <Text style={styles.slotSubtitle}>
            Delivery: {MOCK_LIVE_ORDER.slot.timeRange} • Rider Suresh (GJ-05-EB-4192)
          </Text>

          <View style={styles.itemsSummaryBox}>
            {MOCK_LIVE_ORDER.items.map((item, idx) => (
              <Text key={idx} style={styles.itemSummaryText}>
                • {item.quantity}× {item.product.name} ({item.selectedWeight.label})
              </Text>
            ))}
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => router.push({ pathname: '/order/track/[id]', params: { id: MOCK_LIVE_ORDER.id } })}
              style={({ pressed }) => [styles.trackButton, pressed && styles.btnPressed]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.trackButtonText}>Delivery Status</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#0D631B" />
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push({ pathname: '/order/invoice/[id]', params: { id: MOCK_LIVE_ORDER.id } })}
              style={styles.invoiceButton}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <MaterialIcons name="receipt-long" size={15} color="#FFFFFF" />
                <Text style={styles.invoiceButtonText}>Tax Invoice</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Past Orders */}
        <Text style={styles.sectionHeader}>PAST DELIVERIES</Text>

        {MOCK_PAST_ORDERS.map((order) => (
          <View key={order.id} style={styles.pastCard}>
            <View style={styles.pastHeader}>
              <View>
                <Text style={styles.pastOrderNumber}>{order.orderNumber}</Text>
                <Text style={styles.pastDate}>Delivered 17-Nov-2026 • 6:32 AM</Text>
              </View>
              <View style={[styles.deliveredBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <MaterialIcons name="check-circle" size={12} color={Colors.primary} />
                <Text style={styles.deliveredText}>DELIVERED</Text>
              </View>
            </View>

            <View style={styles.pastItemsRow}>
              {order.items.map((item, idx) => (
                <Text key={idx} style={styles.pastItemName}>
                  {item.product.name} ({item.selectedWeight.label}){idx < order.items.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </View>

            <View style={styles.pastFooter}>
              <Text style={styles.pastTotal}>Total: {formatCurrency(order.totalAmount)}</Text>
              <View style={styles.pastActions}>
                <Pressable
                  onPress={() => router.push({ pathname: '/order/invoice/[id]', params: { id: order.id } })}
                  style={styles.billLink}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialIcons name="receipt-long" size={14} color={Colors.primary} />
                    <Text style={styles.billLinkText}>Invoice</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => showSuccess('All items added back to your morning cart')}
                  style={styles.reorderBtn}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialIcons name="replay" size={14} color="#FFFFFF" />
                    <Text style={styles.reorderText}>Reorder All</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        {/* Quality Support Banner */}
        <View style={styles.supportBox}>
          <MaterialIcons name="support-agent" size={26} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>Need Help with an Order?</Text>
            <Text style={styles.supportDesc}>
              Customer support desk is open 6:00 AM to 10:00 PM every day.
            </Text>
          </View>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.bottomClearance,
  },
  sectionHeader: {
    fontSize: Typography.micro.fontSize,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  activeCard: {
    backgroundColor: '#0A4A14',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  activeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(163, 246, 156, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A3F69C',
  },
  statusBadgeText: {
    color: '#A3F69C',
    fontSize: 9,
    fontWeight: '800',
  },
  orderNumber: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  etaText: {
    color: '#FFFFFF',
    fontSize: Typography.h2.fontSize,
    fontWeight: '800',
    marginTop: 4,
  },
  slotSubtitle: {
    color: '#CBD5E1',
    fontSize: Typography.caption.fontSize,
    marginTop: 2,
  },
  itemsSummaryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginVertical: Spacing.md,
  },
  itemSummaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  trackButton: {
    flex: 2,
    backgroundColor: '#A3F69C',
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackButtonText: {
    color: '#0D631B',
    fontWeight: '800',
    fontSize: Typography.body.fontSize,
  },
  invoiceButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.body.fontSize,
  },
  pastCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  pastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  pastOrderNumber: {
    fontSize: Typography.body.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pastDate: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textMuted,
    marginTop: 2,
  },
  deliveredBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deliveredText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  pastItemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: Spacing.sm,
  },
  pastItemName: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pastFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pastTotal: {
    fontSize: Typography.body.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pastActions: {
    flexDirection: 'row',
    gap: 8,
  },
  billLink: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  billLinkText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  reorderBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  reorderText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 12,
    marginTop: Spacing.sm,
  },
  supportTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  supportDesc: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
