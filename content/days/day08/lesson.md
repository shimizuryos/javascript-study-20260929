---
day: 8
level: 2
title: Context と Provider
summary: createContext / Provider / useContext と、Provider の外で使うとエラーを投げる自作フック、ライブラリの Provider を置く場所を読めるようにする。
minutes: 90
goals:
  - createContext・Provider・useContext の 3 つの役割を説明できる
  - useContext が「一番近い上の Provider」の値を読み、無ければデフォルト値になることを説明できる
  - "Provider の外で呼ぶと throw new Error(...) する useXxx フックの形を読める"
  - "No QueryClient set のようなエラーを見て、どの Provider が足りないかわかる"
  - "providers.tsx と layout.tsx で、ライブラリの Provider をアプリ全体に配る形を読める"
readings:
  - title: React — コンテクストで深くデータを受け渡す
    url: https://ja.react.dev/learn/passing-data-deeply-with-context
  - title: React — リデューサとコンテクストでスケールアップ
    url: https://ja.react.dev/learn/scaling-up-with-reducer-and-context
  - title: React リファレンス — useContext
    url: https://ja.react.dev/reference/react/useContext
  - title: React リファレンス — createContext
    url: https://ja.react.dev/reference/react/createContext
---

## 今日のゴール

目標コードの 37 行目と 39 行目は、フックを呼んでいるだけに見えます。

```ts
const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);
const query = useQuery({ ... });
```

ところが、このフックを使うコンポーネントをそのまま表示すると、次のようなエラーになります。

```
Error: No QueryClient set, use QueryClientProvider to set one
Error: [nuqs] nuqs requires an adapter to work with your framework.
```

`useQuery` や `useQueryStates` は、画面の **上のほうに置かれた Provider** から必要なもの (キャッシュや URL の読み書きの方法) を受け取る作りになっているからです。今日はこの仕組み **Context** を学び、「どこに何の Provider を置けばよいか」を読めるようにします。

## props のバケツリレー

アプリ全体で使う値 (テーマ・ログイン中のユーザー・言語など) を props だけで渡そうとすると、途中のコンポーネントが **自分では使わない props をひたすら受け渡す** ことになります。

```tsx
function Layout({ user }: { user: User }) {
  return <Sidebar user={user} />; // 自分では使わないけど渡す
}

function Sidebar({ user }: { user: User }) {
  return <UserMenu user={user} />; // 自分では使わないけど渡す
}

function UserMenu({ user }: { user: User }) {
  return <p>{user.name}</p>; // ここでやっと使う
}
```

Context を使うと、上で「提供」した値を、下の **どの深さのコンポーネントからでも直接読める** ようになります。

## Context の 3 ステップ

```tsx
import { createContext, useContext } from 'react';

// 1. 作る (引数はデフォルト値)
const ThemeContext = createContext<'light' | 'dark'>('light');

// 2. 提供する
export function App() {
  return (
    <ThemeContext value="dark">
      <Page />
    </ThemeContext>
  );
}

// 3. 読む (Page の中の、どこか深いところ)
function SaveButton() {
  const theme = useContext(ThemeContext);
  return <button className={`btn btn-${theme}`}>保存</button>;
}
```

- `useContext(ThemeContext)` は、**自分より上にある一番近い Provider** の `value` を返します。
- 上に Provider が 1 つも無ければ、`createContext` に渡した **デフォルト値** を返します。
- Provider は **自分の子孫にだけ** 値を届けます。兄弟や親には届きません。
- Provider の `value` が変わると (`Object.is` で判定)、その Context を読んでいるコンポーネントがすべて再レンダーされます。

> React 19 では `<ThemeContext value="dark">` と書けますが、それ以前は `<ThemeContext.Provider value="dark">` と書いていました。意味は同じで、ライブラリのコードや少し前のコードでは `.Provider` のほうをよく見ます。

## state と組み合わせた Provider

Provider を「state を持つコンポーネント」にすると、アプリのどこからでも読み書きできる state になります。

```tsx
type CartContextValue = {
  items: string[];
  add: (item: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const add = useCallback((item: string) => setItems((prev) => [...prev, item]), []);
  const value = useMemo(() => ({ items, add }), [items, add]);
  return <CartContext value={value}>{children}</CartContext>;
}
```

`value={{ items, add }}` と直接書くと、CartProvider が再レンダーされるたびに **新しいオブジェクト** になり、items が変わっていなくても読んでいる側が全部再レンダーされます。Day 7 の `useMemo` / `useCallback` で参照を安定させるのが定番です。

## Provider の外で使われたら教えてくれるフック

実務では、Context を直接 export せず、**Provider と専用のフックだけ** を export する形がほとんどです。

```tsx
export function useCart() {
  const value = useContext(CartContext);
  if (value === null) {
    throw new Error('useCart は <CartProvider> の中で使ってください');
  }
  return value; // ここでは CartContextValue 型 (null が除かれている)
}
```

- デフォルト値を `null` にしておき、`null` なら「Provider で囲み忘れている」と判断してエラーを投げます。黙って変な値で動くより、原因がすぐわかります。
- `if` で `null` を除いたので、戻り値の型は `CartContextValue` になります (Day 3 の絞り込み)。使う側は `const { items, add } = useCart();` とそのまま分割代入できます。

TanStack Query の `useQueryClient` も、まさにこの形です (実際のソースを少し省略したもの)。

```tsx
export const QueryClientContext = React.createContext<QueryClient | undefined>(undefined);

export const useQueryClient = () => {
  const client = React.useContext(QueryClientContext);
  if (!client) {
    throw new Error('No QueryClient set, use QueryClientProvider to set one');
  }
  return client;
};

export const QueryClientProvider = ({ client, children }: QueryClientProviderProps) => {
  React.useEffect(() => {
    client.mount();
    return () => client.unmount();
  }, [client]);
  return <QueryClientContext.Provider value={client}>{children}</QueryClientContext.Provider>;
};
```

`useQuery` は内部で `useQueryClient()` を呼んでいるので、QueryClientProvider の外で使うと冒頭のエラーになります。nuqs の `useQueryStates` も同じように、アダプター (`NuqsAdapter`) の Context が無いとエラーを投げます。

## ライブラリの Provider をどこに置くか

Next.js (App Router) では、Provider を 1 つのファイルにまとめ、ルートの layout で **アプリ全体を包む** のが定番です (詳しくは Day 9)。

```tsx
// app/providers.tsx
'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsAdapter>
  );
}
```

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- `useState(() => new QueryClient())` … `useState` に **関数** を渡すと、初回だけその関数を呼んで初期値にします。QueryClient (キャッシュの入れ物) をマウント中ずっと 1 つに保つためです。本体に `const queryClient = new QueryClient();` と書くと、レンダーのたびに新しいキャッシュになってしまいます。
- `'use client'` … Context や useState は **クライアントコンポーネント** でしか使えないので、Provider のファイルに付けます (Day 9)。
- Provider の入れ子の順番は、ある Provider が別の Provider の値を使うのでなければ自由です。**内側の Provider は外側の Context を読めます** が、逆はできません。

> **落とし穴:** Provider で包んだ範囲の **外** に置いたコンポーネント (例: `<Providers>` の兄弟に置いたヘッダー) からは、Provider の値は読めません。また、Provider を 2 か所に分けて置くと、それぞれが別の state や QueryClient を持つので、**同じデータを共有できなくなります**。

## テストでも Provider で囲む

テストのコードでも、`useQuery` や `useQueryStates` を使うコンポーネントは `QueryClientProvider` や `NuqsTestingAdapter` で囲む必要があります (Day 11 以降のテストで出てきます)。フック単体のテストでは `renderHook` の `wrapper` に Provider を渡します。

```tsx
render(
  <NuqsTestingAdapter searchParams="?page=2">
    <QueryClientProvider client={new QueryClient()}>
      <UserList />
    </QueryClientProvider>
  </NuqsTestingAdapter>,
);

const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
```

## Context の使いどころ

- 1〜2 階層の受け渡しなら、props のほうが「どこから来た値か」が明確です。
- Context が向いているのは、テーマ・ログイン中のユーザー・言語・**ライブラリのクライアント** など、アプリ全体の「環境」のような値です。
- 頻繁に変わる値を 1 つの大きな Context に入れると、読んでいる全員が毎回再レンダーされます。

## まとめ: 目標コードの裏側

```ts
const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);
```

→ nuqs は、上にある `NuqsAdapter` の Context から「URL の読み書きの方法」(Next.js 用・テスト用など) を受け取って動く。

```ts
const query = useQuery({ queryKey: [...], queryFn: ... });
```

→ `useQuery` は内部で `useQueryClient()` を呼び、`QueryClientProvider` の Context から QueryClient (キャッシュ) を受け取る。Provider がアプリ全体で 1 つなので、**別の画面で同じ queryKey を使うと同じキャッシュを共有できる**。

目標コードの `useSharedScopeQuery` 自体は Context を作っていませんが、`<Providers>` の中で使われることを前提にしたフックです。これで Level 2 (React) は終わりです。試験で理解を確かめましょう。
