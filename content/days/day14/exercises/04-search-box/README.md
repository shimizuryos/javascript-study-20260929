---
title: "(発展) 検索ボックスを URL につなぐ"
optional: true
hints:
  - "フックの戻り値から `q` と `setSearch` も取り出します。`q` は `string | null` なので、入力欄には `value={q ?? ''}` を渡します (`null` は input の value にできません)。"
  - "`onChange={(e) => void setSearch(e.target.value)}` で、入力のたびに URL の `q` が変わります。`setSearch` の中で `page: null` もセットされるので、自分で page を戻す必要はありません。"
  - "クリアボタンは `onClick={() => void setSearch('')}` と `disabled={q === null}`。`setSearch('')` は `q: '' || null` → `null` なので、`q` が URL から消えます。"
---

メンバー一覧に **名前の検索ボックス** を付けます。今の `starter.tsx` は入力を `useState` に入れているだけなので、URL にも API にも届きません。フックの `q` / `setSearch` を使って、**URL の `q` と入力欄を同期** させてください。

### 仕様

- 入力欄 (ラベル「名前で検索」) の値は URL の `q`。URL に `q` が無ければ空欄
- 入力すると `setSearch` を呼ぶ → URL の `q` が変わり、`page` は消える (1 ページ目に戻る)
- 「クリア」ボタンで検索語を消す。検索語が無い (`q === null`) ときは `disabled`

| 最初の URL | 操作 | URL | 表示 |
| --- | --- | --- | --- |
| `?q=山` | — | `?q=山` | 入力欄に「山」、山本・山田 (`該当 2 件`) |
| `?page=2` | 「田」と入力 | `?q=田` | 田中・吉田・山田 |
| `?q=田` | 「クリア」 | (空) | 入力欄は空、`該当 12 件` |

### 考えてみよう

- `?page=2` のまま `q=田` で検索したら、何が表示されるでしょうか? (「田」を含む人は 3 人 = 1 ページしかありません)。`setSearch` が `page: null` もセットしている理由がわかります。
- 1 文字入力するたびに API が呼ばれます。実務では nuqs の `limitUrlUpdates: debounce(300)` などで URL の更新を間引くことがあります。
