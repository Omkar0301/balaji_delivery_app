import { apiClient } from './apiClient';
import { Order } from '../types/order';
import { CartItem, DeliverySlot } from '../types/cart';
import { DeliveryAddress } from '../types/user';
import { ApiResponse } from '../types/api';

export interface CreateOrderPayload {
  items: CartItem[];
  slot: DeliverySlot;
  address: DeliveryAddress;
  paymentMethod: 'UPI' | 'CARDS' | 'COD';
  guardNote?: string;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<ApiResponse<Order>> {
    return apiClient.post('/orders', payload);
  },

  async getOrders(): Promise<ApiResponse<Order[]>> {
    return apiClient.get('/orders');
  },

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return apiClient.get(`/orders/${id}`);
  },

  async getLiveTracking(orderId: string): Promise<ApiResponse<Order>> {
    return apiClient.get(`/orders/${orderId}/tracking`);
  },
};
