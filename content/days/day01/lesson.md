---
day: 1
level: 1
title: 変数・アロー関数・分割代入
summary: const / let、アロー関数 (x) => ...、分割代入 const [a, b] = ...、スプレッド構文 ... を読めるようにする。
minutes: 90
goals:
  - const と let の違いを説明できる
  - "(x) => x * 2 や () => ({ ok: true }) のようなアロー関数を読める"
  - "const [a, b] = ... と const { data: rows = [] } = ... の意味がわかる"
  - "{ ...obj, page: 1 } のようなスプレッド構文で「何が上書きされるか」がわかる"
readings:
  - title: MDN — アロー関数式
    url: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/Arrow_functions
  - title: MDN — 分割代入
    url: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
  - title: MDN — スプレッド構文
    url: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  - title: JavaScript Primer — 関数と宣言
    url: https://jsprimer.net/basic/function-declaration/
---

## 今日のゴール

2 週間後に読めるようになりたいコード (ホーム画面の「解読マップ」) には、こんな行があります。

```ts
const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);
```

初見だと記号だらけですが、今日の内容だけで **「右辺が返した配列の 1 番目 (オブジェクト) から scope・page・q を取り出し、2 番目を setParams という名前で受け取っている」** と読めるようになります。右辺の `useQueryStates` が何者かは Day 11 で学びます。

## const と let

変数宣言には `const` と `let` を使います (古い `var` は今のコードではほぼ見ません)。

```ts
const name = 'Alice'; // 再代入できない
let count = 0; // 再代入できる
count = count + 1; // OK
// name = 'Bob';    // エラー: const には再代入できない
```

- 実務のコードは **ほぼ全部 `const`** です。`let` を見たら「この変数は後で書き換わるんだな」と注意して読みます。
- `const` は「変数の付け替え禁止」であって「中身の変更禁止」ではありません。`const user = { age: 1 }; user.age = 2;` は動きます。

## アロー関数

関数の書き方は 2 通りあります。React のコードではアロー関数が圧倒的に多いです。

```ts
// function 宣言
function double(x: number) {
  return x * 2;
}

// アロー関数 (関数を変数に入れている)
const double2 = (x: number) => {
  return x * 2;
};
```

### 省略形

本体が「式 1 つ」なら、`{ }` と `return` を省略できます。**`=>` の右側がそのまま戻り値** です。

```ts
const double3 = (x: number) => x * 2;
const isAdult = (age: number) => age >= 20;
const greet = (name: string) => `こんにちは、${name}さん`;
```

> **落とし穴 1:** `{ }` を書いたら `return` が必要です。`(x) => { x * 2 }` は何も返しません (`undefined`)。

> **落とし穴 2:** オブジェクトを返すときは `( )` で囲みます。`() => { ok: true }` は「`{ }` の関数本体」と解釈されてしまうので、`() => ({ ok: true })` と書きます。

### React でよく見る形

```tsx
<button onClick={() => setOpen(true)}>開く</button>

const ids = users.map((user) => user.id);

useEffect(() => {
  // ...
}, []);
```

どれも「その場で関数を作って渡している」だけです。`() =>` を見たら「あとで呼ばれる関数」と読みます。

## テンプレートリテラル

バッククォート `` ` `` で囲んだ文字列の中では `${式}` で値を埋め込めます。

```ts
const page = 2;
const url = `/api/users?page=${page}`; // "/api/users?page=2"
```

## 配列の分割代入

配列から要素を取り出して、**位置で** 変数に入れます。

```ts
const pair = ['apple', 'banana'];
const [first, second] = pair; // first = 'apple', second = 'banana'

const [, onlySecond] = pair; // 1 つ目を飛ばす
const [a, b = 'default'] = ['x']; // 要素が無ければデフォルト値 → b = 'default'
```

React の `useState` はまさにこれです。

```ts
const [count, setCount] = useState(0);
```

`useState(0)` は「今の値」と「更新する関数」の **2 要素の配列** を返し、それを分割代入で受け取っています。名前は自由なので `const [open, setOpen] = ...` のように付けます。

## オブジェクトの分割代入

オブジェクトから、**プロパティ名で** 取り出します。

```ts
const user = { name: 'Alice', age: 30, address: { city: 'Tokyo' } };

const { name, age } = user; // name = 'Alice', age = 30
const { name: userName } = user; // 名前を付け替える (userName = 'Alice')
const { email = 'なし' } = user; // 無ければデフォルト値
const {
  address: { city },
} = user; // ネストしたものを取り出す (city = 'Tokyo')
```

`{ data: rows }` は「`data` を取り出して `rows` という名前にする」です。`:` の **右側が新しい変数名** で、型注釈ではない点に注意してください。

```ts
const { data: rows = [], isPending } = useQuery(/* ... */);
// → rows は data の中身 (undefined なら [])、isPending はそのまま
```

> **落とし穴 3:** デフォルト値が使われるのは値が `undefined` のときだけです。`null` のときは使われません。

### 関数の引数で分割代入

React コンポーネントの props や、ライブラリのコールバックで頻出です。

```tsx
function UserCard({ name, age }: { name: string; age: number }) {
  return <p>{name} ({age})</p>;
}

queryFn: ({ signal }) => fetchUsers(signal); // 引数オブジェクトから signal だけ取り出す
```

## スプレッド構文 `...` と残余 (rest)

`...` は置かれた場所で意味が変わります。

```ts
// 展開 (スプレッド): 中身をばらして並べる
const a = [1, 2];
const b = [...a, 3]; // [1, 2, 3]

const query = { page: 3, q: 'react' };
const next = { ...query, page: 1 }; // { page: 1, q: 'react' } — 後に書いたものが勝つ

// 残り (rest): 分割代入で「残り全部」を集める
const { page, ...others } = query; // page = 3, others = { q: 'react' }
const sum = (...nums: number[]) => nums.reduce((s, n) => s + n, 0);
```

`{ ...query, page: 1 }` は **元の `query` を変更せずに**、一部だけ違う新しいオブジェクトを作ります。React では state を直接書き換えてはいけないので、この書き方を毎日のように見ます (Day 6)。

## まとめ: 目標コードを分解する

```ts
const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);
```

1. `useQueryStates(...)` は 2 要素の配列を返す (`useState` と同じ形)
2. `[ ..., setParams ]` — 配列の分割代入。2 番目を `setParams` として受け取る
3. `{ scope, page, q }` — 1 番目はオブジェクトなので、さらにオブジェクトの分割代入で 3 つ取り出す

読めましたか? 次はクイズと演習で手を動かしましょう。
