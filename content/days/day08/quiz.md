## default-value

`<Label />` を Provider で囲まずに表示すると、何が表示されますか?

```tsx
const ThemeContext = createContext('light');

function Label() {
  const theme = useContext(ThemeContext);
  return <span>{theme}</span>;
}
```

- [x] `light`
- [ ] 何も表示されない (`undefined`)
- [ ] エラーになる
- [ ] `ThemeContext`

> 上に Provider が 1 つも無いとき、useContext は `createContext` に渡したデフォルト値を返します。エラーにしたい場合は、デフォルト値を `null` にして、自作フックの中で `throw` します。

## nearest-provider

`<Label />` には何が表示されますか? (`Label` は前の問題と同じ)

```tsx
<ThemeContext value="dark">
  <section>
    <ThemeContext value="blue">
      <Label />
    </ThemeContext>
  </section>
</ThemeContext>
```

- [ ] `dark`
- [x] `blue`
- [ ] `light`
- [ ] `dark blue`

> useContext は、自分より上にある **一番近い** Provider の値を読みます。内側の Provider が外側の値を上書きします。

## sibling-outside

`<Footer />` の中で `useContext(ThemeContext)` を呼ぶと何が返りますか? (デフォルト値は `'light'`)

```tsx
<>
  <ThemeContext value="dark">
    <Header />
  </ThemeContext>
  <Footer />
</>
```

- [ ] `'dark'`
- [x] `'light'`
- [ ] `undefined`
- [ ] エラーになる

> Provider が値を届けるのは **自分の子孫だけ** です。`Footer` は Provider の兄弟なので届かず、デフォルト値の `'light'` になります。Provider で包む範囲を間違えると、このように「一部のコンポーネントだけ値が届かない」バグになります。

## provider-syntax

React 19 で `<ThemeContext value="dark">...</ThemeContext>` と同じ意味になるのはどれですか?

- [x] `<ThemeContext.Provider value="dark">...</ThemeContext.Provider>`
- [ ] `<ThemeContext.Consumer value="dark">...</ThemeContext.Consumer>`
- [ ] `<ThemeContext theme="dark">...</ThemeContext>`
- [ ] `useContext(ThemeContext, 'dark')`

> React 19 からは Context 自体を Provider として書けるようになりましたが、以前は `.Provider` を付けて書いていました。ライブラリのソースや少し前のコードでは `.Provider` をよく見かけます。

## hook-narrowing

`useCart` の `return value;` の時点で、`value` の型はどれですか?

```tsx
type CartContextValue = { items: string[]; add: (item: string) => void };
const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const value = useContext(CartContext);
  if (value === null) {
    throw new Error('useCart は <CartProvider> の中で使ってください');
  }
  return value;
}
```

- [ ] `CartContextValue | null`
- [x] `CartContextValue`
- [ ] `null`
- [ ] `unknown`

> `useContext(CartContext)` の結果は `CartContextValue | null` ですが、`null` のときは `throw` して関数を抜けるので、`if` の後では `null` が除かれています (絞り込み)。使う側は null チェックなしで `const { items, add } = useCart();` と書けます。

## inline-value

次の Provider の問題点として正しいものはどれですか?

```tsx
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const add = (item: string) => setItems((prev) => [...prev, item]);
  return <CartContext value={{ items, add }}>{children}</CartContext>;
}
```

- [ ] `value` にオブジェクトは渡せないのでエラーになる
- [x] CartProvider が再レンダーされるたびに `value` が新しいオブジェクトになり、items が同じでも読んでいる側が全部再レンダーされる
- [ ] `add` を呼んでも items が更新されない
- [ ] children が表示されない

> `{ items, add }` や `add` はレンダーのたびに新しく作られるので、`Object.is` で比べると毎回「変わった」ことになります。`useCallback` と `useMemo(() => ({ items, add }), [items, add])` で参照を安定させるのが定番です。動作は正しいので、性能の問題です。

## no-query-client

ある画面で `Error: No QueryClient set, use QueryClientProvider to set one` が出ました。最も考えられる原因はどれですか?

- [ ] queryKey が間違っている
- [ ] API のサーバーが止まっている
- [x] `useQuery` を使うコンポーネントが、`QueryClientProvider` で囲まれた範囲の外で表示されている
- [ ] `useQuery` を 2 回呼んでいる

> `useQuery` は内部で `useQueryClient()` を呼び、Context から QueryClient を受け取ります。上に `QueryClientProvider` が無いと Context の値が `undefined` なので、このエラーを投げます。ルートの layout で Providers に包まれているか、テストなら Provider で囲んでいるかを確認します。

## query-client-in-body

Providers コンポーネントで QueryClient を作る書き方として最も適切なものはどれですか?

- [ ] `const queryClient = new QueryClient();` をコンポーネントの本体に書く
- [x] `const [queryClient] = useState(() => new QueryClient());`
- [ ] `const [queryClient] = useState(new QueryClient);`
- [ ] `useEffect(() => { queryClient = new QueryClient(); }, []);`

> 本体に書くと、レンダーのたびに新しい QueryClient (= 空のキャッシュ) が作られてしまいます。`useState` に関数を渡すと初回だけ呼ばれ、マウント中は同じ QueryClient が使われ続けます。3 つ目は、state として使われるのは初回の QueryClient だけですが、`new QueryClient` 自体はレンダーのたびに実行されて捨てられるので無駄です。

## renderhook-wrapper

`useCart` (CartProvider の外で使うとエラーを投げるフック) をテストする書き方として正しいものはどれですか?

- [ ] `renderHook(() => useCart())`
- [x] `renderHook(() => useCart(), { wrapper: CartProvider })`
- [ ] `renderHook(() => <CartProvider>{useCart()}</CartProvider>)`
- [ ] `useCart()` をテストの中で直接呼ぶ

> `wrapper` に渡したコンポーネントで、フックを呼ぶテスト用コンポーネントが包まれます。1 つ目は Provider が無いのでエラーになり、3 つ目はフックを呼んだ後で JSX を作っているので Provider の外で呼ばれたことになります。フックはコンポーネントの外で直接は呼べません。
