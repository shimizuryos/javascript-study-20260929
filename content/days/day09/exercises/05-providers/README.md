---
title: "(発展) app/providers.tsx を組み立てる"
optional: true
hints:
  - "`const [queryClient] = useState(() => new QueryClient());` と書くと、QueryClient は最初のレンダーで 1 回だけ作られ、以後は同じものが返ります。"
  - "Provider は入れ子にできます: `<QueryClientProvider client={queryClient}><NuqsAdapter>{children}</NuqsAdapter></QueryClientProvider>`"
---

Day 11 (nuqs) と Day 12 (TanStack Query) のフックは、上に Provider が無いと動きません。実際のアプリで `app/layout.tsx` から使う **`app/providers.tsx`** を完成させましょう。

```tsx
// app/layout.tsx (Server Component) … この演習では書かなくてよい
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

### 直すところ (starter には 2 つ問題があります)

1. `QueryClient` がレンダーのたびに作り直されている → キャッシュが消えてしまう。**最初の 1 回だけ** 作るようにする
2. `NuqsAdapter` で囲んでいない → nuqs のフック (`useQueryState` など) が使えない。`QueryClientProvider` の内側で `children` を囲む

> 本物のアプリでは `import { NuqsAdapter } from 'nuqs/adapters/next/app';` と書きます。この実行環境では Next.js 本体が動かないので、同じ役割のテスト用アダプターを `./nuqs-adapter` から同じ名前で import しています。

テストでは、`Providers` の中に置いたコンポーネントが `useQueryClient()` (TanStack Query) と `useQueryState()` (nuqs) を使えるか、再レンダーしても同じ QueryClient が使われ続けるかを確認します。
