---
title: 計算されたキーでオブジェクトを作る
hints:
  - "`{ [PARAM_KEYS.page]: String(page) }` と書くと、`PARAM_KEYS.page` の **値** (`'p'`) がキーになります。"
  - "`setField` は `({ ...form, [field]: value })` の 1 行で書けます。スプレッドでコピーしてから、`field` のキーだけ上書きします。"
  - "`compact` は `Object.fromEntries(Object.entries(params).filter(([, value]) => ...))` の形です。`([, value])` は `[キー, 値]` の 2 つ目だけを受け取る分割代入です。"
---

URL のクエリを組み立てる関数を 3 つ作ります。

### 1. `toUrlParams(page, q)`

画面の中では `page` / `q` と呼んでいる値を、URL 上の名前 (`PARAM_KEYS` に定義済み: `p` / `keyword`) をキーにしたオブジェクトに変換します。**キー名は `PARAM_KEYS` から取って** ください (直接 `p:` と書かない)。

```ts
toUrlParams(2, 'react'); // { p: '2', keyword: 'react' }   ← page は文字列にする
```

### 2. `setField(form, field, value)`

フォームのオブジェクトをコピーして、`field` で指定したキーだけ `value` にした **新しい** オブジェクトを返します (元の `form` は変更しない)。

```ts
setField({ name: 'Alice', email: '', role: 'member' }, 'email', 'a@example.com');
// { name: 'Alice', email: 'a@example.com', role: 'member' }
```

### 3. `compact(params)`

値が `null` または空文字 `''` の項目を取り除いた **新しい** オブジェクトを返します。

```ts
compact({ scope: 'mine', q: null, sort: '', page: '2' });
// { scope: 'mine', page: '2' }
```

`Record<string, string | null>` は「キーは任意の文字列、値は `string` か `null`」というオブジェクトの型です (Day 4 で詳しく扱います)。
