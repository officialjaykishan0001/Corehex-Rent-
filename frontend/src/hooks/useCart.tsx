import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem } from "@/types/rental";
import { getEquipmentBySlug } from "@/data/equipment";

const STORAGE_KEY = "corehex.cart.v1";

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (slug: string, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  estimatedDailyTotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((slug: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === slug);
      if (existing) {
        return prev.map((i) => (i.slug === slug ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { slug, quantity }];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.slug === slug ? { ...i, quantity: Math.max(1, quantity) } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const estimatedDailyTotal = useMemo(
    () =>
      items.reduce((sum, i) => {
        const eq = getEquipmentBySlug(i.slug);
        return sum + (eq ? eq.dailyRate * i.quantity : 0);
      }, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      add,
      remove,
      setQuantity,
      clear,
      estimatedDailyTotal,
    }),
    [items, add, remove, setQuantity, clear, estimatedDailyTotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}