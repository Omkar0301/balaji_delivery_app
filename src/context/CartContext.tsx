import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CartItem, BillSummary } from '../types/cart';
import { Product, WeightOption } from '../types/product';
import { calculateBill } from '../utils/formatters';

interface CartContextValue {
  items: CartItem[];
  totalItemCount: number;
  itemTotal: number;
  bill: BillSummary;
  addItem: (product: Product, selectedWeight: WeightOption, quantity?: number) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, weightId?: string) => number;
  getCartItem: (productId: string, weightId?: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, selectedWeight: WeightOption, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedWeight.id === selectedWeight.id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        if (existing) {
          updated[existingIndex] = {
            ...existing,
            quantity: existing.quantity + quantity,
          };
        }
        return updated;
      }

      return [
        ...prev,
        {
          id: `${product.id}_${selectedWeight.id}`,
          product,
          selectedWeight,
          quantity,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((cartItemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback(
    (productId: string, weightId?: string): number => {
      if (weightId) {
        const match = items.find(
          (i) => i.product.id === productId && i.selectedWeight.id === weightId
        );
        return match ? match.quantity : 0;
      }
      return items
        .filter((i) => i.product.id === productId)
        .reduce((sum, i) => sum + i.quantity, 0);
    },
    [items]
  );

  const getCartItem = useCallback(
    (productId: string, weightId?: string): CartItem | undefined => {
      if (weightId) {
        return items.find(
          (i) => i.product.id === productId && i.selectedWeight.id === weightId
        );
      }
      return items.find((i) => i.product.id === productId);
    },
    [items]
  );

  const totalItemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const itemTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.selectedWeight.price * item.quantity, 0);
  }, [items]);

  const bill = useMemo(() => {
    return calculateBill(itemTotal);
  }, [itemTotal]);

  const value = useMemo(
    () => ({
      items,
      totalItemCount,
      itemTotal,
      bill,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getItemQuantity,
      getCartItem,
    }),
    [items, totalItemCount, itemTotal, bill, addItem, updateQuantity, removeItem, clearCart, getItemQuantity, getCartItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
