import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Linking, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Paths, File as ExpoFile, Directory } from 'expo-file-system';
import { apiClient } from '../../../src/services/apiClient';
import { orderService, InvoicePayload } from '../../../src/services/orderService';
import { useToast } from '../../../src/context/ToastContext';
import { ErrorState } from '../../../src/components/common/ErrorState';
import { LoadingState } from '../../../src/components/common/LoadingState';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';
import { Radius } from '../../../src/theme/radius';
import { Motion } from '../../../src/theme/motion';
import { formatCurrency } from '../../../src/utils/formatters';
import { PressableScale } from '../../../src/components/common/PressableScale';

export default function OrderInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [invoice, setInvoice] = useState<InvoicePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const [stampScale] = useState(() => new Animated.Value(0.4));
  const [stampOpacity] = useState(() => new Animated.Value(0));

  const loadInvoice = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getInvoice(id);
      setInvoice(res.data);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Unable to load tax invoice');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    orderService
      .getInvoice(id)
      .then((res) => {
        if (mounted) {
          setInvoice(res.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          const apiErr = err as { message?: string };
          setError(apiErr?.message || 'Unable to load tax invoice');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!invoice) return;
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
  }, [invoice, stampScale, stampOpacity]);

  const handleDownloadPdf = async () => {
    if (!id || !invoice) return;
    const pdfUrl = orderService.getInvoicePdfUrl(id);
    const safeFileName = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;
    try {
      if (Platform.OS === 'web') {
        await Linking.openURL(pdfUrl);
        return;
      }
      const token = apiClient.getAuthToken();
      const targetDir = Platform.OS === 'android' ? Paths.cache : Paths.document;
      const targetFile = new ExpoFile(targetDir, safeFileName);
      const downloaded = await ExpoFile.downloadFileAsync(pdfUrl, targetFile, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        idempotent: true,
      });

      if (Platform.OS === 'android') {
        const pickedDir = await Directory.pickDirectoryAsync();
        const destFile = pickedDir.createFile(safeFileName, 'application/pdf');
        destFile.write(await downloaded.bytes());
        showSuccess(`Saved ${safeFileName} to selected folder`);
      } else {
        showSuccess(`Saved ${safeFileName} to device storage`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.toLowerCase().includes('cancel')) {
        return;
      }
      showError('Could not download invoice PDF');
    }
  };

  if (loading || !invoice) {
    return (
      <SafeAreaView style={styles.safeArea}>
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
          <View style={{ width: 52 }} />
        </View>
        {error ? (
          <ErrorState message={error} onRetry={() => void loadInvoice()} />
        ) : (
          <LoadingState message="Loading tax invoice..." />
        )}
      </SafeAreaView>
    );
  }

  const customerAddress = invoice.customer?.address ?? invoice.order?.address;
  const addressParts = [
    customerAddress?.flatNumber,
    customerAddress?.buildingName,
    customerAddress?.street,
    customerAddress?.city,
  ].filter(Boolean);
  const itemTotal = invoice.order?.itemTotal ?? invoice.order?.bill?.itemTotal ?? 0;
  const packingFee = invoice.order?.packingFee ?? invoice.order?.bill?.packingFee ?? 0;
  const deliveryFee = invoice.order?.deliveryFee ?? invoice.order?.bill?.deliveryFee ?? 0;
  const totalAmount = invoice.order?.totalAmount ?? invoice.order?.bill?.totalPayable ?? 0;

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
        <PressableScale onPress={() => void handleDownloadPdf()} activeScale={0.92}>
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
            <Text style={styles.companyTitle}>
              {invoice.vendor?.companyLegalName || 'BALAJI ENTERPRISE FRESH PRODUCE'}
            </Text>
            <Text style={styles.taxSub}>
              {invoice.vendor?.hubAddress || 'Balaji Enterprise Wholesale Fulfillment Hub, Surat 395009'}
            </Text>
            <Text style={styles.taxSub}>
              FSSAI Lic No: {invoice.vendor?.fssaiNumber || '10723026000412'} • GSTIN: {invoice.vendor?.gstin || '24AABCB1234F1Z1'}
            </Text>
          </View>

          <View style={styles.dashedLine} />

          {/* Invoice Meta */}
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>INVOICE NO.</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.metaLabel}>ISSUED AT</Text>
              <Text style={styles.metaValue}>
                {new Date(invoice.weighedTimestamp).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.customerBox}>
            <Text style={styles.customerLabel}>BILL TO / CUSTOMER DETAILS</Text>
            <Text style={styles.customerName}>{invoice.customer?.fullName || 'Customer'}</Text>
            {addressParts.length > 0 && (
              <Text style={styles.customerAddress}>{addressParts.join(', ')}</Text>
            )}
            <Text style={styles.customerPhone}>Phone: {invoice.customer?.phone || ''}</Text>
          </View>

          <View style={styles.dashedLine} />

          {/* Electronic Weighment Table */}
          <Text style={styles.tableHeading}>CALIBRATED WEIGHMENT BREAKDOWN</Text>

          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colHeader, { flex: 2 }]}>Commodity</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Pack</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Rate</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: 'right' }]}>Total</Text>
          </View>

          {(invoice.order?.items ?? []).map((item, index) => (
            <View key={item.id ?? index} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.rowTitle}>{item.product?.name}</Text>
                <Text style={styles.rowRegional}>Qty: {item.quantity}</Text>
              </View>
              <Text style={[styles.rowVal, { flex: 1, textAlign: 'center' }]}>
                {item.selectedWeight?.label}
              </Text>
              <Text style={[styles.rowVal, { flex: 1, textAlign: 'center' }]}>
                ₹{item.selectedWeight?.price}
              </Text>
              <Text style={[styles.rowVal, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>
                {formatCurrency(item.lineTotal ?? (item.selectedWeight?.price ?? 0) * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={styles.dashedLine} />

          {/* Totals Calculation */}
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Commodity Net Total</Text>
            <Text style={styles.calcVal}>{formatCurrency(itemTotal)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Perforated Food Pouch Packaging</Text>
            <Text style={styles.freeGreen}>
              {packingFee === 0 ? 'FREE (₹0)' : formatCurrency(packingFee)}
            </Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Early Morning Insulated Delivery</Text>
            <Text style={styles.freeGreen}>
              {deliveryFee === 0 ? 'FREE (₹0)' : formatCurrency(deliveryFee)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Grand Total ({invoice.order?.paymentMethod} {invoice.order?.paymentStatus})
            </Text>
            <Text style={styles.totalVal}>{formatCurrency(totalAmount)}</Text>
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
