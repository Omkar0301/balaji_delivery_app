import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BillSummary } from '../../types/cart';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { Shadows } from '../../theme/shadows';
import { formatCurrency } from '../../utils/formatters';

interface BillSummaryCardProps {
  bill: BillSummary;
}

export const BillSummaryCard: React.FC<BillSummaryCardProps> = ({ bill }) => {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <MaterialIcons name="receipt-long" size={18} color={Colors.primary} />
        <Text style={styles.cardTitle}>Bill Summary</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Item Total</Text>
        <Text style={styles.rowValue}>{formatCurrency(bill.itemTotal)}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.labelWithIcon}>
          <MaterialIcons name="eco" size={15} color={Colors.primary} />
          <Text style={styles.rowLabel}>Eco-Perforated Packaging</Text>
        </View>
        <Text style={styles.freeGreen}>FREE</Text>
      </View>

      <View style={styles.row}>
        <View>
          <View style={styles.labelWithIcon}>
            <MaterialIcons name="local-shipping" size={15} color={Colors.textSecondary} />
            <Text style={styles.rowLabel}>Morning Delivery Fee</Text>
          </View>
          {!bill.hasFreeDelivery && (
            <Text style={styles.subHint}>
              Free delivery above {formatCurrency(bill.freeDeliveryThreshold)}
            </Text>
          )}
        </View>
        <Text style={bill.hasFreeDelivery ? styles.freeGreen : styles.rowValue}>
          {bill.hasFreeDelivery ? 'FREE' : formatCurrency(bill.deliveryFee)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>To Pay</Text>
          <Text style={styles.inclusiveText}>Inclusive of all applicable taxes</Text>
        </View>
        <Text style={styles.totalValue}>{formatCurrency(bill.totalPayable)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    ...Shadows.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.bodyLarge.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rowLabel: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  freeGreen: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  subHint: {
    fontSize: Typography.micro.fontSize,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  inclusiveText: {
    fontSize: Typography.micro.fontSize,
    color: Colors.textMuted,
  },
  totalValue: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '800',
    color: Colors.primary,
  },
});
