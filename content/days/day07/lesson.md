---
day: 7
level: 2
title: エフェクトと自作フック
summary: useEffect (外部との同期・依存配列・クリーンアップ)、参照の同一性、useMemo / useCallback、自作フックを読めるようにする。
minutes: 120
goals:
  - "useEffect の依存配列 (なし / [] / [a, b]) で、エフェクトがいつ実行されるかを説明できる"
  - クリーンアップ関数がいつ呼ばれるか (依存が変わる前・アンマウント時) を説明できる
  - "{ } や [ ] や関数はレンダーごとに別物になる (Object.is で false) ことと、それが依存配列でなぜ問題になるかを説明できる"
  - "useMemo(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]) を分解して読める"
  - useXxx という自作フックが「ロジックの共有」であり「state の共有」ではないことを説明できる
readings:
  - title: React — エフェクトを使って同期を行う
    url: https://ja.react.dev/learn/synchronizing-with-effects
  - title: React — そのエフェクトは不要かもしれない
    url: https://ja.react.dev/learn/you-might-not-need-an-effect
  - title: React — カスタムフックでロジックを再利用する
    url: https://ja.react.dev/learn/reusing-logic-with-custom-hooks
  - title: React リファレンス — useMemo
    url: https://ja.react.dev/reference/react/useMemo
  - title: React リファレンス — useCallback
    url: https://ja.react.dev/reference/react/useCallback
---

## 今日のゴール

実は、目標コードの **ファイル全体が「自作フック」** です。

```ts
export function useSharedScopeQuery<TRow>(resource: string, fetcher: ..., options: Options = {}) {
  const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers); // フックを呼ぶ
  const query = useQuery({ ... }); // フックを呼ぶ

  const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);
  // ...
  return { scope, q, rows: ..., tableState: { pagination }, onPaginationChange };
}
```

名前が `use` で始まり、中で別のフックを呼び、画面で使いやすい形にまとめて返す。今日はこの「自作フック」の作り方と、46 行目の **`useMemo` と依存配列 `[page, pageSize]`** の意味を学びます。

## レンダーは「計算」、副作用は外で

コンポーネント関数は、同じ props と state なら同じ JSX を返す **純粋な計算** であるべきです。通信・タイマー・購読・DOM の直接操作のような **副作用** は、レンダー中ではなく次のどちらかに書きます。

1. **イベントハンドラ** … ユーザーの操作がきっかけのもの (ボタンを押したら保存する)
2. **エフェクト (`useEffect`)** … 「表示されていること」がきっかけのもの (表示中はチャットに接続しておく)

エフェクトは、React の外にあるもの (ブラウザ API・タイマー・サーバー・他のライブラリ) と **同期する** ための仕組みです。

## useEffect の基本と依存配列

```tsx
useEffect(() => {
  document.title = `未読 ${count} 件`;
}, [count]);
```

エフェクトは、レンダー → 画面 (DOM) の更新 → **その後** に実行されます。第 2 引数の **依存配列** で、いつ実行するかが変わります。

| 書き方 | 実行されるタイミング |
| --- | --- |
| `useEffect(fn)` | 毎回のレンダーの後 |
| `useEffect(fn, [])` | 最初の表示 (マウント) の後に 1 回だけ |
| `useEffect(fn, [a, b])` | マウント後 + `a` か `b` が前回から **変わった** レンダーの後 |

「変わった」かどうかは、各要素を `Object.is(前回の値, 今回の値)` で比べて判定します。エフェクトの中で使う props や state は、すべて依存配列に書くのがルールです (ESLint の `react-hooks/exhaustive-deps` が指摘してくれます)。

## クリーンアップ

エフェクトから **関数を返す** と、それがクリーンアップ (後片付け) になります。

```tsx
// タイマー
useEffect(() => {
  const id = setInterval(() => setNow(Date.now()), 1000);
  return () => clearInterval(id);
}, []);

// イベントの購読
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);

// 通信の中断
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users?q=${q}`, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => setUsers(data))
    .catch((error) => {
      if (error.name !== 'AbortError') setError(error);
    });
  return () => controller.abort();
}, [q]);
```

クリーンアップが呼ばれるのは次の 2 つのときです。

- 依存が変わって **エフェクトを再実行する直前** (前回の値のクリーンアップ)
- コンポーネントが画面から消える (**アンマウント**) とき

`q` が `'a'` → `'b'` に変わると、「`'b'` でレンダー → 画面更新 → `'a'` のクリーンアップ (中断) → `'b'` のエフェクト (通信開始)」の順になります。検索語を素早く変えても、古いリクエストの結果で上書きされません。目標コード 41 行目の `queryFn: ({ signal }) => ...` の `signal` は、TanStack Query がこの AbortController の仕組みを肩代わりしてくれているものです (Day 12)。

> **落とし穴:** Next.js などで開発中に **Strict Mode** が有効だと、React はわざと「マウント → クリーンアップ → マウント」を 1 回余分に行い、クリーンアップ忘れを見つけやすくします。開発中だけエフェクトのログが 2 回出るのはこのためで、本番では 1 回です。

## 参照の同一性と Object.is

```ts
Object.is(1, 1); // true
Object.is('a', 'a'); // true
Object.is({ q: 'a' }, { q: 'a' }); // false … 中身が同じでも別のオブジェクト
Object.is([], []); // false
Object.is(() => {}, () => {}); // false
```

コンポーネントの本体で作ったオブジェクト・配列・関数は、**レンダーのたびに新しく作られる別物** です。これを依存配列に入れると、毎回「変わった」と判定されます。

```tsx
function Results({ q }: { q: string }) {
  const [items, setItems] = useState<string[]>([]);
  const options = { q, limit: 10 }; // 毎回新しいオブジェクト

  useEffect(() => {
    search(options).then((result) => setItems(result));
  }, [options]); // ← 毎回「変わった」
}
```

レンダー → 新しい options → エフェクト → setItems → 再レンダー → 新しい options → … と、**リクエストが永遠に続きます**。直し方は 2 つです。

```tsx
// 1. プリミティブ (文字列・数値) だけを依存配列に入れ、オブジェクトはエフェクトの中で作る
useEffect(() => {
  search({ q, limit: 10 }).then((result) => setItems(result));
}, [q]);

// 2. useMemo で「q が変わらない限り同じオブジェクト」にする
const options = useMemo(() => ({ q, limit: 10 }), [q]);
```

## useMemo と useCallback

```tsx
const value = useMemo(() => 計算, [依存]);
```

- 最初のレンダーで関数を呼び、結果を覚えておきます。
- 次のレンダーで依存がすべて前回と同じ (`Object.is`) なら、関数を呼ばずに **前回と同じ値 (同じ参照)** を返します。

使いどころは 2 つです。

1. **参照を安定させる** … 依存配列に入れる値、ライブラリに渡す state やオプションなど
2. **重い計算を省く** … 数千件の並べ替えなど

`useCallback` は関数版です。

```tsx
const handleSelect = useCallback((id: string) => setSelected(id), []);
// 次と同じ意味: useMemo(() => (id: string) => setSelected(id), [])
```

どちらも「最適化」なので、何にでも付けるものではありません。React Compiler を導入したプロジェクトではコンパイラが自動でメモ化しますが、既存のコードベースでは手書きの `useMemo` / `useCallback` をよく見かけます。

## そのエフェクトは要らないかもしれない

```tsx
// × state から計算できる値を、エフェクトで別の state に写している
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);

// ○ レンダー中に計算するだけ
const fullName = `${first} ${last}`;
```

エフェクト版は、余計な再レンダーが 1 回増え、一瞬古い値が表示されます。

- props や state から **計算できる値** は、レンダー中に計算する (重ければ `useMemo`)
- **ユーザーの操作** がきっかけの処理は、イベントハンドラに書く
- データ取得は、実務では TanStack Query などのライブラリに任せる

目標コードにも `useEffect` は 1 つもありません。`rows: query.data?.items ?? []` のように、表示用の値はすべてレンダー中に計算しています。

## 自作フック (カスタムフック)

複数のコンポーネントで同じ「state + ロジック」を使いたいときは、**`use` で始まる関数** に切り出します。

```tsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return [on, toggle] as const;
}

function Menu() {
  const [open, toggleOpen] = useToggle();
  const [dark, toggleDark] = useToggle(true);
  // ...
}
```

- 中で `useState` などのフックを呼べるのは、コンポーネントと `use` で始まる関数だけです。
- 共有されるのは **ロジック** であって **state ではありません**。`useToggle()` を 2 回呼べば、独立した state が 2 つできます。
- **フックのルール:** フックは常にトップレベルで、毎回同じ順番で呼びます。`if` や `for` の中、早期 return の後では呼べません (呼ぶ回数が変わると `Rendered fewer hooks than expected` エラー)。
- 戻り値の形は自由です。`useState` のような配列 (`as const` で `readonly [boolean, () => void]` というタプル型に固定) か、目標コードのようなオブジェクトが定番です。

## まとめ: 目標コードを分解する

```ts
const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);
```

1. `useMemo<PaginationState>(...)` … ジェネリクス (Day 4) で「結果は `PaginationState` 型」と指定
2. `() => ({ pageIndex: page - 1, pageSize })` … オブジェクトを返すアロー関数 (Day 1)。URL の page (1 始まり) を、テーブルの pageIndex (0 始まり) に変換
3. `[page, pageSize]` … page か pageSize が変わったときだけ作り直す。検索語 `q` が変わっただけの再レンダーでは **前回と同じオブジェクト** が返る

こうして参照を安定させておくと、これを受け取る TanStack Table (Day 13) や、`pagination` を依存配列に入れるコードから見て「変わっていない」と正しく判定できます。そしてファイル全体は、URL の状態・データ取得・テーブル用の値を 1 つにまとめた **自作フック** です。画面側は `const { rows, tableState, onPaginationChange } = useSharedScopeQuery(...)` と 1 行呼ぶだけで済みます。
