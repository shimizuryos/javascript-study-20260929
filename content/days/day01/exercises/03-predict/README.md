---
title: 実行せずに予想する
hints:
  - "分割代入のデフォルト値は `undefined` のときだけ使われます。`null` は「値がある」扱いです。"
  - "`=>` の後ろが `{` で始まると関数本体になり、`return` が無ければ `undefined` を返します。"
  - "オブジェクトのスプレッドは後から書いたものが勝ちます。値が `undefined` のプロパティでも「上書き」されます。"
---

**コードを読む力** をつける問題です。次のコードを実行したときの値を **予想して**、`main.ts` の `answers` に書き込んでください。書き込んでから「実行」で答え合わせします。

```ts
// Q1: y の値は?
const [x, y = 5] = [1, undefined];

// Q2: b の値は?
const { a: b = 1 } = { a: null };

// Q3: f(1) の値は?
const f = (n: number) => {
  n + 1;
};

// Q4: rest の値は?
const { page, ...rest } = { page: 2, q: 'ts', size: 20 };

// Q5: merged の値は?
const merged = { ...{ page: 2, q: 'ts' }, ...{ q: undefined } };

// Q6: first の値は? (TypeScript では型エラーになる書き方ですが、JavaScript の動きを考えてください)
const [first] = [];
```

答えが `undefined` のときは `undefined`、オブジェクトのときは `{ ... }` をそのまま書きます。間違えた問題は、なぜそうなるのかをレッスンで確認しましょう。
