---
title: "'use client' が必要なファイルはどれ?"
hints:
  - "`useState` などのフック、`onClick` などのイベント、Context の Provider を **そのファイルの中で** 使っていて、かつ Server Component から直接 import される (= 境界の入口になる) なら `'use client'` が必要です。"
  - "`'use client'` のファイルから import されるだけのファイルは、書かなくてもクライアント側に入ります。"
  - "`error.tsx` は Next.js のルールで必ず Client Component です。`async` でデータを取る page や、`Link` を並べるだけの page は Server Component のままでかまいません。"
---

次の 8 つのファイルについて、**そのファイルの先頭に `'use client'` を書く必要があるか** を予想し、`main.ts` の `answers` に `true` (必要) / `false` (不要) で書き込んでください。

「不要」には「Server Component のままでよい」と「別の `'use client'` ファイルから import されるので書かなくてもクライアント側に入る」の 2 通りがあります。

### Q1 `app/posts/page.tsx`

```tsx
import Link from 'next/link';
import { getPosts } from '@/lib/db';

export default async function PostsPage() {
  const posts = await getPosts();
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          <Link href={`/posts/${p.id}`}>{p.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

### Q2 `app/ui/like-button.tsx` (Server Component の page から import される)

```tsx
import { useState } from 'react';

export function LikeButton({ initial }: { initial: number }) {
  const [likes, setLikes] = useState(initial);
  return <button onClick={() => setLikes(likes + 1)}>♥ {likes}</button>;
}
```

### Q3 `app/ui/price.tsx` (いろいろな場所から import される)

```tsx
export function Price({ value }: { value: number }) {
  return <span>{value.toLocaleString()} 円</span>;
}
```

### Q4 `app/users/row-actions.tsx` (`'use client'` が書かれた `users-table.tsx` からだけ import される)

```tsx
export function RowActions({ onDelete }: { onDelete: () => void }) {
  return <button onClick={onDelete}>削除</button>;
}
```

### Q5 `app/dashboard/error.tsx`

```tsx
export default function Error({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div>
      <p>エラー: {error.message}</p>
      <button onClick={() => retry()}>もう一度</button>
    </div>
  );
}
```

### Q6 `app/layout.tsx`

```tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Q7 `app/providers.tsx`

```tsx
import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### Q8 `app/products/search-box.tsx` (Server Component の `app/products/page.tsx` から import される)

```tsx
import { useRouter } from 'next/navigation';

export function SearchBox() {
  const router = useRouter();
  return (
    <input
      onKeyDown={(e) => {
        if (e.key === 'Enter') router.push(`/products?q=${e.currentTarget.value}`);
      }}
    />
  );
}
```

テストは正解かどうかだけを表示します。間違えた問題は、レッスンの「`'use client'` の境界ルール」を読み直してみましょう。
