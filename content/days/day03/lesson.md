---
day: 3
level: 1
title: TypeScript ① 型を読む
summary: "型注釈、ユニオン型 string | null と絞り込み、リテラル型、as const、(typeof SCOPES)[number] のような「値から型を作る」書き方を読めるようにする。"
minutes: 110
goals:
  - "q: string | null や pageSize?: number のような型の意味を説明できる"
  - "if (q !== null) などの絞り込みで、型がどう変わるかを追える"
  - "as const を付けると型がどう変わるかを説明できる"
  - "(typeof SCOPES)[number] や keyof typeof SCOPE_KEYS がどんな型になるか答えられる"
readings:
  - title: TypeScript Handbook — Everyday Types (よく使う型)
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
  - title: TypeScript Handbook — Narrowing (絞り込み)
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
  - title: TypeScript Handbook — Typeof Type Operator
    url: https://www.typescriptlang.org/docs/handbook/2/typeof-types.html
  - title: TypeScript Handbook — Keyof Type Operator
    url: https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
  - title: TypeScript Handbook — Indexed Access Types (T[number] など)
    url: https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
---

## 今日のゴール

目標コードの前半は、ほとんどが「型」の話です。

```ts
export const SCOPE_KEYS = {
  scope: 'scope',
  page: 'page',
  q: 'q',
} as const;

export const SCOPES = ['all', 'mine', 'team'] as const;
export type Scope = (typeof SCOPES)[number];

export type ScopeParams = { scope: Scope; page: number; q: string | null };

type Options = {
  pageSize?: number;
  enabled?: boolean;
};
```

今日が終わると、`Scope` が `'all' | 'mine' | 'team'` という型になること、`q` は「文字列か `null`」、`pageSize` は「省略してもよい数値」であることが読めるようになります。

TypeScript の型は **実行時には消えます** (JavaScript に変換するときに取り除かれる)。型は「書いた時点でミスを見つけるための注釈」で、プログラムの動きは変えません。

## 型注釈と型推論

`変数: 型` の形で型を書くのが **型注釈** です。読むときは **「`:` の右は型、`=` の右は値」** と覚えます。

```ts
let count: number = 0;
let count2 = 0; // 型を書かなくても number と推論される (型推論)

function double(x: number): number {
  //            ^ 引数の型     ^ 戻り値の型 (省略すると推論される)
  return x * 2;
}
```

実務のコードは推論に任せている部分が多く、型が書かれていない変数もたくさんあります。**エディタで変数にマウスを乗せると、推論された型が表示されます**。読んでいて型がわからなくなったら、まずこれを試しましょう。

## よく出る型

```ts
const name: string = 'Alice';
const age: number = 30;
const done: boolean = false;
const tags: string[] = ['a', 'b']; // 配列 (Array<string> とも書く)
const pair: [string, number] = ['a', 1]; // タプル: 長さと位置ごとの型が決まった配列
const user: { name: string; age: number } = { name: 'Alice', age: 30 }; // オブジェクト型
```

**関数の型** は `(引数: 型) => 戻り値の型` と書きます。目標コードの `fetcher` の型がこれです。

```ts
type Fetcher = (params: ScopeParams, signal: AbortSignal) => Promise<Paginated<User>>;
// 「ScopeParams と AbortSignal を受け取り、Promise<...> を返す関数」
```

型の中の `=>` の右側は **戻り値の型** で、処理ではありません。引数名 (`params`, `signal`) は説明用で、実際に渡す関数の引数名は何でも構いません。

そのほか、`any` (型チェックをしない。できるだけ避ける)、`unknown` (何かわからない。使う前に絞り込みが必要)、`void` (何も返さない) もよく見かけます。

## 省略可能なプロパティ `?`

プロパティ名の後ろの `?` は「**省略してよい**」という意味です。

```ts
type Options = {
  pageSize?: number;
  enabled?: boolean;
};

const a: Options = {}; // OK (両方省略)
const b: Options = { pageSize: 50 }; // OK

function run(options: Options) {
  options.pageSize; // 型は number | undefined (省略されていたら undefined)
}
```

引数にも付けられます: `function greet(name?: string)`。

> **落とし穴:** 型の `pageSize?: number` と、Day 2 の演算子 `a?.b` はまったく別物です。`?:` は「省略可能」、`?.` は「null / undefined なら止まる」です。

## ユニオン型 `A | B`

`|` は「**どれか 1 つ**」です。

```ts
let q: string | null = null; // 文字列 または null
q = 'react'; // OK

type Id = string | number;
```

目標コードの `q: string | null` は「検索語。URL に無ければ `null`」を表しています。ユニオン型の値は、そのままでは **どちらの型でも安全な操作** しかできません。

```ts
function show(q: string | null) {
  q.toUpperCase(); // エラー: 'q' は 'null' の可能性があります
}
```

## 絞り込み (narrowing)

`if` などで条件を確認すると、TypeScript はその中で **型を狭めて** くれます。これを絞り込み (narrowing) と呼びます。

```ts
function show(q: string | null) {
  if (q !== null) {
    q.toUpperCase(); // ここでは q: string
  }
}
```

実務でよく見るパターンをまとめます。

```ts
// ① 早期 return (いちばんよく見る)
function label(q: string | null): string {
  if (q === null) return 'すべて';
  return `「${q}」の検索結果`; // ここから下は q: string
}

// ② typeof (実行時の JavaScript の演算子)
function toPage(value: string | number): number {
  if (typeof value === 'string') return Number(value); // value: string
  return value; // value: number
}

// ③ truthy チェック (falsy でないことの確認) — '' も弾かれる点に注意 (Day 2 の || と同じ)
function trimmed(q: string | null | undefined) {
  if (!q) return null; // null / undefined / '' はここで終わり
  return q.trim(); // q: string
}

// ④ in — そのプロパティを持つかどうかで区別する
type Ok = { items: string[] };
type Err = { error: string };
function count(res: Ok | Err) {
  if ('error' in res) return 0; // res: Err
  return res.items.length; // res: Ok
}

// ⑤ instanceof — try / catch の catch (e) でよく使う (Day 4)
function messageOf(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
```

目標コードの Day 13 の部分 (`typeof updater === 'function' ? updater(pagination) : updater`) も②の形です。

**共通のプロパティの値で区別する** 書き方 (判別可能なユニオン) もライブラリでよく見ます。

```ts
type State = { status: 'pending' } | { status: 'error'; error: Error } | { status: 'success'; data: string[] };

function view(s: State) {
  if (s.status === 'error') return s.error.message; // s は error の形に絞られる
  if (s.status === 'success') return s.data.join(', ');
  return '読み込み中';
}
```

## リテラル型

`'all'` や `1` のような **特定の値そのもの** も型になります。ユニオンと組み合わせると「この中のどれか」を表せます。

```ts
type Scope = 'all' | 'mine' | 'team';

let s: Scope = 'mine'; // OK
s = 'other'; // エラー: 型 '"other"' を型 'Scope' に割り当てることはできません
```

推論のされ方は `const` と `let` で違います。

```ts
const a = 'mine'; // 型は 'mine' (変わらないので値そのもの)
let b = 'mine'; // 型は string (後で別の文字列を入れられるように広げる)
const params = { scope: 'all' }; // 型は { scope: string } (プロパティは書き換えられるので広がる)
```

> **落とし穴:** 最後の例のように、オブジェクトのプロパティは `string` に広がります。そのため `Scope` を期待する関数に `params.scope` を渡すと「`string` を `Scope` に割り当てられない」というエラーになります。変数に型注釈 (`const params: ScopeParams = ...`) を付けるか、次の `as const` で解決します。

## type と interface

オブジェクトの形に名前を付ける方法は 2 つあります。

```ts
type User = { id: number; name: string };

interface User2 {
  id: number;
  name: string;
}

interface Admin extends User2 {
  role: 'admin';
} // 継承
type Admin2 = User & { role: 'admin' }; // & (交差型) で合成
```

違いは細かいので、**読むときはどちらも「オブジェクトの形の定義」** と思って大丈夫です。ユニオン (`'a' | 'b'`) などに名前を付けられるのは `type` だけです。ライブラリの型定義は `interface` が多く、アプリのコードは `type` が多い傾向があります。

## as const

値の後ろに `as const` を付けると、**すべてを読み取り専用にし、リテラル型のまま固定** します。

```ts
const KEYS = { scope: 'scope', page: 'page' };
// 型: { scope: string; page: string }

const KEYS2 = { scope: 'scope', page: 'page' } as const;
// 型: { readonly scope: 'scope'; readonly page: 'page' }
KEYS2.page = 'p'; // エラー: 読み取り専用プロパティ

const SCOPES = ['all', 'mine', 'team'];
// 型: string[]

const SCOPES2 = ['all', 'mine', 'team'] as const;
// 型: readonly ['all', 'mine', 'team']  (長さ 3 で、各要素の値まで決まったタプル)
```

`as const` は型だけの話で、実行時にオブジェクトを凍結 (`Object.freeze`) するわけではありません。

## 値から型を作る: typeof / keyof / [number]

TypeScript のコードには **値の世界** (実行されるもの) と **型の世界** (`:` の右、`type X = ...` の右) があります。`typeof` を型の世界で使うと、**変数の型を取り出せます**。

```ts
const DEFAULTS = { page: 1, q: '' };
type Defaults = typeof DEFAULTS; // { page: number; q: string }
```

> **落とし穴:** 絞り込みで使った `typeof value === 'string'` (値の世界。実行時に `'string'` などの文字列を返す) とは別物です。`type X = typeof value` のように **型の位置にある `typeof` は、型を取り出す** 演算子です。

`keyof` は、オブジェクト型の **キーのユニオン** を作ります。

```ts
type K = keyof { scope: string; page: number }; // 'scope' | 'page'

type ScopeKey = keyof typeof SCOPE_KEYS; // 'scope' | 'page' | 'q'
// 右から読む: SCOPE_KEYS (値) → typeof で型にする → keyof でキーを集める
```

`T[number]` は「**T を数値の添字で読んだときの型**」、つまり配列の要素の型です。

```ts
type A = string[][number]; // string
type B = (typeof SCOPES2)[number]; // 'all' | 'mine' | 'team'
```

`SCOPES2` の型は `readonly ['all', 'mine', 'team']` なので、どの添字で読んでも `'all'` か `'mine'` か `'team'` です。(`typeof SCOPES2[number]` と括弧なしで書いても同じ意味です。括弧は読みやすさのため。)

この「**配列を 1 つ書いて、型はそこから作る**」パターンの利点は、値と型を二重に管理しなくてよいことです。`SCOPES` に `'org'` を足せば、`Scope` 型にも自動で `'org'` が加わります。配列は実行時にも使えます (タブの一覧を `SCOPES.map(...)` で描画する、URL の値が正しいか確かめる、など)。

## as (型アサーション) と ! には注意

`値 as 型` は「**この値はこの型だと信じて**」とコンパイラに伝える書き方です。

```ts
const input = document.getElementById('q') as HTMLInputElement;
const users = JSON.parse(text) as User[];
const root = document.getElementById('root')!; // ! は「null ではない」と断言する (非 null アサーション)
```

どれも **実行時には何も確認・変換しません**。本当は違う型だったら、型エラーの代わりに実行時エラーとして返ってきます。実務コードで見かけたら「ここは型チェックが効いていない」と意識して読みましょう。なお `as const` は名前が似ていますが、型を **より厳しくする** だけなので安全です。

## まとめ: 目標コードを分解する

```ts
export const SCOPES = ['all', 'mine', 'team'] as const;
export type Scope = (typeof SCOPES)[number];
```

1. `as const` で、`SCOPES` の型は `readonly ['all', 'mine', 'team']` になる (付けないと `string[]`)
2. `typeof SCOPES` で、その型を型の世界に持ってくる
3. `[number]` で要素の型を取り出す → `Scope` は `'all' | 'mine' | 'team'`

```ts
export type ScopeParams = { scope: Scope; page: number; q: string | null };
type Options = { pageSize?: number; enabled?: boolean };
```

- `ScopeParams` は 3 つとも必須。`q` は「文字列か `null`」なので、使う前に `null` チェックが要る
- `Options` は 2 つとも省略可能。中で読むと `number | undefined` なので、Day 4 で見るデフォルト値 (`{ pageSize = 20 }`) と組み合わせて使われる
