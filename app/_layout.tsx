import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../src/theme/colors';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { CheckoutProvider } from '../src/context/CheckoutContext';
import { ToastProvider } from '../src/context/ToastContext';
import { NetworkProvider } from '../src/context/NetworkContext';

// Prevent splash screen from disappearing before react navigation mounts
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    const hideTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 150);

    return () => clearTimeout(hideTimer);
  }, []);

  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <AuthProvider>
          <CartProvider>
            <CheckoutProvider>
              <ToastProvider>
                <StatusBar style="dark" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.background },
                    animation: 'slide_from_right',
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="catalog" options={{ headerShown: false }} />
                  <Stack.Screen name="search" options={{ headerShown: false }} />
                  <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="checkout/payment" options={{ headerShown: false }} />
                  <Stack.Screen name="address/add" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="order/confirmed"
                    options={{ headerShown: false, gestureEnabled: false }}
                  />
                  <Stack.Screen name="order/track/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="order/invoice/[id]" options={{ headerShown: false }} />
                </Stack>
              </ToastProvider>
            </CheckoutProvider>
          </CartProvider>
        </AuthProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
