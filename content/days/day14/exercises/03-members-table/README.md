---
title: MembersTable を組み立てる
optional: false
preview: preview.tsx
hints:
  - "`useReactTable` に `manualPagination: true, rowCount, state: tableState, onPaginationChange` を足します。フックが返す名前とテーブルのオプション名がそろえてあるので、ほぼ並べるだけです (Day 13)。"
  - "ページ表示は `{table.getState().pagination.pageIndex + 1} / {table.getPageCount()} ページ (全 {rowCount} 件)` です。`getPageCount()` は `rowCount` と `pageSize` から計算されます。"
  - "ボタンは `<button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>次へ</button>`。`<select id=\"scope-select\" value={scope} onChange={(e) => setScope(e.target.value as Scope)}>` の前に `<label htmlFor=\"scope-select\">表示範囲</label>` を置きます。"
---

`useSharedScopeQuery` を **使う側** のコンポーネントを完成させます。実務では、ページのコンポーネントがフックの戻り値を `useReactTable` にそのまま渡している形をよく見ます。

`useSharedScopeQuery.ts` は目標コードと同じもの、`api.ts` は 12 人のメンバーを 1 ページ 5 件で返す疑似 API です。

### 仕様

1. **テーブルの設定 (TODO 1)** — サーバー側でページ分割するので、`useReactTable` に次の 4 つを渡す
   - `manualPagination: true` / `rowCount` / `state: tableState` / `onPaginationChange`
2. **表示範囲 (TODO 2)** — ラベル「表示範囲」の付いた `<select>`。選択肢は `SCOPES` の順で、表示名は `SCOPE_LABELS` (`すべて` / `自分が追加` / `自分のチーム`)、`value` は `'all'` などの値。選ぶと `setScope` を呼ぶ
3. **ページ表示 (TODO 3)** — `1 / 3 ページ (全 12 件)` の形式。取得中 (`isFetching`) は後ろに ` 更新中…` を付ける
4. **ボタン (TODO 4)** — 「前へ」「次へ」。`table.previousPage()` / `table.nextPage()` を呼び、進めないときは `disabled`

### 期待する動き

| 最初の URL | 操作 | URL | 表示 |
| --- | --- | --- | --- |
| (空) | — | (空) | 佐藤〜伊藤、`1 / 3 ページ (全 12 件)`、「前へ」は押せない |
| (空) | 「次へ」 | `?page=2` | 渡辺〜加藤、`2 / 3 ページ` |
| `?page=3` | 「前へ」 | `?page=2` | 最初は吉田・山田、「次へ」は押せない |
| `?page=2` | 「自分のチーム」を選ぶ | `?scope=team` (page は消える) | `1 / 2 ページ (全 6 件)` |

「プレビュー」欄では、上に今の URL が表示されます。ボタンやセレクトを操作して、URL → 表示 → URL の一周を目で確かめてください。
