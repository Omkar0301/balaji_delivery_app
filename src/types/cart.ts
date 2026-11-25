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
  isMorning: boolean;
  isAvailable: boolean;
  tag?: string;
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
