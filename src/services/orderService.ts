import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { Order } from '../types/order';

export interface CreateOrderPayload {
  addressId: string;
  slotId: string;
  paymentMethod: 'UPI' | 'COD';
  paymentChannel?: 'gpay' | 'phonepe' | 'paytm' | 'cod';
  guardNote?: string;
}

export interface InvoicePayload {
  invoiceNumber: string;
  weighedTimestamp: string;
  vendor: {
    companyLegalName: string;
    hubAddress: string;
    fssaiNumber: string;
    gstin: string;
  };
  customer: {
    fullName: string;
    phone: string;
    address: Order['address'];
  };
  order: Omit<Order, 'items'> & {
    itemTotal: number;
    deliveryFee: number;
    packingFee: number;
    discountTotal: number;
    items: (Order['items'][number] & { lineTotal?: number })[];
  };
}

export interface CreateOrderResponse {
  order: Order;
  paymentOrder?: {
    gatewayOrderId: string;
    amountPaise: number;
    currency: string;
    keyId?: string;
  } | null;
}

export interface VerifyPaymentPayload {
  orderId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}

export const orderService = {
  async createOrder(
    payload: CreateOrderPayload,
    idempotencyKey?: string
  ): Promise<ApiResponse<CreateOrderResponse>> {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined;
    return apiClient.post<CreateOrderResponse>('/orders', payload, headers);
  },

  async getOrders(
    scope: 'active' | 'past' | 'all' = 'all',
    page = 1,
    limit = 20
  ): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(`/orders?scope=${scope}&page=${page}&limit=${limit}`);
  },

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  async getLiveTracking(orderId: string): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(`/orders/${orderId}/tracking`);
  },

  async getInvoice(orderId: string): Promise<ApiResponse<InvoicePayload>> {
    return apiClient.get<InvoicePayload>(`/orders/${orderId}/invoice`);
  },

  getInvoicePdfUrl(orderId: string): string {
    return `${apiClient.getBaseUrl()}/orders/${orderId}/invoice/pdf`;
  },

  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${orderId}/cancel`, reason ? { reason } : {});
  },

  async reorder(orderId: string): Promise<ApiResponse<{ addedCount: number; skippedCount: number }>> {
    return apiClient.post(`/orders/${orderId}/reorder`);
  },

  async verifyPayment(
    payload: VerifyPaymentPayload
  ): Promise<ApiResponse<{ verified: boolean; order: Order }>> {
    return apiClient.post<{ verified: boolean; order: Order }>('/payments/verify', payload);
  },
};
