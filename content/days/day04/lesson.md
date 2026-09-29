---
day: 4
level: 1
title: TypeScript ②・モジュール・非同期
summary: "ジェネリクス <T>、Partial / Pick / Omit などのユーティリティ型、satisfies、import / export、Promise と async / await を読めるようにする。"
minutes: 120
goals:
  - "function first<T>(xs: T[]): T | undefined のようなジェネリクスを読んで、T が何になるか答えられる"
  - "Partial / Pick / Omit / Record / ReturnType / Awaited と T['key'] が作る型を説明できる"
  - "import { a }、import b、import type、@/ エイリアスの違いがわかる"
  - "async / await / try-catch / Promise.all を使ったコードの流れを追える"
readings:
  - title: TypeScript Handbook — Generics
    url: https://www.typescriptlang.org/docs/handbook/2/generics.html
  - title: TypeScript Handbook — Utility Types
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html
  - title: TypeScript 4.9 リリースノート (satisfies 演算子)
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html
  - title: MDN — import
    url: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/import
  - title: JavaScript Primer — 非同期処理 (Promise / Async Function)
    url: https://jsprimer.net/basic/async/
---

## 今日のゴール

Level 1 の最終日です。目標コードの冒頭と、関数の「入り口」を読めるようにします。

```ts
import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import type { Paginated } from './api';

export function useSharedScopeQuery<TRow>(
  resource: string,
  fetcher: (params: ScopeParams, signal: AbortSignal) => Promise<Paginated<TRow>>,
  { pageSize = 20, enabled = true }: Options = {},
) {
```

`<TRow>` はジェネリクス、`Promise<...>` は非同期処理の結果、`import type` は型だけの読み込みです。今日の最後に、このコードを 1 行ずつ分解します。

## ジェネリクス: 型の「引数」

関数が値の引数を受け取るように、**型も引数として受け取れます**。これがジェネリクスです。

```ts
function first<T>(xs: T[]): T | undefined {
  return xs[0];
}

const a = first([1, 2, 3]); // T = number と推論 → a: number | undefined
const b = first(['x', 'y']); // T = string と推論 → b: string | undefined
const c = first<string>([]); // < > で明示することもできる
```

`<T>` は「**呼ばれるたびに決まる型の穴**」です。`first([1, 2, 3])` と呼ぶと、引数 `number[]` から TypeScript が `T = number` を推論し、戻り値も `number | undefined` になります。`any[]` を受け取る関数にすると、戻り値の型の情報が失われてしまいます。ジェネリクスは「入力の型と出力の型のつながり」を保つための仕組みです。

型の名前にも `<T>` を付けられます。目標コードの `Paginated` はこう定義されています (`content/target/api.ts`)。

```ts
export type Paginated<T> = {
  items: T[];
  total: number;
};

type UserPage = Paginated<User>; // { items: User[]; total: number }
```

`string[]` を `Array<string>` とも書けるのは、同じ仕組みです。`Promise<User>` は「あとで `User` が手に入る Promise」です (後半で扱います)。

### 型引数を明示するよくある場面

```ts
const [q, setQ] = useState<string | null>(null);
// 初期値 null だけだと型が null になってしまうので、「string か null」と明示している

const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);
// 目標コード 46 行目。useMemo が返す値の型を PaginationState に指定している
```

### 制約 `extends`

```ts
function findById<T extends { id: number }>(rows: T[], id: number): T | undefined {
  return rows.find((row) => row.id === id);
}
```

`T extends { id: number }` は「**T は少なくとも `id: number` を持つ型**」という条件です。ここでの `extends` は継承ではなく「〜を満たす」と読みます。

型パラメータの名前は `T` 1 文字が基本で、ライブラリでは `TData`・`TError`・`TRow` のように `T` + 役割の名前もよく使われます。

## ユーティリティ型

既存の型から新しい型を作る、組み込みの「型の関数」です。

```ts
type User = { id: number; name: string; email: string; role: 'admin' | 'member' };

type A = Partial<User>; // 全部省略可能 { id?: number; name?: string; ... }
type B = Pick<User, 'id' | 'name'>; // 選ぶ   { id: number; name: string }
type C = Omit<User, 'id'>; // 除く  { name: string; email: string; role: ... }
type D = Record<'admin' | 'member', string>; // { admin: string; member: string }
type E = Record<string, number>; // キーは任意の文字列、値は number
```

実務では「更新 API の引数は `Partial<User>`」「新規作成フォームは `Omit<User, 'id'>`」「一覧に出す列は `Pick<...>`」のように使います。

関数から型を取り出すものもあります。

```ts
declare function fetchUser(id: number): Promise<User>; // 中身は省略 (型だけ宣言)

type R = ReturnType<typeof fetchUser>; // Promise<User>   戻り値の型
type P = Parameters<typeof fetchUser>; // [id: number]    引数の型 (タプル)
type U = Awaited<Promise<User>>; // User             Promise の中身
type V = Awaited<ReturnType<typeof fetchUser>>; // User   定番の組み合わせ
```

入れ子になっていたら **内側から** 読みます。`V` は「`fetchUser` (値) → `typeof` で型に → `ReturnType` で戻り値 `Promise<User>` → `Awaited` で中身 `User`」です。

## インデックスアクセス型 `T['key']`

型の世界で `型['キー']` と書くと、**そのプロパティの型** を取り出せます。

```ts
type Role = User['role']; // 'admin' | 'member'
type Rows = Paginated<User>['items']; // User[]
type Row = Paginated<User>['items'][number]; // User
```

Day 3 の `(typeof SCOPES)[number]` もこの仲間で、「数値の添字で読んだときの型」でした。

## satisfies — 型をチェックしつつ、推論は残す

オブジェクトに型を付ける方法は 3 つあり、意味が違います。

```ts
type Scope = 'all' | 'mine' | 'team';

// ① 型注釈: 変数の型が Record<Scope, string> になる
const labels1: Record<Scope, string> = { all: 'すべて', mine: '自分', team: 'チーム' };

// ② satisfies: 「この型を満たすか」はチェックするが、変数の型は推論されたまま
const labels2 = { all: 'すべて', mine: '自分', team: 'チーム' } satisfies Record<Scope, string>;

// ③ as: チェックがゆるい。キーが足りなくてもエラーにならない (Day 3)
const labels3 = { all: 'すべて' } as Record<Scope, string>; // 通ってしまう。labels3.team は実行時 undefined
```

違いが出るのは、注釈の型が「ゆるい」ときです。

```ts
const columns1: Record<string, string> = { name: '名前', email: 'メール' };
columns1.nmae; // エラーにならない (キーは任意の string なので)

const columns2 = { name: '名前', email: 'メール' } satisfies Record<string, string>;
columns2.nmae; // エラー: プロパティ 'nmae' は存在しません (実際のキーを覚えている)
```

設定ファイルや定数の定義で `satisfies` を見たら、「型のチェックだけしている。変数の型は中身そのもの」と読みます。

## モジュール: import と export

1 つのファイルが 1 つのモジュールです。`export` したものだけを、他のファイルから `import` できます。

```ts
// format.ts — 名前付き (named) export
export const formatDate = (d: Date) => d.toISOString().slice(0, 10);
export type DateText = string;

// UserList.tsx — default export (1 ファイルに 1 つまで)
export default function UserList() {
  /* ... */
}
```

```ts
import { formatDate } from './format'; // 名前付き: { } の中に export 側と同じ名前
import { formatDate as fmt } from './format'; // 名前を変えて読み込む
import * as format from './format'; // まとめて format.formatDate として使う
import UserList from './UserList'; // default: { } なし。名前は自由
import React, { useState } from 'react'; // default と名前付きを同時に
```

> **落とし穴:** default export と名前付き export は取り違えやすいです。default export を `import { UserList } from './UserList'` と `{ }` 付きで読み込むと、TypeScript では型エラーになります (型チェックをすり抜けて実行されると、`undefined` になったり読み込み自体が失敗したりします)。Next.js の `page.tsx` / `layout.tsx` は default export が必須です (Day 9)。

### import type

```ts
import type { Paginated } from './api'; // 型だけを読み込む (JavaScript に変換すると消える)
import { useQuery, type QueryKey } from '@tanstack/react-query'; // 一部だけ型
```

目標コードの `import type { OnChangeFn, PaginationState }` は「この 2 つは型としてしか使わない」という宣言です。

### 再エクスポート (バレルファイル)

```ts
// components/index.ts
export { Button } from './Button';
export { Dialog } from './Dialog';
export * from './form';
export type { ButtonProps } from './Button';
```

`index.ts` に「窓口」をまとめておくと、使う側は `import { Button, Dialog } from '@/components';` と 1 行で済みます。コードを読んでいて「定義へ移動」したら `index.ts` に着いた、というときは、もう 1 回たどりましょう。

### from の後ろの 3 種類

| 書き方 | 意味 |
| --- | --- |
| `'react'`、`'@tanstack/react-query'` | npm パッケージ (`node_modules` の中) |
| `'./api'`、`'../lib/format'` | 相対パス (`.ts` は省略) |
| `'@/components/Button'` | パスエイリアス。`tsconfig.json` の設定で `src/` などを指す |

```json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
```

> **落とし穴:** `@/` (エイリアス) と `@tanstack/` (パッケージ名の一部) は見た目が似ていますが別物です。`@` の直後が `/` ならエイリアスです (`~/` などを使うプロジェクトもあるので、迷ったら `tsconfig.json` の `paths` を見ます)。

## Promise と async / await

`Promise` は「**あとで結果が届く引換券**」です。通信のように時間がかかる処理は、すぐに結果を返せないので Promise を返します。Promise は「待機中」→「成功 (値が入る)」または「失敗 (エラーが入る)」のどちらかになります。

```ts
async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`); // レスポンスが届くまで待つ
  if (!res.ok) throw new Error(`HTTP ${res.status}`); // 失敗させる
  return (await res.json()) as User;
}

const user = await fetchUser(1); // User
fetchUser(1).then((u) => console.log(u.name)); // 同じことを .then で書いた形
```

- `async` を付けた関数は **必ず Promise を返します**。`return 1` と書いても、戻り値の型は `Promise<number>` です
- `await` は Promise の **中身を取り出します** (成功するまで待つ)。`async` 関数の中で使います
- Promise が失敗すると、`await` の行で **例外が投げられます**

> **落とし穴:** `await` を忘れると、変数には中身ではなく Promise そのものが入ります。`const user = fetchUser(1); user.name` は「プロパティ 'name' は型 'Promise<User>' に存在しません」という型エラーになります。

### エラー処理: try / catch

```ts
async function loadName(id: number): Promise<string> {
  try {
    const user = await fetchUser(id);
    return user.name;
  } catch (e) {
    // e の型は unknown。Error かどうか絞り込んでから使う (Day 3)
    return e instanceof Error ? `読み込み失敗: ${e.message}` : '読み込み失敗';
  } finally {
    // 成功しても失敗しても最後に実行される (ローディング表示を消す、など)
  }
}
```

### 並列に待つ: Promise.all

```ts
// 順番に待つ: 合計時間 = 2 つの和
const user = await fetchUser(1);
const teams = await fetchTeams();

// 同時に始めて、全部そろうまで待つ: 合計時間 ≒ いちばん遅いもの
const [user2, teams2] = await Promise.all([fetchUser(1), fetchTeams()]);

// 配列の全要素を並列に
const users = await Promise.all(ids.map((id) => fetchUser(id)));
```

結果は **渡した順番どおりの配列** なので、Day 1 の配列の分割代入で受け取るのが定番です。1 つでも失敗すると `Promise.all` 全体が失敗します。「ユーザーを取ってから、その `teamId` でチームを取る」のように **前の結果が必要なもの** は、順番に `await` するしかありません。

### 実行の順番

```ts
console.log('1');
fetchUser(1).then(() => console.log('3'));
console.log('2');
// 1 → 2 → 3
```

`then` や `await` の「続き」は、**今実行中の処理が最後まで終わってから** 動きます。Promise がすでに成功していても同じです。

### AbortSignal — 中断の合図

```ts
const controller = new AbortController();
fetch('/api/users', { signal: controller.signal });
controller.abort(); // 通信を中断する → fetch の Promise は失敗する
```

TanStack Query は、不要になった通信 (ページを素早く切り替えたときの古いリクエストなど) を中断できるように、`queryFn` に `signal` を渡してくれます。目標コードの `queryFn: ({ signal }) => fetcher({ scope, page, q }, signal)` はそれを `fetcher` に受け渡しています (Day 12)。

## まとめ: 目標コードを分解する

```ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import type { Paginated } from './api';
```

- 1 行目: npm パッケージから、名前付き export を 2 つ読み込む
- 2 行目: 型だけを読み込む (実行時には消える)
- 3 行目: 同じフォルダの `api.ts` から型を読み込む

```ts
export function useSharedScopeQuery<TRow>(
  resource: string,
  fetcher: (params: ScopeParams, signal: AbortSignal) => Promise<Paginated<TRow>>,
  { pageSize = 20, enabled = true }: Options = {},
) {
```

1. `<TRow>` — 型パラメータ。「行の型」は呼び出し側が決める
2. `fetcher: (...) => Promise<Paginated<TRow>>` — 「`ScopeParams` と `AbortSignal` を受け取り、`{ items: TRow[]; total: number }` を **あとで** 返す関数」を受け取る
3. `{ pageSize = 20, enabled = true }: Options = {}` — 第 3 引数は `Options` 型のオブジェクト。分割代入で取り出し、無ければ `20` / `true`。引数ごと省略されたら `{}` を使う (`= {}` が無いと、省略時に `undefined` を分割代入しようとしてエラーになる)

呼び出し側から見るとこうなります。

```ts
declare function fetchUsers(params: ScopeParams, signal: AbortSignal): Promise<Paginated<User>>;

const result = useSharedScopeQuery('users', fetchUsers); // TRow = User と推論される
const result2 = useSharedScopeQuery('users', fetchUsers, { pageSize: 50 });
// result.rows の型は User[]
```

`TRow` を書かなくても、渡した `fetcher` の戻り値から `User` が推論されます。これで Level 1 (JavaScript / TypeScript) は終わりです。レベル試験で力試しをしましょう。
