/**
 * Environment configuration for Balaji Fresh App.
 * Uses EXPO_PUBLIC_* prefix for client-accessible variables.
 */
export const ENV = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL ||
    (__DEV__ ? 'http://localhost:4000/api/v1' : 'https://api.balajifresh.com/api/v1'),
  APP_ENV: (process.env.EXPO_PUBLIC_ENV as 'development' | 'staging' | 'production') || 'development',
  SUPPORT_PHONE: process.env.EXPO_PUBLIC_SUPPORT_PHONE || '+91 98765 43210',
  IS_DEV: __DEV__,
} as const;
