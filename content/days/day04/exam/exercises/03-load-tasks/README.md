---
title: 失敗や null を扱う非同期処理
hints:
  - "`id` が `null` のときは、API を呼ぶ前に `return` します (早期 return)。その下では `id` が `number` に絞り込まれます。"
  - "`catch (e)` の `e` は `unknown` 型です。`e instanceof Error ? e.message : String(e)` で、Error なら message、それ以外は文字列にします。"
  - "`loadAssignees` は `await Promise.all(ids.map((id) => fetchTask(id)))` のあと、`task.assignee ?? '未割り当て'` に変換します。"
---

疑似 API `fetchTask(id)` (`api.ts`、読み取り専用) を使って、2 つの `async` 関数を作ります。`fetchTask` は 10 ミリ秒ほど待ってからタスクを返しますが、次のように **失敗 (reject) することがあります**。

```ts
await fetchTask(1); // { id: 1, title: '設計レビュー', assignee: 'Alice' }
await fetchTask(99); // 失敗: Error('タスク 99 は見つかりません')
await fetchTask(-1); // 失敗: 文字列 'ID が不正です' (Error ではない値で失敗する古いコード)
```

### 1. `loadTaskTitle(id: number | null): Promise<string>`

- `id` が `null` (未選択) → **API を呼ばずに** `'(未選択)'`
- 取得できた → タスクの `title`
- 失敗した → `'読み込み失敗: '` + 理由。理由は、失敗の値が `Error` ならその `message`、そうでなければ `String(値)`

```ts
await loadTaskTitle(1); // '設計レビュー'
await loadTaskTitle(null); // '(未選択)'
await loadTaskTitle(99); // '読み込み失敗: タスク 99 は見つかりません'
await loadTaskTitle(-1); // '読み込み失敗: ID が不正です'
```

### 2. `loadAssignees(ids: number[]): Promise<string[]>`

`ids` のタスクを **並列に** (`Promise.all`) 取得し、担当者名の配列を返します。担当者が `null` のタスクは `'未割り当て'` にします。順番は `ids` と同じです。

```ts
await loadAssignees([3, 2, 1]); // ['Bob', '未割り当て', 'Alice']
```
