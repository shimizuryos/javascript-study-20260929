---
title: タスク管理の型を作る
typecheck: true
hints:
  - "`STATUSES` に `as const` を付け、`type Status = (typeof STATUSES)[number];` で作ります。"
  - "`Pick<Task, 'id' | 'title'>`、`Omit<Task, 'id'>`、`Record<Status, Task[]>` を使います。"
  - "`groupByStatus` は、`const pick = (status: Status) => tasks.filter(...)` のような小さな関数を作って、`{ todo: pick('todo'), ... }` と組み立てると簡潔です。"
---

タスク管理画面の型を作る **型チェック演習** です (型エラー 0 件 + テスト合格で正解)。`main.ts` の `TODO` を埋めてください。

| 名前 | 作りたいもの |
| --- | --- |
| `STATUSES` | 型が `readonly ['todo', 'doing', 'done']` になる配列 |
| `Status` | `'todo' \| 'doing' \| 'done'` (`STATUSES` から作る) |
| `TaskPreview` | `Task` の `id` と `title` だけの型 |
| `NewTask` | `Task` から `id` を除いた型 (新規作成用) |
| `TasksByStatus` | キーが `Status`、値が `Task[]` のオブジェクト型 |

`Task` 型は定義済みです。

```ts
export type Task = { id: number; title: string; status: Status; assignee: string | null };
```

最後に、タスクの配列を状態ごとに分ける `groupByStatus(tasks)` を実装します。該当するタスクが無い状態も、空配列としてキーを含めます。

```ts
groupByStatus([
  { id: 1, title: '設計', status: 'done', assignee: 'Alice' },
  { id: 2, title: '実装', status: 'doing', assignee: null },
]);
// { todo: [], doing: [実装のタスク], done: [設計のタスク] }
```
