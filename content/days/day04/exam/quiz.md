## default-null

`[rows, error]` の値はどれですか?

```ts
const { data: rows = [], error = null } = { data: null, error: undefined };
```

- [ ] `[[], null]`
- [x] `[null, null]`
- [ ] `[[], undefined]`
- [ ] `[null, undefined]`

> (Day 1) 分割代入のデフォルト値は、値が `undefined` のときだけ使われます。`data` は `null` なのでデフォルト値 `[]` は使われず `rows` は `null`。`error` は `undefined` なのでデフォルト値の `null` になります。

## spread-rest

`rest` の値はどれですか?

```ts
const base = { page: 3, q: 'ts', sort: 'new' };
const { page, ...rest } = { ...base, page: 1, q: undefined };
```

- [ ] `{ sort: 'new' }`
- [ ] `{ q: 'ts', sort: 'new' }`
- [x] `{ q: undefined, sort: 'new' }`
- [ ] `{ page: 1, q: undefined, sort: 'new' }`

> (Day 1) まず右辺で `{ page: 1, q: undefined, sort: 'new' }` が作られます (後に書いたものが勝ち、値が `undefined` でも上書きされる)。そこから `page` を取り出した残りが `rest` なので、`{ q: undefined, sort: 'new' }` です。

## target-destructure

目標コードの次の行について、正しい説明はどれですか?

```ts
const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);
```

- [ ] `useQueryStates` は `scope`・`page`・`q`・`setParams` の 4 つのプロパティを持つオブジェクトを返す
- [x] `useQueryStates` は 2 要素の配列を返し、1 番目のオブジェクトから `scope`・`page`・`q` を、2 番目を `setParams` として取り出している
- [ ] 右辺の値を使って、新しい配列 `[{ scope, page, q }, setParams]` を作っている
- [ ] `setParams` は配列の 1 番目の要素である

> (Day 1) `=` の左にある `[ ]` は配列の分割代入 (位置で受け取る)、その中の `{ }` はオブジェクトの分割代入 (名前で受け取る) です。`useState` と同じ「[値, 更新関数]」の形です。

## computed-key

`params` の値はどれですか?

```ts
const KEYS = { page: 'p', q: 'keyword' } as const;
const field = 'q';
const params = { [KEYS.page]: 2, [KEYS[field]]: 'ts', field };
```

- [ ] `{ page: 2, q: 'ts', field: 'q' }`
- [ ] `{ p: 2, q: 'ts', field: 'q' }`
- [x] `{ p: 2, keyword: 'ts', field: 'q' }`
- [ ] `{ p: 2, keyword: 'ts', q: 'q' }`

> (Day 2) `[KEYS.page]` は `'p'`、`[KEYS[field]]` は `KEYS['q']` なので `'keyword'` がキーになります (計算されたキー)。最後の `field` は省略記法で `field: field`、つまり `field: 'q'` です。

## optional-nullish

`[a, b]` の値はどれですか?

```ts
type Query = { data?: { items: string[]; total: number } };
const loading: Query = {};
const done: Query = { data: { items: [], total: 0 } };

const a = loading.data?.total ?? '-';
const b = done.data?.total || '-';
```

- [ ] `['-', 0]`
- [x] `['-', '-']`
- [ ] `[undefined, 0]`
- [ ] `[0, '-']`

> (Day 2) `loading.data` は `undefined` なので `?.` で `undefined` になり、`??` で `'-'`。`done.data?.total` は `0` ですが、`||` は `0` も「無い」扱いにするので `'-'` になります。「0 件」と表示したいなら `??` を使うべきところです。

## text-or-null

目標コードの `setSearch` に `''` と `'0'` を渡したとき、`q` にセットされる値の組み合わせはどれですか?

```ts
const setSearch = (text: string) => setParams({ q: text || null, page: null });
```

- [ ] `''` と `'0'`
- [x] `null` と `'0'`
- [ ] `null` と `null`
- [ ] `null` と `0`

> (Day 2) `''` は falsy なので `null` になり、URL から `?q=` が消えます。`'0'` は **空でない文字列** なので truthy で、そのまま `'0'` です (数値の `0` とは違います)。空文字だけを `null` にしたいので、ここは `??` ではなく `||` が正解です。

## narrowing-error

型エラーになるのはどの行ですか?

```ts
function f(q: string | null, size?: number) {
  const a = q?.length; // (1)
  const b = size ?? 20; // (2)
  const c = q.trim(); // (3)
  if (!q) return;
  const d = q.toUpperCase(); // (4)
}
```

- [ ] (1)
- [ ] (2)
- [x] (3)
- [ ] (4)

> (Day 3) (3) の時点では `q` は `string | null` なので、`q.trim()` は「'q' は 'null' の可能性があります」というエラーになります。(1) は `?.` で `null` を避けており、(4) は `if (!q) return;` で絞り込まれた後なので `q` は `string` です。

## without-as-const

`as const` を **外した** とき、`Sort` の型はどれになりますか?

```ts
const SORTS = ['new', 'old', 'popular'] as const;
type Sort = (typeof SORTS)[number];
```

- [ ] `'new' | 'old' | 'popular'` のまま変わらない
- [x] `string`
- [ ] `string[]`
- [ ] `never`

> (Day 3) `as const` が無いと `SORTS` の型は `string[]` になり、その要素の型 (`[number]`) は `string` です。リテラル型のユニオンを作るには `as const` が必要です。

## keyof-values

`B` の型はどれですか?

```ts
const LABELS = { all: 'すべて', mine: '自分' } as const;
type A = keyof typeof LABELS;
type B = (typeof LABELS)[A];
```

- [ ] `'all' | 'mine'`
- [x] `'すべて' | '自分'`
- [ ] `string`
- [ ] `{ readonly all: 'すべて'; readonly mine: '自分' }`

> (Day 3・4) `A` はキーのユニオン `'all' | 'mine'`。`(typeof LABELS)[A]` は、そのキーで読んだときの値の型 (インデックスアクセス型) なので `'すべて' | '自分'` です。`as const` で値がリテラル型になっているので `string` に広がりません。

## generic-infer

`result.rows` の型はどれですか?

```ts
type User = { id: number; name: string };
declare function fetchUsers(params: ScopeParams, signal: AbortSignal): Promise<Paginated<User>>;

// 目標コード: useSharedScopeQuery<TRow>(resource, fetcher: (...) => Promise<Paginated<TRow>>, ...)
// 戻り値の rows は TRow[]
const result = useSharedScopeQuery('users', fetchUsers);
```

- [x] `User[]`
- [ ] `Paginated<User>[]`
- [ ] `TRow[]`
- [ ] `unknown[]`

> (Day 4) `fetcher` の型 `Promise<Paginated<TRow>>` と、渡した `fetchUsers` の戻り値 `Promise<Paginated<User>>` を突き合わせて、`TRow = User` と推論されます。そのため `rows` は `User[]` です。型引数を明示しなくても、渡した関数から決まります。

## import-default-type

`format.ts` が次のようになっているとき、正しい import はどれですか?

```ts
// format.ts
export default function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
export type DateStyle = 'short' | 'long';
```

- [ ] `import { formatDate, DateStyle } from './format';`
- [x] `import formatDate, { type DateStyle } from './format';`
- [ ] `import formatDate, DateStyle from './format';`
- [ ] `import type formatDate from './format';` と書いて `formatDate(new Date())` を呼ぶ

> (Day 4) default export は `{ }` なしで、名前付き export は `{ }` の中に書きます。`type DateStyle` は「型だけ読み込む」印です。`import type` で読み込んだものは型としてしか使えないので、関数として呼ぶことはできません。

## async-order

コンソールに表示される順番はどれですか?

```ts
async function load() {
  console.log('2');
  await Promise.resolve();
  console.log('4');
}

console.log('1');
load();
console.log('3');
```

- [x] `1 → 2 → 3 → 4`
- [ ] `1 → 3 → 2 → 4`
- [ ] `1 → 2 → 4 → 3`
- [ ] `1 → 3 → 4 → 2`

> (Day 4) `async` 関数は、最初の `await` までは呼ばれた時点ですぐに実行されるので `2` は `1` の直後です。`await` の続き (`4`) は、今実行中の処理 (`console.log('3')` まで) が終わってから動きます。
