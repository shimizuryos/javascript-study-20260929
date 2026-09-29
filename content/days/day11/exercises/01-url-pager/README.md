---
title: ページ番号を URL に置く
preview: preview.tsx
hints:
  - "`useState(1)` を `useQueryState('page', parseAsInteger.withDefault(1))` に置き換えます。戻り値の形 `[値, 更新関数]` は useState と同じです。"
  - "withDefault があるので `page` は `number` 型です (null になりません)。「次へ」は `setPage((old) => old + 1)` のような関数型更新でも書けます。"
  - "「前へ」は `disabled={page <= 1}` で押せなくします。1 ページ目に戻ると、デフォルト値なので `page` は URL から消えます。"
---

`main.tsx` の `Pager` は、ページ番号を `useState` に入れているので、リロードすると 1 ページ目に戻ってしまいます。**ページ番号を URL の `?page=` に置く** ように書き換えてください。

| URL | 表示 |
| --- | --- |
| `/articles` | `1 ページ目` (「前へ」は押せない) |
| `/articles?page=3` | `3 ページ目` |
| `/articles?page=abc` | `1 ページ目` (不正な値はデフォルト扱い) |

- 「次へ」で 1 増やし、「前へ」で 1 減らす
- 1 ページ目のときは「前へ」を `disabled` にする
- `?page=2` で「前へ」を押すと、URL から `page` が消える (デフォルト値は書き込まれない)

テストは `NuqsTestingAdapter` で囲んで実行し、`onUrlUpdate` に渡される `queryString` (例: `'?page=4'`) で URL を確かめます。プレビュー欄では、ボタンを押すと上の URL 表示が変わる様子を確認できます。
