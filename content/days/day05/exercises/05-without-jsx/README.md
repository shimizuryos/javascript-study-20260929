---
title: "(発展) JSX を使わずに書く"
optional: true
hints:
  - "`createElement(型, props, ...子)` の形です。props が無いときは `null` を渡します。"
  - "`<a href={item.href}>{item.label}</a>` は `createElement('a', { href: item.href }, item.label)` です。"
  - "`map` で作った配列もそのまま子として渡せます。key は props の中に書きます: `createElement('li', { key: item.id }, ...)`"
---

「JSX はただの関数呼び出し」であることを体感する問題です。次の JSX と **同じ画面** を、JSX を使わずに `createElement` で書いてください。

```tsx
export function Menu({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <nav className="menu">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

この演習のファイルは `main.ts` (`.tsx` ではない) なので、JSX を書くと構文エラーになります。

```ts
import { createElement } from 'react';

createElement('h2', null, title); // <h2>{title}</h2>
createElement('nav', { className: 'menu' }, 子1, 子2); // <nav className="menu">子1 子2</nav>
```

`createElement` は、自動ランタイムの `jsx()` が登場する前に JSX の変換先として使われていた関数で、今も使えます。
