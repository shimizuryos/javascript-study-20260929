---
title: Provider の置き場所を直す
hints:
  - "まず「実行」して、エラーメッセージを読みましょう。どのコンポーネントが、どの Provider の外にいるでしょうか?"
  - "Provider は **自分の子孫にだけ** 値を届けます。`Header` は今 `<Providers>` の兄弟です。"
  - "`<Providers>` を一番外側に移して、`Header` も `main` も全部その中に入れます。`<Providers>` を 2 つ置くと、QueryClient (キャッシュ) も 2 つになってしまいます。"
---

画面の上にヘッダー、下にユーザー一覧がある画面です。ヘッダーを追加したところ、画面を開くと次のエラーで何も表示されなくなりました。

```
Error: No QueryClient set, use QueryClientProvider to set one
```

読み取り専用のファイルを確認してから、`main.tsx` の `App` を直してください。

| ファイル | 中身 |
| --- | --- |
| `providers.tsx` | アプリ全体の Provider をまとめた `Providers` (QueryClientProvider + テーマの Context)。Next.js なら `app/providers.tsx` にあたる |
| `components.tsx` | `Header` と `UserList`。どちらも `useQuery` と `useTheme` を使う |
| `api.ts` | 疑似 API。呼ばれた回数を `apiCalls` に記録する |

直した後の条件:

- エラーにならず、ヘッダーに「ログイン中: Alice」、一覧に 3 人が表示される
- ヘッダーにもテーマ (`theme-dark`) が届く
- `Header` と `UserList` は同じ queryKey `['me']` を使っているので、**同じ QueryClient を共有していれば** API (`fetchMe`) は 1 回しか呼ばれない

Next.js の `app/layout.tsx` で `<Providers>{children}</Providers>` とアプリ全体を包むのは、このためです (Day 9)。
