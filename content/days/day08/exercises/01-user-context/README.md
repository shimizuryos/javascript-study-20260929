---
title: Provider と専用フックを作る
hints:
  - "Provider は `return <UserContext value={user}>{children}</UserContext>;` です (`<UserContext.Provider value={user}>` でも同じ)。"
  - "`useUser` では `const user = useContext(UserContext);` で読み、`null` なら `throw new Error('useUser は <UserProvider> の中で使ってください');` とします。"
  - "`if` で null を除いた後の `user` は `User` 型になるので、そのまま return できます。"
---

ログイン中のユーザーを、アプリのどこからでも読めるようにします。

```tsx
<UserProvider user={{ name: 'Alice', role: 'admin' }}>
  <Header />  {/* この中の深いところで useUser() が使える */}
</UserProvider>
```

1. `UserProvider({ user, children })` … `UserContext` で `children` を包み、`user` を提供する
2. `useUser()` … 一番近い `UserProvider` の `user` を返す。**Provider の外で呼ばれたら**、`'UserProvider'` という文字を含むメッセージのエラーを投げる

`UserContext` は export しません。使う側は `UserProvider` と `useUser` だけを知っていればよい、という実務でよく見る形です。`Greeting` と `AdminBadge` はすでに `useUser` を使って書かれています。

```tsx
function Greeting() {
  const { name } = useUser();
  return <p>こんにちは、{name}さん</p>;
}
```
