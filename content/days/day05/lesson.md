---
day: 5
level: 2
title: コンポーネントと JSX
summary: JSX・関数コンポーネント・props・children・リストと key・条件付きレンダーを読めるようにする。
minutes: 100
goals:
  - JSX が「関数呼び出し」に変換され、React 要素 (オブジェクト) を返すことを説明できる
  - "function Avatar({ name, size = 40 }: AvatarProps) のような props の受け取り方を読める"
  - children を受け取って包むだけのコンポーネント (Provider など) の形がわかる
  - "items.map((item) => <li key={item.id}>...) の key の役割と、index を key にすると困る場面を説明できる"
  - "&& / 三項演算子 / 早期 return の条件付きレンダーを読み、{count && ...} で 0 が表示される理由を説明できる"
readings:
  - title: React — 初めてのコンポーネント
    url: https://ja.react.dev/learn/your-first-component
  - title: React — JSX に波括弧で JavaScript を含める
    url: https://ja.react.dev/learn/javascript-in-jsx-with-curly-braces
  - title: React — コンポーネントに props を渡す
    url: https://ja.react.dev/learn/passing-props-to-a-component
  - title: React — 条件付きレンダー
    url: https://ja.react.dev/learn/conditional-rendering
  - title: React — リストのレンダー
    url: https://ja.react.dev/learn/rendering-lists
---

## 今日のゴール

今日から Level 2 (React) です。目標コードの `useSharedScopeQuery` は **自作フック** で、それ自体は画面を描きません。画面を描くのは、フックを呼び出す **コンポーネント** の側です。実務では、たとえばこんなコンポーネントと組み合わせて使われます。

```tsx
export function UserList() {
  const { rows, isPending, error } = useSharedScopeQuery('users', fetchUsers);

  if (error) return <p className="error">読み込みに失敗しました</p>;

  return (
    <section>
      {isPending && <Spinner />}
      <ul>
        {rows.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </section>
  );
}
```

今日の内容で、この **`return` の中身 (JSX) がすべて読める** ようになります。フックの中身は Day 7 以降で読みます。

## JSX は「関数呼び出し」

JSX は、HTML に似た見た目で UI を書くための JavaScript の拡張構文です。ブラウザは JSX を理解できないので、ビルド時に普通の関数呼び出しに変換されます。

```tsx
const el = <h1 className="title">こんにちは</h1>;

// ↓ ビルド後 (イメージ)
import { jsx } from 'react/jsx-runtime';
const el = jsx('h1', { className: 'title', children: 'こんにちは' });
```

`jsx(...)` が返すのは **「こういう要素を描いてほしい」という説明のオブジェクト** (React 要素) で、DOM そのものではありません。ただの値なので、変数に入れる・関数から返す・配列に入れる、が自由にできます。

> 古いコードでは `React.createElement('h1', { className: 'title' }, 'こんにちは')` に変換されていました。昔のファイルの先頭に必ず `import React from 'react'` があるのはそのためです (今は不要)。

### JSX のルール

```tsx
<>
  <img src={url} alt="" />
  <label htmlFor="q" className="label">検索</label>
  <button onClick={handleClick} style={{ color: 'red' }}>送信</button>
</>
```

- ルート (一番外側) の要素は 1 つ。複数並べたいときは **フラグメント** `<>...</>` で包みます。フラグメントは DOM に何も出力しない「まとめ役」です。
- `<img />` のような空要素も必ず閉じます。
- `class` は `className`、`for` は `htmlFor`。属性名は `onClick` のようなキャメルケースです。
- `style={{ color: 'red' }}` の外側の `{ }` は「ここから JavaScript」、内側の `{ }` はオブジェクトリテラルです。数値は多くの場合 `px` として扱われます (`{ width: 40 }` → `width: 40px`。ただし `opacity` や `lineHeight` など単位の無いプロパティはそのままの数値)。

## `{ }` で JavaScript の式を埋め込む

JSX の中で `{ }` を書くと、その中は JavaScript の **式** になります。

```tsx
<p>{user.name} さん ({user.age + 1} 歳になります)</p>
<img src={user.avatarUrl} alt={`${user.name} のアイコン`} />
```

- 書けるのは **値になるもの (式)** だけです。`if` や `for` などの文は書けません。条件は `? :` や `&&`、繰り返しは `map` を使います。
- 属性に文字列をそのまま渡すなら `"..."`、それ以外は `{...}` です。`size="48"` は文字列、`size={48}` は数値になります。

`{ }` の中の値によって、画面に出るものが変わります。

| 値 | 画面の表示 |
| --- | --- |
| 文字列・数値 (`'abc'`, `0`, `NaN`) | そのまま表示 |
| `true` / `false` / `null` / `undefined` | **何も表示しない** |
| 配列 | 中身を順に表示 |
| 普通のオブジェクト `{ ... }` | エラー (Objects are not valid as a React child) |

この表が、あとで出てくる「`0` が表示されてしまう」バグの原因になります。

## コンポーネント

コンポーネントは **JSX を返す関数** です。

```tsx
export function Avatar() {
  return <img className="avatar" src="/alice.png" alt="Alice" />;
}

export default function Profile() {
  return (
    <div>
      <Avatar />
      <Avatar />
    </div>
  );
}
```

- 名前は **大文字で始めます**。JSX は小文字のタグ (`<div>`) を HTML 要素、大文字のタグ (`<Avatar>`) をコンポーネントとして扱います。
- 複数行の JSX を返すときは `return (` と `)` で囲みます (`return` の直後で改行すると `undefined` が返るため)。
- `<Avatar />` と書くと、**React が** `Avatar` 関数を呼びます。自分で `Avatar()` と呼ぶことはありません。

## props — 親から子へ値を渡す

JSX の属性は、**1 つのオブジェクト (props)** にまとめて子コンポーネントに渡されます。

```tsx
<Avatar name="Alice" size={48} />
// → React が Avatar({ name: 'Alice', size: 48 }) のように呼ぶ
```

受け取る側は、Day 1 で学んだ **引数の分割代入** で取り出すのが定番です。

```tsx
type AvatarProps = {
  name: string;
  size?: number; // 省略可能
};

export function Avatar({ name, size = 40 }: AvatarProps) {
  return <img src={`/avatars/${name}.png`} alt={name} width={size} height={size} />;
}
```

- `{ name, size = 40 }: AvatarProps` は「props から name と size を取り出す。size が `undefined` なら 40」という意味です。`: AvatarProps` は props 全体の型です。
- props は **読み取り専用** です。子が props を書き換えてはいけません (変化する値は Day 6 の state で扱います)。
- `<Button disabled />` のように値を省略すると `disabled={true}` と同じです。
- `<Avatar {...user} />` は「user のプロパティを全部 props として渡す」(スプレッド) です。

## children — タグの間に書いたもの

開きタグと閉じタグの **間に書いた JSX** は、`children` という名前の props として渡されます。

```tsx
import type { ReactNode } from 'react';

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

<Card title="お知らせ">
  <p>明日はメンテナンスです。</p>
</Card>;
```

`ReactNode` は「JSX に置けるものなら何でも」(要素・文字列・数値・`null`・配列など) を表す型です。Day 8 で学ぶ `<QueryClientProvider client={...}>{children}</QueryClientProvider>` も、**children を包んで返すコンポーネント** の一種です。

## リストの表示と key

配列を並べて表示するときは、`map` で **JSX の配列** に変換します。

```tsx
<ul>
  {users.map((user) => (
    <li key={user.id}>{user.name}</li>
  ))}
</ul>
```

`key` は、**「前回のレンダーのどの項目と、今回のどの項目が同じものか」** を React が見分けるための名札です。追加・削除・並べ替えがあっても、key が同じなら同じ項目として扱われ、入力中のテキストやチェック状態が正しい項目に引き継がれます。

- key は兄弟の中で **一意** で、**レンダーをまたいで変わらない** 値にします。データの ID が最適です。
- key を付け忘れると、開発ビルドでは `Each child in a list should have a unique "key" prop.` という警告が出ます (演習の「ログ」にも表示されます)。
- `key` は props としては子に渡されません (子の中で `key` は読めません)。
- `map` の中で複数の要素を返すときは `<Fragment key={item.id}>...</Fragment>` を使います (`<>` には key を書けないため)。

> **落とし穴:** `key={index}` (配列の位置) にすると警告は消えますが、先頭への追加・削除・並べ替えで「位置」と「項目」の対応がずれ、入力欄の中身などが **別の項目の行にくっついて** しまいます。`key={Math.random()}` は毎回別物扱いになるのでもっと悪いです。並びが絶対に変わらない静的なリストなら index でも問題ありません。

## 条件付きレンダー

JSX の中には `if` を書けないので、次の 3 つを使い分けます。

```tsx
function UserList({ users, isPending }: { users: User[]; isPending: boolean }) {
  // 1. 早期 return: 画面全体を切り替える
  if (isPending) return <p>読み込み中…</p>;

  return (
    <div>
      {/* 2. 三項演算子: A か B か */}
      {users.length > 0 ? <p>{users.length} 件</p> : <p>該当なし</p>}

      {/* 3. &&: 条件を満たすときだけ表示 */}
      {users.length > 100 && <p>多すぎるので絞り込んでください</p>}
    </div>
  );
}
```

- `cond && <X />` の値は、cond が truthy なら `<X />`、falsy なら **cond の値そのもの** です (Day 2 の `&&`)。
- 何も表示したくないときは `null` を返します (`return null;`)。

> **落とし穴:** `{count && <Badge count={count} />}` は、count が `0` のとき **画面に「0」と表示されます**。`0 && ...` の結果は `0` で、数値の 0 は表示されるからです (上の表)。`{count > 0 && ...}` のように **真偽値になる条件** を書くか、三項演算子 `{count ? <Badge count={count} /> : null}` を使います。

## まとめ: 実務のコンポーネントを読む

冒頭のコードを分解して読んでみましょう。

```tsx
if (error) return <p className="error">読み込みに失敗しました</p>;
```

→ エラーがあれば **早期 return** で別の表示を返す。`className` は HTML の `class`。

```tsx
{isPending && <Spinner />}
```

→ `isPending` は真偽値なので `&&` で安全 (数値だと `0` が出る危険がある)。`<Spinner />` は大文字なのでコンポーネント。

```tsx
{rows.map((user) => (
  <li key={user.id}>{user.name}</li>
))}
```

→ 配列 `rows` を `map` で `<li>` の配列に変換。key は ID なので、ページを切り替えて行が入れ替わっても React は正しく対応を取れる。

JSX は「関数呼び出しで作ったオブジェクト」、コンポーネントは「props を受け取って JSX を返す関数」。この 2 つを押さえれば、どんなに大きな画面も同じ読み方で読めます。
