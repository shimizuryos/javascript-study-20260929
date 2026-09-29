---
title: state を親に持ち上げる
hints:
  - "`FilterableFruitList` に `const [query, setQuery] = useState('');` を移します。"
  - "`SearchBox` は state を持たず、`{ value, onChange }` を props で受け取ります。`onChange` には **イベントではなく文字列** を渡す約束です: `onChange={(e) => onChange(e.target.value)}`"
  - "親では `<SearchBox value={query} onChange={setQuery} />` と `<FruitList query={query} />` のように配ります。"
---

検索欄 (`SearchBox`) と一覧 (`FruitList`) が兄弟になっている画面です。今は検索欄が自分の中に state を持っているため、入力しても一覧が絞り込まれません。

```tsx
<FilterableFruitList />
// 検索欄に「りんご」と入力 → 「2 件」と表示され、りんご / りんごジュース だけが並ぶ
```

検索語の state を **共通の親 (`FilterableFruitList`) に持ち上げて** ください。

- `SearchBox({ value, onChange })` … state を持たない入力部品にする
  - `value: string` … 入力欄に表示する値
  - `onChange: (value: string) => void` … 入力されたら **新しい文字列** を渡して呼ぶ
- `FruitList({ query })` … そのままで OK (query で絞り込んで件数と一覧を表示する)
- `FilterableFruitList` … state を持ち、2 つの子に配る

「今の値」と「変わったら呼ぶ関数」を受け取る部品の形は、実務の入力コンポーネントやテーブルのライブラリでも同じです。
