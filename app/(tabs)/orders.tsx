import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthContext } from '../../src/context/AuthContext';
import { useCartContext } from '../../src/context/CartContext';
import { useToast } from '../../src/context/ToastContext';
import { orderService } from '../../src/services/orderService';
import { EmptyState } from '../../src/components/common/EmptyState';
import { ErrorState } from '../../src/components/common/ErrorState';
import { LoadingState } from '../../src/components/common/LoadingState';
import { Order } from '../../src/types/order';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';
import { Radius } from '../../src/theme/radius';
import { Shadows } from '../../src/theme/shadows';
import { formatCurrency } from '../../src/utils/formatters';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useAuthContext();
  const { refreshCart } = useCartContext();
  const { showSuccess, showError } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(isLoggedIn);
  const [error, setError] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);

  const fetchOrdersData = useCallback(async () => {
    const [activeRes, pastRes] = await Promise.all([
      orderService.getOrders('active', 1, 10),
      orderService.getOrders('past', 1, 20),
    ]);
    setActiveOrders(activeRes.data);
    setPastOrders(pastRes.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) return;
      let mounted = true;
      fetchOrdersData()
        .then(() => {
          if (mounted) setError(null);
        })
        .catch((err: unknown) => {
          if (mounted) {
            const apiErr = err as { message?: string };
            setError(apiErr?.message || 'Unable to load orders');
          }
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
      return () => {
        mounted = false;
      };
    }, [isLoggedIn, fetchOrdersData])
  );

  const handleRetry = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError(null);
    try {
      await fetchOrdersData();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, fetchOrdersData]);

  const onRefresh = useCallback(async () => {
    if (!isLoggedIn) return;
    setRefreshing(true);
    try {
      await fetchOrdersData();
      showSuccess('Deliveries and dispatch status refreshed');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Unable to load orders');
    } finally {
      setRefreshing(false);
    }
  }, [isLoggedIn, fetchOrdersData, showSuccess]);

  const handleReorder = async (orderId: string) => {
    try {
      await orderService.reorder(orderId);
      await refreshCart();
      showSuccess('All items added back to your morning cart');
      router.push('/(tabs)/cart');
    } catch {
      showError('Could not reorder items');
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>My Orders & Deliveries</Text>
          <Text style={styles.subtitle}>સવારની ડિલિવરી હિસાબ • Balaji Enterprise Fresh</Text>
        </View>
        <EmptyState
          title="Sign in to view your orders"
          description="Track your morning produce deliveries, download GST invoices, and reorder in one tap."
          actionLabel="Sign In with Mobile"
          onAction={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders & Deliveries</Text>
        <Text style={styles.subtitle}>સવારની ડિલિવરી હિસાબ • Balaji Enterprise Fresh</Text>
      </View>

      {loading && activeOrders.length === 0 && pastOrders.length === 0 ? (
        <LoadingState message="Loading your orders..." />
      ) : error && activeOrders.length === 0 && pastOrders.length === 0 ? (
        <ErrorState message={error} onRetry={() => void handleRetry()} />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Spacing.bottomClearance + insets.bottom },
          ]}
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
          {activeOrders.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>ACTIVE MORNING DELIVERIES</Text>

              {activeOrders.map((activeOrder) => (
                <View key={activeOrder.id} style={styles.activeCard}>
                  <View style={styles.activeTopRow}>
                    <View style={styles.statusBadge}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.statusBadgeText}>
                        {activeOrder.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                    <Text style={styles.orderNumber}>{activeOrder.orderNumber}</Text>
                  </View>

                  <Text style={styles.etaText}>
                    Scheduled: {activeOrder.slot.date} ({activeOrder.slot.timeRange})
                  </Text>
                  <Text style={styles.slotSubtitle}>
                    Delivery: {activeOrder.slot.timeRange}
                    {activeOrder.partner ? ` • Rider ${activeOrder.partner.name}` : ''}
                  </Text>

                  <View style={styles.itemsSummaryBox}>
                    {activeOrder.items.map((item, idx) => (
                      <View key={idx} style={{ marginBottom: 4 }}>
                        <Text style={styles.itemSummaryText}>
                          • {item.quantity}× {item.product.name} ({item.selectedWeight.label})
                        </Text>
                        {!!item.product.regionalName && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: '#A3F69C',
                              fontWeight: '600',
                              marginLeft: 12,
                            }}
                          >
                            {item.product.regionalName}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/order/track/[id]',
                          params: { id: activeOrder.id },
                        })
                      }
                      style={({ pressed }) => [styles.trackButton, pressed && styles.btnPressed]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.trackButtonText}>Delivery Status</Text>
                        <MaterialIcons name="arrow-forward" size={16} color="#0D631B" />
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/order/invoice/[id]',
                          params: { id: activeOrder.id },
                        })
                      }
                      style={styles.invoiceButton}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <MaterialIcons name="receipt-long" size={15} color="#FFFFFF" />
                        <Text style={styles.invoiceButtonText}>Tax Invoice</Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Past Orders */}
          <Text style={styles.sectionHeader}>PAST DELIVERIES</Text>

          {pastOrders.length === 0 && activeOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Place your first morning produce order to see live tracking and invoices here."
              actionLabel="Browse Fresh Produce"
              onAction={() => router.push('/(tabs)')}
            />
          ) : pastOrders.length === 0 ? (
            <View style={[styles.pastCard, { alignItems: 'center', paddingVertical: Spacing.lg }]}>
              <Text style={[styles.supportDesc, { textAlign: 'center' }]}>
                No past deliveries yet. Completed or cancelled orders will appear here.
              </Text>
            </View>
          ) : (
            pastOrders.map((order) => (
              <View key={order.id} style={styles.pastCard}>
                <View style={styles.pastHeader}>
                  <View>
                    <Text style={styles.pastOrderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.pastDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.deliveredBadge,
                      { flexDirection: 'row', alignItems: 'center', gap: 4 },
                    ]}
                  >
                    <MaterialIcons name="check-circle" size={12} color={Colors.primary} />
                    <Text style={styles.deliveredText}>{order.status}</Text>
                  </View>
                </View>

                <View style={styles.pastItemsRow}>
                  {order.items.map((item, idx) => (
                    <Text key={idx} style={styles.pastItemName}>
                      {item.product.name}
                      {item.product.regionalName ? ` (${item.product.regionalName})` : ''} •{' '}
                      {item.selectedWeight.label}
                      {idx < order.items.length - 1 ? ', ' : ''}
                    </Text>
                  ))}
                </View>

                <View style={styles.pastFooter}>
                  <Text style={styles.pastTotal}>Total: {formatCurrency(order.totalAmount)}</Text>
                  <View style={styles.pastActions}>
                    <Pressable
                      onPress={() =>
                        router.push({ pathname: '/order/invoice/[id]', params: { id: order.id } })
                      }
                      style={styles.billLink}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialIcons name="receipt-long" size={14} color={Colors.primary} />
                        <Text style={styles.billLinkText}>Invoice</Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => void handleReorder(order.id)}
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
            ))
          )}

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
      )}
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
