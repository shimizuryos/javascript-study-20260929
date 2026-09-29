---
title: async な Server Component でページを作る
hints:
  - "関数を `export default async function UserPage({ params }: Props)` にして、`const { id } = await params;` で id を取り出します。"
  - "`const user = await getUser(id);` の結果が `null` なら `notFound()` を呼びます。`notFound()` は例外を投げて処理を止めるので、その後ろでは `user` は `null` ではないと TypeScript も理解します。"
  - "`LikeButton` は `'use client'` のコンポーネントです。Server Component からは **数値などの値** を props で渡せます: `<LikeButton initialLikes={user.likes} />`"
---

`app/users/[id]/page.tsx` に相当する **Server Component のページ** を作ります。

| この演習のファイル | 実際のアプリでの場所 |
| --- | --- |
| `main.tsx` (あなたが書く) | `app/users/[id]/page.tsx` (Server Component) |
| `api.ts` | `lib/users.ts` など (サーバー側のデータ取得。本物なら DB) |
| `like-button.tsx` | `app/users/[id]/like-button.tsx` (`'use client'`) |

### 仕様

1. `params` は `Promise<{ id: string }>` です。**`await` してから** `id` を取り出す
2. `getUser(id)` (`api.ts`) でユーザーを取得する (これも `await`)
3. ユーザーが見つからなければ (`null`) `notFound()` (`next/navigation`) を呼ぶ
4. 次の形で表示する

```tsx
<article>
  <h1>{名前}</h1>
  <p>{自己紹介 (bio)}</p>
  <LikeButton initialLikes={いいね数} />
  <Link href="/users">一覧へ戻る</Link>
</article>
```

テストでは、Next.js がやっていることと同じように **ページ関数を直接呼び、返ってきた JSX を描画** します。

```tsx
render(await UserPage({ params: Promise.resolve({ id: '1' }) }));
```

`LikeButton` の中身 (`like-button.tsx`) も読んでみてください。Server Component のページの中に、クリックに反応する部分だけが Client Component として埋め込まれています。
