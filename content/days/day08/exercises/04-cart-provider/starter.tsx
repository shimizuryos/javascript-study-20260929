import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type CartContextValue = {
  items: string[];
  add: (item: string) => void;
  remove: (item: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // TODO: items の state を持ち、add / remove を作って、{ items, add, remove } を提供する
  return <>{children}</>;
}

export function useCart(): CartContextValue {
  // TODO: useContext で読み、Provider の外ならエラーを投げる
  return { items: [], add: () => {}, remove: () => {} };
}
