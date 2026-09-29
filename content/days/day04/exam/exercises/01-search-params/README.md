---
title: URL のクエリとオブジェクトを変換する
hints:
  - "`toSearchObject` は引数を `({ scope, page, q }: Params)` と分割代入で受け取り、`{ [PARAM_KEYS.scope]: scope, ... }` のように計算されたキーで作ります。`q` を入れるかどうかは、先に `q` 以外で作ったオブジェクトに `{ ...base, [PARAM_KEYS.q]: q }` と足すかで分けられます。"
  - "`changeScope` は `{ ...params, scope, page: 1 }` の形です。"
  - "`fromSearchObject` では、`??` (無いときだけ) と `||` (空文字も無い扱い) を使い分けます。"
---

検索画面の条件 `Params` と、URL のクエリを表すオブジェクトを相互に変換する関数を 3 つ作ります。URL 上の名前は `PARAM_KEYS` で決まっています (`page` は `p`、`q` は `keyword`)。**キー名は `PARAM_KEYS` から取って** ください。

```ts
export const PARAM_KEYS = { scope: 'scope', page: 'p', q: 'keyword' } as const;
export type Params = { scope: string; page: number; q: string | null };
```

### 1. `toSearchObject(params)` — 条件 → URL 用オブジェクト

- 値はすべて文字列にする (`page` は `String(page)`)
- `q` が `null` または `''` のときは、`keyword` のキー自体を含めない

```ts
toSearchObject({ scope: 'mine', page: 2, q: 'react' }); // { scope: 'mine', p: '2', keyword: 'react' }
toSearchObject({ scope: 'all', page: 1, q: null }); // { scope: 'all', p: '1' }
```

### 2. `changeScope(params, scope)` — 絞り込みを変える

元の `params` を変更せず、`scope` を変えて `page` を `1` に戻した **新しい** オブジェクトを返します。

```ts
changeScope({ scope: 'all', page: 5, q: 'ts' }, 'team'); // { scope: 'team', page: 1, q: 'ts' }
```

### 3. `fromSearchObject(search)` — URL 用オブジェクト → 条件

- `scope` が無ければ `'all'`
- `p` が無ければ `1`。あれば数値にする
- `keyword` が無い、または `''` なら `null`

```ts
fromSearchObject({ scope: 'mine', p: '3', keyword: 'react' }); // { scope: 'mine', page: 3, q: 'react' }
fromSearchObject({ keyword: '' }); // { scope: 'all', page: 1, q: null }
```
