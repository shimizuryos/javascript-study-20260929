# 読めるNext.js — 14日間トレーニング

実務の Next.js コード (nuqs + TanStack Query + TanStack Table を組み合わせた自作フック `useSharedScopeQuery` など) を
**「読める」** ようになるための、2 週間の学習 Web アプリです。

- **教材**: JS/TS の文法 → React → Next.js (App Router) → nuqs / TanStack Query / TanStack Table → 総仕上げ (14 日・各 90〜120 分)
- **演習**: ブラウザ上でコードを書いて実行すると、自動テストで採点 (本物の React / Testing Library / nuqs / TanStack が動く)。型の演習は TypeScript コンパイラで採点
- **試験**: Day 4・8・11・14。80% 以上で合格
- **進捗の可視化**: 全体・レベル別の達成率、14 日プラン、学習ヒートマップ、連続学習日数、目標コードの「解読マップ」
- **定着**: 間違えたクイズを 1・3・7 日後に再出題する復習キュー
- **サーバー不要**: 静的サイトとして GitHub Pages で配信。進捗はブラウザの localStorage に保存 (JSON でエクスポート/インポート可)

カリキュラムの詳細は [docs/CURRICULUM.md](docs/CURRICULUM.md)。

## 公開 (GitHub Pages)

`.github/workflows/ci.yml` が、すべての push / PR で lint・型チェック・全演習の検証・ビルドを行い、
**デフォルトブランチ (main) への push** のときに GitHub Pages へデプロイします。

初回だけ次の設定が必要です。

1. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にする
2. main に push する (または Actions タブから `CI / Deploy` を手動実行)
3. `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される

> **注意:** GitHub Pages は、無料プランでは **public リポジトリ** でのみ使えます。private のまま公開したい場合は GitHub Pro 等 (学生なら GitHub Student Developer Pack に含まれる) が必要です。
> どちらも使えない場合は、`out/` を Cloudflare Pages / Netlify / Vercel など静的ホスティングにデプロイしても動きます (`PAGES_BASE_PATH` は空にする)。

## ローカルで動かす

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # 静的サイトを out/ に出力
npm run verify     # lint + 型チェック + テスト (CI と同じ)
```

Node.js 22 以上。

## しくみ

```
content/                 教材 (Markdown + 演習ごとの starter / main / test ファイル)
src/app/                 Next.js App Router のページ (output: 'export' で静的 HTML に)
src/lib/content.ts       ビルド時に content/ を読み込み、Markdown を HTML に (shiki でハイライト)
src/lib/progress/        進捗ストア (localStorage + useSyncExternalStore)
src/runner/              ブラウザ内テストランナー
  transform.ts           TS/TSX → JS (sucrase) + 無限ループ防止
  run.ts                 テスト実行 (test / expect / モジュール解決)
  expect.ts              日本語メッセージ付きの expect
  next-mock.ts           next/navigation・next/link のモック
src/sandbox/main.ts      サンドボックス iframe 内のエントリ (esbuild で React 開発ビルドと一緒にバンドル)
public/sandbox/          サンドボックス iframe の HTML
public/runner/           型チェック用 Web Worker (TypeScript 6 をブラウザで実行)
tests/                   Vitest: ランナーの単体テスト + 全演習の検証
```

- 演習コードは iframe (サンドボックス) の中で実行し、実行のたびに iframe を作り直す。
- iframe 内の React は **開発ビルド** (`act()` が使え、key の警告なども表示できる)。CI (Vitest + jsdom) でも同じ `runTests()` を使うので、「CI で模範解答が通る = ブラウザでも通る」。
- 型チェック演習は `typescript@6` (JS 版の最終メジャー) を Web Worker で動かす (TypeScript 7 はネイティブ実装でブラウザでは動かないため)。

## 教材を追加・修正する

[docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) を参照。演習を追加したら `npm test` で「模範解答が通り、初期コードが通らない」ことを確認する。
