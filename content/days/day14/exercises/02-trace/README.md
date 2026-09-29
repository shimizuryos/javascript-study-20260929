---
title: 状態の変化を追いかける (予想)
optional: false
hints:
  - "URL の `page` は 1 始まり、`pageIndex` は 0 始まりです。`pageSize` はフックの第 3 引数 (`PAGE_SIZE` = 5) がそのまま入ります。"
  - "nuqs v2 は、パーサーの **デフォルト値と同じ値** をセットすると、そのキーを URL から消します (`clearOnDefault` が既定で `true`)。`page: null` をセットしたときも消えます。"
  - "`keepPreviousData` は「今の queryKey のデータがキャッシュに無いとき」だけ前のデータを仮表示します。キャッシュにあるなら本物のデータ (`isPlaceholderData: false`) を表示しつつ、古ければ (staleTime 0) 裏で取り直します。"
---

**実行せずに** 状態の変化を予想する問題です。`useSharedScopeQuery.ts` (目標コードと同じもの) と `api.ts` (12 人のメンバー、1 ページ 5 件) を読み、`main.ts` の `answers` に予想を書いてください。テストは本物のフックを動かして、あなたの予想と一致したかだけを判定します (正解はメッセージに出ません)。

フックはすべて次の形で呼ばれます。

```ts
useSharedScopeQuery('members', fetchMembers, { pageSize: PAGE_SIZE }); // PAGE_SIZE = 5
```

| 問 | 最初の URL | 操作 | 答えるもの |
| --- | --- | --- | --- |
| Q1 | `?scope=team&page=2` | なし | `tableState.pagination` |
| Q2 | `?page=2&q=田` | 読み込み完了まで待つ | `[rows.length, rowCount]` |
| Q3 | `?scope=team&page=2` | `setScope('mine')` | 更新後の URL のクエリ |
| Q4 | `?page=2` | `onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex - 1 }))` | 更新後の URL のクエリ |
| Q5 | `?page=2` | 読み込み完了後に `onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex + 1 }))` | その **直後** (次のページの取得中) の `{ first: rows[0].name, pageIndex, isPlaceholderData }` |
| Q6 | (空) | 1 ページ目を表示 → 「次へ」→ 2 ページ目を表示 → 「前へ」 | 「前へ」の **直後** の `isPlaceholderData` |
| Q7 | (空) | Q6 と同じ操作のあと、取得がすべて終わるまで待つ | `fetchMembers` が呼ばれた合計回数 |

- URL のクエリは `{ scope: 'team', page: '2' }` のようにオブジェクトで書きます (値は文字列。何も無ければ `{}`)。
- `api.ts` の名前の並び: `佐藤, 鈴木, 高橋, 田中, 伊藤, 渡辺, 山本, 中村, 小林, 加藤, 吉田, 山田` (全員 = `scope: 'all'`)。

間違えた問題は、レッスンの「『次へ』を押したときのタイムライン」を読み直してから再挑戦しましょう。
