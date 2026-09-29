## route-file

App Router のプロジェクトで、URL `/users/42` を表示するファイルはどれですか?

- [ ] `app/users/42.tsx`
- [x] `app/users/[id]/page.tsx`
- [ ] `app/users/[id]/layout.tsx`
- [ ] `app/users.tsx`

> App Router では **フォルダが URL の区切り** に対応し、その中の `page.tsx` がページになります。`[id]` は動的セグメントで、`42` の部分が `id` として渡されます。`layout.tsx` はページを包む枠で、単独ではページになりません。

## catch-all

`app/docs/[...slug]/page.tsx` のページを URL `/docs/react/hooks` で開いたとき、`await params` の値はどれですか?

- [x] `{ slug: ['react', 'hooks'] }`
- [ ] `{ slug: 'react/hooks' }`
- [ ] `{ slug: 'hooks' }`
- [ ] `['react', 'hooks']`

> `[...slug]` はキャッチオール (catch-all) セグメントで、残りの区切りを **配列** で受け取ります。`params` はオブジェクトで、キー名はフォルダ名の `slug` です。

## layout-children

URL `/dashboard/settings` を開いたとき、次のレイアウトの `children` に入るのはどれですか?

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>メニュー</nav>
      <main>{children}</main>
    </div>
  );
}
```

- [x] `app/dashboard/settings/page.tsx` が返す内容
- [ ] `app/layout.tsx` (ルートレイアウト) が返す内容
- [ ] URL に関係なく、いつも `app/dashboard/page.tsx` が返す内容
- [ ] 何も入らない (レイアウトでは `children` は使えない)

> レイアウトは、同じフォルダ以下のページを包む枠です。`/dashboard/settings` では、`app/dashboard/settings/page.tsx` の内容が `children` として渡されます。`/dashboard/a` から `/dashboard/b` に移動しても、レイアウト (`<nav>` など) は作り直されずに残ります。

## needs-use-client

`'use client'` を **付ける必要がある** コンポーネントはどれですか?

- [ ] `async function Page() { const users = await getUsers(); return <ul>...</ul>; }`
- [x] `function LikeButton() { const [liked, setLiked] = useState(false); return <button onClick={() => setLiked(true)}>...</button>; }`
- [ ] `function Title({ text }: { text: string }) { return <h1>{text}</h1>; }`
- [ ] `export default function RootLayout({ children }) { return <html lang="ja"><body>{children}</body></html>; }`

> App Router のコンポーネントは、何も書かなければ Server Component です。`useState` などのフックや `onClick` のようなイベント処理はブラウザで動かす必要があるので、`'use client'` が必要です。データを `await` で取ってくるだけのコンポーネントや、props を表示するだけのコンポーネントは Server Component のままで動きます。

## client-boundary

`Label.tsx` には `'use client'` がありません。`Label` について正しいのはどれですか?

```tsx
// components/Counter.tsx
'use client';
import { useState } from 'react';
import { Label } from './Label';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      <Label count={count} />
    </button>
  );
}

// components/Label.tsx
export function Label({ count }: { count: number }) {
  return <span>{count} 回</span>;
}
```

- [x] Client Component の `Counter` から import されているので、`Label` もクライアント側で動き、`count` の変化が表示に反映される
- [ ] `'use client'` が無いので Server Component のままになり、`Counter` の中では使えない
- [ ] `Label.tsx` にも `'use client'` を書かないとエラーになる
- [ ] `Label` はサーバーでしか実行されないので、ボタンを押しても `0 回` のまま

> `'use client'` は「ここから先はクライアント側」という **境界** の目印です。境界のファイルが import したモジュールも、クライアント用のコードに含まれます。そのため `Label` に `'use client'` を書く必要はありません。

## providers-file

次のように、Provider を `'use client'` 付きの別ファイルにまとめてからルートレイアウトで使う理由として、最も適切なのはどれですか?

```tsx
// app/providers.tsx
'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [x] Provider は state や Context を使うのでクライアント側で動かす必要がある。小さな Client Component に切り出せば、レイアウト自体は Server Component のままにできる
- [ ] `<Providers>` で囲むと、その下のページがすべて Client Component になるので、ページに `'use client'` を書かずに済む
- [ ] `QueryClient` はサーバーでしか作れないので、別ファイルにする必要がある
- [ ] `layout.tsx` が 2 回実行されるのを防ぐため

> Context の Provider はクライアント側の機能なので `'use client'` が必要です。それを `providers.tsx` に閉じ込めると、`layout.tsx` は Server Component のまま使えます。`children` として渡されたページは、Provider の中に置かれても Server Component のままです (props として渡されたものは境界を越えても変わらない)。

## params-promise

Next.js 16 で URL `/users/42` を開いたとき、`id` の値はどれですか?

```tsx
// app/users/[id]/page.tsx
export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <h1>ユーザー {id}</h1>;
}
```

- [ ] `42` (数値)
- [x] `'42'` (文字列)
- [ ] `Promise { '42' }`
- [ ] `undefined`

> Next.js 15 以降、`params` は Promise なので `await` してから取り出します (`await` 済みなので Promise ではありません)。URL から取り出した値は **常に文字列** です。数値として使いたいときは `Number(id)` などで変換します。

## search-params-client

URL が `/products?q=shoe&page=3` のとき、`sort` の値と、`goNext()` を実行した後の URL の組み合わせはどれですか?

```tsx
'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function Pager() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const sort = searchParams.get('sort');
  const goNext = () => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '4');
    router.push(`${pathname}?${params.toString()}`);
  };
  // ...
}
```

- [x] `sort` は `null`、URL は `/products?q=shoe&page=4`
- [ ] `sort` は `undefined`、URL は `/products?q=shoe&page=4`
- [ ] `sort` は `null`、URL は `/products?page=4`
- [ ] `sort` は `''`、URL は `?page=4`

> `URLSearchParams` の `get` は、キーが無いと `null` を返します (`undefined` ではありません)。`new URLSearchParams(searchParams)` で今のクエリをコピーしてから `page` だけを書き換え、`pathname` と組み合わせて移動しているので、`q=shoe` は残ります。

## suspense-search-params

静的にレンダリングされるページで、`useSearchParams` を使う Client Component を置くときに必要なことはどれですか?

- [x] そのコンポーネントを `<Suspense fallback={...}>` で囲む (囲まないとビルド時にエラーになる)
- [ ] `useSearchParams` を `useEffect` の中で呼ぶ
- [ ] そのコンポーネントに `'use server'` を付ける
- [ ] 何もしなくてよい (Next.js が自動で処理する)

> 静的レンダリングでは、ビルド時にはクエリ文字列がわかりません。`useSearchParams` を使う部分を `<Suspense>` で囲むと、その部分だけをブラウザで描画し、残りは事前に HTML にできます。囲まないと、ビルド時に「Suspense 境界が無い」というエラーになります。

## hydration-mismatch

次の Client Component をページに置くと、開発中のブラウザのコンソールに警告が出ることがあります。原因として正しいのはどれですか?

```tsx
'use client';

export function Clock() {
  return <p>現在時刻: {new Date().toLocaleTimeString()}</p>;
}
```

- [x] サーバーで作った HTML と、ブラウザでの最初の描画 (hydration) で時刻が違い、内容が一致しないから
- [ ] `'use client'` があるのでサーバーでは実行されず、HTML が空になるから
- [ ] Client Component では `Date` が使えないから
- [ ] `<p>` の中に文字列と `{}` を混ぜて書いているから

> Client Component も、最初の HTML はサーバーで作られます。ブラウザはその HTML に React をつなぐ (hydration) とき、同じ内容が描画されることを期待します。時刻や `Math.random()` のように実行するたびに変わる値を描画すると一致しません (hydration mismatch)。ブラウザでだけ決まる値は、`useEffect` の中で state にセットして表示するのが定番の直し方です。
