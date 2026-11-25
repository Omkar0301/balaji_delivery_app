import { APP_CONSTANTS } from '../constants/app';
import { BillSummary } from '../types/cart';

/**
 * Format number to Indian Rupee currency string
 */
export function formatRupee(amount: number): string {
  return `${APP_CONSTANTS.CURRENCY_SYMBOL}${Math.round(amount)}`;
}

/**
 * Alias for formatRupee
 */
export function formatCurrency(amount: number): string {
  return `${APP_CONSTANTS.CURRENCY_SYMBOL}${Math.round(amount)}`;
}

/**
 * Calculate discount percentage from MRP and Selling Price
 */
export function formatDiscountPercentage(mrp: number, price: number): number {
  if (mrp <= price || mrp <= 0) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Format weight from grams into appropriate unit display
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${Number.isInteger(kg) ? kg : kg.toFixed(1)} kg`;
  }
  return `${grams}g`;
}

/**
 * Calculate bill breakdown from item subtotal
 */
export function calculateBill(itemTotal: number): BillSummary {
  const threshold = APP_CONSTANTS.FREE_DELIVERY_THRESHOLD;
  const hasFreeDelivery = itemTotal >= threshold;
  const deliveryFee = hasFreeDelivery ? 0 : APP_CONSTANTS.DEFAULT_DELIVERY_FEE;
  const packingFee = APP_CONSTANTS.DEFAULT_PACKING_CHARGE;
  const freeDeliveryShortfall = hasFreeDelivery ? 0 : threshold - itemTotal;

  return {
    itemTotal,
    packingFee,
    deliveryFee,
    discountTotal: 0,
    totalPayable: itemTotal + deliveryFee + packingFee,
    freeDeliveryThreshold: threshold,
    freeDeliveryShortfall,
    hasFreeDelivery,
  };
}
