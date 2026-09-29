---
day: 10
level: 3
title: URL とレンダリング
summary: Promise で渡される params / searchParams の読み方、useSearchParams / useRouter / usePathname で URL を読み書きする方法、Suspense 境界、hydration とその不一致の原因を学ぶ。
minutes: 110
goals:
  - "const { id } = await params のように、Promise で渡される params / searchParams を読める"
  - "string | string[] | undefined の searchParams を、数値・文字列・配列に安全に変換できる"
  - "new URLSearchParams(searchParams) → set / delete → router.replace でクエリを更新するコードを読める"
  - useSearchParams を使う部品に Suspense 境界が必要な理由を説明できる
  - hydration の仕組みと、不一致 (hydration エラー) の典型的な原因・直し方を説明できる
readings:
  - title: Next.js — page.js (params / searchParams)
    url: https://nextjs.org/docs/app/api-reference/file-conventions/page
  - title: Next.js — useSearchParams
    url: https://nextjs.org/docs/app/api-reference/functions/use-search-params
  - title: Next.js — useRouter
    url: https://nextjs.org/docs/app/api-reference/functions/use-router
  - title: React — hydrateRoot
    url: https://ja.react.dev/reference/react-dom/client/hydrateRoot
  - title: MDN — URLSearchParams
    url: https://developer.mozilla.org/ja/docs/Web/API/URLSearchParams
---

## 今日のゴール

目標コードの `useSharedScopeQuery` は、**画面の状態 (scope / page / q) を URL のクエリに持たせる** フックです。

```ts
const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);
// ...
const setSearch = (text: string) => setParams({ q: text || null, page: null });
```

`useQueryStates` (nuqs) は Day 11 で学びますが、中でやっていることは今日の内容 — **URL のクエリを読み、型を整え、他のクエリを残したまま書き換える** — そのものです。今日は Next.js の素の API で同じことを手で書き、nuqs が何を肩代わりしてくれるのかを体感します。後半では、URL の値をサーバーとブラウザの両方で扱うときに起きる **hydration** の問題も学びます。

## URL の部品

```txt
/users/42?tab=posts&page=2
└─┬────┘ └──────┬────────┘
pathname      search (クエリ文字列)
```

| 部品 | 例 | Server Component で | Client Component で |
| --- | --- | --- | --- |
| パス | `/users/42` | `params` (`{ id: '42' }`) | `usePathname()` / `useParams()` |
| クエリ | `?tab=posts&page=2` | `searchParams` | `useSearchParams()` |

## Server Component で読む: params と searchParams は Promise

Next.js 15 から、page に渡される `params` と `searchParams` は **Promise** になりました。`await` してから中身を取り出します。

```tsx
// app/users/[id]/page.tsx
export default async function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { tab = 'profile' } = await searchParams;
  return <h1>ユーザー {id} ({tab})</h1>;
}
```

`(await searchParams).tab` のように、`await` を `( )` で囲んでその場でプロパティを読む書き方もよく見ます。

Next.js 16 では、props の型を自動生成してくれる **`PageProps`** も使えます (`next dev` / `next build` / `next typegen` で生成され、import 不要)。

```tsx
export default async function UserPage(props: PageProps<'/users/[id]'>) {
  const { id } = await props.params; // id: string と推論される
  const query = await props.searchParams;
  // ...
}
```

補足:

- layout には `searchParams` は渡されません (layout はページ移動で再レンダーされないため)。
- `'use client'` の page では `async` が使えないので、React の `use(params)` で Promise を読みます。

### 古い書き方 (Next.js 14 以前) の見分け方

社内コードの Next.js が古い場合、`params` は **ただのオブジェクト** です。

```tsx
// Next.js 14 以前: Promise ではない。async も await も無い
export default function UserPage({ params }: { params: { id: string } }) {
  return <h1>ユーザー {params.id}</h1>;
}
```

| 見分けるポイント | 14 以前 | 15 以降 |
| --- | --- | --- |
| 型 | `params: { id: string }` | `params: Promise<{ id: string }>` / `PageProps<'...'>` |
| 読み方 | `params.id` | `(await params).id` / `use(params)` |

Next.js 15 は移行期間として古い読み方も (警告付きで) 動きましたが、**16 で完全に廃止** されました。`package.json` の `next` のバージョンを見ればどちらか判断できます。また、`pages/` ディレクトリ + `useRouter` を `next/router` から import しているコードは、さらに古い Pages Router の書き方です。

## searchParams の値は `string | string[] | undefined`

URL はユーザーが自由に書き換えられるので、searchParams の値は 3 通りありえます。

| URL | `await searchParams` |
| --- | --- |
| `/shop?q=shoe` | `{ q: 'shoe' }` |
| `/shop?tag=a&tag=b` | `{ tag: ['a', 'b'] }` ← 同じキーが複数あると配列 |
| `/shop` | `{}` ← `q` は `undefined` |
| `/shop?page=abc` | `{ page: 'abc' }` ← 「数字の文字列」とは限らない |

そのまま使わず、**必要な型に変換する関数** を 1 か所に用意するのが定石です。

```ts
type Value = string | string[] | undefined;

const first = (v: Value) => (Array.isArray(v) ? v[0] : v);
const toArray = (v: Value) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

function toPage(v: Value): number {
  const n = Number(first(v));
  return Number.isInteger(n) && n >= 1 ? n : 1; // 不正な値なら 1 ページ目
}
```

> **落とし穴:** `Number(undefined)` は `NaN`、`Number('')` は `0`、`Number('2.5')` は `2.5` です。`Number.isInteger(n) && n >= 1` のように **範囲まで確認** しないと、`?page=abc` や `?page=0` で画面が壊れます。

目標コードの `parseAsInteger.withDefault(1)` (Day 11) は、まさにこの変換とデフォルト値をまとめて面倒見てくれる部品です。

## Client Component で読む: useSearchParams / usePathname

Client Component では `next/navigation` のフックを使います。

```tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export function CurrentFilter() {
  const pathname = usePathname(); // '/products' (クエリは含まない)
  const searchParams = useSearchParams(); // 読み取り専用の URLSearchParams
  const q = searchParams.get('q'); // string | null
  const tags = searchParams.getAll('tag'); // string[]
  return <p>{pathname} で「{q ?? 'なし'}」を検索中 (タグ: {tags.join(', ')})</p>;
}
```

| URL | `searchParams.get('q')` |
| --- | --- |
| `?q=shoe` | `'shoe'` |
| `?q=` | `''` (空文字) |
| `?page=2` | `null` ← サーバー側の `undefined` と違うので注意 |
| `?q=a&q=b` | `'a'` (最初の 1 つ。全部欲しいときは `getAll`) |

## URL を書き換える: useRouter

`useSearchParams()` が返す値は **読み取り専用** です。書き換えるときは **コピーを作ってから** 変更し、`useRouter()` で移動します。

```tsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeSort(sort: string) {
    const params = new URLSearchParams(searchParams); // ① コピー
    params.set('sort', sort); // ② sort だけ変える (他のクエリはそのまま)
    params.delete('page'); // ③ 条件が変わったら 1 ページ目へ
    router.push(`${pathname}?${params}`); // ④ 移動 (`${params}` は 'q=shoe&sort=new' になる)
  }

  return (
    <select onChange={(e) => changeSort(e.target.value)}>
      <option value="new">新しい順</option>
      <option value="old">古い順</option>
    </select>
  );
}
```

- `new URLSearchParams(searchParams.toString())` と書くコードもあります。意味は同じです。
- テンプレートリテラルの中の `${params}` は自動で `params.toString()` になります (先頭に `?` は付かない)。
- `useRouter` は **`next/navigation`** から import します。`next/router` は Pages Router 用で、App Router では使えません。

| メソッド | 履歴 | 使いどころ |
| --- | --- | --- |
| `router.push(url)` | 増える (「戻る」で前の状態へ) | ページ送り、タブ切り替え |
| `router.replace(url)` | 増えない (今の履歴を置き換え) | 検索欄の入力、フィルタの微調整 |

リンクとして置きたいときは、同じ URL を `` <Link href={`${pathname}?${params}`}> `` に渡します。

目標コードの `setParams({ q: text || null, page: null })` は、①〜④ をまとめて 1 行でやっている、と読めます (`null` は「URL から消す」の意味)。

## useSearchParams と Suspense 境界

Next.js はクエリを使わないページを **ビルド時に HTML にしておく (静的レンダリング)** ことがあります。ところがビルド時には「ユーザーがどんな `?q=...` で来るか」が分かりません。そこで `useSearchParams()` を使う Client Component は、**一番近い `<Suspense>` 境界まで、ブラウザで描画される** 扱いになります。

```tsx
// app/products/page.tsx (Server Component)
import { Suspense } from 'react';
import { SearchBox } from './search-box'; // 中で useSearchParams を使う

export default function ProductsPage() {
  return (
    <>
      <h1>商品一覧</h1> {/* ビルド時に HTML になる */}
      <Suspense fallback={<p>読み込み中…</p>}>
        <SearchBox /> {/* ブラウザで URL を読んでから描画される */}
      </Suspense>
    </>
  );
}
```

- `<Suspense>` が無いと、静的なページでは **本番ビルドがエラー** になります (開発サーバーでは動いてしまうので気づきにくい)。
- nuqs のフックも内部で URL を読むので、同じように `<Suspense>` で囲んでいるコードをよく見ます。
- page が `await searchParams` している (= リクエストごとに描画する動的なページ) なら必須ではありませんが、囲んでおいて害はありません。

## hydration: サーバーの HTML にブラウザが命を吹き込む

Day 9 で「Client Component もサーバーで一度描画される」と学びました。最初の表示はこう進みます。

1. **サーバー** が Server Component と Client Component を描画し、HTML を返す → ブラウザはすぐに表示できる (まだクリックには反応しない)
2. **ブラウザ** で JavaScript が読み込まれ、React が Client Component を **もう一度描画** して、既にある HTML と照らし合わせながらイベントハンドラを取り付ける
3. これが **hydration** (ハイドレーション)。2 の描画結果が 1 の HTML と **違う** と、React は hydration エラーを出し、その部分をブラウザで作り直す (ちらつき・state の消失の原因)

### 不一致の典型的な原因

| 原因 | 例 |
| --- | --- |
| 実行するたびに変わる値 | `new Date().toLocaleString()`、`Math.random()` |
| サーバーかブラウザかで分岐 | `typeof window === 'undefined' ? ... : ...` |
| ブラウザにしかない値をレンダー中に読む | `localStorage.getItem('theme')`、`window.innerWidth` |
| 不正な HTML の入れ子 | `<p>` の中に `<div>`、`<a>` の中に `<a>` (ブラウザが HTML を勝手に直すため、形が変わる) |

> **落とし穴:** Server Component の中で `new Date()` を使っても hydration エラーにはなりません。Server Component はブラウザで描画し直されず、サーバーの結果がそのまま使われるからです。問題になるのは **Client Component のレンダー中** に、サーバーとブラウザで違う値を作る場合です。

### 直し方 1: useEffect で「表示の後に」ブラウザの値を読む

```tsx
'use client';

import { useEffect, useState } from 'react';

export function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    setNow(new Date().toLocaleTimeString()); // useEffect はブラウザでだけ、hydration の後に動く
  }, []);
  return <p>{now ?? '--:--:--'}</p>; // サーバーと最初の描画はどちらも '--:--:--'
}
```

### 直し方 2: useSyncExternalStore の 3 つ目の引数

外部の値 (localStorage など) を読むためのフック `useSyncExternalStore` は、**サーバーと hydration 中に使う値** を 3 つ目の引数 (`getServerSnapshot`) で渡せます。

```tsx
'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

export function useTheme() {
  return useSyncExternalStore(
    subscribe,
    () => localStorage.getItem('theme') ?? 'light', // ブラウザでの値
    () => 'light', // サーバーと hydration 中の値 (HTML と一致させる)
  );
}
```

hydration が終わると React は自動で 2 つ目の関数の値に切り替えて描画し直します。

### 直し方 3: suppressHydrationWarning (時刻表示などの最後の手段)

```tsx
<time dateTime={iso} suppressHydrationWarning>
  {new Date(iso).toLocaleString()}
</time>
```

その要素の **直下のテキスト・属性だけ** 不一致の警告を出さなくする「逃げ道」です。子要素には効かないので、多用はしません。

## まとめ: URL を書き換える 3 行を読む

実務のコードでは、次の 3 行を何度も見かけます。

```ts
const params = new URLSearchParams(searchParams);
params.set('page', String(next));
router.replace(`${pathname}?${params}`);
```

1. `useSearchParams()` の値は読み取り専用なので、**コピー** を作る
2. `page` だけを書き換える。**他のクエリ (q や scope) はそのまま残る**
3. 同じパスのまま、履歴を増やさずに URL を置き換える

URL が変わると `useSearchParams()` を使っているコンポーネントが再描画され、新しい値で画面が更新されます。目標コードでは、この一連の流れを nuqs の `setParams({ page: next.pageIndex + 1 })` が 1 行で行っています。明日は、その nuqs を学びます。
