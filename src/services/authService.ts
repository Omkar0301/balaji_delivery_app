import { apiClient } from './apiClient';
import { UserProfile } from '../types/user';
import { ApiResponse } from '../types/api';

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  isNewUser: boolean;
}

export const authService = {
  async sendOtp(phone: string): Promise<ApiResponse<{ message: string; cooldown: number }>> {
    return apiClient.post('/auth/send-otp', { phone });
  },

  async verifyOtp(phone: string, otp: string): Promise<ApiResponse<AuthResponse>> {
    const res = await apiClient.post<AuthResponse>('/auth/verify-otp', { phone, otp });
    if (res.data.token) {
      apiClient.setAuthToken(res.data.token);
    }
    return res;
  },

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get('/auth/profile');
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return apiClient.put('/auth/profile', updates);
  },

  logout() {
    apiClient.setAuthToken(null);
  },
};
