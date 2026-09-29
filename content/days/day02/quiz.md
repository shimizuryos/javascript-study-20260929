## shorthand

`params` の値はどれですか?

```ts
const scope = 'mine';
const page = 2;
const params = { scope, page };
```

- [ ] `['mine', 2]`
- [x] `{ scope: 'mine', page: 2 }`
- [ ] `{ 'mine': 'mine', 2: 2 }`
- [ ] 構文エラーになる

> `{ scope }` は `{ scope: scope }` の省略記法です。変数名がそのままキー名になり、変数の中身が値になります。

## computed-key

`parsers` の値はどれですか?

```ts
const KEYS = { page: 'p', q: 'keyword' };
const parsers = { [KEYS.page]: 1, q: 2 };
```

- [ ] `{ page: 1, q: 2 }`
- [x] `{ p: 1, q: 2 }`
- [ ] `{ 'KEYS.page': 1, q: 2 }`
- [ ] `{ p: 1, keyword: 2 }`

> `[ ]` で囲んだキーは「中の式の **結果**」がキーになります (計算されたキー)。`KEYS.page` は `'p'` なので 1 つ目のキーは `p`。2 つ目の `q` は `[ ]` で囲んでいないので、文字どおり `q` というキーです。

## map-result

`result` の値はどれですか?

```ts
const result = [1, 2, 3, 4].map((n) => n % 2 === 0);
```

- [ ] `[2, 4]`
- [x] `[false, true, false, true]`
- [ ] `true`
- [ ] `[1, 3]`

> `map` は各要素をコールバックの戻り値に **変換** するだけなので、長さは変わりません。ここでは「偶数か?」の真偽値の配列になります。偶数だけ残したいなら `filter` を使います。

## chain

`result` の値はどれですか?

```ts
const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 17 },
  { name: 'Carol', age: 22 },
];
const result = users.filter((u) => u.age >= 20).map((u) => u.name.length);
```

- [ ] `['Alice', 'Carol']`
- [x] `[5, 5]`
- [ ] `[5, 3, 5]`
- [ ] `2`

> 上から順に読みます。`filter` で 20 歳以上 (Alice と Carol) が残り、`map` でそれぞれの名前の長さ (`'Alice'.length` は 5、`'Carol'.length` も 5) に変換されます。

## find-fallback

`label` の値はどれですか?

```ts
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];
const label = users.find((u) => u.id === 3)?.name ?? 'ゲスト';
```

- [ ] `undefined`
- [x] `'ゲスト'`
- [ ] `'Bob'`
- [ ] TypeError になる

> `find` は見つからないと `undefined` を返します。`undefined?.name` はエラーにならず `undefined` になり、`?? 'ゲスト'` で `'ゲスト'` に置き換わります。「探す → 無ければ代わりの値」の定番の書き方です。

## every-empty

`[a, b]` の値はどれですか?

```ts
const items: number[] = [];
const a = items.every((n) => n > 0);
const b = items.some((n) => n > 0);
```

- [ ] `[false, false]`
- [x] `[true, false]`
- [ ] `[true, true]`
- [ ] `[undefined, undefined]`

> `every` は「条件に反する要素が 1 つも無い」ときに `true` なので、空配列では `true` になります。`some` は「条件に合う要素が 1 つでもある」ときに `true` なので、空配列では `false` です。「全部選択済みか?」の判定などで、空のときの挙動に注意が必要です。

## entries-roundtrip

`result` の値はどれですか?

```ts
const prices = { apple: 100, banana: 80 };
const result = Object.fromEntries(Object.entries(prices).map(([name, price]) => [name, price * 2]));
```

- [ ] `[['apple', 200], ['banana', 160]]`
- [x] `{ apple: 200, banana: 160 }`
- [ ] `{ apple: 100, banana: 80 }`
- [ ] `[200, 160]`

> `Object.entries` で `[['apple', 100], ['banana', 80]]` という組の配列にし、`map` で値だけ 2 倍にしてから、`Object.fromEntries` でオブジェクトに戻しています。オブジェクトを加工するときの定番パターンです。

## optional-chain-scope

`user` が `{ profile: undefined }` のとき、`user?.profile.name` を実行するとどうなりますか?

```ts
const user: { profile?: { name: string } } | undefined = { profile: undefined };
```

- [ ] `undefined` になる
- [ ] `null` になる
- [x] TypeError になる
- [ ] `''` になる

> `?.` が守るのは **直前の値 (`user`) だけ** です。`user` は存在するので `user.profile` まで進み、それが `undefined` なのに `.name` を読もうとしてエラーになります。`profile` も無いかもしれないなら `user?.profile?.name` と書きます (TypeScript なら書いた時点で型エラーとして教えてくれます)。

## nullish-vs-or

`[a, b]` の値はどれですか?

```ts
const count = 0;
const a = count || 10;
const b = count ?? 10;
```

- [ ] `[0, 0]`
- [ ] `[10, 10]`
- [x] `[10, 0]`
- [ ] `[0, 10]`

> `||` は左が falsy (`0` も含む) なら右を使うので `a` は `10`。`??` は左が `null` / `undefined` のときだけ右を使うので、`0` はそのまま残り `b` は `0` です。`0` 件、`0` ページ目のように `0` が正しい値になりうるときは `??` を使います。

## reduce-read

`result` の値はどれですか? (`reduce` は「前回までの結果 `acc`」と「今の要素」から次の結果を作る処理を、配列の先頭から順に繰り返します。第 2 引数 `{}` が最初の `acc` です。)

```ts
const items = [
  { id: 'a', name: 'Apple' },
  { id: 'b', name: 'Banana' },
];
const result = items.reduce((acc, item) => ({ ...acc, [item.id]: item.name }), {});
```

- [ ] `['Apple', 'Banana']`
- [ ] `{ id: 'b', name: 'Banana' }`
- [x] `{ a: 'Apple', b: 'Banana' }`
- [ ] `{ item.id: 'Banana' }`

> 1 回目は `acc = {}` から `{ a: 'Apple' }` を作り、2 回目はそれをコピーして `b: 'Banana'` を足した `{ a: 'Apple', b: 'Banana' }` を作ります。`[item.id]` は計算されたキー、`...acc` は Day 1 のスプレッドです。同じ結果は `Object.fromEntries(items.map((i) => [i.id, i.name]))` でも作れます。
