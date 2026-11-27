import { Product, WeightOption } from './product';

export interface CartItem {
  id: string;
  product: Product;
  selectedWeight: WeightOption;
  quantity: number;
}

export interface DeliverySlot {
  id: string;
  title: string;
  timeRange: string;
  date: string;
  slotDate?: string;
  isMorning: boolean;
  isAvailable: boolean;
  remainingCapacity?: number;
  tag?: string;
  cutoffTime?: string;
}

export interface BillSummary {
  itemTotal: number;
  packingFee: number;
  deliveryFee: number;
  discountTotal: number;
  totalPayable: number;
  freeDeliveryThreshold: number;
  freeDeliveryShortfall: number;
  hasFreeDelivery: boolean;
}
