---
title: 表示範囲を共有する Provider
hints:
  - "`ScopeProvider` の中で `useState<Scope>(initialScope)` を持ち、`{ scope, setScope }` を `ScopeContext` で提供します (`useMemo` で包むとなお良い)。"
  - "`useScope` は `useContext(ScopeContext)` で読み、`null` なら `throw new Error('useScope は <ScopeProvider> の中で使ってください');` とします。"
---

表示範囲 (`'all' | 'mine' | 'team'`) を、離れたコンポーネント同士で共有できるようにします。`ScopeSwitcher` (切り替えボタン) と `ScopeLabel` (今の範囲の表示) は、すでに `useScope` を使って書かれています。

```tsx
<ScopeProvider initialScope="mine">
  <Toolbar>
    <ScopeSwitcher />
  </Toolbar>
  <Sidebar>
    <ScopeLabel /> {/* 表示中: 自分 → ボタンを押すと切り替わる */}
  </Sidebar>
</ScopeProvider>
```

1. `ScopeProvider({ initialScope, children })` … scope の state を持ち、`{ scope, setScope }` を `ScopeContext` で提供する。`initialScope` は省略可能で、省略時は `'all'`
2. `useScope()` … `{ scope, setScope }` を返す。Provider の外で呼ばれたら、`'ScopeProvider'` を含むメッセージのエラーを投げる

別々の `ScopeProvider` は、それぞれ独立した scope を持ちます。
