import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { BillSummary, CartItem, DeliverySlot } from '../types/cart';

export interface CartResponsePayload {
  items: CartItem[];
  totalItemCount: number;
  itemTotal: number;
  bill: BillSummary;
  skippedCount?: number;
}

export interface GuestCartMergeItem {
  productId: string;
  weightOptionId: string;
  quantity: number;
}

export const cartService = {
  async getCart(): Promise<ApiResponse<CartResponsePayload>> {
    return apiClient.get<CartResponsePayload>('/cart');
  },

  async addItem(
    productId: string,
    weightOptionId: string,
    quantity = 1
  ): Promise<ApiResponse<CartResponsePayload>> {
    return apiClient.post<CartResponsePayload>('/cart/items', {
      productId,
      weightOptionId,
      quantity,
    });
  },

  async updateItem(itemId: string, quantity: number): Promise<ApiResponse<CartResponsePayload>> {
    return apiClient.patch<CartResponsePayload>(`/cart/items/${itemId}`, { quantity });
  },

  async removeItem(itemId: string): Promise<ApiResponse<CartResponsePayload>> {
    return apiClient.delete<CartResponsePayload>(`/cart/items/${itemId}`);
  },

  async clearCart(): Promise<ApiResponse<CartResponsePayload>> {
    return apiClient.delete<CartResponsePayload>('/cart');
  },

  async mergeGuestCart(items: GuestCartMergeItem[]): Promise<ApiResponse<CartResponsePayload>> {
    return apiClient.post<CartResponsePayload>('/cart/merge', { items });
  },

  async getDeliverySlots(): Promise<ApiResponse<DeliverySlot[]>> {
    return apiClient.get<DeliverySlot[]>('/delivery-slots');
  },
};
