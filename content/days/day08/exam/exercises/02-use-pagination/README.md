---
title: 自作フック usePagination
hints:
  - "ページ数は `Math.max(1, Math.ceil(total / pageSize))` です (0 件でも 1 ページとする)。"
  - "`next` は `setPage((p) => Math.min(p + 1, pageCount))`、`prev` は `setPage((p) => Math.max(p - 1, 1))` のように **関数型更新** で書くと、続けて呼んでも正しく動きます。"
  - "`pagination` は目標コード 46 行目と同じ形です: `useMemo(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize])`"
---

一覧のページ送りのロジックを、自作フック `usePagination` にまとめます。

```ts
const { page, pageCount, canPrev, canNext, next, prev, pagination } = usePagination(45, 10);
// page: 1, pageCount: 5, canPrev: false, canNext: true
// pagination: { pageIndex: 0, pageSize: 10 }
```

- `usePagination(total, pageSize = 10)`
- `page` … 今のページ (**1 始まり**)。最初は 1
- `pageCount` … `total / pageSize` の切り上げ。ただし 0 件でも 1
- `canPrev` / `canNext` … 前 / 次のページがあるか
- `next()` / `prev()` … ページを 1 つ進める / 戻す。範囲外には行かない。1 回の処理の中で続けて呼んでも正しく動く
- `pagination` … テーブル用の `{ pageIndex: page - 1, pageSize }` (**0 始まり**)。page と pageSize が変わらない限り **同じオブジェクト** を返す
