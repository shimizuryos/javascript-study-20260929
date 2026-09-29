---
title: "(発展) オブジェクトの state でフォームを作る"
optional: true
hints:
  - "入力欄の `name` 属性を state のキーと同じにしておくと、`setForm((prev) => ({ ...prev, [name]: value }))` の 1 つのハンドラで全部の欄を扱えます (Day 2 の計算されたキー)。"
  - "チェックボックスは `e.target.value` ではなく `e.target.checked` です。`type === 'checkbox' ? checked : value` で分けます。"
  - "`<form onSubmit={...}>` では、最初に `e.preventDefault()` を呼んでページの再読み込みを止めます。"
---

会員登録フォームを、**1 つのオブジェクトの state** で作ります。

```ts
type SignupValues = { name: string; email: string; agree: boolean };
// 初期値: { name: '', email: '', agree: false }
```

- 入力欄: 名前 (`name`)、メールアドレス (`email`)、「利用規約に同意する」チェックボックス (`agree`)。ラベルは今のコードのまま
- 3 つの欄を 1 つの `handleChange` で更新する (元のオブジェクトは変更せず、スプレッドで新しいオブジェクトを作る)
- 「登録」ボタンは、名前が空でなく、メールアドレスに `@` を含み、同意にチェックがあるときだけ押せる
- 送信すると `onSubmit(values)` を 1 回呼ぶ

```tsx
<SignupForm onSubmit={(values) => console.log(values)} />
// → { name: 'Alice', email: 'alice@example.com', agree: true }
```
