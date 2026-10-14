# 読めるNext.js — 14日間トレーニング

実務の Next.js コード (nuqs + TanStack Query + TanStack Table を組み合わせた自作フック `useSharedScopeQuery` など) を
**「読める」** ようになるための、2 週間の学習 Web アプリです。

- **教材**: JS/TS の文法 → React → Next.js (App Router) → nuqs / TanStack Query / TanStack Table → 総仕上げ (14 日・各 90〜120 分)
- **演習**: ブラウザ上でコードを書いて実行すると、自動テストで採点 (本物の React / Testing Library / nuqs / TanStack が動く)。型の演習は TypeScript コンパイラで採点
- **試験**: Day 4・8・11・14。80% 以上で合格
- **進捗の可視化**: 全体・レベル別の達成率、14 日プラン、学習ヒートマップ、連続学習日数、目標コードの「解読マップ」
- **定着**: 間違えたクイズを 1・3・7 日後に再出題する復習キュー
- **ログインと同期**: GitHub でログインすると進捗がサーバー (Cloudflare D1) に保存され、別の端末と自動で同期。ログインしなくてもブラウザ内 (localStorage) だけで使える
- **配信**: Cloudflare Workers (静的ファイル + `/api` の Worker)。無料枠で動く

カリキュラムの詳細は [docs/CURRICULUM.md](docs/CURRICULUM.md)。

## 公開 (Cloudflare Workers)

`.github/workflows/ci.yml` が、すべての push / PR で lint・型チェック・全演習と API の検証・ビルド・E2E を行い、
**main への push** のときに Cloudflare Workers へデプロイします (D1 のテーブル作成・更新も自動)。

公開 URL: `https://javascript-study.<workers.dev のサブドメイン>.workers.dev`

### 初回の設定

1. Cloudflare に登録し、Workers & Pages で `workers.dev` のサブドメインを決める
2. D1 データベース `js-study` を作り、Database ID を `wrangler.jsonc` の `database_id` に書く
3. API トークンを作る (テンプレート「Edit Cloudflare Workers」+ 権限「Account → D1 → Edit」)
4. GitHub の OAuth App を作る
   - Homepage URL: `https://javascript-study.<サブドメイン>.workers.dev`
   - Authorization callback URL: `https://javascript-study.<サブドメイン>.workers.dev/api/auth/callback`
5. GitHub リポジトリの Settings → Secrets and variables → Actions に登録する

   | Secret | 中身 |
   | --- | --- |
   | `CLOUDFLARE_API_TOKEN` | 3 の API トークン |
   | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare の Account ID |
   | `OAUTH_GITHUB_CLIENT_ID` | 4 の Client ID |
   | `OAUTH_GITHUB_CLIENT_SECRET` | 4 の Client secret |

6. main に push する (または Actions タブから `CI / Deploy` を main で手動実行)

ログインできる GitHub アカウントは `wrangler.jsonc` の `ALLOWED_GITHUB_LOGINS` (カンマ区切り) で決める。空にすると誰でもログインできる。

## ローカルで動かす

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # 静的サイトを out/ に出力
npm run verify     # lint + 型チェック + テスト (CI と同じ)

# Cloudflare Workers の環境 (静的ファイル + /api + ローカルの D1) で動かす
npm run build && npm run dev:cloudflare      # http://localhost:8787
# → http://localhost:8787/api/auth/dev-login で、GitHub を使わずに開発用ユーザーでログインできる
npm run e2e:cloudflare                       # ログインと同期の E2E
```

Node.js 22 以上。

## しくみ

```
content/                 教材 (Markdown + 演習ごとの starter / main / test ファイル)
src/app/                 Next.js App Router のページ (output: 'export' で静的 HTML に)
src/lib/content.ts       ビルド時に content/ を読み込み、Markdown を HTML に (shiki でハイライト)
src/lib/progress/        進捗ストア (localStorage + useSyncExternalStore) と、端末間の統合 (merge.ts)
src/lib/sync/            サーバーとの同期 (ログイン確認 → 取得 → 統合 → 保存、競合時は取り直し)
worker/                  Cloudflare Worker: GitHub OAuth ログイン、セッション、進捗 API (D1)
worker/migrations/       D1 のテーブル定義
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
