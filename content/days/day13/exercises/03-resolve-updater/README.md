---
title: Updater を解決して 1 始まりの page に変換する
hints:
  - "`resolvePagination` は `typeof updater === 'function' ? updater(current) : updater` の 1 行です。目標コード 49 行目と同じです。"
  - "`toPagination(page, pageSize)` は `{ pageIndex: page - 1, pageSize }` です。"
  - "`createPaginationHandler` が返す関数の中で、`resolvePagination(updater, toPagination(page, pageSize))` の結果の `pageIndex + 1` を `setPage` に渡します。"
---

目標コード 46〜51 行目の「表のページ ⇔ URL のページ」の変換を、React を使わない小さな関数に分けて作ります。

### 1. `resolvePagination(updater, current)`

`onPaginationChange` が受け取る `Updater<PaginationState>` (値 **または** 前の値を受け取る関数) を、「次の状態」に解決します。

```ts
const current = { pageIndex: 2, pageSize: 20 };
resolvePagination({ pageIndex: 0, pageSize: 20 }, current); // { pageIndex: 0, pageSize: 20 }
resolvePagination((old) => ({ ...old, pageIndex: old.pageIndex + 1 }), current); // { pageIndex: 3, pageSize: 20 }
```

### 2. `toPagination(page, pageSize)`

URL の 1 始まりの `page` を、表の `PaginationState` (0 始まりの `pageIndex`) にします。

```ts
toPagination(3, 20); // { pageIndex: 2, pageSize: 20 }
```

### 3. `createPaginationHandler(page, pageSize, setPage)`

表に渡す `onPaginationChange` を作ります。表から Updater を受け取ったら、次の状態に解決し、**1 始まりに戻して** `setPage` を呼びます。

```ts
const onPaginationChange = createPaginationHandler(3, 20, setPage);
onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex + 1 })); // setPage(4)
onPaginationChange({ pageIndex: 0, pageSize: 20 }); // setPage(1)
```

いまの `main.ts` の `createPaginationHandler` は「Updater は必ず値だ」と思い込んでいるため、関数が来ると `setPage(NaN)` になってしまいます。最後のテストでは、本物の `useReactTable` に渡して「次へ」「最初へ」「最後へ」を押したときの動きを確かめます。
