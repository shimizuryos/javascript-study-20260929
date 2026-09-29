# カリキュラム (14 日間)

目的: 本番の Next.js コードベース (nuqs + TanStack Query + TanStack Table を組み合わせた自作フック `useSharedScopeQuery` など) を **読める** ようになること。
1 日 90〜120 分を想定。各日は「レッスン → 確認クイズ → 演習」の順で進め、レベルの区切りで試験 (合格ライン 80%) がある。

目標コード (代表例): [`content/target/useSharedScopeQuery.ts`](../content/target/useSharedScopeQuery.ts)。
ホーム画面の「解読マップ」で、各行を何日目に学ぶかが見える。

| Day | Level | テーマ | 主な内容 | 試験 |
| --- | --- | --- | --- | --- |
| 1 | 1 JS/TS | 変数・アロー関数・分割代入 | const/let、アロー関数 (省略形、`() => ({})`)、テンプレートリテラル、配列/オブジェクトの分割代入 (リネーム・デフォルト値)、スプレッド/残余 | |
| 2 | 1 JS/TS | オブジェクトと配列の操作 | 省略記法、計算されたキー `{ [KEY]: v }`、map/filter/find/some/every、Object.keys/entries/fromEntries、`?.`、`??` と `\|\|` の違い (reduce はクイズのみ) | |
| 3 | 1 JS/TS | TypeScript ① 型を読む | 型注釈と推論、ユニオン `A \| null`、絞り込み (narrowing)、リテラル型、type と interface (軽く)、`as const`、`typeof` / `keyof typeof` / `(typeof X)[number]` | |
| 4 | 1 JS/TS | TypeScript ② ・モジュール・非同期 | ジェネリクスの読み方、ユーティリティ型 (Record/Partial/Pick/Omit/ReturnType/Awaited)、インデックスアクセス型 `T['k']`、`satisfies`、import/export・`import type`・`@/` エイリアス、Promise と async/await | Level 1 試験 |
| 5 | 2 React | コンポーネントと JSX | JSX、コンポーネント、props、children、リストと key、条件付きレンダー | |
| 6 | 2 React | state | useState、イベント、イミュータブルな更新、関数型更新 `setX(prev => ...)`、state のリフトアップ、制御されたフォーム | |
| 7 | 2 React | エフェクトと自作フック | useEffect (外部との同期・クリーンアップ・依存配列)、参照の同一性 (`Object.is`)、useMemo / useCallback、自作フック | |
| 8 | 2 React | Context と Provider | useContext、Provider パターン (QueryClientProvider / NuqsAdapter の前提) | Level 2 試験 |
| 9 | 3 Next.js | App Router の基本 | ファイルベースルーティング、layout、動的セグメント `[id]` / `[...slug]`、Link、Server / Client Components、`'use client'` の境界、Provider を置く場所 | |
| 10 | 3 Next.js | URL とレンダリング | `params` / `searchParams` (Promise)、useSearchParams / useRouter / usePathname、Suspense 境界、hydration とその不一致 | |
| 11 | 4 ライブラリ | nuqs | (冒頭で Level 3 試験) useQueryState、パーサー、withDefault、useQueryStates、オプション (history / shallow)、`inferParserType` | Level 3 試験 |
| 12 | 4 ライブラリ | TanStack Query | QueryClient / Provider、useQuery、queryKey 設計、`{ signal }`、enabled、isPending / isFetching、staleTime、placeholderData、select、queryOptions、(useMutation はクイズのみ)、nuqs → queryKey の結合 | |
| 13 | 4 ライブラリ | TanStack Table (v8) | 列定義、useReactTable、getCoreRowModel、flexRender、`row.original`、ページネーション、manualPagination + 外部 state + `onPaginationChange` (Updater)、未知のフックの読み方 | |
| 14 | 5 総仕上げ | useSharedScopeQuery を読む・作る | 目標コードの逐行読解、実装、最終試験 | 最終試験 |

## バージョンについて

- Next.js 16 / React 19 / nuqs 2 / TanStack Query v5 / TanStack Table v8 を前提にしている。
- TanStack Table は 2026 年 8 月に v9 が出たが、API (`useTable`) が大きく変わっており、既存のコードベースはほぼ v8 (`useReactTable`) のはずなので v8 を教える。Day 13 で v9 との違いにも触れる。
- Next.js 15 以降、`params` / `searchParams` は Promise。社内コードが 14 以前ならこの部分の書き方が違う。

## 定着の仕組み

- **解読マップ**: 目標コードの各行が、学んだ日の完了とともに色づく。
- **復習キュー**: クイズで間違えた問題を 1 日後・3 日後・7 日後に再出題 (ライトナー方式)。
- **ストリーク**: 連続学習日数。週に 1 回まで休んでも途切れない (フリーズ)。
- **必須 / 任意**: 各日の演習のうち「任意」は飛ばしてよい。忙しい日の最低ラインを明示。
- **進捗のエクスポート / インポート**: 進捗はブラウザ (localStorage) に保存されるため、端末を変えるときは JSON で持ち運ぶ。
