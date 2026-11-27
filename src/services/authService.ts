import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { DeliveryAddress, UserProfile } from '../types/user';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  isNewUser: boolean;
}

export interface UpdateProfilePayload {
  fullName?: string;
  preferredLanguage?: 'en' | 'gu';
  dealsAlertsEnabled?: boolean;
  dispatchAlertsEnabled?: boolean;
}

export const authService = {
  async sendOtp(
    phone: string,
    language: 'en' | 'gu' = 'en'
  ): Promise<ApiResponse<{ message: string; cooldown: number }>> {
    return apiClient.post('/auth/send-otp', { phone, language });
  },

  async verifyOtp(
    phone: string,
    otp: string,
    deviceInfo?: string
  ): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/verify-otp', { phone, otp, deviceInfo });
  },

  async guestLogin(
    language: 'en' | 'gu' = 'en',
    deviceInfo?: string
  ): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/guest', { language, deviceInfo });
  },

  async refreshSession(
    refreshToken: string
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    return apiClient.post('/auth/refresh', { refreshToken }, { 'X-Skip-Refresh': '1' });
  },

  async logout(refreshToken?: string | null): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {});
  },

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get('/auth/profile');
  },

  async updateProfile(updates: UpdateProfilePayload): Promise<ApiResponse<UserProfile>> {
    return apiClient.put('/auth/profile', updates);
  },

  async getAddresses(): Promise<ApiResponse<DeliveryAddress[]>> {
    return apiClient.get('/addresses');
  },

  async addAddress(
    address: Omit<DeliveryAddress, 'id'>
  ): Promise<ApiResponse<DeliveryAddress>> {
    return apiClient.post('/addresses', address);
  },

  async updateAddress(
    id: string,
    updates: Partial<Omit<DeliveryAddress, 'id'>>
  ): Promise<ApiResponse<DeliveryAddress>> {
    return apiClient.put(`/addresses/${id}`, updates);
  },

  async setDefaultAddress(id: string): Promise<ApiResponse<DeliveryAddress>> {
    return apiClient.patch(`/addresses/${id}/default`);
  },

  async deleteAddress(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.delete(`/addresses/${id}`);
  },
};
