---
day: 14
level: 5
title: useSharedScopeQuery を読む・作る
summary: 目標コードを 1 行ずつ読み、URL → パーサー → queryKey → テーブル → URL の一周をたどったうえで、自分で実装して画面から使う。
minutes: 120
goals:
  - 目標コードの各行が何をしているかを、何日目に学んだ構文かと合わせて説明できる
  - "URL → { scope, page, q } → queryKey → rows / rowCount → テーブル → onPaginationChange → URL の一周を順番に説明できる"
  - 「次へ」を押したときの URL・queryKey・isFetching・isPlaceholderData の変化を予想できる
  - "フックを使う側のコード (useReactTable に manualPagination / rowCount / state / onPaginationChange を渡す) を読める"
  - urlKeys・history・select・機能別ラッパーなどの変種に気づき、知らないフックを読む手順を持っている
readings:
  - title: TanStack Query — Paginated / Lagged Queries
    url: https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries
  - title: TanStack Table — Pagination Guide (Manual Server-Side Pagination)
    url: https://tanstack.com/table/v8/docs/guide/pagination
  - title: nuqs — Batching (useQueryStates と urlKeys)
    url: https://nuqs.dev/docs/batching
  - title: nuqs — Options
    url: https://nuqs.dev/docs/options
  - title: TanStack Query — Query Options
    url: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
---

## 今日のゴール

いよいよ目標コード `useSharedScopeQuery` を **全部** 読みます。新しい構文はもう出てきません。13 日間で学んだ部品を組み合わせて読むだけです。

1. 上から 1 行ずつ読む (どの日に学んだかを確認しながら)
2. データの流れを一周たどる
3. 「次へ」を押した瞬間から何が起きるかを時系列で追う
4. フックを **使う側** のコンポーネントを読む
5. 実務で出会う **変種** と、知らないフックを読むときの手順

演習では、このフックを自分で書き (演習 1)、状態の変化を予想し (演習 2)、テーブル画面から使います (演習 3・4)。最後に **最終試験** があります。

## 1. 目標コードを上から読む

まず全体の地図です (ホーム画面の「解読マップ」と同じ区切り)。

| 行 | 書いてあること | 学んだ日 |
| --- | --- | --- |
| 1 | `'use client'` | Day 9 |
| 3〜7 | `import` / `import type` | Day 4 |
| 9〜17 | `as const`、`(typeof SCOPES)[number]` | Day 3 |
| 19〜23 | 計算されたキー `{ [KEY]: ... }` + nuqs のパーサー | Day 2・11 |
| 25〜30 | ユニオン型 `string \| null`、`?` 付きプロパティ | Day 3 |
| 32〜36 | ジェネリクス `<TRow>`、引数の分割代入 + デフォルト値 | Day 4・1 |
| 37 | `useQueryStates` + 配列とオブジェクトの分割代入 | Day 11・1 |
| 39〜44 | `useQuery`、queryKey、`{ signal }`、`keepPreviousData` | Day 12 |
| 46 | `page - 1`、`useMemo` | Day 13・7 |
| 48〜51 | `Updater` と `typeof` による絞り込み | Day 13・3・6 |
| 53〜54 | `page: null`、`text \|\| null` | Day 11・2 |
| 56〜70 | `?.` と `??`、省略記法 | Day 2・12 |

### 1〜7 行目: ファイルの性格を決める部分

```ts
'use client';

import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import type { Paginated } from './api';
```

- `'use client'` (Day 9): このモジュールは Client Components 側のコードです。中で React のフックを使うので、Server Component からは直接呼べません。
- TanStack Table からは **`import type` しかしていません** (Day 4)。つまりこのフックはテーブル本体を作らず、「テーブルに渡す値」を用意するだけです。`useReactTable` を呼ぶのは使う側 (4 章) です。import 文を見るだけで、フックの守備範囲がわかります。

### 9〜30 行目: 定数・パーサー・型

```ts
export const SCOPE_KEYS = { scope: 'scope', page: 'page', q: 'q' } as const;
export const SCOPES = ['all', 'mine', 'team'] as const;
export type Scope = (typeof SCOPES)[number]; // 'all' | 'mine' | 'team'

const scopeParsers = {
  [SCOPE_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'),
  [SCOPE_KEYS.page]: parseAsInteger.withDefault(1),
  [SCOPE_KEYS.q]: parseAsString,
};
```

- `as const` (Day 3) で `SCOPE_KEYS.page` の型は `string` ではなく `'page'` になります。だから計算されたキー `[SCOPE_KEYS.page]` (Day 2) も型の上で `page` というキーになり、37 行目の `{ scope, page, q }` に正しい型が付きます。
- `SCOPES` は「値の配列」を 1 か所に書き、型 `Scope` はそこから作ります。`<select>` の選択肢も `SCOPES.map(...)` で作れるので、値と型がずれません。
- パーサー (Day 11) が「URL の文字列 ⇔ 値」の変換を決めます。

| キー | URL → 値 | URL に無いとき | おかしな値のとき |
| --- | --- | --- | --- |
| `scope` | `?scope=team` → `'team'` | `'all'` | `?scope=admin` → `'all'` |
| `page` | `?page=2` → `2` | `1` | `?page=abc` → `1` |
| `q` | `?q=田` → `'田'` | `null` | — |

`withDefault` が付いた `scope` と `page` は `null` になりません。付いていない `q` だけが `string | null` です (25 行目の `ScopeParams` と一致しています)。

> **落とし穴:** `SCOPES` から `as const` を消すと `Scope` はただの `string` になり、`'admin'` も通る型になってしまいます。`as const` は型を守るための 1 語です。

### 32〜37 行目: シグネチャと URL の読み取り

```ts
export function useSharedScopeQuery<TRow>(
  resource: string,
  fetcher: (params: ScopeParams, signal: AbortSignal) => Promise<Paginated<TRow>>,
  { pageSize = 20, enabled = true }: Options = {},
) {
  const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);
```

- `<TRow>` (Day 4): 行の型は呼び出し側が決めます。`fetchMembers` を渡せば `TRow` は `Member` と推論され、戻り値の `rows` は `Member[]` になります。
- 第 3 引数は「分割代入 + デフォルト値」と「引数全体のデフォルト `= {}`」の組み合わせ (Day 1)。省略すると `pageSize: 20, enabled: true` です。
- `resource` は queryKey の先頭に入るだけの名前です (次の節)。
- **気づきたい点:** `ScopeParams` に `pageSize` がありません。つまり fetcher (API) には 1 ページの件数が渡らず、API 側の件数と `pageSize` が **一致している前提** で書かれています。
- 37 行目は Day 1 で分解したとおり、「配列の 1 番目 (値のオブジェクト) から 3 つ取り出し、2 番目を `setParams` と名付ける」です。

### 39〜44 行目: URL の状態で取得する

```ts
const query = useQuery({
  queryKey: [resource, { scope, page, q, pageSize }] as const,
  queryFn: ({ signal }) => fetcher({ scope, page, q }, signal),
  placeholderData: keepPreviousData,
  enabled,
});
```

- **queryFn で使う値は全部 queryKey に入っています** (Day 12)。URL が変わる → キーが変わる → 別のキャッシュ → 自動で取得、という仕組みです。`q` を入れ忘れると「検索しても一覧が変わらない」バグになります。
- `({ signal })` は引数オブジェクトから `signal` だけを取り出す書き方 (Day 1)。これを fetcher → `fetch` に渡すと、不要になったリクエストを TanStack Query が中断できます。
- `placeholderData: keepPreviousData`: 新しいキーのデータが届くまで、**前のキーのデータ** を仮に表示します (`isPlaceholderData: true`)。ページ送りのたびに表が空になってガタつくのを防ぎます。
- `enabled`: `false` の間は取得しません (ログイン情報が揃うまで待つ、など)。

### 46〜54 行目: テーブルとの橋渡し

```ts
const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);

const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
  const next = typeof updater === 'function' ? updater(pagination) : updater;
  void setParams({ page: next.pageIndex + 1 });
};

const setScope = (next: Scope) => setParams({ scope: next, page: null });
const setSearch = (text: string) => setParams({ q: text || null, page: null });
```

- URL の `page` は **1 始まり** (人が読む番号)、TanStack Table の `pageIndex` は **0 始まり** です (Day 13)。読むときに `- 1`、書き戻すときに `+ 1` と、変換が対になっています。
- `useMemo` (Day 7) で、`page` と `pageSize` が変わらない限り同じオブジェクトを返します。
- `updater` の型は `Updater<PaginationState>` = 「新しい値」または「`(old) => 新しい値` の関数」(Day 13)。`typeof updater === 'function'` で絞り込み (Day 3)、関数なら今の値を渡して計算します。`setCount((prev) => prev + 1)` と同じ考え方です (Day 6)。
- 実際、TanStack Table v8 の `table.nextPage()` や `table.setPageIndex(3)` は、いつも **関数** を渡してきます。値の形が来るのは、自分で `onPaginationChange({ ... })` を呼んだときなどです。
- `void` は「`setParams` が返す Promise を待たない」ことを明示する印です。
- 書き戻しているのは `page` だけです。テーブルから `pageSize` を変えても URL には残りません (このフックはページサイズ変更に対応していない、と読み取れます)。
- `page: null` はキーを URL から消す = デフォルト 1 に戻す (Day 11)。条件が変わったら 1 ページ目から、が定石です。`text || null` は空文字 `''` も `null` にします (`??` だと `''` が残る。Day 2)。

### 56〜70 行目: 使う側に渡す形

```ts
return {
  scope, q, setScope, setSearch,
  rows: query.data?.items ?? [],
  rowCount: query.data?.total ?? 0,
  isPending: query.isPending,
  isFetching: query.isFetching,
  isPlaceholderData: query.isPlaceholderData,
  error: query.error,
  tableState: { pagination },
  onPaginationChange,
};
```

- 最初の読み込み中は `query.data` が `undefined` なので、`?.` と `??` で空配列・0 にしています (Day 2)。使う側は `undefined` を気にせずに済みます。
- `tableState` と `onPaginationChange` は、`useReactTable` のオプション名 (`state` / `onPaginationChange`) に合わせた形です。使う側は並べるだけで配線が終わります。

## 2. データの流れを一周たどる

```text
URL  ?scope=team&page=2&q=田
  │ ① nuqs のパーサーが 文字列 → 値 に変換
  ▼
{ scope: 'team', page: 2, q: '田' }
  │ ② queryKey に詰める
  ▼
['members', { scope: 'team', page: 2, q: '田', pageSize: 20 }]
  │ ③ キャッシュに無ければ queryFn → fetcher({ scope, page, q }, signal)
  ▼
{ items: [...20 件], total: 45 }
  │ ④ rows = items / rowCount = total / pagination = { pageIndex: 1, pageSize: 20 }
  ▼
useReactTable({ manualPagination: true, rowCount, state: { pagination }, onPaginationChange })
  │ ⑤ ユーザーが「次へ」→ table.nextPage() → onPaginationChange((old) => ...)
  ▼
next = { pageIndex: 2, pageSize: 20 }
  │ ⑥ setParams({ page: next.pageIndex + 1 })
  ▼
URL  ?scope=team&page=3&q=田   → ① に戻る
```

大事なのは、**状態の持ち主が URL だけ** だという点です。テーブルはページ番号を自分で持たず (`state` で外から渡される)、TanStack Query のキーも URL から作られます。だから再読み込みしても、URL を人に送っても、同じページが表示されます。

## 3. タイムライン: 2 ページ目で「次へ」を押す

`?page=2` (全 45 件、`pageSize` 20) で「次へ」を押したときの動きです。

1. `table.nextPage()` → テーブルは `state` で外から渡された値を使うだけで自分では変えないので、`onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex + 1 }))` を呼ぶだけ
2. フックが関数を実行: `updater({ pageIndex: 1, pageSize: 20 })` → `{ pageIndex: 2, pageSize: 20 }` → `setParams({ page: 3 })`
3. nuqs はフックの state をすぐ更新して再レンダーさせる。URL の書き換えは少しだけ後 (複数の更新をまとめ、書き込みの間隔も既定で 50ms 以上あける)。`history: 'replace'`・`shallow: true` なので履歴は増えず、サーバーにも行かない
4. 再レンダー: `page` = 3 → queryKey が `[..., { page: 3, ... }]` に変わる → キャッシュに無いので取得開始。`keepPreviousData` により `data` は 2 ページ目のまま
5. レスポンスが届くと `data` が 3 ページ目に置き換わる

| 時点 | URL | queryKey の page | isFetching | isPlaceholderData | 表示される rows | ページ表示 |
| --- | --- | --- | --- | --- | --- | --- |
| 押す前 | `?page=2` | 2 | false | false | 21〜40 件目 | 2 / 3 |
| 直後の再レンダー | (まだ `?page=2`) | 3 | true | true | 21〜40 件目 (仮) | 3 / 3 |
| 少し後 | `?page=3` | 3 | true | true | 21〜40 件目 (仮) | 3 / 3 |
| 取得完了 | `?page=3` | 3 | false | false | 41〜45 件目 | 3 / 3 |

> **落とし穴:** 取得中は「ページ表示は 3 なのに、行は 2 ページ目」という瞬間があります。実務では `isPlaceholderData` の間は表を薄く表示したり、「次へ」を `disabled={!table.getCanNextPage() || isPlaceholderData}` にしたりします。

逆に「前へ」で 2 ページ目に **戻る** と、2 ページ目のデータはキャッシュにあるので `isPlaceholderData` は `false` のまま本物が即表示されます。ただし古い (staleTime 0) ので、裏で取り直します (`isFetching: true`)。演習 2 で確かめます。

## 4. 使う側: MembersTable

実務のコードでは、ページのコンポーネントがフックの戻り値を `useReactTable` に渡している形をよく見ます。

```tsx
// app/members/members-table.tsx
'use client';

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { SCOPES, useSharedScopeQuery, type Scope } from '@/hooks/useSharedScopeQuery';
import { fetchMembers, type Member } from '@/lib/api';

const columns: ColumnDef<Member>[] = [
  { accessorKey: 'name', header: '名前' },
  { accessorKey: 'team', header: 'チーム' },
];

export function MembersTable() {
  const { scope, setScope, rows, rowCount, isPending, isPlaceholderData, tableState, onPaginationChange } =
    useSharedScopeQuery('members', fetchMembers);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // rows はもう 1 ページ分。テーブル側で切り分けない
    rowCount, // 全件数 → getPageCount() / getCanNextPage() の計算に使う
    state: tableState, // { pagination } は URL から来る
    onPaginationChange, // テーブルからの変更は URL へ
  });

  if (isPending) return <p>読み込み中…</p>;

  return (
    <div style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
      <select value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
        {SCOPES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <table>{/* thead / tbody は flexRender で描画 (Day 13) */}</table>
      <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>前へ</button>
      <span>{table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</span>
      <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>次へ</button>
    </div>
  );
}
```

- `useReactTable` は `if (isPending) return` より **前** で呼んでいます。フックは条件分岐の後ろに置けません (Day 7)。
- `getPageCount()` は `Math.ceil(rowCount / pageSize)` です。`rowCount` を渡し忘れると、手元の 1 ページ分の行数 (20 件) から `getPageCount()` が 1 と計算され、「次へ」がずっと押せなくなります。
- このコンポーネントの外側には `NuqsAdapter` と `QueryClientProvider` (Day 8・9) が必要です。また nuqs は内部で `useSearchParams` を使うので、`page.tsx` では `<Suspense>` で囲むのが定石です (Day 10)。

```tsx
// app/members/page.tsx (Server Component)
import { Suspense } from 'react';
import { MembersTable } from './members-table';

export default function MembersPage() {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <MembersTable />
    </Suspense>
  );
}
```

## 5. 実務で出会う変種

本物のコードベースは目標コードと少しずつ違うはずです。見かけたら「何が変わるか」を言えるようにしておきましょう。

### URL のキー名だけ変える — `urlKeys`

```ts
const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers, {
  urlKeys: { scope: 's', page: 'p' },
});
// 値の名前は scope / page のまま、URL は ?s=team&p=2
```

URL の `?scope=team` は **読まれなくなる** 点に注意です。

### 履歴とサーバー — `history: 'push'` / `shallow: false`

```ts
useQueryStates(scopeParsers, { history: 'push' }); // ページ送りのたびに履歴が増え、「戻る」で前のページへ
useQueryStates(scopeParsers, { shallow: false }); // URL が変わるたびにサーバー側 (Server Components) も再実行
```

`shallow: false` は、`page.tsx` が `searchParams` を読んでサーバーでデータを取っている構成で使います。TanStack Query でクライアントから取る目標コードの構成なら、既定の `true` のままが普通です。

### キーと取得関数をまとめる — `queryOptions`

```ts
export const membersQuery = (params: ScopeParams) =>
  queryOptions({
    queryKey: ['members', params] as const,
    queryFn: ({ signal }) => fetchMembers(params, signal),
  });

useQuery({ ...membersQuery({ scope, page, q }), placeholderData: keepPreviousData });
queryClient.invalidateQueries({ queryKey: ['members'] }); // 'members' で始まるキャッシュを全部古くする
```

### 画面に必要な形に変える — `select`

```ts
useQuery({
  queryKey: ['members', { scope, page, q }] as const,
  queryFn: ({ signal }) => fetchMembers({ scope, page, q }, signal),
  select: (data) => ({ names: data.items.map((m) => m.name), total: data.total }),
});
// query.data は select の戻り値。キャッシュに入っているのは API の生データ
```

### 機能ごとのラッパー

```ts
export const useMembersQuery = () => useSharedScopeQuery('members', fetchMembers);
export const useProjectsQuery = () => useSharedScopeQuery('projects', fetchProjects, { pageSize: 50 });
```

画面側には `useMembersQuery()` しか出てこないので、定義へジャンプして共通フックにたどり着きます。`resource` が違うので、同じ `scope` / `page` でもキャッシュは混ざりません。一方で URL のキー (`scope` / `page` / `q`) は **共有** されるので、同じ画面に 2 つ置くとページ送りが連動します。名前の "Shared" は、この「URL の状態を画面の部品どうしで共有する」性質を指していると読めます。

### 0 始まりの値をパーサーで作る — `parseAsIndex`

```ts
[SCOPE_KEYS.page]: parseAsIndex.withDefault(0), // URL ?page=2 → 値 1
```

この場合は `pageIndex: page` と書くのが正解で、`- 1` があるとずれます。**変換がどこで行われているか** を必ず確かめましょう。

### 古い Next.js — `searchParams` が同期

Next.js 15 以降の `page.tsx` では `searchParams` は Promise ですが (Day 10)、14 以前は普通のオブジェクトです。

```tsx
// Next.js 15 以降
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
}
// Next.js 14 以前
export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  const page = searchParams.page;
}
```

サーバー側でも同じパーサーで読みたいときは、`nuqs/server` の `createLoader(scopeParsers)` を使うこともあります。

## 6. 知らないフックを読むチェックリスト

1. **import を見る** — どのライブラリの何を使っているか。`import type` だけなら「値は使っていない」
2. **引数と戻り値を見る** — 呼び出し側が何を渡し、何を受け取るか。ジェネリクスは呼び出し側で何に決まるか
3. **状態の持ち主を探す** — URL (nuqs)? サーバーのキャッシュ (TanStack Query)? `useState`?
4. **queryKey と queryFn を見比べる** — queryFn で使う値が全部キーに入っているか
5. **変換を探す** — `± 1`、`|| null`、`?? []`、パーサー。どこで何が何に変わるか
6. **書き戻しを追う** — `set...` がどのキーを変え、どのキーを消すか (`null`)。書き戻していない値は何か
7. **使う側を 1 つ読む** — 定義元ではなく利用箇所から逆にたどると、意図がわかりやすい

## まとめ

最後に、最も詰め込まれた 1 行をもう一度分解します。

```ts
queryFn: ({ signal }) => fetcher({ scope, page, q }, signal),
```

1. `({ signal }) => ...` — TanStack Query が渡すオブジェクトから `signal` だけを取り出すアロー関数 (Day 1・12)
2. `{ scope, page, q }` — 省略記法で `{ scope: scope, page: page, q: q }` を作る (Day 2)。値は URL から来ている (Day 11)
3. `fetcher(...)` — 呼び出し側から渡された関数。戻り値の型 `Promise<Paginated<TRow>>` から `rows` の型が決まる (Day 4)

13 日前は記号の塊だった行が、全部読めるようになっているはずです。演習で手を動かし、最終試験に挑戦しましょう。
