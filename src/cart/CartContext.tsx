import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/types";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
  coupon: string;
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  applyCoupon: (code: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "iwosan.cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = coupon ? Math.round(subtotal * 0.08) : 0;
  const serviceFee = Math.round(Math.max(0, subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + serviceFee);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      serviceFee,
      discount,
      total,
      coupon,
      addItem: (product) => {
        setItems((current) => {
          const existing = current.find((item) => item.product.id === product.id);
          if (existing) {
            return current.map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }
          return [...current, { product, quantity: 1 }];
        });
      },
      updateQuantity: (productId, quantity) => {
        setItems((current) =>
          current
            .map((item) =>
              item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      removeItem: (productId) => {
        setItems((current) => current.filter((item) => item.product.id !== productId));
      },
      applyCoupon: (code) => setCoupon(code.trim().toUpperCase()),
      clearCart: () => {
        setItems([]);
        setCoupon("");
      },
    }),
    [coupon, discount, itemCount, items, serviceFee, subtotal, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
