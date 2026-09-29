---
day: 9
level: 3
title: App Router の基本
summary: app/ ディレクトリのファイル構成が URL になる仕組み、layout と page、Server Component と Client Component、'use client' の境界、Provider を置く場所を学ぶ。
minutes: 110
goals:
  - "app/users/[id]/page.tsx のようなファイルパスから、対応する URL と params を答えられる"
  - layout.tsx が children で page を包む入れ子の構造を説明できる
  - Server Component と Client Component の違い (できること・できないこと) を説明できる
  - "'use client' が「境界の入口」を示す宣言であることと、props で渡せる値の制限を説明できる"
  - "app/providers.tsx ('use client') を app/layout.tsx から使う Provider パターンを読める"
readings:
  - title: Next.js — Layouts and Pages
    url: https://nextjs.org/docs/app/getting-started/layouts-and-pages
  - title: Next.js — Project Structure
    url: https://nextjs.org/docs/app/getting-started/project-structure
  - title: Next.js — Dynamic Route Segments
    url: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
  - title: Next.js — Linking and Navigating
    url: https://nextjs.org/docs/app/getting-started/linking-and-navigating
  - title: Next.js — Server and Client Components
    url: https://nextjs.org/docs/app/getting-started/server-and-client-components
---

## 今日のゴール

今日から Level 3 (Next.js) です。目標コードの **1 行目** はこうなっています。

```ts
'use client';
```

ただの文字列に見えますが、Next.js ではとても大事な意味があります。今日の内容で **「このファイルはクライアント側 (ブラウザでも動く側) のコード。中でフック (`useQuery` / `useQueryStates` / `useMemo`) を使っているから」** と読めるようになり、さらに「このフックを使う画面のファイル構成」と「フックが動くために `app/layout.tsx` に何が必要か」まで説明できるようになります。

> Next.js はバージョンで書き方が変わります。この教材は **Next.js 16 の App Router** (`app/` ディレクトリ) が前提です。社内コードに `pages/` ディレクトリや `getServerSideProps` があれば、それは古い **Pages Router** の書き方です。

## ファイルの置き場所がそのまま URL になる

App Router では **`app/` の下のフォルダ構成 = URL** です (ファイルベースルーティング)。

```txt
app/
├─ layout.tsx               … 全ページ共通の枠 (ルートレイアウト。必須)
├─ page.tsx                 … /
├─ users/
│  ├─ page.tsx              … /users
│  ├─ users-table.tsx       … page ではないので URL にならない (置いておくだけ)
│  └─ [id]/
│     └─ page.tsx           … /users/1, /users/abc, ...
├─ docs/
│  └─ [...slug]/page.tsx    … /docs/a, /docs/a/b, ...
├─ (marketing)/
│  └─ about/page.tsx        … /about  ← (marketing) は URL に出ない
└─ _components/             … _ で始まるフォルダはルーティングの対象外
```

- **フォルダ** が URL の 1 区切り (セグメント) になり、**`page.tsx`** を置いたフォルダだけが実際に開けるページになります。
- `page.tsx` 以外のファイル (`users-table.tsx` など) を同じフォルダに置いても URL にはなりません。関連ファイルをページの近くにまとめて置けます。

### 動的セグメント `[id]` と params

フォルダ名を `[ ]` で囲むと「そこには何が来てもよい」という **動的セグメント** になり、実際の値が `params` としてページに渡されます。

| フォルダ | URL の例 | `params` |
| --- | --- | --- |
| `app/users/[id]` | `/users/42` | `{ id: '42' }` |
| `app/shop/[category]/[item]` | `/shop/shoes/7` | `{ category: 'shoes', item: '7' }` |
| `app/docs/[...slug]` | `/docs/react/hooks` | `{ slug: ['react', 'hooks'] }` |
| `app/docs/[...slug]` | `/docs` | (一致しない) |
| `app/docs/[[...slug]]` | `/docs` | `{ slug: undefined }` |

- `[...slug]` (キャッチオール) は「残りのセグメント全部」を **配列** で受け取ります。1 つ以上必要です。
- `[[...slug]]` (オプショナル キャッチオール) は 0 個でも一致します。

> **落とし穴:** URL から来る値は **いつも文字列** です。`/users/42` でも `id` は `42` ではなく `'42'`。数値として使うなら `Number(id)` で変換します。

### ルートグループ `(group)`

`(marketing)` のように `( )` で囲んだフォルダは **URL に出ません**。「URL は変えずに、一部のページだけに共通の layout を付けたい」ときに使います。

```txt
app/(shop)/layout.tsx         … /cart と /products だけを包む layout
app/(shop)/cart/page.tsx      … /cart
app/(shop)/products/page.tsx  … /products
app/(marketing)/about/page.tsx … /about (shop の layout は付かない)
```

## page.tsx と layout.tsx

**page** はその URL 固有の画面、**layout** は複数のページで共有する枠です。どちらも `export default` でコンポーネントを書きます。

```tsx
// app/layout.tsx … ルートレイアウト (必須。<html> と <body> を含む)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header>社内ツール</header>
        {children}
      </body>
    </html>
  );
}
```

```tsx
// app/users/layout.tsx … /users 以下を包む layout
export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <h2>ユーザー管理</h2>
      {children}
    </section>
  );
}
```

```tsx
// app/users/[id]/page.tsx
export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // params は Promise (Day 10 で詳しく)
  return <h1>ユーザー {id}</h1>;
}
```

`/users/42` を開くと、Next.js はこれらを **外側から順に入れ子** にして描画します。`children` に「内側の layout または page」が入る、と読みます (Day 5 の children と同じ仕組みです)。

```tsx
<RootLayout>
  <UsersLayout>
    <UserPage params={Promise.resolve({ id: '42' })} />
  </UsersLayout>
</RootLayout>
```

layout はページを移動しても **作り直されません** (state が保たれ、再レンダーもされない)。サイドバーやヘッダーを layout に置くのはこのためです。

### loading.tsx / error.tsx / not-found.tsx

同じフォルダに置くと、特定の場面で表示される特別なファイルです。

| ファイル | いつ表示されるか |
| --- | --- |
| `loading.tsx` | page の読み込み (データ取得) 中。中身は `<Suspense>` の fallback |
| `error.tsx` | page でエラーが投げられたとき。**必ず `'use client'`**。props は `error` と `retry` (古いコードでは `reset`) |
| `not-found.tsx` | page の中で `notFound()` (`next/navigation`) を呼んだとき |

実際にはこう組み立てられます (概念図)。

```tsx
<Layout>
  <ErrorBoundary fallback={<Error />}>
    <Suspense fallback={<Loading />}>
      <NotFoundBoundary fallback={<NotFound />}>
        <Page />
      </NotFoundBoundary>
    </Suspense>
  </ErrorBoundary>
</Layout>
```

## `<Link>` でページを移動する

ページ間の移動には `next/link` の `Link` を使います (**default export** なので `{ }` を付けずに import)。

```tsx
import Link from 'next/link';

<Link href="/users">一覧へ</Link>
<Link href={`/users/${user.id}`}>{user.name}</Link>
<Link href={{ pathname: '/users', query: { page: 2 } }}>2 ページ目</Link>
```

- 描画結果は普通の `<a>` タグですが、クリックすると **ページ全体を読み込み直さずに** 中身だけ差し替えます。画面に入ったリンク先は先読み (prefetch) もされます。
- 普通の `<a href>` で書くとページ全体が読み込み直され、layout の state も消えます。

## Server Components と Client Components

App Router の page や layout は、**何も書かなければ Server Component** です。Server Component は **サーバーでだけ実行され、コードはブラウザに送られません**。

```tsx
// app/users/page.tsx … 'use client' が無い = Server Component
import { db } from '@/lib/db';

export default async function UsersPage() {
  const users = await db.user.findMany(); // サーバーで直接 DB を読める
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

一方、クリックや入力に反応するには、ファイルの先頭に `'use client'` を書いた **Client Component** が必要です。

```tsx
// app/ui/like-button.tsx
'use client';

import { useState } from 'react';

export function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  return <button onClick={() => setLikes(likes + 1)}>♥ {likes}</button>;
}
```

|  | Server Component | Client Component |
| --- | --- | --- |
| `async` にして `await` でデータ取得 | できる | できない |
| DB・秘密の API キーを使う | できる | できない (ブラウザに漏れる) |
| `useState` / `useEffect` / 自作フック | **できない** | できる |
| `onClick` などのイベント | **できない** | できる |
| `window` / `localStorage` | できない | できる (ただし Day 10 の注意あり) |
| コードがブラウザに送られる | 送られない | 送られる |

> **落とし穴:** Client Component は「ブラウザでだけ動く」わけではありません。最初の表示では **サーバーでも一度 HTML に描画され**、その後ブラウザでもう一度動きます (Day 10 の hydration)。「Client = ブラウザ **でも** 動く」と覚えてください。

## `'use client'` の境界ルール

### 1. `'use client'` は「ここからクライアント」という入口の印

`'use client'` はファイルの **先頭 (import より前)** に書きます。そのファイルが **import しているもの全部** がクライアント側に入るので、その先のファイルには書かなくてかまいません。

```txt
app/users/page.tsx                (Server)
└─ import UsersTable
   users-table.tsx  'use client'  ← ここが境界の入口
   ├─ import useSharedScopeQuery  (クライアント側に入る)
   └─ import Pagination           ('use client' が無くてもクライアント側)
```

### 2. Server → Client へは props で渡す。渡せるのはシリアライズできる値だけ

Server Component の描画結果はデータとしてブラウザへ送られます。そのため props に渡せるのは **文字列・数値・真偽値・null・配列・プレーンなオブジェクト・JSX** などで、**関数は渡せません**。

```tsx
// app/posts/[id]/page.tsx (Server Component)
<LikeButton initialLikes={post.likes} />            // ○ 数値
<UserCard user={{ id: 1, name: 'Alice' }} />        // ○ プレーンなオブジェクト
<LikeButton onLike={() => console.log('liked')} />  // × 関数はサーバーから渡せない
```

`onClick` のような関数は、Client Component の **中で** 作ります。

### 3. Client Component の中に Server Component を置くには children で渡す

Client Component のファイルから Server Component を import することはできません (import したものは全部クライアント側になるため)。代わりに **Server Component 側で組み立てて `children` として渡します**。

```tsx
// app/page.tsx (Server Component)
import { Modal } from './ui/modal'; // 'use client'
import { Cart } from './ui/cart'; // Server Component (async でデータ取得)

export default function Page() {
  return (
    <Modal>
      <Cart />
    </Modal>
  );
}
```

`Cart` はサーバーで描画され、`Modal` には **描画済みの結果** が `children` として届きます。`Modal` は `Cart` のコードを知りません。

## Provider はどこに置く? (Day 11・12 の前提)

`useQuery` (TanStack Query) や `useQueryStates` (nuqs) は、上のどこかに **Provider** (Day 8) がないと動きません。ところが Context は Server Component では使えず、`app/layout.tsx` は Server Component です。そこで次の 2 ファイルに分けるのが定番です。

```tsx
// app/providers.tsx
'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </QueryClientProvider>
  );
}
```

```tsx
// app/layout.tsx (Server Component のまま)
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

読み方のポイント:

1. `providers.tsx` は Context と `useState` を使うので `'use client'` が必要。
2. `useState(() => new QueryClient())` — QueryClient (キャッシュの入れ物) を **最初の 1 回だけ** 作る。本体に `new QueryClient()` と直接書くと、再レンダーのたびにキャッシュが空になる。
3. `layout.tsx` は `Providers` を import して `children` を包むだけ。**`children` として渡る各ページは Server Component のまま**です (ルール 3)。
4. TanStack Query の公式ガイド (Advanced Server Rendering) では、`useState` の代わりに `isServer` (`typeof window === 'undefined'` と同じ判定) でサーバーかどうかを分岐する `getQueryClient()` 関数を使う書き方も紹介されています。どちらも「ブラウザでは 1 つを使い回す」ための工夫です。

## まとめ: 目標コードの 1 行目を読む

```ts
'use client';
```

1. ファイル先頭の文字列は **ディレクティブ** (Next.js / React への指示)。
2. このファイルは `useMemo` / `useQuery` / `useQueryStates` という **フック** を呼ぶので、Client Component からしか使えない。`'use client'` はその目印になっている。
3. 実際の画面ではこう使われます。

```txt
app/layout.tsx          (Server) … <Providers> で全体を包む
app/providers.tsx       'use client' … QueryClientProvider + NuqsAdapter
app/users/page.tsx      (Server) … <UsersTable /> を置くだけ
app/users/users-table.tsx 'use client' … useSharedScopeQuery('users', fetchUsers) を呼ぶ
```

「page は Server、フックを使う部分は `'use client'` のファイルに切り出し、Provider は layout から包む」という形が見えれば今日は十分です。次はクイズと演習で確認しましょう。
