import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/apiClient';
import { authService, UpdateProfilePayload } from '../services/authService';
import { DeliveryAddress, UserProfile } from '../types/user';
import { tokenStorage } from '../utils/tokenStorage';

const CACHED_PROFILE_KEY = '@balaji_cached_profile';

interface AuthContextValue {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isHydrating: boolean;
  phone: string;
  setPhone: (phone: string) => void;
  login: (phone: string, language?: 'en' | 'gu') => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<{ ok: boolean; isNewUser: boolean }>;
  loginAsGuest: (language?: 'en' | 'gu') => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: UpdateProfilePayload) => Promise<void>;
  addAddress: (address: Omit<DeliveryAddress, 'id'>) => Promise<DeliveryAddress | null>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function formatIndianPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits.slice(2);
  return digits.slice(-10);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [phone, setPhone] = useState<string>('');
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  const clearSession = useCallback(() => {
    apiClient.setAuthToken(null);
    setUser(null);
    void AsyncStorage.removeItem(CACHED_PROFILE_KEY).catch(() => {});
  }, []);

  useEffect(() => {
    apiClient.setOnSessionExpired(clearSession);
    return () => apiClient.setOnSessionExpired(null);
  }, [clearSession]);

  const refreshProfile = useCallback(async () => {
    const [profileRes, addressesRes] = await Promise.all([
      authService.getProfile(),
      authService.getAddresses(),
    ]);
    setUser({
      ...profileRes.data,
      savedAddresses: addressesRes.data,
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      let usedCachedProfile = false;
      try {
        const [accessToken, refreshToken, rawCached] = await Promise.all([
          tokenStorage.getAccessToken(),
          tokenStorage.getRefreshToken(),
          AsyncStorage.getItem(CACHED_PROFILE_KEY).catch(() => null),
        ]);
        if (!accessToken && !refreshToken) {
          return;
        }

        if (accessToken) {
          apiClient.setAuthToken(accessToken);
        }

        if (rawCached && mounted) {
          try {
            const cachedProfile = JSON.parse(rawCached) as UserProfile;
            setUser(cachedProfile);
            setIsHydrating(false);
            usedCachedProfile = true;
          } catch {
            // Ignore malformed cached profile
          }
        }

        const [profileRes, addressesRes] = await Promise.all([
          authService.getProfile(),
          authService.getAddresses(),
        ]);

        const freshProfile: UserProfile = {
          ...profileRes.data,
          savedAddresses: addressesRes.data,
        };
        void AsyncStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(freshProfile)).catch(() => {});

        if (mounted) {
          setUser(freshProfile);
        }
      } catch {
        await tokenStorage.clearTokens();
        await AsyncStorage.removeItem(CACHED_PROFILE_KEY).catch(() => {});
        apiClient.setAuthToken(null);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted && !usedCachedProfile) {
          setIsHydrating(false);
        }
      }
    }

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (phoneNumber: string, language: 'en' | 'gu' = 'en') => {
    const normalized = formatIndianPhone(phoneNumber);
    setPhone(normalized);
    await authService.sendOtp(normalized, language);
    return true;
  }, []);

  const verifyOtp = useCallback(
    async (otp: string): Promise<{ ok: boolean; isNewUser: boolean }> => {
      const normalized = formatIndianPhone(phone);
      const res = await authService.verifyOtp(normalized, otp, `${Platform.OS} app`);
      const { accessToken, refreshToken, user: verifiedUser, isNewUser } = res.data;
      apiClient.setAuthToken(accessToken);
      await tokenStorage.saveTokens(accessToken, refreshToken);
      setUser({
        ...verifiedUser,
        savedAddresses: verifiedUser.savedAddresses ?? [],
      });
      return { ok: true, isNewUser };
    },
    [phone]
  );

  const loginAsGuest = useCallback(async (language: 'en' | 'gu' = 'en'): Promise<boolean> => {
    const res = await authService.guestLogin(language, `${Platform.OS} app`);
    const { accessToken, refreshToken, user: guestUser } = res.data;
    apiClient.setAuthToken(accessToken);
    await tokenStorage.saveTokens(accessToken, refreshToken);
    setPhone('');
    setUser({
      ...guestUser,
      savedAddresses: guestUser.savedAddresses ?? [],
    });
    return true;
  }, []);

  const updateProfile = useCallback(async (updates: UpdateProfilePayload) => {
    const res = await authService.updateProfile(updates);
    setUser((prev) =>
      prev
        ? {
            ...prev,
            ...res.data,
            savedAddresses: res.data.savedAddresses ?? prev.savedAddresses,
          }
        : res.data
    );
  }, []);

  const addAddress = useCallback(
    async (address: Omit<DeliveryAddress, 'id'>): Promise<DeliveryAddress | null> => {
      const res = await authService.addAddress(address);
      const created = res.data;
      setUser((prev) => {
        if (!prev) return null;
        const nextExisting = created.isDefault
          ? prev.savedAddresses.map((a) => ({ ...a, isDefault: false }))
          : prev.savedAddresses;
        return {
          ...prev,
          savedAddresses: [created, ...nextExisting],
        };
      });
      return created;
    },
    []
  );

  const setDefaultAddress = useCallback(async (addressId: string) => {
    await authService.setDefaultAddress(addressId);
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

  const deleteAddress = useCallback(async (addressId: string) => {
    await authService.deleteAddress(addressId);
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        savedAddresses: prev.savedAddresses.filter((a) => a.id !== addressId),
      };
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (apiClient.getAuthToken()) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Best-effort server revocation; always clear local session
    } finally {
      await tokenStorage.clearTokens();
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: user !== null,
      isHydrating,
      phone,
      setPhone,
      login,
      verifyOtp,
      loginAsGuest,
      refreshProfile,
      updateProfile,
      addAddress,
      setDefaultAddress,
      deleteAddress,
      logout,
    }),
    [
      user,
      isHydrating,
      phone,
      login,
      verifyOtp,
      loginAsGuest,
      refreshProfile,
      updateProfile,
      addAddress,
      setDefaultAddress,
      deleteAddress,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
