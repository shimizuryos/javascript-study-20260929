---
title: layout のナビゲーションに「今いるページ」を表示する
hints:
  - "`usePathname()` (`next/navigation`) は今の URL のパス部分 (`'/dashboard/users'` など。`?` 以降は含まない) を返します。"
  - "`const active = pathname === href;` を作り、`<Link href={href} aria-current={active ? 'page' : undefined}>` のように書きます。`undefined` を渡した属性は出力されません。"
  - "`usePathname` はフックなので、このファイルの先頭には `'use client'` が必要です (starter には書いてあります)。"
---

実務の管理画面でよく見る **「layout にナビゲーションを置き、今いるページのリンクを強調する」** 部品を作ります。

ファイルの対応はこうなっています。

| この演習のファイル | 実際のアプリでの場所 | 種類 |
| --- | --- | --- |
| `layout.tsx` (読み取り専用) | `app/dashboard/layout.tsx` | Server Component |
| `main.tsx` (あなたが書く) | `app/dashboard/nav-link.tsx` | Client Component (`'use client'`) |

まず `layout.tsx` を読んで、`children` がどこに入るか、`NavLink` がどう使われているかを確認してください。layout 自体は Server Component のままで、**今のパスを知る必要がある `NavLink` だけ** を Client Component に切り出しています。

### 作るもの: `NavLink({ href, children })`

- `next/link` の `Link` で `href` へのリンクを表示する (普通の `<a>` だとページ全体が読み込み直されてしまう)
- `usePathname()` で今のパスを取り、`href` と **完全に一致する** ときだけ `aria-current="page"` を付ける

```tsx
// URL が /dashboard/users?page=2 のとき
<NavLink href="/dashboard/users">ユーザー</NavLink>
// → <a href="/dashboard/users" aria-current="page">ユーザー</a>

<NavLink href="/dashboard/settings">設定</NavLink>
// → <a href="/dashboard/settings">設定</a>
```

`aria-current="page"` は「今のページへのリンク」を支援技術に伝える属性で、CSS (`[aria-current='page'] { font-weight: bold }`) で見た目を変えるのにもよく使われます。
