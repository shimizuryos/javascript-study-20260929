---
title: "(発展) レンダー中に localStorage を読まないように直す"
optional: true
hints:
  - "方法 1 (useEffect): `const [theme, setTheme] = useState('light');` として、`useEffect(() => { setTheme(localStorage.getItem(THEME_KEY) ?? 'light'); }, []);` で hydration の後に読み込みます。"
  - "方法 2 (useSyncExternalStore): `useSyncExternalStore(subscribe, () => localStorage.getItem(THEME_KEY) ?? 'light', () => 'light')`。3 つ目の関数がサーバーと hydration 中に使われます。`subscribe` は `window` の `storage` イベントを購読する関数です (レッスン参照)。"
  - "表示部分 (`<p>テーマ: {theme}</p>`) は変えなくて大丈夫です。"
---

ユーザーが選んだテーマ (`light` / `dark`) を localStorage から読んで表示する `ThemeLabel` があります。ブラウザだけで描画するときは正しく動くのですが、**サーバーで HTML を作ってから hydration すると不一致が起きます**。

```tsx
const theme = typeof window === 'undefined' ? 'light' : (localStorage.getItem(THEME_KEY) ?? 'light');
```

- サーバー (`window` が無い) → `'light'` で HTML を作る
- ブラウザの最初の描画 (hydration) → 保存されていれば `'dark'` を描画する → **HTML と合わない**

**レンダー中に localStorage を読まない** ように直してください。方法はヒントの 2 通りのどちらでもかまいません。

### テストでやっていること

テストでは本物の Next.js の代わりに、次の手順で hydration を再現しています (`test.tsx` を読んでみてください)。

1. localStorage が空の状態で描画し、それを「サーバーが返した HTML」とする
2. localStorage に `dark` を保存する
3. その HTML に対して `hydrateRoot` (React が hydration を行う関数) を呼ぶ
4. hydration エラーが報告されないこと、hydration の後に `テーマ: dark` になることを確認する
