---
title: 配列メソッドでユーザー一覧を加工する
hints:
  - "`activeNames` は `users.filter(...).map(...)` の 2 段です。"
  - "`nameOf` は `find` の結果に `?.name` を付け、`?? '(不明)'` で見つからないときの値を決めます。"
  - "`inTeams` は `filter` の中で `teams.includes(u.team)` を使います。`summarize` は `length` / `some` / `every` を組み合わせます。"
---

次のユーザー一覧を加工する関数を 4 つ作ります。**`for` 文は使わず**、配列メソッドで書いてみましょう。

```ts
const users: User[] = [
  { id: 1, name: 'Alice', team: 'dev', active: true, age: 31 },
  { id: 2, name: 'Bob', team: 'sales', active: false, age: 17 },
  { id: 3, name: 'Carol', team: 'dev', active: true, age: 24 },
  { id: 4, name: 'Dave', team: 'design', active: true, age: 45 },
];
```

| 関数 | 内容 | 例 (上の `users` の場合) |
| --- | --- | --- |
| `activeNames(users)` | `active` が `true` の人の名前の配列 | `['Alice', 'Carol', 'Dave']` |
| `nameOf(users, id)` | `id` の人の名前。見つからなければ `'(不明)'` | `nameOf(users, 3)` → `'Carol'`、`nameOf(users, 9)` → `'(不明)'` |
| `inTeams(users, teams)` | `teams` のどれかに所属する人の配列 (元の順番のまま) | `inTeams(users, ['dev', 'design'])` → Alice, Carol, Dave |
| `summarize(users)` | `{ count: 人数, hasMinor: 18 歳未満が 1 人でもいるか, allActive: 全員 active か }` | `{ count: 4, hasMinor: true, allActive: false }` |

空の配列を渡したときの `summarize([])` は `{ count: 0, hasMinor: false, allActive: true }` になります (`every` は空配列で `true` を返すため。レッスンの「落とし穴」を参照)。
