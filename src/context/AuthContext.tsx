import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { UserProfile, DeliveryAddress } from '../types/user';
import { MOCK_USER } from '../data/mockData';

interface AuthContextValue {
  user: UserProfile | null;
  isLoggedIn: boolean;
  phone: string;
  setPhone: (phone: string) => void;
  login: (phone: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addAddress: (address: Omit<DeliveryAddress, 'id'>) => void;
  setDefaultAddress: (addressId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(MOCK_USER);
  const [phone, setPhone] = useState<string>('9876543210');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const login = useCallback(async (phoneNumber: string): Promise<boolean> => {
    setPhone(phoneNumber);
    // Simulate API delay
    await new Promise((res) => setTimeout(res, 300));
    return true;
  }, []);

  const verifyOtp = useCallback(async (otp: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 400));
    if (otp === '1234' || otp.length === 4) {
      setUser(MOCK_USER);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  const addAddress = useCallback((address: Omit<DeliveryAddress, 'id'>) => {
    setUser((prev) => {
      if (!prev) return null;
      const newAddress: DeliveryAddress = {
        ...address,
        id: `addr-${Date.now()}`,
      };
      const updated = prev.savedAddresses.map((a) =>
        newAddress.isDefault ? { ...a, isDefault: false } : a
      );
      return {
        ...prev,
        savedAddresses: [newAddress, ...updated],
      };
    });
  }, []);

  const setDefaultAddress = useCallback((addressId: string) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        savedAddresses: prev.savedAddresses.map((a) => ({
          ...a,
          isDefault: a.id === addressId,
        })),
      };
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn,
      phone,
      setPhone,
      login,
      verifyOtp,
      updateProfile,
      addAddress,
      setDefaultAddress,
      logout,
    }),
    [user, isLoggedIn, phone, login, verifyOtp, updateProfile, addAddress, setDefaultAddress, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
