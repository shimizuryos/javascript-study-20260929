---
day: 11
level: 4
title: nuqs — URL に置く useState
summary: useQueryState / useQueryStates とパーサー (parseAsInteger.withDefault(1) など) で、「URL のクエリ文字列を state として読み書きする」コードを読めるようにする。
minutes: 120
goals:
  - useQueryState が「値を URL のクエリに置く useState」だと説明できる
  - "parseAsInteger.withDefault(1) のようなパーサーの役割と、withDefault で型から null が消える理由がわかる"
  - "setParams({ q: text || null, page: null }) を実行したあとの URL を予想できる"
  - "{ [SCOPE_KEYS.page]: parseAsInteger.withDefault(1) } のようなパーサーのオブジェクトと useQueryStates を読める"
  - NuqsAdapter を置く場所と、テストでは NuqsTestingAdapter を使うことを説明できる
readings:
  - title: nuqs — Basic usage
    url: https://nuqs.dev/docs/basic-usage
  - title: nuqs — Parsers
    url: https://nuqs.dev/docs/parsers
  - title: nuqs — Options
    url: https://nuqs.dev/docs/options
  - title: nuqs — Adapters
    url: https://nuqs.dev/docs/adapters
  - title: nuqs — Testing
    url: https://nuqs.dev/docs/testing
---

## 今日のゴール

> 今日は冒頭で **Level 3 試験 (Next.js)** があります。先に試験を済ませてからレッスンに進みましょう。

目標コードの 19〜23 行目・37 行目・53〜54 行目を読めるようにします。

```ts
const scopeParsers = {
  [SCOPE_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'),
  [SCOPE_KEYS.page]: parseAsInteger.withDefault(1),
  [SCOPE_KEYS.q]: parseAsString,
};

const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);

const setScope = (next: Scope) => setParams({ scope: next, page: null });
const setSearch = (text: string) => setParams({ q: text || null, page: null });
```

今日の終わりには「URL が `?scope=mine&page=3` なら scope は `'mine'`、page は `3`、q は `null`。`setSearch('react')` を呼ぶと URL は `?scope=mine&q=react` になる」と説明できるようになります。

## なぜ state を URL に置くのか

一覧画面の「今のページ」「検索語」「絞り込み」を `useState` に入れると、リロードやリンクの共有で消えてしまいます。URL のクエリ文字列 (`?page=3&q=react`) に置けば、

- リロードしても同じ画面が出る
- URL を送れば、相手も同じ条件で開ける
- ブラウザの「戻る」で前の条件に戻れる

Day 10 の `useSearchParams` + `useRouter` で自分で書くと、こうなります。

```tsx
const searchParams = useSearchParams();
const router = useRouter();
const pathname = usePathname();

const page = Number(searchParams.get('page') ?? '1'); // 文字列 → 数値の変換を毎回書く (?page=abc なら NaN)
const setPage = (next: number) => {
  const params = new URLSearchParams(searchParams); // 他のクエリを消さないようにコピー
  params.set('page', String(next));
  router.push(`${pathname}?${params}`);
};
```

文字列と値の変換、不正な値の扱い、他のキーを消さない工夫……を毎回書くのは大変です。**nuqs** はこれを `useState` と同じ形のフックにまとめたライブラリです。

## useQueryState — URL 版の useState

```tsx
'use client';
import { parseAsInteger, useQueryState } from 'nuqs';

export function Pager() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  return (
    <>
      <p>{page} ページ目</p>
      <button onClick={() => setPage(page + 1)}>次へ</button>
    </>
  );
}
```

| | `useState(1)` | `useQueryState('page', parser)` |
| --- | --- | --- |
| 値の置き場所 | コンポーネントのメモリ | URL の `?page=...` |
| 第 1 引数 | 初期値 | クエリのキー名 |
| 第 2 引数 | なし | **パーサー** (文字列 ⇔ 値の変換方法) |
| 戻り値 | `[値, 更新関数]` | `[値, 更新関数]` (同じ形) |

同じキーを読むコンポーネントが複数あっても、全員が同じ値を受け取ります (置き場所が URL 1 つだけなので)。

## アダプター — 「どのルーターの URL か」を渡す

nuqs は Next.js 以外 (React Router など) でも動くので、「URL をどう読み書きするか」を **アダプター** という Provider で渡します。Day 8 の Provider パターンそのものです。

```tsx
// app/layout.tsx (ルートレイアウト。Server Component のままでよい)
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
```

実務では Day 9 の `providers.tsx` (`'use client'` の Provider まとめ) の中に `QueryClientProvider` などと一緒に並んでいることもよくあります。Next.js 用のアダプターは内部で `useSearchParams` を使うので、Day 10 の「Suspense で囲む」話もそのまま当てはまります。

テストではブラウザの URL の代わりに **`NuqsTestingAdapter`** で囲みます。

```tsx
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';

const onUrlUpdate = vi.fn();
render(
  <NuqsTestingAdapter searchParams="?page=3" onUrlUpdate={onUrlUpdate} hasMemory>
    <Pager />
  </NuqsTestingAdapter>,
);
// URL が書き換わるたびに onUrlUpdate({ searchParams, queryString: '?page=4', options }) が呼ばれる
```

- `searchParams` … 最初の URL のクエリ
- `onUrlUpdate` … URL が更新されるたびに呼ばれる。`vi.fn()` を渡して中身を確かめる
- `hasMemory` … 更新後の URL を覚えておく。付けないと毎回「最初の URL」を元に計算されるので、何度も更新するテストでは付けます

> **落とし穴:** アダプターで囲み忘れると `[nuqs] nuqs requires an adapter to work with your framework.` というエラーになります。

## パーサー — 文字列 ⇔ 値の変換

URL の中身は常に文字列です。パーサーは「URL の文字列 → 値」(parse) と「値 → URL の文字列」(serialize) の組です。

| パーサー | URL | 値 | 型 |
| --- | --- | --- | --- |
| `parseAsString` | `?q=react` | `'react'` | `string` |
| `parseAsInteger` | `?page=3` | `3` | `number` |
| `parseAsBoolean` | `?open=true` | `true` | `boolean` |
| `parseAsStringLiteral(SCOPES)` | `?scope=mine` | `'mine'` | `'all' \| 'mine' \| 'team'` |
| `parseAsArrayOf(parseAsString)` | `?tags=a,b` | `['a', 'b']` | `string[]` |
| `parseAsIsoDate` | `?from=2026-09-01` | `Date` | `Date` |

- キーが無いときや、変換できないとき (`?page=abc`) の値は **`null`** です。型も `number | null` になります。
- 第 2 引数を省略すると、`parseAsString` と同じ (`string | null`) です。

`parseAsStringLiteral` には、Day 3 の `as const` で作った配列を渡します。

```ts
export const SCOPES = ['all', 'mine', 'team'] as const;
parseAsStringLiteral(SCOPES); // 値の型は 'all' | 'mine' | 'team'。?scope=admin は null になる
```

URL は誰でも書き換えられるので、「想定外の値を型の外に出さない」ことが大事です。

## withDefault — null を消す

```ts
const [a] = useQueryState('page', parseAsInteger); // a: number | null
const [b] = useQueryState('page', parseAsInteger.withDefault(1)); // b: number
```

- キーが無い / 変換できないときは、`null` の代わりにデフォルト値を返します
- 型から `null` が消えるので、`page + 1` とそのまま計算できます
- **デフォルト値は URL に書き込まれません。**「page が無い = 1 ページ目」として扱います

さらに、デフォルト値と **同じ値をセットすると、キーが URL から消えます** (オプション `clearOnDefault`。既定で `true`)。

```ts
// URL: ?page=3&q=ts
setPage(1); // URL: ?q=ts   (page は消える。値は 1)
```

「`?page=1` の URL」と「page が無い URL」の 2 通りができるのを防ぎ、URL を短く保つための仕組みです。

> **落とし穴:** 目標コードの `q` は `parseAsString` (withDefault なし) なので `string | null` です。25 行目の `q: string | null` はここから来ています。

## 更新関数のルール

```ts
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

setPage(5); // ?page=5
setPage((old) => old + 1); // 関数型更新 (Day 6 と同じ)。old はデフォルト適用後の値
setPage(null); // キーを URL から消す → 値はデフォルトの 1
await setPage(2); // Promise を返す。URL の書き換えが終わると解決する
```

- 値は **すぐに** 画面へ反映されますが、URL の書き換えは少し後にまとめて行われます (ブラウザの制限を避けるため間引きされる)。テストで URL を確かめるときは `waitFor` で待ちます。
- 戻り値は `Promise<URLSearchParams>` です。目標コード 50 行目の `void setParams(...)` の `void` は「この Promise は待たずに捨てる」と明示する書き方です。

## useQueryStates — 複数のキーをまとめて扱う

```ts
const [{ scope, page, q }, setParams] = useQueryStates({
  scope: parseAsStringLiteral(SCOPES).withDefault('all'),
  page: parseAsInteger.withDefault(1),
  q: parseAsString,
});
// scope: 'all' | 'mine' | 'team', page: number, q: string | null
```

引数は「キー名 → パーサー」のオブジェクト、戻り値は `[値のオブジェクト, 更新関数]` です。更新関数は **変えたいキーだけ** を渡す部分更新です。

```ts
// URL: ?scope=mine&page=3&q=react
setParams({ page: 4 }); // ?scope=mine&page=4&q=react (他はそのまま)
setParams({ q: 'next', page: null }); // ?scope=mine&q=next
setParams((old) => ({ page: old.page + 1 })); // 関数型更新。返すのは変えたいキーだけ
setParams(null); // このフックが扱うキー (scope/page/q) を全部消す
```

このフックが知らないキー (`?tab=info` など) は、どの場合も残ります。

### 計算されたキー

目標コードは、キー名を定数から取っています。

```ts
export const SCOPE_KEYS = { scope: 'scope', page: 'page', q: 'q' } as const;

const scopeParsers = {
  [SCOPE_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'),
  [SCOPE_KEYS.page]: parseAsInteger.withDefault(1),
  [SCOPE_KEYS.q]: parseAsString,
};
```

`[SCOPE_KEYS.page]` は Day 2 の計算されたキーです。`as const` のおかげで `SCOPE_KEYS.page` の型は `string` ではなく `'page'` なので、結果は `{ scope: ..., page: ..., q: ... }` と書いたのと **値も型も同じ** になります。クエリ名を定数にまとめておくと、複数の画面やリンクで同じ名前を使うときに打ち間違いを防げます。

### パーサーはコンポーネントの外で定義する

`scopeParsers` はファイルのトップレベル (関数の外) にあります。1 回だけ作られて参照が変わらず (Day 7)、他のファイルからも使い回せます。そして、型を取り出すこともできます。

```ts
import { type inferParserType } from 'nuqs';

type ScopeParams = inferParserType<typeof scopeParsers>;
// { scope: 'all' | 'mine' | 'team'; page: number; q: string | null }
```

目標コード 25 行目の `ScopeParams` は、これと同じ型を手で書いたものです。

## オプション — history と shallow

```ts
setPage(2, { history: 'push' }); // この 1 回だけ
parseAsInteger.withDefault(1).withOptions({ history: 'push' }); // このキーはいつも
useQueryStates(scopeParsers, { history: 'push' }); // このフック全体
```

| オプション | 既定値 | 意味 |
| --- | --- | --- |
| `history` | `'replace'` | `'push'` にすると履歴に積まれ、「戻る」で前の値に戻れる |
| `shallow` | `true` | URL だけ書き換え、サーバー側 (Server Components) は再実行しない。`false` にするとサーバーで `searchParams` を読むページも再レンダーされる |
| `clearOnDefault` | `true` | デフォルト値と同じならキーを消す |

目安は「ページ番号のように『戻る』で戻りたいものは `push`、検索語のように 1 文字ごとに変わるものは `replace`」です。

## まとめ: 目標コードを分解する

```ts
const scopeParsers = {
  [SCOPE_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'),
  [SCOPE_KEYS.page]: parseAsInteger.withDefault(1),
  [SCOPE_KEYS.q]: parseAsString,
};
```

1. キーは `'scope'` / `'page'` / `'q'` (計算されたキー)
2. scope は SCOPES のどれか。無い・不正なら `'all'`
3. page は整数。無い・不正なら `1`
4. q は文字列。無ければ `null` (withDefault が無いので)

```ts
const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);
```

`useQueryStates` が返す `[値のオブジェクト, 更新関数]` を分割代入しています (Day 1)。URL が `?scope=mine&page=3` なら `scope = 'mine'`、`page = 3`、`q = null` です。

```ts
const setScope = (next: Scope) => setParams({ scope: next, page: null });
const setSearch = (text: string) => setParams({ q: text || null, page: null });
```

- `page: null` … page を URL から消す = 1 ページ目に戻す。「条件が変わったら 1 ページ目から」が定石です
- `text || null` … 空文字なら `null` にしてキーごと消す。そのまま `''` を渡すと `?q=` という空のクエリが残ります (Day 2 の `||`)
- `setScope('all')` … `'all'` はデフォルト値なので、scope も URL から消えます (clearOnDefault)

例えば URL が `?scope=mine&page=3&q=react` のとき `setSearch('')` を呼ぶと、URL は `?scope=mine` になります。
