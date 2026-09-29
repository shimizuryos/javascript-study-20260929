# 教材の書き方 (CONTENT GUIDE)

教材はすべて `content/` 以下のファイルで、ビルド時に読み込まれて静的ページになる。
見本は **`content/days/day01/`** (レッスン・クイズ・演習 5 問)。迷ったら Day 1 に合わせる。

## ディレクトリ構成

```
content/
  target/                       … 目標コード (useSharedScopeQuery.ts) と解読マップ (map.json)
  days/
    day01/
      lesson.md                 … レッスン本文 (frontmatter 付き)
      quiz.md                   … 確認クイズ
      exercises/
        01-arrow-functions/     … 演習 1 問 = 1 ディレクトリ (番号順に並ぶ)
          README.md             … frontmatter + 問題文
          starter.ts            … 学習者に最初に表示するコード (テストに通らないこと)
          main.ts               … 模範解答 (テストに通ること)
          test.ts               … テスト (学習者にも読み取り専用で見える)
          api.ts など           … 補助ファイル (任意、読み取り専用で見える)
    day04/
      exam/                     … 試験がある日だけ
        exam.md                 … frontmatter (title, level, passScore) + 試験の説明
        quiz.md                 … 試験の選択問題
        exercises/…             … 試験の演習 (形式は通常の演習と同じ)
```

## lesson.md

```yaml
---
day: 2
level: 1            # 1: JS/TS, 2: React, 3: Next.js, 4: ライブラリ, 5: 総仕上げ
title: オブジェクトと配列の操作
summary: 1 文の要約 (一覧やカードに表示)
minutes: 90         # 目安時間 (レッスン + クイズ + 演習)
goals:              # 「〜を読める / 説明できる」の形で 3〜5 個
  - ...
readings:           # 公式ドキュメント (日本語版があれば日本語版)。3〜5 個
  - title: MDN — オプショナルチェーン
    url: https://developer.mozilla.org/ja/docs/...
---
```

- `:` や `{` `[` で始まる値、`: ` を含む値は `"..."` で囲む (YAML の仕様)。
- 本文は Markdown (GFM)。見出しは `##` から。コードブロックは言語名 (`ts` / `tsx` / `bash` / `json`) を付けるとハイライトされる。
- 冒頭に **「今日のゴール」** を置き、目標コード (`content/target/useSharedScopeQuery.ts`) のどの部分が読めるようになるかを示す。
- 最後に **「まとめ」** を置き、目標コードや実務コードの 1 行を分解して読んでみせる。
- 注意点は `> **落とし穴:** ...` の引用で書く。
- 分量の目安: 本文 2,500〜5,000 字。説明は短く、コード例を多く。「書ける」より「読める」を優先する。
- 文体: です・ます調。専門用語は初出で短く説明する。英語の API 名はそのまま。

## quiz.md

```markdown
## question-id

問題文 (Markdown。コードブロック可)

- [ ] 選択肢 (1 行。インラインコード可)
- [x] 正解の選択肢 (ちょうど 1 つ)
- [ ] 選択肢

> 解説 (必須。なぜその答えになるか。複数行可、各行 > で始める)
```

- ID (`## ` の後) は英小文字・数字・ハイフン。同じファイル内で重複しない。**後から変えない** (進捗の保存キーになる)。
- 1 日 7〜10 問。半分以上を **コード読解問題** (コード片を見せて「値は?」「型は?」「何回呼ばれる?」) にする。
- 選択肢は 3〜4 個。紛らわしい誤答 (よくある勘違い) を入れる。
- 試験の quiz.md も同じ形式 (8〜12 問)。

## 演習 (exercises/NN-slug/)

### README.md

```yaml
---
title: 分割代入で取り出す
optional: false        # true なら「任意 (発展)」。1 日の必須演習は 2〜4 問
typecheck: false       # true なら TypeScript の型チェックも採点に含める (後述)
preview: preview.tsx   # 任意。指定したファイルの default export を「プレビュー」欄に描画する
hints:                 # 段階的なヒント 2〜3 個 (Markdown)
  - "..."
---
問題文 (Markdown)。入出力の例を必ず書く。
```

### ファイル

- `starter.ts(x)` と `main.ts(x)` の拡張子は同じにする。JSX を使うなら `.tsx`。
- テストは `test.ts(x)` で、学習者のコードを `import { ... } from './main'` で読み込む。
- **starter はテストに通らないこと、main は通ること** を CI が全演習で検証する (`npm test`)。
- starter は「実行はできるがテストに落ちる」状態にする (構文エラーにしない)。`// TODO` で書く場所を示す。
- テスト名は日本語で「何を確認するか」を書く (学習者に表示される)。1 問 3〜6 テスト。
- main.ts / test.ts / 補助ファイルは `content/tsconfig.json` で型チェックされる (`npm run typecheck`)。starter は対象外。

### テストで使えるもの

グローバル (import 不要): `test` / `it` / `describe` / `beforeEach` / `afterEach` / `expect` / `vi.fn()`

`expect` のマッチャー: `toBe` `toEqual` `toStrictEqual` `toMatchObject` `toBeNull` `toBeUndefined` `toBeDefined` `toBeTruthy` `toBeFalsy` `toBeTypeOf` `toBeInstanceOf` `toBeGreaterThan(OrEqual)` `toBeLessThan(OrEqual)` `toContain` `toContainEqual` `toHaveLength` `toHaveProperty` `toMatch` `toThrow` `toHaveBeenCalled` `toHaveBeenCalledTimes` `toHaveBeenCalledWith` `toHaveBeenLastCalledWith` `toBeInTheDocument` `toHaveTextContent` `toHaveValue` `toBeDisabled` `toBeEnabled` `toBeChecked` `toHaveAttribute`、`.not` / `.resolves` / `.rejects`、`expect.any()` `expect.objectContaining()` など。

import できるモジュール (これ以外は import できない):

| モジュール | 用途 |
| --- | --- |
| `react`, `react-dom`, `react-dom/client` | React 19 (開発ビルド) |
| `@testing-library/react` | 本物。`render` `screen` `renderHook` `act` `waitFor` `within` `fireEvent` |
| `@testing-library/user-event` | 本物。`userEvent.setup()` / `await userEvent.click(...)` |
| `nuqs`, `nuqs/adapters/testing` | 本物。テストでは `NuqsTestingAdapter` で囲む |
| `@tanstack/react-query` | 本物 (v5)。テストごとに `new QueryClient({ defaultOptions: { queries: { retry: false } } })` |
| `@tanstack/react-table` | 本物 (v8) |
| `next/navigation`, `next/link` | **モック**。`useRouter` `useSearchParams` `usePathname` `Link` がメモリ上の URL で動く |
| `@study/next-mock` | テスト用。`mockRouter.setUrl('/users?page=2')`、`mockRouter.url`、`mockRouter.history` |
| `./main`, `./api` など | 同じ演習ディレクトリのファイル |

- 実行環境は Vitest + jsdom 相当 (ブラウザ上の iframe、CI では jsdom)。React は開発ビルドなので `act` が使え、key の警告なども学習者に表示される。
- 各テストの後に `cleanup()` (画面の片付け) と `mockRouter.reset()` が自動で走る。
- 非同期の表示は `await screen.findByText(...)` か `await waitFor(() => ...)` で待つ。
- 疑似 API は補助ファイル (`api.ts`) に書き、`await new Promise((r) => setTimeout(r, 10))` 程度の短い遅延にする (テストのタイムアウトは 5 秒)。
- Next.js の Server Component は「async 関数コンポーネント」として直接呼んでテストできる: `render(await Page({ params: Promise.resolve({ id: '1' }) }))`。
- ループには無限ループ防止の仕組みが入っている。

### 型チェック演習 (`typecheck: true`)

TypeScript の型そのものを答える演習。ブラウザ内で TypeScript コンパイラが動き、**型エラー 0 件** かつテスト (あれば) 合格で正解。

- `main.ts` / `test.ts` とも **外部モジュールを import しない** (標準ライブラリ ES2022 のみ)。
- テストでは type-challenges と同じヘルパーがグローバルに使える:

```ts
import type { Scope } from './main';
type cases = [
  Expect<Equal<Scope, 'all' | 'mine' | 'team'>>,
  Expect<NotEqual<Scope, string>>,
];
// @ts-expect-error — 型エラーになるべき行 (エラーにならないと「使われていない @ts-expect-error」でエラー)
const bad: Scope = 'other';
```

- 実行時のテスト (`test(...)`) も最低 1 つ書く (テストが 0 件だとエラーになるため)。
- starter は「型エラーが出る」または「テストに落ちる」状態にする。

### 演習の種類 (読む力を育てるためにバランスよく混ぜる)

1. **予想する (predict)** — コードの実行結果を予想して `export const answers = { q1: ..., }` に書く。テストは正解値がメッセージに出ないよう「一致したか」だけを見る (Day 1 `03-predict` 参照)。
2. **展開する (de-sugar)** — 省略記法 (分割代入、`?.`、`??` など) を使わない等価なコードに書き直す / 逆に省略記法で書き直す。
3. **型を答える (typecheck)** — `type X = ...` を書かせ、`Expect<Equal<...>>` で採点。
4. **バグを直す (fix)** — starter に実務でありがちなバグ (queryKey の入れ忘れ、0/1 始まりのずれ、state の直接変更など) を 1 か所入れておき、直させる。
5. **作る (build)** — 小さな関数・コンポーネント・フックを実装する。

## 試験 (exam/)

```yaml
---
title: Level 1 試験 — JavaScript / TypeScript
level: 1
passScore: 80
---
試験の説明 (範囲、目安時間、合格ライン、進め方)
```

- 採点: クイズ 1 問 = 1 点、演習 1 問 = 3 点。解答を表示した演習は 0 点。合格ライン 80%。
- 範囲はそのレベルの全日。新しい知識は出さない。

## 検証コマンド

```bash
npm test                              # 全演習の検証 (模範解答が通る・初期コードが通らない)
npx vitest run tests/content.test.ts -t "day 2"   # 特定の日だけ
npm run typecheck                     # アプリ + 教材 (main/test/補助ファイル) の型チェック
```
