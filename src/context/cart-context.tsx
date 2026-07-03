/**
 * Cart state backed by the Shopify Storefront Cart API.
 *
 * The cart lives on Shopify; we keep its id in AsyncStorage so it survives app
 * restarts, and mirror the latest server cart in React state. Every mutation
 * returns the fresh cart, which we store as the single source of truth.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/context/auth-context';
import {
  addCartLine,
  createCart,
  fetchCart,
  removeCartLine,
  updateCartLine,
  updateCartBuyerIdentity,
} from '@/lib/queries';
import type { Cart } from '@/lib/types';

const CART_ID_KEY = 'ruzza-watch.cartId';

type CartContextValue = {
  cart: Cart | null;
  /** Number of items (sum of line quantities) — for the footer badge. */
  totalQuantity: number;
  /** True during the initial cart hydration on app launch. */
  loading: boolean;
  /** True while any mutation is in flight. */
  mutating: boolean;
  error: string | null;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  /** Re-fetch the cart from Shopify (e.g. after returning from checkout). */
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On launch, restore a previously created cart (if it still exists on Shopify).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const savedId = await AsyncStorage.getItem(CART_ID_KEY);
        if (savedId) {
          const existing = await fetchCart(savedId);
          if (active && existing) {
            setCart(existing);
          } else if (active) {
            // Cart expired or was completed — drop the stale id.
            await AsyncStorage.removeItem(CART_ID_KEY);
          }
        }
      } catch (err) {
        // A missing/misconfigured Shopify setup shouldn't crash the app; the
        // product screens surface configuration errors on their own.
        if (active) setError((err as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const runMutation = useCallback(async (fn: () => Promise<Cart>) => {
    setMutating(true);
    setError(null);
    try {
      const next = await fn();
      setCart(next);
      await AsyncStorage.setItem(CART_ID_KEY, next.id);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setMutating(false);
    }
  }, []);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      await runMutation(async () => {
        if (!cart) return createCart(variantId, quantity, token);
        return addCartLine(cart.id, variantId, quantity);
      });
    },
    [cart, runMutation, token],
  );

  // Keep the cart's buyer identity in sync with the logged-in customer, so an
  // eventual checkout is linked to their account.
  useEffect(() => {
    if (!cart) return;
    updateCartBuyerIdentity(cart.id, token)
      .then((next) => {
        if (next) setCart(next);
      })
      .catch(() => {
        // non-fatal
      });
    // Only re-run when the token changes, not on every cart mutation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      await runMutation(() => updateCartLine(cart.id, lineId, quantity));
    },
    [cart, runMutation],
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      await runMutation(() => removeCartLine(cart.id, lineId));
    },
    [cart, runMutation],
  );

  const refresh = useCallback(async () => {
    if (!cart) return;
    try {
      const next = await fetchCart(cart.id);
      if (next) {
        setCart(next);
      } else {
        // Cart was completed (order placed) — clear it.
        setCart(null);
        await AsyncStorage.removeItem(CART_ID_KEY);
      }
    } catch {
      // non-fatal
    }
  }, [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      totalQuantity: cart?.totalQuantity ?? 0,
      loading,
      mutating,
      error,
      addItem,
      updateItem,
      removeItem,
      refresh,
    }),
    [cart, loading, mutating, error, addItem, updateItem, removeItem, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
