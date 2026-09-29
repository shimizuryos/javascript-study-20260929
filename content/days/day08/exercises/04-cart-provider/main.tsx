import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type CartContextValue = {
  items: string[];
  add: (item: string) => void;
  remove: (item: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);

  const add = useCallback((item: string) => {
    setItems((prev) => (prev.includes(item) ? prev : [...prev, item]));
  }, []);

  const remove = useCallback((item: string) => {
    setItems((prev) => prev.filter((i) => i !== item));
  }, []);

  const value = useMemo(() => ({ items, add, remove }), [items, add, remove]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (value === null) {
    throw new Error('useCart は <CartProvider> の中で使ってください');
  }
  return value;
}
