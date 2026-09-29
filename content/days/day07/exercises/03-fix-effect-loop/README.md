---
title: リクエストが止まらないバグを直す
hints:
  - "`options` はレンダーのたびに作られる **新しいオブジェクト** です。`Object.is(前回の options, 今回の options)` は常に false になります。"
  - "結果が届く → setItems → 再レンダー → 新しい options → エフェクト再実行 → また search … というループになっています。"
  - "`const options = useMemo(() => ({ q, limit: 10 }), [q]);` にするか、エフェクトの中で `search({ q, limit: 10 })` と作って依存配列を `[q, search]` にします。"
---

検索結果を表示するコンポーネントです。本番で「**画面を開いているだけで検索 API が呼ばれ続けている**」という障害が起きました。

```tsx
<SearchResults q="react" search={search} />
// 期待: search({ q: 'react', limit: 10 }) が 1 回だけ呼ばれ、結果が表示される
// 実際: 結果が表示されたあとも、search が何度も呼ばれ続ける
```

原因を見つけて直してください。`q` が変わったときは、新しい `q` で検索し直す必要があります。

テストでは、`search` が呼ばれた回数と、React の `<Profiler>` で数えた **再レンダーの回数** を確認しています (`<Profiler onRender={...}>` は中のコンポーネントが画面に反映されるたびに `onRender` を呼ぶ、React 組み込みの計測用コンポーネントです)。
