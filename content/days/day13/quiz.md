## headless

TanStack Table が「ヘッドレス UI」のライブラリである、とはどういう意味ですか?

- [ ] 画面を持たないサーバー専用のライブラリで、ブラウザでは使えない
- [x] 見出し・行・ページ分けなどの計算と状態管理だけを受け持ち、`<table>` などのマークアップや CSS は自分で書く
- [ ] 見出し (`<thead>`) の無い表しか作れない
- [ ] 表の見た目は決まっていて、CSS だけを差し替えられる

> TanStack Table は「何を表示するか」を計算して渡すだけで、HTML は出力しません。そのため `getHeaderGroups()` や `getRowModel()` を使って自分で `<table>` を組み立てる定型コードを、どのプロジェクトでも見かけます。

## row-original

次の列定義で、「編集」ボタンを押したときに `openEditor` に渡される値はどれですか?

```tsx
type User = { id: number; email: string };

const columns: ColumnDef<User>[] = [
  { accessorKey: 'email', header: 'メール' },
  {
    id: 'actions',
    cell: ({ row }) => <button onClick={() => openEditor(row.original.id)}>編集</button>,
  },
];
```

- [ ] その行の表示上の位置 (`0`、`1`、…)
- [x] その行の元データ (`User` オブジェクト) の `id`
- [ ] 列の id (`'actions'`)
- [ ] セルの値 (`undefined`)

> `row.original` は、`data` に渡した配列のその行の要素 (ここでは `User`) そのものです。`row.id` (既定では配列の位置 `'0'`、`'1'`…) とは別物なので注意しましょう。

## flex-render

`flexRender(header.column.columnDef.header, header.getContext())` について、正しい説明はどれですか?

```ts
const columns: ColumnDef<User>[] = [
  { accessorKey: 'email', header: 'メール' },
  { accessorKey: 'role', header: () => <b>役割</b> },
];
```

- [ ] `header` が文字列の列でしか使えない
- [ ] `header` が関数の列でしか使えない
- [x] 文字列ならそのまま表示し、関数なら `getContext()` の結果を渡して呼び出した戻り値を表示する
- [ ] `header` を HTML の文字列に変換する

> 列定義の `header` や `cell` は「文字列」でも「関数」でもよいので、描画側では `flexRender` でどちらにも対応します。関数には `getContext()` が返すオブジェクト (`column`、`table`、セルなら `getValue`、`row` など) が渡されます。

## page-rows

12 行のデータを次の設定で表示しています。`pageIndex` が `2` のとき、`table.getRowModel().rows.length` はいくつですか?

```ts
const table = useReactTable({
  data, // 12 行
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
});
```

- [ ] `0`
- [x] `2`
- [ ] `5`
- [ ] `12`

> `pageIndex` は 0 始まりなので、`2` は 3 ページ目です。1 ページ目が 1〜5 行目、2 ページ目が 6〜10 行目、3 ページ目が 11〜12 行目なので 2 行です。`getRowModel()` はページ分けの **後** の行を返します。

## page-count

`table.getPageCount()` の値はどれですか?

```ts
const table = useReactTable({
  data: rows, // サーバーが返した 10 行
  columns,
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  rowCount: 95,
  state: { pagination: { pageIndex: 0, pageSize: 10 } },
  onPaginationChange,
});
```

- [ ] `1`
- [ ] `9`
- [x] `10`
- [ ] `95`

> `manualPagination: true` のとき、表は行を切り出さず、全件数は `rowCount` から知ります。ページ数は `Math.ceil(95 / 10) = 10` です。`data` に渡した 10 行はそのまま `getRowModel()` に出てきます。

## updater-values

`Updater<number>` 型の値として **正しくない** ものはどれですか?

```ts
type Updater<T> = T | ((old: T) => T);
```

- [ ] `5`
- [ ] `(old) => old + 1`
- [ ] `() => 0`
- [x] `'5'`

> `Updater<number>` は「`number`」か「`number` を受け取って `number` を返す関数」です。`() => 0` は引数を使っていないだけで、`(old: number) => number` として使えます。`'5'` は文字列なので当てはまりません。

## resolve-updater

URL が `?page=3` のとき、表の「次へ」(`table.nextPage()`) が押されました。`setParams` に渡される値はどれですか? (`pageSize` は 20、`nextPage()` は `(old) => ({ ...old, pageIndex: old.pageIndex + 1 })` という関数を渡してきます)

```ts
const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);

const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
  const next = typeof updater === 'function' ? updater(pagination) : updater;
  void setParams({ page: next.pageIndex + 1 });
};
```

- [ ] `{ page: 3 }`
- [x] `{ page: 4 }`
- [ ] `{ page: 5 }`
- [ ] `{ page: 2 }`

> `page` が 3 なので `pagination` は `{ pageIndex: 2, pageSize: 20 }` です。updater は関数なので `updater(pagination)` で `{ pageIndex: 3, pageSize: 20 }` になり、`3 + 1 = 4` を URL に書きます。0 始まりと 1 始まりの変換 (`- 1` と `+ 1`) が両側でそろっているのがポイントです。

## controlled-no-handler

次のコードで「次へ」ボタン (`table.nextPage()`) を押すと、どうなりますか?

```tsx
const [pagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: { pagination },
});
```

- [ ] 2 ページ目に進む
- [x] ページは変わらない (1 ページ目のまま)
- [ ] エラーになる
- [ ] 最後のページに移動する

> `state: { pagination }` を渡すと、表は常にその値を使います。値を変える手段 (`onPaginationChange` で state を更新する) を渡していないので、`nextPage()` を呼んでも外から渡した `pageIndex: 0` のままです。`state` と `on〇〇Change` は必ず組にします。

## stable-columns

次のコードの問題点として、最も適切なのはどれですか?

```tsx
function UserTable({ users }: { users: User[] }) {
  const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: '名前' },
    { accessorKey: 'email', header: 'メール' },
  ];
  const table = useReactTable({ data: users, columns, getCoreRowModel: getCoreRowModel() });
  // ...
}
```

- [ ] `columns` は `let` で宣言しないといけない
- [x] レンダーのたびに `columns` が新しい配列になるので、表の計算が毎回やり直しになる (状況によっては無限に再レンダーする原因になる)
- [ ] `columns` をコンポーネントの中で定義すると、列が表示されない
- [ ] `ColumnDef<User>[]` の型注釈が不要なのでエラーになる

> TanStack Table は `data` や `columns` の参照が変わったかどうかで計算し直すかを決めます。コンポーネントの中で配列を作ると毎回別物になるので、コンポーネントの外で定義するか `useMemo` で包みます (Day 7 の参照の同一性)。

## filtered-row-model

表に「キーワードで行を絞り込む」機能を付けたいとき、`useReactTable` に追加するものとして正しいのはどれですか?

- [ ] `getPaginationRowModel: getPaginationRowModel()`
- [x] `getFilteredRowModel: getFilteredRowModel()` と、`globalFilter` (または `columnFilters`) の state
- [ ] `manualPagination: true`
- [ ] `getCoreRowModel` を 2 回渡す

> TanStack Table の機能は「行モデル」を足していく形です。絞り込みは `getFilteredRowModel()`、並び替えは `getSortedRowModel()`、ページ分けは `getPaginationRowModel()` を渡し、それぞれの状態 (`globalFilter` / `sorting` / `pagination`) を管理します。
