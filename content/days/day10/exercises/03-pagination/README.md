---
title: 他のクエリを保つページ送りリンク
hints:
  - "今のページは `Number(searchParams.get('page'))` を `Number.isInteger(n) && n >= 1` で確認し、だめなら `1` にします (`?page` が無いと `get` は `null` → `Number(null)` は `0` なので 1 になります)。"
  - "リンク先は `const params = new URLSearchParams(searchParams);` でコピーしてから `params.set('page', String(target))` (1 ページ目なら `params.delete('page')`) で作ります。"
  - "`` const qs = params.toString(); return qs ? `${pathname}?${qs}` : pathname; `` とすると、クエリが空のときに `/products?` のような URL になりません。"
---

一覧画面の下に置く **ページ送り** を作ります。前の演習と同じく、検索語 (`q`) やタグ (`tags`) などの **他のクエリを保ったまま** `page` だけを変えたリンクにするのがポイントです。

### 仕様: `<Pagination totalPages={5} />`

- 今のページは URL の `page` (無い・不正な値なら `1`)
- `{今のページ} / {totalPages}` を表示する (例: `2 / 5`)
- 「前へ」「次へ」は `next/link` の `Link` にする。**リンク先は今の URL から `page` だけを変えたもの**
  - 1 ページ目へのリンクは `page` を URL から **消す** (デフォルト値なので書かない)
- 1 ページ目では「前へ」、最後のページでは「次へ」を **リンクにしない** (`<span>前へ</span>` のように文字だけ表示)

```txt
今の URL: /products?q=shoe&page=2&tags=a&tags=b
「前へ」 → /products?q=shoe&tags=a&tags=b
「次へ」 → /products?q=shoe&page=3&tags=a&tags=b
```

Server Component の page から使う場合は、この部品を `<Suspense>` で囲むことになります (`useSearchParams` を使うため。レッスン参照)。

目標コードでは、TanStack Table の「次のページ」操作を `setParams({ page: next.pageIndex + 1 })` で URL に書き戻しています (Day 13)。やっていることはこの演習と同じです。
