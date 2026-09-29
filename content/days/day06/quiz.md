## snapshot-three-times

`count` が 0 のときにボタンを 1 回押すと、次の表示で count はいくつになりますか?

```tsx
const [count, setCount] = useState(0);

function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}
```

- [ ] 3
- [x] 1
- [ ] 0
- [ ] エラーになる

> このレンダーの `count` は 0 で固定 (スナップショット) なので、3 回とも `setCount(0 + 1)` になります。「1 にして」を 3 回お願いしているだけなので、結果は 1 です。

## functional-three-times

`count` が 0 のときにボタンを 1 回押すと、次の表示で count はいくつになりますか?

```tsx
function handleClick() {
  setCount((c) => c + 1);
  setCount((c) => c + 1);
  setCount((c) => c + 1);
}
```

- [x] 3
- [ ] 1
- [ ] 0
- [ ] 6

> 関数を渡すと、React はそれをキューに入れて順番に「直前の結果」を引数にして呼びます。0 → 1 → 2 → 3 となります。

## mixed-updates

`count` が 0 のときにボタンを 1 回押すと、次の表示で count はいくつになりますか?

```tsx
function handleClick() {
  setCount(count + 5);
  setCount((c) => c + 1);
}
```

- [ ] 1
- [ ] 5
- [x] 6
- [ ] 11

> 1 つ目は「5 にする」、2 つ目は「直前の結果 + 1」です。キューを順に処理すると 0 → 5 → 6 になります。

## log-after-set

`name` が `'Alice'` のときにボタンを押すと、コンソールに何が出ますか?

```tsx
const [name, setName] = useState('Alice');

function handleClick() {
  setName('Bob');
  console.log(name);
}
```

- [x] `'Alice'`
- [ ] `'Bob'`
- [ ] `undefined`
- [ ] 何も出ない

> setState は「次のレンダーで使う値」を予約するだけで、手元の `name` 変数 (このレンダーのスナップショット) は変わりません。`'Bob'` が見えるのは次のレンダーです。

## onclick-call

次のコンポーネントを表示すると、どうなりますか?

```tsx
function Toggle() {
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(!open);
  return <button onClick={handleClick()}>切り替え</button>;
}
```

- [ ] クリックするたびに open が切り替わる
- [ ] 1 回目のクリックだけ動く
- [x] 表示した時点で handleClick が呼ばれ、再レンダーが止まらずエラーになる
- [ ] 何も起きない (エラーも出ない)

> `onClick={handleClick()}` は、レンダー中に handleClick を **実行** し、その戻り値を onClick に渡します。レンダーのたびに setOpen が呼ばれて再レンダーが続き、`Too many re-renders` エラーになります。関数そのものを渡す `onClick={handleClick}` が正解です。

## push-no-rerender

ボタンを押したとき、画面はどうなりますか?

```tsx
const [items, setItems] = useState(['a']);

function handleAdd() {
  items.push('b');
  setItems(items);
}
```

- [ ] `a` と `b` が表示される
- [x] 再レンダーされず、`a` だけが表示されたまま
- [ ] エラーになる
- [ ] `b` だけが表示される

> `push` は元の配列を書き換えるだけで、配列の参照は同じままです。React は `Object.is(前, 次)` が true なので「変化なし」と判断し、再レンダーしません。`setItems([...items, 'b'])` のように新しい配列を渡します。

## toggle-immutable

`id` が 2 の todo の `done` を反転する更新として正しいものはどれですか?

- [ ] `setTodos(todos.map((t) => { if (t.id === 2) t.done = !t.done; return t; }))`
- [x] `setTodos(todos.map((t) => (t.id === 2 ? { ...t, done: !t.done } : t)))`
- [ ] `todos[1].done = !todos[1].done; setTodos(todos)`
- [ ] `setTodos({ ...todos, done: true })`

> 変更したい要素だけ `{ ...t, done: !t.done }` で新しいオブジェクトにし、ほかはそのまま返します。1 つ目は map で新しい配列は作っていますが、中のオブジェクトを直接書き換えているので「前の state」まで変わってしまいます。4 つ目は配列をオブジェクトに変えてしまっています。

## controlled-no-onchange

次の入力欄に文字を打つと、どうなりますか?

```tsx
const [text, setText] = useState('初期値');

<input value={text} />;
```

- [ ] 打った文字が普通に入力される
- [x] `value` が state に固定されているので、打っても表示が変わらない
- [ ] 打つたびに text が自動で更新される
- [ ] エラーで画面が表示されない

> `value` を渡すと、入力欄の表示は常に state の値になります。`onChange` で setText を呼ばない限り state は変わらないので、打っても元に戻ります (開発ビルドでは警告が出ます)。

## lift-state

`SearchBox` (入力欄) と `ResultList` (結果一覧) が兄弟のコンポーネントで、入力に応じて一覧を絞り込みたいとき、検索語の state はどこに置くべきですか?

- [ ] `SearchBox` の中
- [ ] `ResultList` の中
- [ ] 両方に同じ state を置いて、同じ値になるようにする
- [x] 2 つの共通の親に置き、値と更新関数を props で渡す

> 兄弟同士は直接 props をやりとりできません。共通の親に state を持ち上げ (リフトアップ)、`SearchBox` には `value` と `onChange`、`ResultList` には `query` を渡します。state を 1 か所にまとめることで、表示がずれなくなります。

## initial-prop

親が `initial` を 1 → 5 に変えて再レンダーしたとき、子の `count` はどうなりますか? (ボタンは押していないとします)

```tsx
function Counter({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);
  return <p>{count}</p>;
}
```

- [x] 1 のまま
- [ ] 5 になる
- [ ] 6 になる
- [ ] 0 に戻る

> `useState` の引数は **最初のレンダーでだけ** 使われる初期値です。あとから props が変わっても、React が覚えている state (1) がそのまま返ります。
