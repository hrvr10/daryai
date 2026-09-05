"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Cart stores a snapshot of each line so it survives products changing.
// The server always recomputes the real price at checkout.
export type CartLine = {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color?: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, size: string, color: string | undefined, qty: number) => void;
  remove: (id: string, size: string, color?: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "daryai_cart_v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const sameLine = (l: CartLine, id: string, size: string, color?: string) =>
      l.id === id && l.size === size && (l.color || undefined) === (color || undefined);

    const add: CartContextValue["add"] = (line, qty = 1) => {
      setLines((prev) => {
        const i = prev.findIndex((l) => sameLine(l, line.id, line.size, line.color));
        if (i === -1) return [...prev, { ...line, qty }];
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty, price: line.price };
        return next;
      });
    };

    const setQty: CartContextValue["setQty"] = (id, size, color, qty) => {
      setLines((prev) =>
        prev
          .map((l) =>
            sameLine(l, id, size, color) ? { ...l, qty: Math.max(0, qty) } : l,
          )
          .filter((l) => l.qty > 0),
      );
    };

    const remove: CartContextValue["remove"] = (id, size, color) =>
      setLines((prev) => prev.filter((l) => !sameLine(l, id, size, color)));

    const clear = () => setLines([]);

    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);

    return { lines, count, subtotal, add, setQty, remove, clear };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
