## deps-empty

次のエフェクトが実行されるのはいつですか?

```tsx
useEffect(() => {
  console.log('接続');
}, []);
```

- [ ] 毎回のレンダーの後
- [x] 最初に表示された (マウントされた) 後の 1 回だけ
- [ ] 一度も実行されない
- [ ] state が変わるたび

> 依存配列が空 `[]` なので、「前回から変わった依存」が存在せず、マウント後の 1 回だけ実行されます。依存配列そのものを省略した `useEffect(fn)` は、毎回のレンダーの後に実行されます。

## deps-none

次のコンポーネントで、ボタンを 2 回押しました。`'effect'` は合計何回ログに出ますか? (Strict Mode ではないとします)

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log('effect');
  });
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

- [ ] 1 回
- [ ] 2 回
- [x] 3 回
- [ ] 無限に出る

> 依存配列を省略すると、毎回のレンダーの後に実行されます。最初の表示で 1 回、ボタンを押すたびに再レンダーされて 1 回ずつ、合計 3 回です。このエフェクトは state を更新しないので、無限ループにはなりません。

## cleanup-order

`q` が `'a'` の状態で表示され、その後 `'b'` に変わりました。ログはどの順番で出ますか?

```tsx
useEffect(() => {
  console.log(`start ${q}`);
  return () => console.log(`stop ${q}`);
}, [q]);
```

- [ ] `start a` → `start b` → `stop a`
- [x] `start a` → `stop a` → `start b`
- [ ] `start a` → `stop b` → `start b`
- [ ] `start a` → `start b`

> 依存が変わると、まず **前回のエフェクトのクリーンアップ** が前回の値 (`'a'`) のまま呼ばれ、その後に新しい値でエフェクトが実行されます。クリーンアップの関数は `'a'` のときのレンダーで作られたものなので、`q` は `'a'` です。

## object-is

`true` になるのはどれですか?

- [ ] `Object.is({ page: 1 }, { page: 1 })`
- [ ] `Object.is([1], [1])`
- [x] `Object.is('page', 'page')`
- [ ] `Object.is(() => 1, () => 1)`

> 文字列や数値などのプリミティブは値で比べられます。オブジェクト・配列・関数は、中身が同じでも **別々に作ったものは別物** です。コンポーネントの本体で作ったオブジェクトがレンダーごとに「変わった」と判定されるのはこのためです。

## object-deps-loop

次のコンポーネントを表示すると、どうなりますか?

```tsx
function Results({ q }: { q: string }) {
  const [items, setItems] = useState<string[]>([]);
  const options = { q, limit: 10 };
  useEffect(() => {
    search(options).then((result) => setItems(result));
  }, [options]);
  return <List items={items} />;
}
```

- [ ] `q` が変わったときだけ search が呼ばれる
- [ ] 最初に 1 回だけ search が呼ばれる
- [x] 結果が返るたびに再レンダーされ、search が呼ばれ続ける
- [ ] `options` は const なので、依存配列に入れても変化しない

> `options` はレンダーのたびに新しいオブジェクトなので、エフェクトは毎回再実行されます。結果の setItems で再レンダー → 新しい options → また search…と止まりません。依存配列を `[q]` にしてオブジェクトはエフェクトの中で作るか、`useMemo(() => ({ q, limit: 10 }), [q])` にします。`const` は再代入禁止なだけで、毎回別のオブジェクトが作られることは変わりません。

## usememo-same

`page` が 3、`pageSize` が 20 のまま、検索語 `q` だけが変わって再レンダーされました。`pagination` はどうなりますか?

```ts
const pagination = useMemo(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);
```

- [x] 前回と **同じオブジェクト** `{ pageIndex: 2, pageSize: 20 }` が返る (`===` で true)
- [ ] 中身が同じ **新しいオブジェクト** が返る
- [ ] `{ pageIndex: 3, pageSize: 20 }` になる
- [ ] `undefined` になる (依存が変わっていないので計算されない)

> 依存 `[page, pageSize]` が前回と同じなので、useMemo は関数を呼ばずに前回覚えた値をそのまま返します。参照が変わらないので、受け取る側は「変わっていない」と判定できます。pageIndex は 0 始まりなので 3 - 1 = 2 です。

## usecallback-equiv

`useCallback(fn, deps)` と同じ意味になるのはどれですか?

- [ ] `useMemo(fn, deps)`
- [x] `useMemo(() => fn, deps)`
- [ ] `useEffect(fn, deps)`
- [ ] `useState(fn)`

> useMemo は「関数を **呼んだ結果**」を覚えます。関数そのものを覚えたいので、「関数を返す関数」`() => fn` を渡します。これが useCallback の中身です。`useMemo(fn, deps)` だと fn を呼んだ戻り値が覚えられてしまいます。

## derive-not-effect

`items` と `query` (どちらも state) から絞り込み結果を表示したいとき、最も適切な書き方はどれですか?

- [ ] `const [visible, setVisible] = useState(items);` と `useEffect(() => setVisible(items.filter((i) => i.includes(query))), [items, query]);`
- [x] `const visible = items.filter((i) => i.includes(query));` とレンダー中に計算する
- [ ] `useEffect(() => { visible = items.filter(...) }, [])`
- [ ] 絞り込み結果をもう 1 つの state にして、入力欄の onChange で両方を更新する

> props や state から計算できる値は、state にせずレンダー中に計算します。エフェクト版は余計な再レンダーが増え、一瞬古い結果が表示されます。計算が重いときだけ `useMemo(() => items.filter(...), [items, query])` にします。

## custom-hook-independent

2 つのコンポーネントがそれぞれ `useToggle()` を呼んでいます。`A` でトグルすると `B` はどうなりますか?

```tsx
function useToggle() {
  const [on, setOn] = useState(false);
  return [on, () => setOn((v) => !v)] as const;
}

function A() { const [on, toggle] = useToggle(); /* ... */ }
function B() { const [on, toggle] = useToggle(); /* ... */ }
```

- [ ] `B` の `on` も切り替わる (同じフックなので state が共有される)
- [x] `B` は変わらない (呼び出しごとに独立した state がある)
- [ ] エラーになる (同じフックは 1 か所でしか使えない)
- [ ] `A` が再レンダーされるたびに `B` の state が初期値に戻る

> 自作フックで共有されるのは「ロジック」だけです。`useToggle()` の中の `useState` は、呼び出したコンポーネントごとに別の state を持ちます。state そのものを共有したいときは、リフトアップ (Day 6) か Context (Day 8) を使います。

## strict-mode-twice

Next.js の開発サーバー (`next dev`) で次のコンポーネントを表示したら、ブラウザのコンソールに `接続` と `切断` と `接続` が出ました。理由として正しいものはどれですか?

```tsx
useEffect(() => {
  console.log('接続');
  return () => console.log('切断');
}, []);
```

- [ ] 依存配列 `[]` の書き方が間違っている
- [ ] コンポーネントが 2 つ表示されている
- [x] 開発中の Strict Mode が、クリーンアップ忘れを見つけるためにマウント → クリーンアップ → マウントを 1 回余分に行った
- [ ] 本番でも同じように 2 回接続される

> 開発中の Strict Mode では、React がわざとエフェクトを「実行 → クリーンアップ → 実行」します。クリーンアップが正しく書けていれば、最終的な状態は 1 回だけ実行したのと同じになります。本番ビルドでは 1 回だけです。
