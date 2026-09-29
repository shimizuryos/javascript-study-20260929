## optional-prop

関数の中で `options.pageSize` の型はどれですか?

```ts
type Options = {
  pageSize?: number;
  enabled?: boolean;
};

function run(options: Options) {
  const size = options.pageSize;
}
```

- [ ] `number`
- [x] `number | undefined`
- [ ] `number | null`
- [ ] `Options`

> `?` 付きのプロパティは省略できるので、読んだときは「数値 または `undefined`」です。`null` は含まれません (`null` も許したいなら `pageSize?: number | null` と書きます)。

## narrowing-early-return

`// ここ` の行で、`q` の型はどれですか?

```ts
function label(q: string | null) {
  if (q === null) {
    return 'すべて';
  }
  return q.trim(); // ここ
}
```

- [x] `string`
- [ ] `string | null`
- [ ] `null`
- [ ] `any`

> `q === null` のときは `return` で関数を抜けるので、それより下に来るのは `q` が `null` でないときだけです。TypeScript はこれを理解して `q` を `string` に絞り込みます (早期 return による絞り込み)。

## truthy-narrowing

`label('')` の戻り値はどれですか?

```ts
function label(q: string | null): string {
  if (!q) return 'すべて';
  return `「${q}」の検索結果`;
}
```

- [ ] `'「」の検索結果'`
- [x] `'すべて'`
- [ ] `''`
- [ ] 型エラーになる

> `!q` は `q` が falsy のときに `true` になります。`null` だけでなく空文字 `''` も falsy なので `'すべて'` が返ります。「空文字も検索なしとして扱いたい」ならこれで正しく、`''` を区別したいなら `q === null` と書きます。

## in-narrowing

`// ここ` の行で、`res` の型はどれですか?

```ts
type Ok = { items: string[] };
type Err = { error: string };

function count(res: Ok | Err) {
  if ('error' in res) {
    return -1;
  }
  return res.items.length; // ここ
}
```

- [ ] `Ok | Err`
- [x] `Ok`
- [ ] `Err`
- [ ] `{ items: string[]; error: string }`

> `'error' in res` は「`res` が `error` プロパティを持つか」を調べます。持つ場合 (`Err`) は `return` しているので、下に来るのは `Ok` のときだけです。

## widening-error

`setScope(...)` の呼び出しのうち、**型エラーになるもの** の組み合わせはどれですか?

```ts
type Scope = 'all' | 'mine';
declare function setScope(s: Scope): void;

const a = 'mine';
let b = 'mine';
const c = { scope: 'mine' };
const d = { scope: 'mine' } as const;

setScope(a);
setScope(b);
setScope(c.scope);
setScope(d.scope);
```

- [ ] `a` と `d.scope`
- [ ] `b` だけ
- [x] `b` と `c.scope`
- [ ] 4 つともエラーにならない

> `const a` は `'mine'` 型ですが、`let b` は後で書き換えられるので `string` に広がります。オブジェクトのプロパティ `c.scope` も書き換えられるので `string` です。`string` は `Scope` に割り当てられないのでエラーになります。`as const` を付けた `d.scope` は `'mine'` 型のままなので OK です。(`declare function` は「型だけ宣言する」書き方です。)

## as-const-array

`TABS` の型はどれですか?

```ts
const TABS = ['list', 'grid'] as const;
```

- [ ] `string[]`
- [ ] `('list' | 'grid')[]`
- [x] `readonly ['list', 'grid']`
- [ ] `['list', 'grid']`

> 配列に `as const` を付けると、読み取り専用 (`readonly`) で、長さと各要素の値まで決まったタプル型になります。付けなければ `string[]` です。

## typeof-number

`Size` の型はどれですか?

```ts
const PAGE_SIZES = [10, 20, 50] as const;
type Size = (typeof PAGE_SIZES)[number];
```

- [ ] `number`
- [x] `10 | 20 | 50`
- [ ] `readonly [10, 20, 50]`
- [ ] `number[]`

> `typeof PAGE_SIZES` は `readonly [10, 20, 50]`。`[number]` は「数値の添字で読んだときの型」なので、要素のユニオン `10 | 20 | 50` になります。`as const` が無いと `typeof PAGE_SIZES` が `number[]` になり、`Size` はただの `number` になってしまいます。

## keyof-typeof

`ColorName` の型はどれですか?

```ts
const COLORS = {
  primary: '#2563eb',
  danger: '#dc2626',
} as const;
type ColorName = keyof typeof COLORS;
```

- [x] `'primary' | 'danger'`
- [ ] `'#2563eb' | '#dc2626'`
- [ ] `string`
- [ ] `{ readonly primary: '#2563eb'; readonly danger: '#dc2626' }`

> 右から読みます。`COLORS` (値) を `typeof` で型にし、`keyof` でその **キー** のユニオンを取り出します。値 (`'#2563eb'` など) のユニオンが欲しいときは、Day 4 で学ぶインデックスアクセス型で `(typeof COLORS)[ColorName]` と書きます。

## typeof-two-worlds

次のコードについて、正しい説明はどれですか?

```ts
const DEFAULTS = { page: 1, q: '' };

const a = typeof DEFAULTS;
type B = typeof DEFAULTS;
```

- [ ] `a` と `B` はどちらも `{ page: number; q: string }` という型を表す
- [x] `a` は実行時の値 `'object'` で、`B` は型 `{ page: number; q: string }`
- [ ] `a` は型で、`B` は実行時の値 `'object'`
- [ ] `type B = typeof DEFAULTS` は構文エラー

> 値の位置 (`const a = ...`) の `typeof` は JavaScript の演算子で、`'string'` や `'object'` などの **文字列** を返します。型の位置 (`type B = ...`) の `typeof` は TypeScript の演算子で、変数の **型** を取り出します。見た目は同じでも別物です。

## as-assertion

次のコードはどうなりますか?

```ts
const value = JSON.parse('"abc"') as number;
console.log(value.toFixed(1));
```

- [ ] 型エラーになり、実行できない
- [x] 型エラーにはならないが、実行すると TypeError になる
- [ ] `'abc'` と表示される
- [ ] `NaN` と表示される

> `as number` は「これは number だと信じて」とコンパイラに伝えるだけで、実行時には何も確認・変換しません。実際の値は文字列 `'abc'` なので、`toFixed` が無くて TypeError になります。`as` を見たら「ここは型チェックが効いていない」と意識して読みましょう。
