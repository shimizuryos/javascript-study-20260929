---
day: 13
level: 4
title: TanStack Table (v8) — データと列定義から表を組み立てる
summary: ColumnDef と useReactTable・flexRender で表を描画するコードと、manualPagination + onPaginationChange (Updater) で URL の page とつなぐコードを読めるようにする。
minutes: 120
goals:
  - 「ヘッドレス UI」とは何か、TanStack Table が何をして何をしないかを説明できる
  - "ColumnDef<T> (accessorKey / accessorFn / header / cell) と row.original を読める"
  - "getHeaderGroups / getRowModel / getVisibleCells / flexRender による描画の定型を説明できる"
  - "state: { pagination } と onPaginationChange、Updater<T> = T | ((old: T) => T) の意味がわかる"
  - "URL の 1 始まりの page と 0 始まりの pageIndex を変換するコードを読める"
readings:
  - title: TanStack Table v8 — Introduction
    url: https://tanstack.com/table/v8/docs/introduction
  - title: TanStack Table v8 — Column Definitions Guide
    url: https://tanstack.com/table/v8/docs/guide/column-defs
  - title: TanStack Table v8 — Pagination Guide
    url: https://tanstack.com/table/v8/docs/guide/pagination
  - title: TanStack Table v8 — React Table Adapter
    url: https://tanstack.com/table/v8/docs/framework/react/react-table
---

## 今日のゴール

目標コードの 46〜51 行目 (と 5 行目の import) を読めるようにします。

```ts
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';

const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);

const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
  const next = typeof updater === 'function' ? updater(pagination) : updater;
  void setParams({ page: next.pageIndex + 1 });
};
```

今日の終わりには「表の 0 始まりのページ番号と、URL の 1 始まりのページ番号を相互に変換して、表のページ送りを URL に書き戻している」と説明できるようになります。最後に、**知らないフックを読む手順** もまとめます。

## ヘッドレス UI

TanStack Table は **見た目 (HTML / CSS) を持たない** 表のライブラリです。「どの見出しを、どの行を、どの順番で、何ページ目に表示するか」を計算するだけで、`<table>` を書くのは自分です。これを **ヘッドレス UI** と呼びます。デザインは自由にできる代わりに描画のコードを毎回書くので、どのプロジェクトでも **ほぼ同じ形の定型コード** になります。一度読めれば、どこでも読めます。

## 列定義 `ColumnDef<T>`

```tsx
import type { ColumnDef } from '@tanstack/react-table';

type User = { id: number; firstName: string; lastName: string; email: string; role: 'admin' | 'member' };

const columns: ColumnDef<User>[] = [
  { accessorKey: 'email', header: 'メール' },
  {
    id: 'name',
    header: '名前',
    accessorFn: (row) => `${row.lastName} ${row.firstName}`,
  },
  {
    accessorKey: 'role',
    header: () => <span>役割</span>,
    cell: ({ getValue }) => (getValue() === 'admin' ? '管理者' : 'メンバー'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <button onClick={() => edit(row.original.id)}>編集</button>,
  },
];
```

| プロパティ | 意味 |
| --- | --- |
| `accessorKey` | 行オブジェクトのどのプロパティをこの列の値にするか。列の `id` もこの名前になる |
| `accessorFn` | 行から値を計算する関数。`id` を付けて列に名前を付ける |
| `header` | 見出し。文字列か、JSX を返す関数 |
| `cell` | セルの中身を返す関数。省略すると値をそのまま表示 |
| `row.original` | その行の **元のデータ** (ここでは `User` オブジェクト) |

`accessorKey` も `accessorFn` も無い列 (上の `actions`) は、値を持たない「表示用の列」です。ボタンなどを置くのに使います。

同じ列定義を `createColumnHelper` で書くこともあります。中身は同じオブジェクトですが、`getValue()` の型 (`'admin' | 'member'` など) が正しく推論されます。

```tsx
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<User>();
const columns = [
  columnHelper.accessor('email', { header: 'メール' }),
  columnHelper.accessor((row) => `${row.lastName} ${row.firstName}`, { id: 'name', header: '名前' }),
  columnHelper.accessor('role', { header: '役割', cell: (info) => (info.getValue() === 'admin' ? '管理者' : 'メンバー') }),
  columnHelper.display({ id: 'actions', cell: ({ row }) => <button>編集 {row.original.id}</button> }),
];
```

## useReactTable と描画の定型

```tsx
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

function UserTable({ users }: { users: User[] }) {
  const table = useReactTable({
    data: users, // 行の配列
    columns, // 列定義
    getCoreRowModel: getCoreRowModel(), // 必須。基本の「行モデル」を作る関数
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

見出しと本体が **同じ形の 2 重ループ** になっているのがわかります。

| コード | 意味 |
| --- | --- |
| `getHeaderGroups()` | 見出しの行の配列 (普通は 1 行。列をグループにすると増える) |
| `getRowModel().rows` | **今表示すべき行** (並び替え・絞り込み・ページ分けの後) |
| `row.getVisibleCells()` | その行のセルの配列 (非表示の列を除く) |
| `getContext()` | `header` / `cell` 関数に渡す引数 (`getValue`、`row`、`column`、`table` など) |
| `flexRender(定義, context)` | 定義が文字列ならそのまま、関数なら context を渡して呼ぶ。だから `header` は文字列でも関数でもよい |
| `row.id` | 行の id。既定は配列の位置 (`'0'`、`'1'`、…)。`getRowId` オプションで DB の id にもできる |

`getXxxRowModel` は、機能ごとの「行の計算方法」です。使う機能の分だけ import して渡します (`getPaginationRowModel()`、`getSortedRowModel()`、`getFilteredRowModel()` など)。

## data と columns は「安定した参照」で渡す

```tsx
// ✕ レンダーのたびに新しい配列を作っている
function UserTable({ users }: { users: User[] }) {
  const columns: ColumnDef<User>[] = [{ accessorKey: 'email', header: 'メール' }];
  const table = useReactTable({ data: users.filter((u) => u.active), columns, getCoreRowModel: getCoreRowModel() });
}

// ○ 列定義はコンポーネントの外、加工したデータは useMemo
const columns: ColumnDef<User>[] = [{ accessorKey: 'email', header: 'メール' }];
function UserTable({ users }: { users: User[] }) {
  const data = useMemo(() => users.filter((u) => u.active), [users]);
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
}
```

TanStack Table は `data` や `columns` の **参照** (Day 7 の `Object.is`) が変わったときだけ計算し直します。毎回新しい配列を渡すと毎回計算し直しになり、場合によっては **無限に再レンダーする** 原因にもなります。`data: query.data ?? []` の `[]` も毎回新しい配列なので、外に `const EMPTY: User[] = [];` を置いて使うと安全です。

## ページネーション (クライアント側)

全件を持っていて、表示だけページに分けるときは `getPaginationRowModel` を足します。

```ts
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
});

table.getRowModel().rows; // 今のページの行だけ (5 行)
table.getState().pagination; // { pageIndex: 0, pageSize: 5 }
table.nextPage(); // pageIndex を 1 増やす (previousPage は 1 減らす)
table.getCanNextPage(); // 次のページがあるか (getCanPreviousPage も)
table.getPageCount(); // 全ページ数
```

ページの状態は `PaginationState = { pageIndex: number; pageSize: number }` です。**`pageIndex` は 0 始まり** (1 ページ目が 0) です。

## state を外に出す (制御された状態)

何も指定しなければ、表はページ番号などの状態を内部で持ちます。URL など **自分の好きな場所に置きたい** ときは、`state` と `on〇〇Change` を組にして渡します (Day 6 の制御されたフォームと同じ考え方です)。

```tsx
const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: { pagination }, // 表はこの値を使う
  onPaginationChange: setPagination, // 表が変えたくなったらこれを呼ぶ
});
```

`table.nextPage()` を呼ぶと、表は自分では値を変えずに `onPaginationChange` を呼び、「こう変えたい」と伝えるだけです。受け取った側が state を更新すると、新しい `pagination` が `state` として戻ってきます。

> **落とし穴:** `state: { pagination }` を渡して `onPaginationChange` を渡し忘れると、ボタンを押してもページが変わりません (外から値を固定しているため)。

## Updater<T> — 「値」または「前の値を受け取る関数」

`onPaginationChange` が受け取る引数の型は `Updater` です。

```ts
type Updater<T> = T | ((old: T) => T);
type OnChangeFn<T> = (updaterOrValue: Updater<T>) => void;
```

React の `setState` と同じく、「新しい値そのもの」か「前の値から新しい値を作る関数」のどちらかです。だから上の例では `onPaginationChange: setPagination` とそのまま渡せました。

`setState` 以外に渡したいときは、自分でどちらかを判定して **新しい値に解決** します。

```ts
const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
  const next = typeof updater === 'function' ? updater(pagination) : updater; // 関数なら今の値を渡して呼ぶ
  saveSomewhere(next);
};
```

`typeof updater === 'function'` で絞り込み (Day 3) をしているので、`? :` の左では `updater` は関数、右では `PaginationState` です。同じ処理をするヘルパー `functionalUpdate(updater, old)` も `@tanstack/react-table` から import できます。なお v8 の `nextPage()` などは実際には関数の形で渡してきますが、型の上では値の場合もあるので両方に対応しておきます。

## サーバー側でページ分けする: manualPagination + rowCount

API が「1 ページ分の行」と「全件数」を返すときは、表に行を切り出させず、**渡した行をそのまま表示** させます。

```ts
const table = useReactTable({
  data: rows, // サーバーが返した「今のページの行だけ」
  columns,
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true, // 行の切り出しはしない (getPaginationRowModel は不要)
  rowCount: total, // 全件数。getPageCount() = Math.ceil(rowCount / pageSize)
  state: { pagination },
  onPaginationChange,
});
```

`table.nextPage()` などのボタンの処理や `getCanNextPage()` はそのまま使えます。ページが変わったら新しい行を取ってくる (Day 12 の queryKey が変わる) のは、自分の仕事です。

## 1 始まりの page と 0 始まりの pageIndex

URL のページ番号は人間向けなので 1 始まり (`?page=1` が最初)、表の `pageIndex` は配列の位置なので 0 始まりです。

| URL の page | 表の pageIndex |
| --- | --- |
| 1 (または無し) | 0 |
| 2 | 1 |
| 3 | 2 |

```ts
// URL → 表: 1 引く
const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);
// 表 → URL: 1 足す
setPage(next.pageIndex + 1);
```

> **落とし穴:** どちらか一方を忘れると「1 ページずれる」バグになります。症状は「最初から 2 ページ目の番号が出る」「1 ページ目なのに『前へ』が押せる」「次へで 2 ページ飛ぶ」などです。

## 並び替えと絞り込み (概要)

ページネーションと **同じパターン** (`getXxxRowModel` + `state` + `on〇〇Change`) で作られています。

```tsx
const [sorting, setSorting] = useState<SortingState>([]); // 例: [{ id: 'name', desc: false }]

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: { sorting },
  onSortingChange: setSorting,
});

<th onClick={header.column.getToggleSortingHandler()}>
  {flexRender(header.column.columnDef.header, header.getContext())}
  {header.column.getIsSorted() === 'asc' ? ' ▲' : header.column.getIsSorted() === 'desc' ? ' ▼' : ''}
</th>;
```

- クリックするたびに「昇順 → 降順 → 並び替えなし」と切り替わります (数値の列は降順から)
- 絞り込みは `getFilteredRowModel()` と `columnFilters` / `globalFilter` の state で同じように作ります
- サーバー側で並び替えるなら `manualSorting: true` (`manualPagination` と同じ考え方)

## v9 について

TanStack Table は 2026 年 8 月に **v9** が出ました。v9 では `useReactTable` に代わって **`useTable`** という新しい API になり、使う機能の指定の仕方なども変わっています。ただ、既存のコードベースの多くはまだ v8 です。`package.json` の `@tanstack/react-table` が `8.x` で、コードに `useReactTable` があれば、今日の内容がそのまま読めます。

## 知らないフックの読み方

実務では、今日のような自作フックを初めて読むことがよくあります。上から 1 行ずつ読むより、次の順番で読むと迷いません。

1. **戻り値を見る** … `return { ... }` に何があるか。「このフックは呼び出し側に何をくれるのか」がわかる
2. **引数と型を見る** … 何を渡すと動くのか。`<TRow>` などのジェネリクス、省略できる引数とデフォルト値
3. **import を見る** … どの名前がどのライブラリから来ているか。わからない名前はそのライブラリのドキュメントで探す
4. **フックの呼び出しを 1 つずつ見る** … それぞれが「状態の置き場所」(useState / nuqs)、「取得」(useQuery)、「計算」(useMemo) のどれか
5. **データの流れを図にする** … 値がどこから来て、どこへ行くか

目標コードに当てはめると、流れはこうなります (明日の Day 14 で 1 行ずつ確かめます)。

```text
URL (?scope=&page=&q=)
  └─ useQueryStates(scopeParsers) ─→ { scope, page, q }
        ├─ useQuery({ queryKey: [resource, { scope, page, q, pageSize }] }) ─→ rows / rowCount
        └─ useMemo ─→ pagination { pageIndex: page - 1, pageSize }
表の「次へ」─→ onPaginationChange(updater) ─→ setParams({ page: pageIndex + 1 }) ─→ URL (先頭に戻る)
```

## まとめ: 目標コードを分解する

```ts
const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);
```

1. `useMemo<PaginationState>` … 型引数で「`PaginationState` を返す」と指定している (Day 4 のジェネリクス)
2. `pageIndex: page - 1` … URL の 1 始まりを、表の 0 始まりに変換
3. `[page, pageSize]` … この 2 つが変わったときだけ新しいオブジェクトを作る。参照を安定させる (Day 7)

```ts
const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
  const next = typeof updater === 'function' ? updater(pagination) : updater;
  void setParams({ page: next.pageIndex + 1 });
};
```

1. `OnChangeFn<PaginationState>` … `(updater: Updater<PaginationState>) => void` という型の関数
2. `typeof updater === 'function' ? updater(pagination) : updater` … Updater を「次の状態」に解決する
3. `next.pageIndex + 1` … 0 始まりを 1 始まりに戻して URL に書く (1 ページ目なら clearOnDefault で `page` が消える)
4. `void` … `setParams` が返す Promise は待たない (Day 11)

このフックは `tableState: { pagination }` と `onPaginationChange` を返し、呼び出し側が `useReactTable({ ..., manualPagination: true, rowCount, state: tableState, onPaginationChange })` のように渡して使います。
