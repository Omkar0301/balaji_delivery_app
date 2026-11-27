import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartService } from '../services/cartService';
import { BillSummary, CartItem } from '../types/cart';
import { Product, WeightOption } from '../types/product';
import { calculateBill } from '../utils/formatters';
import { useAuthContext } from './AuthContext';

const GUEST_CART_STORAGE_KEY = '@balaji_guest_cart';

interface CartContextValue {
  items: CartItem[];
  totalItemCount: number;
  itemTotal: number;
  bill: BillSummary;
  isSyncing: boolean;
  addItem: (product: Product, selectedWeight: WeightOption, quantity?: number) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getItemQuantity: (productId: string, weightId?: string) => number;
  getCartItem: (productId: string, weightId?: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isHydrating } = useAuthContext();
  const [items, setItems] = useState<CartItem[]>([]);
  const [serverBill, setServerBill] = useState<BillSummary | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const prevLoggedInRef = useRef<boolean>(false);

  const persistGuestCart = useCallback(async (nextItems: CartItem[]) => {
    try {
      await AsyncStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(nextItems));
    } catch {
      // Ignore storage failures in guest mode
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }
    setIsSyncing(true);
    try {
      const res = await cartService.getCart();
      setItems(res.data.items);
      setServerBill(res.data.bill);
    } catch {
      // Keep current items if transient fetch fails
    } finally {
      setIsSyncing(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isHydrating) return;

    async function syncOnAuthTransition() {
      if (isLoggedIn) {
        setIsSyncing(true);
        try {
          const rawGuest = await AsyncStorage.getItem(GUEST_CART_STORAGE_KEY);
          const guestItems: CartItem[] = rawGuest ? (JSON.parse(rawGuest) as CartItem[]) : [];

          if (guestItems.length > 0) {
            const mergePayload = guestItems.map((i) => ({
              productId: i.product.id,
              weightOptionId: i.selectedWeight.id,
              quantity: i.quantity,
            }));
            const merged = await cartService.mergeGuestCart(mergePayload);
            await AsyncStorage.removeItem(GUEST_CART_STORAGE_KEY);
            setItems(merged.data.items);
            setServerBill(merged.data.bill);
          } else {
            const res = await cartService.getCart();
            setItems(res.data.items);
            setServerBill(res.data.bill);
          }
        } catch {
          // Fallback to fetching server cart if merge fails
        } finally {
          setIsSyncing(false);
        }
      } else {
        setServerBill(null);
        if (prevLoggedInRef.current) {
          // User logged out: start with empty guest cart
          setItems([]);
          await AsyncStorage.removeItem(GUEST_CART_STORAGE_KEY).catch(() => {});
        } else {
          // Initial guest boot: restore saved guest cart
          try {
            const rawGuest = await AsyncStorage.getItem(GUEST_CART_STORAGE_KEY);
            if (rawGuest) {
              setItems(JSON.parse(rawGuest) as CartItem[]);
            }
          } catch {
            // Ignore malformed storage
          }
        }
      }
      prevLoggedInRef.current = isLoggedIn;
    }

    syncOnAuthTransition();
  }, [isLoggedIn, isHydrating]);

  const addItem = useCallback(
    (product: Product, selectedWeight: WeightOption, quantity = 1) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.product.id === product.id && i.selectedWeight.id === selectedWeight.id
        );
        let next: CartItem[];

        if (existingIndex > -1) {
          next = [...prev];
          const existing = next[existingIndex];
          if (existing) {
            next[existingIndex] = {
              ...existing,
              quantity: existing.quantity + quantity,
            };
          }
        } else {
          next = [
            ...prev,
            {
              id: `${product.id}_${selectedWeight.id}`,
              product,
              selectedWeight,
              quantity,
            },
          ];
        }

        if (!isLoggedIn) {
          void persistGuestCart(next);
        }
        return next;
      });

      if (isLoggedIn) {
        void cartService
          .addItem(product.id, selectedWeight.id, quantity)
          .then((res) => {
            setItems(res.data.items);
            setServerBill(res.data.bill);
          })
          .catch(() => {
            void refreshCart();
          });
      }
    },
    [isLoggedIn, persistGuestCart, refreshCart]
  );

  const updateQuantity = useCallback(
    (cartItemId: string, delta: number) => {
      let targetNextQty = 0;

      setItems((prev) => {
        const next = prev
          .map((item) => {
            if (item.id === cartItemId) {
              const nextQty = item.quantity + delta;
              targetNextQty = nextQty;
              return nextQty > 0 ? { ...item, quantity: nextQty } : null;
            }
            return item;
          })
          .filter((item): item is CartItem => item !== null);

        if (!isLoggedIn) {
          void persistGuestCart(next);
        }
        return next;
      });

      if (isLoggedIn) {
        const op =
          targetNextQty > 0
            ? cartService.updateItem(cartItemId, targetNextQty)
            : cartService.removeItem(cartItemId);

        void op
          .then((res) => {
            setItems(res.data.items);
            setServerBill(res.data.bill);
          })
          .catch(() => {
            void refreshCart();
          });
      }
    },
    [isLoggedIn, persistGuestCart, refreshCart]
  );

  const removeItem = useCallback(
    (cartItemId: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== cartItemId);
        if (!isLoggedIn) {
          void persistGuestCart(next);
        }
        return next;
      });

      if (isLoggedIn) {
        void cartService
          .removeItem(cartItemId)
          .then((res) => {
            setItems(res.data.items);
            setServerBill(res.data.bill);
          })
          .catch(() => {
            void refreshCart();
          });
      }
    },
    [isLoggedIn, persistGuestCart, refreshCart]
  );

  const clearCart = useCallback(async () => {
    setItems([]);
    setServerBill(null);
    await AsyncStorage.removeItem(GUEST_CART_STORAGE_KEY).catch(() => {});
    if (isLoggedIn) {
      await cartService.clearCart().catch(() => {});
    }
  }, [isLoggedIn]);

  const { itemByKey, qtyByProductId } = useMemo(() => {
    const byKey = new Map<string, CartItem>();
    const byProd = new Map<string, number>();
    for (const item of items) {
      byKey.set(`${item.product.id}_${item.selectedWeight.id}`, item);
      byProd.set(item.product.id, (byProd.get(item.product.id) ?? 0) + item.quantity);
    }
    return { itemByKey: byKey, qtyByProductId: byProd };
  }, [items]);

  const getItemQuantity = useCallback(
    (productId: string, weightId?: string): number => {
      if (weightId) {
        return itemByKey.get(`${productId}_${weightId}`)?.quantity ?? 0;
      }
      return qtyByProductId.get(productId) ?? 0;
    },
    [itemByKey, qtyByProductId]
  );

  const getCartItem = useCallback(
    (productId: string, weightId?: string): CartItem | undefined => {
      if (weightId) {
        return itemByKey.get(`${productId}_${weightId}`);
      }
      return items.find((i) => i.product.id === productId);
    },
    [itemByKey, items]
  );

  const totalItemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const itemTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.selectedWeight.price * item.quantity, 0),
    [items]
  );

  const bill = useMemo(
    () => serverBill ?? calculateBill(itemTotal),
    [serverBill, itemTotal]
  );

  const value = useMemo(
    () => ({
      items,
      totalItemCount,
      itemTotal,
      bill,
      isSyncing,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      getItemQuantity,
      getCartItem,
    }),
    [
      items,
      totalItemCount,
      itemTotal,
      bill,
      isSyncing,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      getItemQuantity,
      getCartItem,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return ctx;
}
