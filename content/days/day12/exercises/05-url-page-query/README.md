---
title: "(発展) URL のページ番号で取得する"
optional: true
preview: preview.tsx
hints:
  - "`const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));` で URL から読みます (Day 11)。"
  - "queryKey は `['articles', { page }]`、queryFn は `({ signal }) => fetchArticles(page, signal)` です。page が変わるとキーが変わり、自動で取得されます。"
  - "ページ数は `Math.ceil(data.total / PAGE_SIZE)` です。data が無い間は 1 としておきます。"
---

Day 11 の nuqs と今日の TanStack Query を組み合わせて、**目標コードと同じ流れ** を作ります。

```text
「次へ」 → setPage(3) → URL が ?page=3 に → page が 3 に → queryKey が変わる → 自動で取得
```

`ArticleList` を次のように作ってください。

- ページ番号は `useState` ではなく **URL の `?page=`** に置く (無ければ 1)
- `useQuery` のキーは `['articles', { page }]`、`placeholderData: keepPreviousData` を付ける
- 一覧の下に `<p>{page} / {全ページ数} ページ</p>` を表示する (1 ページ 3 件。全ページ数は `data.total` から計算)
- 「前へ」は 1 ページ目で、「次へ」は最後のページか仮のデータを表示している間は押せない

テストは `NuqsTestingAdapter` と `QueryClientProvider` の両方で囲んで実行します。
