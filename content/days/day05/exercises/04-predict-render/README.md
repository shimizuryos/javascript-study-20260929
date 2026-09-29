---
title: 画面に何が出るか予想する
hints:
  - "`true` / `false` / `null` / `undefined` は何も表示しません。数値は 0 でも表示されます。"
  - "`a && b` は a が falsy なら **a そのもの** を返します。`0 && 'x'` は `0`、`false && 'x'` は `false` です。"
  - "分割代入のデフォルト値は `undefined` のときだけ使われます。空文字 `''` は「値がある」扱いです。"
---

**コードを読む力** をつける問題です。次の JSX を表示したとき、画面に出る **テキスト全体** (`container.textContent`) を予想して、`main.tsx` の `answers` に文字列で書き込んでください。何も表示されないときは空文字 `''` です。

```tsx
// Q1
<p>{0 && '在庫あり'}</p>

// Q2
<p>{[1, 2, 3].map((n) => n * 10)}</p>

// Q3
<p>{true}{null}{undefined}{false}完了</p>

// Q4
function Price({ value, unit = '円' }: { value: number; unit?: string }) {
  return <span>{value}{unit}</span>;
}
<Price value={500} unit="" />

// Q5
function Status({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return <p>{items.length > 1 ? '複数あり' : items[0]}</p>;
}
<div>
  <Status items={[]} />
  <Status items={['A']} />
  <Status items={['A', 'B']} />
</div>

// Q6
const count = 0;
<p>{count > 0 && `${count} 件`}</p>

// Q7
<ul>
  {['a', 'b'].map((s, i) => (
    <li key={s}>{i}{s}</li>
  ))}
</ul>
```

例: `<p>{1 + 1}個</p>` なら `'2個'` です。間違えた問題は、レンダーされる値の表 (レッスンの「`{ }` で JavaScript の式を埋め込む」) で確認しましょう。
