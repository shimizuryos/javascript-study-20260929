## route-group-url

次のファイルのページを開く URL はどれですか?

```txt
app/(shop)/products/[id]/page.tsx
```

- [ ] `/(shop)/products/[id]`
- [ ] `/shop/products/123`
- [x] `/products/123`
- [ ] `/products?id=123`

> `(shop)` のように `( )` で囲んだフォルダは **ルートグループ** で、URL には現れません。`[id]` は動的セグメントなので、`/products/123` や `/products/abc` など何でも一致します。

## catch-all-params

`app/docs/[...slug]/page.tsx` で `/docs/react/hooks` を開いたとき、`params` (await した後) はどれですか?

- [x] `{ slug: ['react', 'hooks'] }`
- [ ] `{ slug: 'react/hooks' }`
- [ ] `{ slug: 'hooks' }`
- [ ] `{ react: 'hooks' }`

> `[...slug]` (キャッチオール) は、そこから後ろのセグメントを全部 **配列** で受け取ります。`/docs` だけ (0 個) には一致しません。0 個も許したいときは `[[...slug]]` と書きます。

## params-string

`app/users/[id]/page.tsx` で `/users/42` を開きました。`typeof id` の値はどれですか?

```tsx
export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(typeof id);
  // ...
}
```

- [ ] `'number'`
- [x] `'string'`
- [ ] `'object'`
- [ ] `'undefined'`

> URL から取り出した値は、数字に見えても常に **文字列** です。数値として使うなら `Number(id)` で変換します。「`id === 42` が false になる」という形のバグでよく出てきます。

## layout-nesting

次の 3 ファイルがあるとき、`/dashboard/settings` を開いた画面の構造として正しいのはどれですか?

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body><header>H</header>{children}</body></html>;
}

// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <section><nav>N</nav>{children}</section>;
}

// app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return <h1>設定</h1>;
}
```

- [x] `<body><header>H</header><section><nav>N</nav><h1>設定</h1></section></body>`
- [ ] `<body><section><nav>N</nav></section><header>H</header><h1>設定</h1></body>`
- [ ] `<body><h1>設定</h1></body>` (page が layout を置き換える)
- [ ] `<body><header>H</header><h1>設定</h1></body>` (近い layout は 1 つだけ使われる)

> layout はフォルダの階層どおりに **入れ子** になります。ルートレイアウトの `{children}` にダッシュボードの layout が入り、その `{children}` に page が入ります。

## hooks-in-server

`app/counter/page.tsx` に次のコードを書きました (`'use client'` は書いていません)。どうなりますか?

```tsx
import { useState } from 'react';

export default function CounterPage() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

- [ ] 問題なく動く (page は自動的に Client Component になる)
- [x] エラーになる。page は何も書かなければ Server Component で、`useState` や `onClick` は使えない
- [ ] 表示はされるが、ボタンを押しても数字は変わらない (エラーにはならない)
- [ ] `async` を付ければ動く

> App Router の page / layout は **デフォルトで Server Component** です。state やイベントが必要なら、その部分を `'use client'` のファイルに切り出します (またはこのファイルの先頭に `'use client'` を書きます)。Next.js は「`useState` は Client Component でしか使えない (`'use client'` を付けて)」という趣旨のエラーを出します。

## boundary-import

`page.tsx` (Server Component) が `users-table.tsx` を import し、`users-table.tsx` が `row-actions.tsx` を import しています。`row-actions.tsx` について正しい説明はどれですか?

```tsx
// users-table.tsx
'use client';
import { RowActions } from './row-actions';
// ...

// row-actions.tsx ('use client' は書いていない)
export function RowActions({ onDelete }: { onDelete: () => void }) {
  return <button onClick={onDelete}>削除</button>;
}
```

- [ ] `onClick` を使っているので、`row-actions.tsx` にも `'use client'` を書かないとエラーになる
- [x] `'use client'` のファイルから import されているので、書かなくてもクライアント側で動く
- [ ] Server Component として動くので、ボタンを押しても何も起きない
- [ ] `onDelete` は関数なので、どこからも渡せない

> `'use client'` は「ここからクライアント」という **境界の入口** の印です。入口のファイルが import したものは全部クライアント側に入るので、その先のファイルに毎回書く必要はありません。`onDelete` は Client Component (`users-table.tsx`) の中で作って渡すので問題ありません。

## serializable-props

Server Component の page から、Client Component の `<UserCard>` に props を渡します。**エラーになる** のはどれですか?

```tsx
// app/users/page.tsx (Server Component)
const user = await getUser('1');
```

- [ ] `<UserCard user={{ id: user.id, name: user.name }} />`
- [ ] `<UserCard tags={['admin', 'dev']} />`
- [ ] `<UserCard>{<p>{user.name}</p>}</UserCard>`
- [x] `<UserCard onSelect={(id) => console.log(id)} />`

> サーバーからブラウザへは props が **データとして送られる** ので、渡せるのは文字列・数値・配列・プレーンなオブジェクト・JSX などシリアライズできる値だけです。関数は送れません。イベントハンドラは Client Component の中で作ります。

## children-server

次の構成で、`Cart` (データを取得する async な Server Component) のコードはどこで実行されますか?

```tsx
// app/page.tsx (Server Component)
import { Modal } from './ui/modal'; // 'use client'
import { Cart } from './ui/cart';

export default function Page() {
  return (
    <Modal>
      <Cart />
    </Modal>
  );
}
```

- [x] サーバー。`Modal` には `Cart` の描画結果が `children` として届く
- [ ] ブラウザ。Client Component の中に置いたので Client Component になる
- [ ] サーバーとブラウザの両方
- [ ] エラーになる。Client Component の中に Server Component は置けない

> `<Cart />` を書いているのは Server Component の `Page` なので、`Cart` はサーバーで描画されます。`Modal` は `children` として **描画済みの結果** を受け取って表示するだけです。「Client Component から Server Component を import する」のは不可ですが、「children で渡す」のは可能です。

## query-client-state

`app/providers.tsx` のコードです。このコードの問題はどれですか?

```tsx
'use client';

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

- [ ] `'use client'` は不要なので消すべき
- [x] `Providers` が再レンダーされるたびに新しい QueryClient が作られ、キャッシュが消えてしまう
- [ ] `QueryClientProvider` は layout.tsx で直接使わなければならない
- [ ] `children` を渡すと中のページが全部 Client Component になってしまう

> コンポーネントの本体はレンダーのたびに実行されるので、`new QueryClient()` も毎回実行されます。`const [queryClient] = useState(() => new QueryClient());` と書けば、最初の 1 回だけ作ったものを使い続けられます。`children` として渡るページは Server Component のままです。

## link-default-import

Next.js の `Link` を使うための import として正しいのはどれですか?

- [x] `import Link from 'next/link';`
- [ ] `import { Link } from 'next/link';`
- [ ] `import { Link } from 'next/navigation';`
- [ ] `import Link from 'react';`

> `next/link` は `Link` を **default export** しているので、`{ }` を付けずに import します。`next/navigation` からは `useRouter` / `usePathname` / `useSearchParams` / `notFound` などを名前付きで import します。
