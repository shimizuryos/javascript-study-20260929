---
title: ユーティリティ型で型を作る
typecheck: true
hints:
  - "`Pick<User, 'id' | 'name'>` で選ぶ、`Omit<User, 'id' | 'createdAt'>` で除く、`Partial<...>` で全部を省略可能にします。"
  - "`User['role']` で role の型を取り出せます。`Record<Role, string>` は「キーが Role、値が string」のオブジェクト型です。"
  - "関数から型を取り出すには、まず `typeof fetchUser` で関数の型にします。`Awaited<ReturnType<typeof fetchUser>>` は内側から読みます。"
---

`User` 型と `fetchUser` 関数をもとに、**ユーティリティ型を使って** 次の 7 つの型を作ってください (中身を手で書き写さず、`User` から作ること)。そのあと、2 つの関数を完成させます。

```ts
export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
};
```

| 型 | 意味 | できあがる型 |
| --- | --- | --- |
| `UserSummary` | 一覧に出す列だけ | `{ id: number; name: string }` |
| `NewUser` | 新規作成フォームの入力 (`id` と `createdAt` はサーバーが決めるので除く) | `{ name: string; email: string; role: ... }` |
| `UserPatch` | 更新 API の引数 (`NewUser` の項目のうち、変えたいものだけ送る) | `{ name?: string; email?: string; role?: ... }` |
| `Role` | `User` の `role` の型 | `'admin' \| 'member'` |
| `RoleLabels` | 役割ごとの表示名 | `{ admin: string; member: string }` |
| `FetchedUser` | `fetchUser` が最終的に返すもの (Promise の中身) | `User` |
| `FetchUserArgs` | `fetchUser` の引数の型 (タプル) | `[id: number]` |

関数:

- `applyPatch(user, patch)` … `user` に `patch` の内容を上書きした **新しい** `User` を返す
- `toSummary(user)` … `{ id, name }` だけのオブジェクトを返す (他のプロパティを含めない)

```ts
applyPatch(alice, { role: 'member' }); // alice のコピーで role だけ 'member'
toSummary(alice); // { id: 1, name: 'Alice' }
```
