---
day: 2
level: 1
title: オブジェクトと配列の操作
summary: "{ name } の省略記法、{ [KEY]: v } の計算されたキー、map / filter / find、Object.entries、?. と ?? を読めるようにする。"
minutes: 100
goals:
  - "{ scope, page } や { [SCOPE_KEYS.page]: 1 } のようなオブジェクトの書き方を読める"
  - "users.filter(...).map(...) のような配列メソッドのつながりを読んで、結果を予想できる"
  - "Object.entries / Object.fromEntries で「オブジェクト ⇔ 配列」を行き来するコードを読める"
  - "query.data?.items ?? [] の意味と、?? と || の違いを説明できる"
readings:
  - title: MDN — オブジェクト初期化子 (省略記法・計算されたプロパティ名)
    url: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Object_initializer
  - title: MDN — Object.entries()
    url: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
  - title: MDN — オプショナルチェーン (?.)
    url: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  - title: MDN — Null 合体演算子 (??)
    url: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
  - title: JavaScript Primer — 配列
    url: https://jsprimer.net/basic/array/
---

## 今日のゴール

目標コードの中ほどに、こんな部分があります。

```ts
const scopeParsers = {
  [SCOPE_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'),
  [SCOPE_KEYS.page]: parseAsInteger.withDefault(1),
  [SCOPE_KEYS.q]: parseAsString,
};

// ... (return の中)
rows: query.data?.items ?? [],
rowCount: query.data?.total ?? 0,
```

今日が終わると、次のように読めるようになります。

- `[SCOPE_KEYS.scope]: ...` は「`SCOPE_KEYS.scope` の **値** (`'scope'`) をキーにする」書き方
- `query.data?.items ?? []` は「`data` がまだ無ければ (読み込み中なら) 空配列を使う」

`parseAsInteger` などの中身は Day 11 (nuqs)、`query` の正体は Day 12 (TanStack Query) で学びます。

## オブジェクトの省略記法

変数名とキー名が同じなら、`{ name: name }` を `{ name }` と書けます。

```ts
const scope = 'mine';
const page = 2;

const params = { scope, page }; // { scope: scope, page: page } と同じ → { scope: 'mine', page: 2 }
```

目標コードの `queryKey: [resource, { scope, page, q, pageSize }]` や、最後の `return { scope, q, setScope, ... }` はすべてこの省略記法です。**`{ }` の中に `:` が無い名前を見たら「同じ名前の変数が入っている」** と読みます。

> **落とし穴:** Day 1 の分割代入 `const { scope, page } = params;` と見た目がそっくりです。`=` の **左** にあれば「取り出す」(分割代入)、**右** や引数の位置にあれば「作る」(省略記法) です。

## プロパティの読み方 `.` と `[ ]`

```ts
const user = { name: 'Alice', 'favorite-color': 'blue' };

user.name; // 'Alice'
user['name']; // 'Alice' (同じ意味)
user['favorite-color']; // 'blue' (- を含むキーは [ ] でしか書けない)

const key = 'name';
user[key]; // 'Alice' ← 変数の「中身」をキーとして使う
user.key; // undefined ← 「key」という名前のプロパティを探してしまう (TypeScript では型エラー)
```

**`[ ]` の中は式** (変数や計算) で、その結果がキーになります。これが次の「計算されたキー」につながります。

## 計算されたキー `{ [式]: 値 }`

オブジェクトを **作るとき** にも、キーを `[ ]` で囲むと、中の式の **結果** がキーになります。

```ts
const KEY = 'page';
const a = { KEY: 1 }; // { KEY: 1 }   ← 文字どおり「KEY」というキー
const b = { [KEY]: 1 }; // { page: 1 }  ← 変数 KEY の中身がキー

const field = 'email';
const c = { [`${field}Error`]: '必須です' }; // { emailError: '必須です' }
```

目標コードでは、キーに **定数オブジェクトのプロパティ** を使っています。

```ts
const SCOPE_KEYS = { scope: 'scope', page: 'page', q: 'q' };

const scopeParsers = {
  [SCOPE_KEYS.page]: parseAsInteger.withDefault(1),
};
// → { page: parseAsInteger.withDefault(1) }
```

なぜ `page: ...` と直接書かないのでしょうか。URL のクエリ名 (`?page=2` の `page`) は複数の画面で共有するので、**名前を 1 か所 (`SCOPE_KEYS`) で管理** しておくと、変更やタイプミスに強くなるからです。たとえば `SCOPE_KEYS.page` を `'p'` に変えれば、`scopeParsers` のキーも自動で `p` になります。

### 「1 か所だけ変えたコピー」を作る

Day 1 のスプレッドと組み合わせると、フォームなどで頻出の形になります。

```ts
const form = { name: 'Alice', email: '' };
const field = 'email';

const next = { ...form, [field]: 'a@example.com' };
// → { name: 'Alice', email: 'a@example.com' }
```

「どのキーを書き換えるか」が変数で決まるので、1 つの関数で全部の入力欄を扱えます。

## 配列メソッド

配列を加工するときは `for` 文よりも、次のメソッドをつなげて書くのが主流です。どれも **元の配列を変更しません**。

| メソッド | 何をする | 戻り値 |
| --- | --- | --- |
| `map(fn)` | 各要素を変換する | 同じ長さの **新しい配列** |
| `filter(fn)` | 条件に合う要素だけ残す | 新しい配列 (0 件なら `[]`) |
| `find(fn)` | 条件に合う **最初の 1 つ** | 要素 または `undefined` |
| `some(fn)` | 1 つでも条件に合うか | `true` / `false` |
| `every(fn)` | 全部が条件に合うか | `true` / `false` |
| `includes(v)` | 値が含まれるか | `true` / `false` |

`reduce` という「配列を 1 つの値にまとめる」メソッドもあります。実務コードで見かけたら読めれば十分なので、今日はクイズで 1 問だけ扱います。

```ts
const users = [
  { id: 1, name: 'Alice', team: 'dev', active: true },
  { id: 2, name: 'Bob', team: 'sales', active: false },
  { id: 3, name: 'Carol', team: 'dev', active: true },
];

users.map((u) => u.name); // ['Alice', 'Bob', 'Carol']
users.filter((u) => u.active); // Alice と Carol の 2 件
users.find((u) => u.id === 2); // { id: 2, name: 'Bob', ... }
users.find((u) => u.id === 99); // undefined
users.some((u) => u.team === 'sales'); // true
users.every((u) => u.active); // false
['dev', 'sales'].includes('dev'); // true
```

コールバック (`(u) => ...`) は要素ごとに呼ばれ、第 2 引数で **添字** (0 始まりの番号) も受け取れます: ``users.map((u, i) => `${i + 1}. ${u.name}`)``。

### つなげて読む (メソッドチェーン)

```ts
const devNames = users
  .filter((u) => u.team === 'dev') // ① dev の人だけ
  .map((u) => u.name); //              ② 名前だけにする
// → ['Alice', 'Carol']
```

**上から順に、配列が形を変えながら流れていく** と読みます。途中の値を想像しにくいときは、1 段ずつ変数に分けて考えます。

> **落とし穴:** `find` は見つからないと `undefined` を返します。`users.find(...).name` と書くと、見つからなかったときにエラーになります。後で出てくる `?.` と組み合わせて `users.find(...)?.name` と書くのが定番です。

> **落とし穴:** `every` は **空配列だと `true`** を返します (「条件に反する要素が 1 つも無い」ため)。`some` は空配列だと `false` です。

React では `map` で配列を画面の部品に変換するのが定番です (Day 5)。

```tsx
<ul>
  {users.map((u) => (
    <li key={u.id}>{u.name}</li>
  ))}
</ul>
```

## Object.keys / values / entries / fromEntries

オブジェクトには `map` や `filter` がありません。そこで **いったん配列に変換** してから配列メソッドを使います。

```ts
const params = { scope: 'mine', page: 2, q: null };

Object.keys(params); // ['scope', 'page', 'q']
Object.values(params); // ['mine', 2, null]
Object.entries(params); // [['scope', 'mine'], ['page', 2], ['q', null]]
```

`entries` は `[キー, 値]` の組の配列です。逆に、組の配列からオブジェクトに戻すのが `Object.fromEntries` です。

```ts
// null の項目を取り除く
const cleaned = Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== null),
);
// → { scope: 'mine', page: 2 }
```

`([, value]) =>` は Day 1 の配列の分割代入です。`[キー, 値]` の 1 つ目 (キー) を飛ばして、2 つ目だけ `value` として受け取っています。「entries → 配列メソッド → fromEntries」は、オブジェクトを加工する定番パターンです。

```ts
// 配列から「id → 名前」の対応表を作る
const nameById = Object.fromEntries(users.map((u) => [u.id, u.name]));
// → { 1: 'Alice', 2: 'Bob', 3: 'Carol' }  (キーは文字列 '1', '2', '3' になる)
```

## オプショナルチェーン `?.`

`a?.b` は「`a` が `null` か `undefined` なら、エラーにせず `undefined` を返す。そうでなければ `a.b`」です。

```ts
const query: { data?: { items: string[] } } = {}; // data がまだ無い状態

query.data.items; // 実行すると TypeError (TypeScript なら書いた時点で型エラー)
query.data?.items; // undefined (エラーにならない)
```

TanStack Query の `query.data` は、**読み込みが終わるまで `undefined`** です。そのため `query.data?.items` のような書き方が毎日のように出てきます。

形は 3 種類あります。

```ts
user?.profile?.name; // プロパティ
list?.[0]; // [ ] でのアクセス (list が null/undefined なら undefined)
onChange?.(value); // 関数呼び出し (onChange が undefined なら呼ばない)
```

`onChange?.(value)` は「省略可能なコールバックを、渡されていれば呼ぶ」ときの定番です。

> **落とし穴:** `?.` が守るのは **その直前の値だけ** です。`user?.profile.name` は、`user` が `undefined` なら全体が `undefined` になりますが (その先は評価されない)、`user` があって `profile` が `undefined` ならエラーになります。

## `??` と `||` の違い

どちらも「左が使えなければ右を使う」ですが、**「使えない」の判定が違います**。

- `a ?? b` … `a` が `null` か `undefined` のときだけ `b`
- `a || b` … `a` が **falsy** (`false`, `0`, `''`, `null`, `undefined`, `NaN`) なら `b`

| `a` の値 | `a ?? 'x'` | `a \|\| 'x'` |
| --- | --- | --- |
| `null` | `'x'` | `'x'` |
| `undefined` | `'x'` | `'x'` |
| `0` | `0` | `'x'` |
| `''` (空文字) | `''` | `'x'` |
| `false` | `false` | `'x'` |
| `'abc'` | `'abc'` | `'abc'` |

目標コードの `query.data?.total ?? 0` では、件数が本当に `0` のときに `0` のまま使いたいので `??` が合っています。

```ts
const total = 0;
total || '不明'; // '不明'  ← 「0 件」が消えてしまう
total ?? '不明'; // 0
```

> **落とし穴:** `0` や `''` が **正しい値** になりうるときに `||` を使うと、それが勝手に置き換わるバグになります。「無いときの代わり」を決めたいだけなら、まず `??` を選びます。

逆に、目標コードには **わざと `||` を使っている行** もあります。

```ts
const setSearch = (text: string) => setParams({ q: text || null, page: null });
```

検索欄が空 (`''`) のときは `null` にして、URL から `?q=` を消したいからです。`??` だと `''` はそのまま残ってしまいます。**`||` と `??` のどちらを使っているかで、書いた人の意図が読める** ようになりましょう。

## まとめ: 目標コードを分解する

```ts
rows: query.data?.items ?? [],
```

1. `query.data` — TanStack Query が取ってきたデータ (読み込み中は `undefined`)
2. `?.items` — `data` があればその `items`、無ければ (エラーにせず) `undefined`
3. `?? []` — 結果が `undefined` なら空配列。画面側は常に配列として `map` できる

```ts
const scopeParsers = {
  [SCOPE_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'),
  [SCOPE_KEYS.page]: parseAsInteger.withDefault(1),
  [SCOPE_KEYS.q]: parseAsString,
};
```

1. `{ [ ... ]: ... }` — 計算されたキー。`SCOPE_KEYS.scope` の値 `'scope'` がキーになる
2. つまり結果は `{ scope: ..., page: ..., q: ... }` という 3 つのキーを持つオブジェクト
3. キー名を定数から取ることで、URL のクエリ名を 1 か所で管理している

明日 (Day 3) は、`SCOPE_KEYS` の定義に付いている `as const` など、TypeScript の型を読んでいきます。
