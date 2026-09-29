---
title: 表をページに分ける (クライアント側)
hints:
  - "`useReactTable` に `getPaginationRowModel: getPaginationRowModel()` と `initialState: { pagination: { pageIndex: 0, pageSize: 5 } }` を足します。"
  - "ボタンは `onClick={() => table.previousPage()}` / `disabled={!table.getCanPreviousPage()}` のように、表のメソッドを呼ぶだけです。"
  - "今のページは `table.getState().pagination.pageIndex` (0 始まり) なので、表示するときは `+ 1` します。全ページ数は `table.getPageCount()` です。"
---

12 件の商品を、**1 ページ 5 件** に分けて表示する表を作ります。全データは手元にあるので、TanStack Table に行を切り出してもらいます (`getPaginationRowModel`)。

```text
商品1〜5    「1 / 3」  [前へ(押せない)] [次へ]
  次へ →
商品6〜10   「2 / 3」  [前へ] [次へ]
  次へ →
商品11〜12  「3 / 3」  [前へ] [次へ(押せない)]
```

- 表の下に `<p>` で `{今のページ} / {全ページ数}` を表示する (人間向けなので 1 始まり)
- 「前へ」「次へ」は `table.previousPage()` / `table.nextPage()` を呼ぶ
- 行けないときはボタンを `disabled` にする (`getCanPreviousPage()` / `getCanNextPage()`)
