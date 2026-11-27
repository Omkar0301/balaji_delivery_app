import { BillSummary, CartItem, DeliverySlot } from './cart';
import { DeliveryAddress } from './user';

export type OrderStatus =
  | 'PENDING_PAYMENT'
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

export interface PaymentIntentPayload {
  gatewayOrderId: string;
  amountPaise: number;
  currency: string;
  upiIntentUrl?: string;
  gatewayPaymentId?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#BE-89421"
  items: CartItem[];
  slot: DeliverySlot;
  address: DeliveryAddress;
  status: OrderStatus;
  paymentMethod: 'UPI' | 'CARDS' | 'COD';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentChannel?: string;
  totalAmount: number;
  bill?: BillSummary;
  partner?: DeliveryPartner;
  trackingSteps: OrderTrackingStep[];
  guardNote?: string;
  invoiceNumber?: string;
  weighedAt?: string;
  createdAt: string;
  paymentIntent?: PaymentIntentPayload;
}
