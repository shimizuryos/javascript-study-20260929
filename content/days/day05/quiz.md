## jsx-is-call

次の JSX は、ビルド後にどのような呼び出しになりますか? (イメージとして最も近いもの)

```tsx
<Greeting name="Alice" size={2} />
```

- [ ] `Greeting('Alice', 2)`
- [x] `jsx(Greeting, { name: 'Alice', size: 2 })`
- [ ] `jsx('Greeting', { name: 'Alice', size: '2' })`
- [ ] `new Greeting({ name: 'Alice', size: 2 })`

> 大文字で始まるタグは、関数 `Greeting` そのものへの参照になります。属性は 1 つのオブジェクト (props) にまとめられ、`size={2}` は数値の 2 です。`Greeting` を実際に呼ぶのは React で、そのとき props オブジェクトが 1 つ渡されます。

## lowercase-component

次のコードを実行すると、どうなりますか? (TypeScript のエラーは無視します)

```tsx
function profileCard() {
  return <p>プロフィール</p>;
}

export function Page() {
  return <profileCard />;
}
```

- [ ] `profileCard` が呼ばれて「プロフィール」と表示される
- [x] `profileCard` は呼ばれず、`<profilecard>` という (存在しない) HTML 要素として扱われる
- [ ] 構文エラーになる
- [ ] React が自動で大文字に直して `ProfileCard` を探す

> JSX は、小文字で始まるタグを HTML 要素の名前 (文字列 `'profileCard'`) として扱います。関数は呼ばれず、中身の「プロフィール」も表示されません。コンポーネントの名前は必ず大文字で始めます。

## render-values

画面に **何も表示されない** のはどれですか?

- [ ] `<p>{0}</p>`
- [x] `<p>{false}</p>`
- [ ] `<p>{'false'}</p>`
- [ ] `<p>{NaN}</p>`

> `true` / `false` / `null` / `undefined` は何も表示しません。数値は `0` や `NaN` でもそのまま表示され、`'false'` は文字列なので「false」と表示されます。

## zero-pitfall

`<Inbox unread={0} />` を表示すると、画面には何が出ますか?

```tsx
function Inbox({ unread }: { unread: number }) {
  return <div>{unread && <span>未読 {unread} 件</span>}</div>;
}
```

- [ ] 何も表示されない
- [x] `0`
- [ ] `未読 0 件`
- [ ] `false`

> `0 && ...` は左側の `0` をそのまま返し、数値の 0 は画面に表示されます。`{unread > 0 && ...}` のように真偽値の条件にするか、三項演算子 `{unread ? ... : null}` を使います。

## curly-statement

JSX の `{ }` の中に **書けない** のはどれですか?

- [ ] `{items.length > 0 ? 'あり' : 'なし'}`
- [x] `{if (items.length > 0) { 'あり' }}`
- [ ] `{items.map((i) => i.name).join(', ')}`
- [ ] `{String(items.length)}`

> `{ }` の中に書けるのは値になる「式」だけです。`if` は文なので書けません。条件分岐は三項演算子や `&&`、または `return` の前の `if` (早期 return) で書きます。

## props-default

次の `<Badge label="新着" />` の `<span>` の className はどれですか?

```tsx
function Badge({ label, color = 'gray' }: { label: string; color?: string }) {
  return <span className={`badge badge-${color}`}>{label}</span>;
}
```

- [x] `badge badge-gray`
- [ ] `badge badge-undefined`
- [ ] `badge badge-`
- [ ] `badge`

> `color` を渡していないので props の中では `undefined` です。分割代入のデフォルト値 `color = 'gray'` が使われ、テンプレートリテラルで `badge badge-gray` になります。

## children-prop

`Card` は `<p>本文</p>` をどうやって受け取りますか?

```tsx
<Card title="お知らせ">
  <p>本文</p>
</Card>
```

- [x] `children` という名前の props として受け取る
- [ ] 第 2 引数として受け取る
- [ ] `body` という名前の props として受け取る
- [ ] 受け取れない (タグの間に書いたものは無視される)

> 開きタグと閉じタグの間に書いたものは `children` という props になります。`function Card({ title, children }: { title: string; children: ReactNode })` のように受け取り、`{children}` と書いた場所に表示します。

## key-purpose

リストの `key` の役割として正しいものはどれですか?

- [ ] `<li>` を表示する順番を決める
- [x] 前回と今回のレンダーで、どの項目が同じものかを React が見分ける
- [ ] 子コンポーネントに ID を props として渡す
- [ ] CSS でスタイルを当てるための目印にする

> key は項目の「名札」です。並び順は配列の順番で決まり、key は順番には影響しません。また key は props として子に渡されないので、子で ID が必要なら `id={item.id}` のように別に渡します。

## index-key

各行に入力欄があるリストで `key={index}` を使っています。入力欄に文字を打ちかけた状態で、配列の **先頭に** 新しい項目が追加されました。何が起きますか?

```tsx
{todos.map((todo, index) => (
  <li key={index}>
    {todo.title} <input />
  </li>
))}
```

- [ ] 何も問題ない (key の警告が出ていないので正しく動く)
- [x] 入力欄の中身が「位置」に付いたままになり、打ちかけた文字が別の項目の行に表示される
- [ ] 同じ key が 2 つになりエラーになる
- [ ] 新しく追加した項目が表示されない

> key が index だと、React は「0 番目の `<li>` は前回も今回も同じもの」と判断して DOM (入力欄) を使い回します。先頭に追加すると 0 番目の項目は新しいものに変わるのに、入力欄の中身は 0 番目の位置に残ってしまいます。`key={todo.id}` にすれば、入力欄は正しい項目と一緒に移動します。
