## generic-infer

`w` の型はどれですか?

```ts
function wrap<T>(value: T): { value: T } {
  return { value };
}
const w = wrap(['a', 'b']);
```

- [ ] `{ value: T }`
- [x] `{ value: string[] }`
- [ ] `{ value: unknown }`
- [ ] `{ value: any }`

> 引数 `['a', 'b']` の型 `string[]` から、`T = string[]` と推論されます。戻り値の型 `{ value: T }` の `T` も置き換わって `{ value: string[] }` になります。ジェネリクスは「入力の型と出力の型のつながり」を保ちます。

## use-state-generic

`a` と `b` の型の組み合わせはどれですか? (`useState` は `<S>(initial: S)` のような形のジェネリック関数です)

```ts
const [a] = useState(null);
const [b] = useState<string | null>(null);
```

- [ ] `a: string | null`、`b: string | null`
- [x] `a: null`、`b: string | null`
- [ ] `a: any`、`b: string`
- [ ] `a: null`、`b: null`

> 型引数を書かないと、初期値 `null` から `S = null` と推論され、あとで文字列を入れられない state になってしまいます。そのため `useState<string | null>(null)` のように型引数を明示します。実務でとてもよく見る形です。

## default-param-destructure

`size()` の結果はどれですか?

```ts
type Options = { pageSize?: number };

function size({ pageSize = 20 }: Options = {}) {
  return pageSize;
}
```

- [x] `20`
- [ ] `undefined`
- [ ] TypeError になる
- [ ] `0`

> 引数を省略すると、まず `= {}` によって引数全体が `{}` になり、そこから `pageSize` を取り出します。`{}` には `pageSize` が無い (`undefined`) ので、デフォルト値 `20` が使われます。`= {}` が無いと `undefined` を分割代入しようとして TypeError になります。目標コードの第 3 引数と同じ形です。

## partial-pick

`Patch` の型はどれですか?

```ts
type User = { id: number; name: string; email: string };
type Patch = Partial<Pick<User, 'name' | 'email'>>;
```

- [x] `{ name?: string; email?: string }`
- [ ] `{ id?: number; name?: string; email?: string }`
- [ ] `{ name: string; email: string }`
- [ ] `{ id: number }`

> 内側から読みます。`Pick<User, 'name' | 'email'>` で `{ name: string; email: string }` を選び、`Partial` で全部を省略可能にします。「名前とメールだけ、変更したいものを送る」更新 API の引数などに使われます。

## awaited-returntype

`Data` の型はどれですか?

```ts
async function loadIds() {
  return [1, 2, 3];
}
type Data = Awaited<ReturnType<typeof loadIds>>;
```

- [ ] `Promise<number[]>`
- [x] `number[]`
- [ ] `() => Promise<number[]>`
- [ ] `number`

> `typeof loadIds` は関数の型、`ReturnType` でその戻り値 `Promise<number[]>` (async 関数は Promise を返す)、`Awaited` で Promise の中身 `number[]` を取り出します。

## indexed-access

`Row` の型はどれですか?

```ts
type User = { id: number; name: string };
type Paginated<T> = { items: T[]; total: number };
type Row = Paginated<User>['items'][number];
```

- [ ] `User[]`
- [x] `User`
- [ ] `number`
- [ ] `{ items: User[]; total: number }`

> `Paginated<User>` は `{ items: User[]; total: number }`。`['items']` でプロパティの型 `User[]` を取り出し、`[number]` で配列の要素の型 `User` を取り出します。

## satisfies-vs-as

型エラーになるのはどれですか?

```ts
type Scope = 'all' | 'mine' | 'team';

const a = { all: 'すべて', mine: '自分' } satisfies Record<Scope, string>;
const b = { all: 'すべて', mine: '自分' } as Record<Scope, string>;
```

- [ ] `a` も `b` もエラーになる
- [x] `a` だけエラーになる
- [ ] `b` だけエラーになる
- [ ] どちらもエラーにならない

> `satisfies` は「この型を満たしているか」をきちんとチェックするので、`team` が無いとエラーになります。`as` は「信じて」と伝えるだけでチェックがゆるく、キーが足りなくても通ってしまいます (実行時に `b.team` は `undefined`)。

## import-default-named

`api.ts` が次のようになっているとき、正しい import はどれですか?

```ts
// api.ts
export default function fetchUsers() {
  /* ... */
}
export const PAGE_SIZE = 20;
```

- [ ] `import { fetchUsers, PAGE_SIZE } from './api';`
- [x] `import fetchUsers, { PAGE_SIZE } from './api';`
- [ ] `import fetchUsers, PAGE_SIZE from './api';`
- [ ] `import default fetchUsers, { PAGE_SIZE } from './api';`

> default export は `{ }` なしで (名前は自由)、名前付き export は `{ }` の中に同じ名前で書きます。両方を 1 行で読み込むときは `import 既定の名前, { 名前付き } from ...` の順です。

## async-return

`result` の型はどれですか?

```ts
async function getCount() {
  return 3;
}
const result = getCount();
```

- [ ] `number`
- [x] `Promise<number>`
- [ ] `3`
- [ ] `Promise<void>`

> `async` 関数は必ず Promise を返します。`return 3` の `3` は Promise に包まれるので、`result` は `Promise<number>` です。中身の `3` を使うには `await getCount()` と書きます。

## promise-all-order

`[a, b]` の値はどれですか? (`wait(ms)` は `ms` ミリ秒後に成功する Promise を返します)

```ts
const [a, b] = await Promise.all([
  wait(30).then(() => 'slow'),
  wait(10).then(() => 'fast'),
]);
```

- [x] `['slow', 'fast']`
- [ ] `['fast', 'slow']`
- [ ] `['fast', undefined]`
- [ ] `'fast'`

> `Promise.all` の結果は、終わった順ではなく **渡した順** に並びます。先に終わるのは `'fast'` ですが、配列の 1 番目は `'slow'` です。そのため、配列の分割代入で安心して受け取れます。
