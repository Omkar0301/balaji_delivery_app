import React, { createContext, useContext, useMemo, useState } from 'react';
import { DeliverySlot } from '../types/cart';

export type PaymentChannel = 'gpay' | 'phonepe' | 'paytm' | 'cod';

interface CheckoutContextValue {
  selectedSlot: DeliverySlot | null;
  setSelectedSlot: (slot: DeliverySlot | null) => void;
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  guardNote: string;
  setGuardNote: (note: string) => void;
  paymentChannel: PaymentChannel;
  setPaymentChannel: (channel: PaymentChannel) => void;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [guardNote, setGuardNote] = useState<string>('');
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>('gpay');

  const resetCheckout = () => {
    setSelectedSlot(null);
    setGuardNote('');
  };

  const value = useMemo(
    () => ({
      selectedSlot,
      setSelectedSlot,
      selectedAddressId,
      setSelectedAddressId,
      guardNote,
      setGuardNote,
      paymentChannel,
      setPaymentChannel,
      resetCheckout,
    }),
    [selectedSlot, selectedAddressId, guardNote, paymentChannel]
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckoutContext(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error('useCheckoutContext must be used within a CheckoutProvider');
  }
  return ctx;
}
