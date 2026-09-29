import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui';

export const metadata: Metadata = { title: '使い方' };

const REPO = 'https://github.com/shimizuryos/javascript-study-20260929';

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">使い方</h1>

      <Card>
        <h2 className="font-bold">このアプリのゴール</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          実務の Next.js コード (nuqs・TanStack Query・TanStack Table を組み合わせた自作フックなど) を
          <strong className="text-ink">「読める」</strong>
          ようになることです。ホーム画面の「解読マップ」にあるコードが、14 日後に 1 行ずつ説明できる状態を目指します。
        </p>
      </Card>

      <Card>
        <h2 className="font-bold">1 日の進め方 (90〜120 分)</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            <strong>レッスンを読む</strong> —
            公式ドキュメントへのリンクも付いています。読み終えたら「読み終えた」を押します。
          </li>
          <li>
            <strong>確認クイズ</strong> — 選ぶとすぐ正誤と解説が出ます。間違えた問題は自動で「復習」に入り、1・3・7
            日後に出題されます。
          </li>
          <li>
            <strong>演習</strong> — ブラウザ上でコードを書いて「▶ 実行」(Ctrl / ⌘ +
            Enter)。自動テストで採点されます。「必須」をクリアすればその日は完了、「任意」は余裕がある日に。
          </li>
          <li>
            <strong>試験</strong> — Day 4・8・11・14 にあります。80% 以上で合格。何度でも受け直せます。
          </li>
        </ol>
      </Card>

      <Card>
        <h2 className="font-bold">演習のコツ</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            <strong>テストのタブを読む</strong>:
            テストは「何ができれば正解か」を書いた仕様書です。読むこと自体が読解の練習になります。
          </li>
          <li>
            <strong>失敗メッセージを読む</strong>: 「期待値」と「実際の値」の差が、次に直す場所を教えてくれます。
          </li>
          <li>
            <code>console.log(...)</code> の出力は結果欄に表示されます。React の警告 (key が無い、など) も表示されます。
          </li>
          <li>ヒントは段階的に開けます。解答を見ても進捗は付きますが、試験の問題だけは 0 点になります。</li>
          <li>書きかけのコードは自動保存されます。</li>
        </ul>
      </Card>

      <Card>
        <h2 className="font-bold">進捗の保存について</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          ログインは不要で、進捗はこのブラウザの localStorage に保存されます。端末を変えるときは
          <Link href="/settings/" className="mx-1 text-accent-strong underline">
            設定
          </Link>
          からファイルに書き出し、移動先で読み込んでください。
        </p>
      </Card>

      <Card>
        <h2 className="font-bold">このアプリ自体も教材です</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          このアプリは Next.js (App Router) で作られていて、ソースコードは
          <a href={REPO} target="_blank" rel="noopener noreferrer" className="mx-1 text-accent-strong underline">
            GitHub
          </a>
          にあります。慣れてきたら読んでみましょう。
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            <code>src/app/</code> — ページとルーティング (Day 9)。<code>days/[day]/page.tsx</code>{' '}
            は動的セグメントの実例
          </li>
          <li>
            <code>src/components/providers.tsx</code> — layout から使う Provider (Day 8・9)
          </li>
          <li>
            <code>src/components/exercises/exercises-table.tsx</code> — nuqs + TanStack Table (Day 11・13)。
            <Link href="/exercises/" className="text-accent-strong underline">
              演習一覧
            </Link>
            のページ
          </li>
          <li>
            <code>src/lib/progress/store.ts</code> — useSyncExternalStore で localStorage を扱う (Day 7・10)
          </li>
        </ul>
      </Card>
    </div>
  );
}
