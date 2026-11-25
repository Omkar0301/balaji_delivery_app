import { CartItem, DeliverySlot } from './cart';
import { DeliveryAddress } from './user';

export type OrderStatus =
  | 'CONFIRMED'
  | 'SORTING_PACKING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  photoUrl: string;
  rating: number;
  completedDeliveries: number;
  vehicleNumber: string;
  vehicleType: string;
}

export interface OrderTrackingStep {
  title: string;
  subtitle: string;
  timestamp?: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#BE-89421"
  items: CartItem[];
  slot: DeliverySlot;
  address: DeliveryAddress;
  status: OrderStatus;
  paymentMethod: 'UPI' | 'CARDS' | 'COD';
  totalAmount: number;
  partner?: DeliveryPartner;
  trackingSteps: OrderTrackingStep[];
  guardNote?: string;
  createdAt: string;
}
