## import-type-only

目標コードの import 文について、正しい読み取りはどれですか?

```ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
```

- [ ] このフックの中で `useReactTable` を呼んでテーブルを作っている
- [x] TanStack Table からは型しか使っていないので、テーブル本体は使う側が作る
- [ ] TanStack Query からも型しか読み込んでいない
- [ ] `import type` で読み込んだ `PaginationState` は実行時にオブジェクトとして使える

> `import type` は型だけを読み込み、実行時のコードには残りません。このフックは `pagination` や `onPaginationChange` という **テーブルに渡す値** を用意するだけで、`useReactTable` を呼ぶのは `MembersTable` のような使う側のコンポーネントです。import 文を見るだけで、フックの守備範囲がわかります。

## invalid-url-values

URL が `?scope=admin&page=abc` のとき、37 行目で取り出される値はどれですか?

```ts
const scopeParsers = {
  [SCOPE_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'),
  [SCOPE_KEYS.page]: parseAsInteger.withDefault(1),
  [SCOPE_KEYS.q]: parseAsString,
};
const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);
```

- [ ] `scope = 'admin'`, `page = NaN`
- [ ] `scope = null`, `page = null`
- [x] `scope = 'all'`, `page = 1`
- [ ] URL が不正なのでエラーが投げられる

> `parseAsStringLiteral(SCOPES)` は `SCOPES` に含まれない値を `null` と解釈し、`parseAsInteger` は数値にならない文字列を `null` と解釈します。どちらも `withDefault` があるので、`null` の代わりにデフォルト値 (`'all'` と `1`) になります。URL は誰でも書き換えられるので、パーサーが「不正な値を安全な値に落とす」役を担っています。

## pagesize-not-sent

`useSharedScopeQuery('members', fetchMembers, { pageSize: 50 })` と呼んだとき、`fetchMembers` に **渡らない** 値はどれですか?

```ts
queryKey: [resource, { scope, page, q, pageSize }] as const,
queryFn: ({ signal }) => fetcher({ scope, page, q }, signal),
```

- [ ] `scope`
- [ ] `page`
- [ ] `q`
- [x] `pageSize`

> `pageSize` は queryKey と `pagination` には入りますが、fetcher の引数 (`ScopeParams`) にはありません。このフックは「API 側の 1 ページの件数と `pageSize` が一致している」前提で書かれている、と読み取れます。実務で `pageSize` を変えたのに表示件数が変わらなかったら、ここを疑います。

## just-after-next

`?page=2` で 2 ページ目を表示中に「次へ」を押しました。3 ページ目のレスポンスが届く **前** の再レンダーでの値はどれですか?

```ts
rows: query.data?.items ?? [],
tableState: { pagination }, // pagination = { pageIndex: page - 1, pageSize }
```

- [ ] `rows` は `[]`、`pageIndex` は `2`
- [x] `rows` は 2 ページ目のまま、`pageIndex` は `2`
- [ ] `rows` は 2 ページ目のまま、`pageIndex` は `1`
- [ ] `rows` は 3 ページ目、`pageIndex` は `2`

> nuqs の state はすぐ更新されるので `page` は 3、`pageIndex` は 2 になります。一方、queryKey `[..., { page: 3 }]` のデータはまだ無いので、`placeholderData: keepPreviousData` によって 2 ページ目のデータが仮に表示されます (`isPlaceholderData: true`)。「ページ番号は 3 なのに行は 2 ページ目」という瞬間があるわけです。

## back-to-cached

1 ページ目 → 「次へ」→ 2 ページ目の表示完了 → 「前へ」と操作しました (staleTime は既定の 0)。「前へ」の **直後** の値はどれですか?

- [ ] `isPlaceholderData: true`, `isFetching: true`
- [x] `isPlaceholderData: false`, `isFetching: true`
- [ ] `isPlaceholderData: false`, `isFetching: false`
- [ ] `isPlaceholderData: true`, `isFetching: false`

> 1 ページ目のデータはキャッシュにあるので、`keepPreviousData` の出番はなく、本物のデータがすぐ表示されます (`isPlaceholderData: false`)。ただし staleTime 0 なので「古い」扱いになり、裏で取り直します (`isFetching: true`)。`keepPreviousData` が働くのは「今のキーのデータがキャッシュに無いとき」だけです。

## table-sends-function

`useReactTable({ ..., onPaginationChange })` で作ったテーブルの `table.nextPage()` を呼ぶと、`onPaginationChange` には何が渡されますか?

```ts
const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
  const next = typeof updater === 'function' ? updater(pagination) : updater;
  void setParams({ page: next.pageIndex + 1 });
};
```

- [ ] 新しいページ番号 (数値) `3`
- [ ] 新しい値のオブジェクト `{ pageIndex: 2, pageSize: 20 }`
- [x] 前の値を受け取って新しい値を返す関数 `(old) => ({ ...old, pageIndex: old.pageIndex + 1 })` 相当
- [ ] 何も渡されない (`undefined`)

> TanStack Table v8 の `nextPage()` / `previousPage()` / `setPageIndex()` は、内部で「前の値から次の値を計算する関数」を作って `onPaginationChange` に渡します。だから `typeof updater === 'function'` の分岐が必須です。値のオブジェクトが来るのは、自分で `onPaginationChange({ ... })` を呼んだときなどです。

## setscope-all

URL が `?scope=team&page=3&q=田` のとき `setScope('all')` を呼びました。書き換わった後の URL はどれですか?

```ts
const setScope = (next: Scope) => setParams({ scope: next, page: null });
```

- [ ] `?scope=all&page=1&q=田`
- [ ] `?scope=all&q=田`
- [x] `?q=田`
- [ ] (クエリなし)

> `page: null` で `page` が消えます。`scope` は `'all'` をセットしていますが、これはパーサーのデフォルト値なので、nuqs (`clearOnDefault` が既定で `true`) が URL から消します。`q` は渡していないのでそのまま残ります。

## forgot-rowcount

`MembersTable` で `useReactTable` に `rowCount` を渡し忘れました (`manualPagination: true`、`pageSize` 20、全 45 件)。どうなりますか?

```ts
const table = useReactTable({
  data: rows, // 1 ページ分 (20 件)
  columns,
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  state: tableState,
  onPaginationChange,
});
```

- [ ] テーブルが 45 件全部を表示する
- [x] `getPageCount()` が 20 件から計算されて 1 になり、「次へ」が押せなくなる
- [ ] 実行時エラーになる
- [ ] 何も変わらない (`rowCount` は自動で API から取得される)

> `rowCount` が無いと、テーブルは手元の行数 (`rows.length` = 20) を全件数とみなし、`getPageCount()` は `Math.ceil(20 / 20) = 1` になります。すると `getCanNextPage()` が `false` になり、「次へ」が無効になります。サーバー側ページネーションでは、全件数をテーブルに教えるのは使う側の責任です。

## parse-as-index

別のコードベースで、`page` のパーサーが次のように書かれていました。`pagination` の正しい書き方はどれですか?

```ts
[SCOPE_KEYS.page]: parseAsIndex.withDefault(0), // URL ?page=2 → 値 1
```

- [ ] `{ pageIndex: page - 1, pageSize }`
- [x] `{ pageIndex: page, pageSize }`
- [ ] `{ pageIndex: page + 1, pageSize }`
- [ ] `{ pageIndex: Number(page) - 1, pageSize }`

> `parseAsIndex` は「URL は 1 始まり、値は 0 始まり」に変換するパーサーです。すでに 0 始まりの値なので、そのまま `pageIndex` に使えます。ここで `- 1` をすると 1 ページずれます。「1 始まり ⇔ 0 始まり」の変換がどこで行われているかは、コードごとに必ず確かめましょう。
