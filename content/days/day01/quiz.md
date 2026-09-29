## const-reassign

次のうち、**エラーになる** のはどれですか?

```ts
const user = { name: 'Alice' };
let count = 0;
```

- [ ] `count = 1;`
- [ ] `user.name = 'Bob';`
- [x] `user = { name: 'Bob' };`
- [ ] `count++;`

> `const` は「変数に別の値を入れ直す (再代入)」ことを禁止します。`user.name = 'Bob'` は変数 `user` が指すオブジェクトの中身を変えているだけなので、エラーにはなりません。

## arrow-braces

`f(3)` の結果はどれですか?

```ts
const f = (x: number) => {
  x * 2;
};
```

- [ ] `6`
- [x] `undefined`
- [ ] `3`
- [ ] エラーになる

> `=>` の後ろに `{ }` を書くと「関数の本体」になり、`return` を書かない限り何も返しません。`(x) => x * 2` と書けば 6 が返ります。

## arrow-object

`{ ok: true }` を **返す** 関数として正しいのはどれですか?

- [ ] `const f = () => { ok: true };`
- [x] `const f = () => ({ ok: true });`
- [ ] `const f = () => return { ok: true };`
- [ ] `const f = => { ok: true };`

> `() => { ... }` の `{ }` は関数本体と解釈されます。オブジェクトを返すときは `( )` で囲んで「これは式です」と伝えます。

## array-default

`b` の値はどれですか?

```ts
const [a, b = 10] = [1];
```

- [ ] `1`
- [x] `10`
- [ ] `undefined`
- [ ] `[1]`

> 配列の 2 番目の要素が存在しない (`undefined`) ので、デフォルト値の `10` が使われます。

## rename

実行後に **使える変数** はどれですか?

```ts
const { data: rows } = { data: [1, 2, 3] };
```

- [ ] `data` だけ
- [x] `rows` だけ
- [ ] `data` と `rows` の両方
- [ ] どちらも使えない (構文エラー)

> `{ data: rows }` は「`data` プロパティを取り出して `rows` という変数に入れる」という意味です。`data` という変数は作られません。`:` の右側が変数名です。

## default-null

`q` の値はどれですか?

```ts
const { q = 'all' } = { q: null };
```

- [ ] `'all'`
- [x] `null`
- [ ] `undefined`
- [ ] エラーになる

> 分割代入のデフォルト値が使われるのは、値が `undefined` のときだけです。`null` はそのまま入ります。URL のクエリが無いときに `null` を返すライブラリ (nuqs など) を扱うとき、この違いが効いてきます。

## spread-order

`next` の値はどれですか?

```ts
const query = { page: 3, q: 'react' };
const next = { ...query, page: 1 };
```

- [x] `{ page: 1, q: 'react' }`
- [ ] `{ page: 3, q: 'react' }`
- [ ] `{ page: 1 }`
- [ ] `{ page: 3, q: 'react', page: 1 }`

> オブジェクトのスプレッドは、同じキーがあると **後に書いたものが勝ちます**。`query` はコピーされるだけで、変更されません。

## rest

`rest` の値はどれですか?

```ts
const { a, ...rest } = { a: 1, b: 2, c: 3 };
```

- [ ] `{ a: 1, b: 2, c: 3 }`
- [x] `{ b: 2, c: 3 }`
- [ ] `[2, 3]`
- [ ] `{ a: 1 }`

> 分割代入の中の `...rest` は「まだ取り出していない残り全部」をまとめたオブジェクトになります。

## use-state

`const [count, setCount] = useState(0);` について正しい説明はどれですか?

- [ ] `useState` は `count` と `setCount` という名前のプロパティを持つオブジェクトを返す
- [x] `useState` は 2 要素の配列を返し、それを配列の分割代入で受け取っている
- [ ] `count` と `setCount` という名前は React が決めていて、変えられない
- [ ] `[count, setCount]` は新しい配列を作っている

> 配列の分割代入は「位置」で受け取るので、名前は自由に付けられます。`const [open, setOpen] = useState(false)` のように、中身に合わせた名前にするのが慣例です。
