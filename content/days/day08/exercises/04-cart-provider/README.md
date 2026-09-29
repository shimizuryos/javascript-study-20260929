---
title: "(発展) state を持つ Provider"
optional: true
hints:
  - "`CartProvider` の中で `const [items, setItems] = useState<string[]>([]);` を持ち、`add` / `remove` は関数型更新 (`setItems((prev) => ...)`) で書きます。"
  - "`add` と `remove` は `useCallback(..., [])`、value は `useMemo(() => ({ items, add, remove }), [items, add, remove])` で参照を安定させます。"
  - "`useCart` は Day 8 の `useUser` と同じ形です。null なら 'CartProvider' を含むメッセージで throw します。"
---

カートの中身を、アプリのどこからでも読み書きできるようにします。

```tsx
type CartContextValue = {
  items: string[];
  add: (item: string) => void; // すでに入っている商品は追加しない
  remove: (item: string) => void;
};

<CartProvider>
  <ProductPage /> {/* useCart().add('りんご') */}
  <CartIcon />    {/* useCart().items.length */}
</CartProvider>
```

- `CartProvider({ children })` … items の state を持ち、`{ items, add, remove }` を Context で提供する
- `useCart()` … 値を返す。Provider の外で呼ばれたら、`'CartProvider'` を含むメッセージのエラーを投げる
- items が変わらない再レンダーでは、`useCart()` が返すオブジェクトも `add` / `remove` も **同じ参照** のままにする (Day 7 の useMemo / useCallback)

テストでは、ボタンを持つコンポーネントと件数を表示するコンポーネントを **別々に** 置いて、Context 経由で state が共有されることを確かめます。
