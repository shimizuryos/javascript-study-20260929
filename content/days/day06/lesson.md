---
day: 6
level: 2
title: state
summary: useState・イベント・state のスナップショット・関数型更新・イミュータブルな更新・state のリフトアップ・制御された入力を読めるようにする。
minutes: 110
goals:
  - "const [count, setCount] = useState(0) で「何が起き、いつ再レンダーされるか」を説明できる"
  - "onClick={handle} と onClick={handle()} の違いを説明できる"
  - "setCount(count + 1) を 3 回呼んでも +1 にしかならない理由と、setCount((c) => c + 1) の意味を説明できる"
  - "オブジェクト・配列の state をスプレッド / map / filter で更新するコードを読める (push などの破壊的変更がダメな理由も)"
  - "value + onChange の入力欄と、state を親に持ち上げる (リフトアップ) 形を読める"
readings:
  - title: React — state：コンポーネントのメモリ
    url: https://ja.react.dev/learn/state-a-components-memory
  - title: React — スナップショットとしての state
    url: https://ja.react.dev/learn/state-as-a-snapshot
  - title: React — 一連の state の更新をキューに入れる
    url: https://ja.react.dev/learn/queueing-a-series-of-state-updates
  - title: React — 配列 state の更新
    url: https://ja.react.dev/learn/updating-arrays-in-state
  - title: React — コンポーネント間で state を共有する
    url: https://ja.react.dev/learn/sharing-state-between-components
---

## 今日のゴール

目標コードの 48〜51 行目には、次のような関数があります。

```ts
const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
  const next = typeof updater === 'function' ? updater(pagination) : updater;
  void setParams({ page: next.pageIndex + 1 });
};
```

`updater` は「**新しい値そのもの**」か「**前の値を受け取って新しい値を返す関数**」のどちらかです。この「値 or 関数」という形は、今日学ぶ React の `setState` とまったく同じ考え方です。今日の内容で、**なぜ関数の形が必要なのか** がわかるようになります (TanStack Table の型そのものは Day 13)。

## 普通の変数ではダメな理由

```tsx
function Counter() {
  let count = 0;
  return <button onClick={() => { count = count + 1; }}>{count}</button>;
}
```

このボタンは何度押しても 0 のままです。理由は 2 つあります。

1. ローカル変数を書き換えても、React は **再レンダー** (コンポーネント関数をもう一度呼んで画面を作り直すこと) をしない
2. 仮に再レンダーされても、関数が最初から実行されるので `count` は 0 に戻る

この 2 つを解決するのが **state** です。

## useState

```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

- `useState(0)` は `[今の値, 更新関数]` を返します (Day 1 の配列の分割代入)。
- `0` は **初回のレンダーでだけ** 使われる初期値です。2 回目以降は React が覚えている値が返ります。
- `setCount(新しい値)` を呼ぶと、React は値を記録して **再レンダーを予約** します。

`use` で始まる関数は **フック** (Hook) と呼ばれ、コンポーネントの **トップレベル** (if や for の外) でだけ呼べます。

> **落とし穴:** 初期値は最初の 1 回しか使われません。`useState(props.initial)` と書いても、あとで `props.initial` が変わったときに state は追従しません。

## イベントハンドラ

```tsx
function handleClick() {
  setOpen(true);
}

<button onClick={handleClick}>開く</button>           // ○ 関数を渡す (クリック時に呼ばれる)
<button onClick={() => setOpen(true)}>開く</button>   // ○ その場で関数を作って渡す
<button onClick={handleClick()}>開く</button>         // × レンダー中に呼んでしまう
```

`onClick={handleClick()}` は、**レンダー中に** `handleClick` を実行し、その戻り値 (`undefined`) を onClick に渡します。中で setState していると「レンダー → setState → 再レンダー → setState …」の無限ループになり、`Too many re-renders` エラーになります。

入力欄のイベントでは、引数のイベントオブジェクトから値を取り出します。

```tsx
<input onChange={(e) => setText(e.target.value)} />
```

名前の慣習: 自分で定義するハンドラは `handleXxx`、props として受け取るハンドラは `onXxx` (例: `onChange`, `onPaginationChange`)。

## state はスナップショット

```tsx
const [count, setCount] = useState(0);

function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  console.log(count);
}
```

ボタンを押すと、count は **3 ではなく 1** になり、ログには **0** が出ます。

- このレンダーでの `count` は **0 で固定** された値 (スナップショット) です。setCount を呼んでも、手元の `count` 変数は変わりません。
- `setCount(count + 1)` は 3 回とも `setCount(0 + 1)`、つまり「1 にして」を 3 回お願いしているだけです。
- 新しい値が見えるのは **次のレンダー** です。

## 関数型更新 `setX(prev => ...)`

前の値をもとに更新したいときは、**値の代わりに関数** を渡します。

```tsx
function handleClick() {
  setCount((c) => c + 1); // 0 → 1
  setCount((c) => c + 1); // 1 → 2
  setCount((c) => c + 1); // 2 → 3
}
```

React は渡された関数を順番にキューに入れ、**直前の結果** を引数にして呼びます。そのため +3 になります。

| 呼び方 | 意味 |
| --- | --- |
| `setCount(5)` | 5 にする |
| `setCount(count + 1)` | 「このレンダーの count + 1」にする |
| `setCount((c) => c + 1)` | 「その時点の最新の値 + 1」にする |

1 回のイベントで複数回更新するときや、タイマー・非同期処理の中で更新するとき (古いスナップショットを掴んでしまいやすい) は、関数型更新を使うのが安全です。冒頭の `updater` も、ライブラリが「前の値からの更新」を表現するためにこの形を採用しています。

## オブジェクト・配列の state はイミュータブルに

state の中身は **直接書き換えず、新しいオブジェクト・配列を作って** set します。

```tsx
const [user, setUser] = useState({ name: 'Alice', age: 30 });

setUser({ ...user, age: 31 }); // ○ 新しいオブジェクト
// user.age = 31; setUser(user);  // × 同じオブジェクトを渡している
```

React は `Object.is(前の値, 新しい値)` で変化を判定します。**同じ参照** を渡すと「変わっていない」とみなして **再レンダーしません**。

配列の定番パターン:

| やりたいこと | ○ 新しい配列を返す | × 元の配列を変更する |
| --- | --- | --- |
| 追加 | `[...items, x]` / `[x, ...items]` | `push`, `unshift` |
| 削除 | `items.filter((i) => i.id !== id)` | `splice` |
| 1 件更新 | `items.map((i) => (i.id === id ? { ...i, done: true } : i))` | `items[0].done = true` |
| 並べ替え | `[...items].sort(...)` / `items.toSorted(...)` | `sort`, `reverse` |

```tsx
// 1 件だけ done を反転する (ほかの要素はそのまま使い回す)
setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
```

> **落とし穴:** `items.push(x); setItems(items);` は、中身は増えても **配列の参照が同じ** なので再レンダーされません。しかも「前の state」まで書き換えてしまうので、別の再レンダーのタイミングで突然表示が変わる、という分かりにくいバグになります。

## 制御された入力 (controlled input)

入力欄の値を state で持ち、`value` と `onChange` をセットで渡す形を **制御されたコンポーネント** と呼びます。

```tsx
const [text, setText] = useState('');

<input value={text} onChange={(e) => setText(e.target.value)} />;

<input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />;
```

- 画面の値は常に state と一致します。state を `''` にすれば入力欄も空になります (送信後のリセットなど)。
- `value` だけ渡して `onChange` を書かないと、入力できない欄になります (開発ビルドでは警告が出ます)。
- 絞り込み結果のように **state から計算できる値は state にしない** で、レンダー中に計算します: `const visible = items.filter((i) => i.includes(text));`

## state のリフトアップ

兄弟のコンポーネント同士で同じ state を使いたいときは、state を **共通の親に移し**、値と更新関数を props で配ります。

```tsx
function SearchPage() {
  const [query, setQuery] = useState(''); // 親が持つ (唯一の情報源)
  return (
    <>
      <SearchBox value={query} onChange={setQuery} />
      <ResultList query={query} />
    </>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}
```

`SearchBox` は自分で state を持たず、「今の値」と「変わったら呼ぶ関数」を受け取るだけの部品になりました。この **value + onChange の組** は、UI ライブラリの入力部品や TanStack Table の `state` + `onPaginationChange` など、あらゆる場所で出てきます。

さらに「別の画面とも共有したい」「リロードしても残したい」state は、URL に置くことがあります。目標コードの `useQueryStates` (Day 11) は、**state の置き場所を URL にする** フックです。

## まとめ: 目標コードを分解する

```ts
const next = typeof updater === 'function' ? updater(pagination) : updater;
```

1. `updater` は「新しい値」か「前の値 → 新しい値 の関数」(setState と同じ 2 通り)
2. 関数なら、今の `pagination` を渡して新しい値を計算する (`setCount((c) => c + 1)` の `c` にあたる)
3. 値ならそのまま使う

```ts
const setSearch = (text: string) => setParams({ q: text || null, page: null });
```

→ 検索語が変わったら、`{ ...元の状態, q, page }` のように **新しい状態をまとめて渡す**。state は直接書き換えず、更新関数に新しい値を渡す、という React の原則どおりの形です。
