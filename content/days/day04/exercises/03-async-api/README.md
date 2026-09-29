---
title: async / await で API を呼ぶ
hints:
  - "`const user = await fetchUser(id);` で中身を取り出します。失敗 (reject) すると `await` の行で例外が投げられるので、`try { ... } catch { ... }` で受け止めます。"
  - "`try` の中で `return fetchUser(id).then(...)` のように `await` せずに Promise を返すと、失敗が `catch` に届きません。いったん `await` で受けてから `return` しましょう。"
  - "`getUserNames` は `await Promise.all(ids.map((id) => fetchUser(id)))` で、全員分の `User[]` がそろいます。そのあと `map` で名前にします。"
---

疑似 API (`api.ts`、読み取り専用) を使って、3 つの `async` 関数を作ります。API はどれも 10 ミリ秒ほど待ってから結果を返し、見つからないときは `Error` で **失敗 (reject)** します。

```ts
fetchUser(1); // → { id: 1, name: 'Alice', teamId: 10 }
fetchTeam(10); // → { id: 10, name: '開発' }
fetchUser(99); // → 失敗: Error('ユーザー 99 は見つかりません')
```

### 1. `getUserName(id)`

ユーザー名を返します。ユーザーが見つからない (`fetchUser` が失敗する) ときは、失敗させずに `'(不明なユーザー)'` を返します。

### 2. `getUserWithTeam(id)`

ユーザーを取得し、その `teamId` でチームを取得して `{ name: ユーザー名, team: チーム名 }` を返します。こちらは、ユーザーが見つからなければ **そのまま失敗** させます (`catch` しない)。

```ts
await getUserWithTeam(3); // { name: 'Carol', team: '開発' }
```

### 3. `getUserNames(ids)` — 遅いのを直す

今の実装は `for` 文で 1 人ずつ順番に `await` しているため、100 人いれば 100 回分待つことになります。`Promise.all` を使って **全員分を同時に** 取得するように書き直してください。結果の順番は `ids` と同じにします。

```ts
await getUserNames([3, 1, 2]); // ['Carol', 'Alice', 'Bob']
```

テストでは、API が「同時に何件通信中になったか」を記録して、並列になっているかを確かめます。
