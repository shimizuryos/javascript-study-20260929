'use client';

import type { RunError, RunResult, TypeDiagnostic } from '@/runner/types';
import { CheckIcon } from '@/components/ui';

export type TypecheckState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; diagnostics: TypeDiagnostic[] }
  | { status: 'error'; message: string };

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-4">
      <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}

const WARNING_HINTS: [RegExp, string][] = [
  [/unique "key" prop/, 'リストの各要素に key が必要です (Day 5)。'],
  [
    /uncontrolled input to be controlled|controlled input to be uncontrolled/,
    'input の value が undefined と値の間で切り替わっています (Day 6)。',
  ],
  [
    /Cannot update a component .* while rendering a different component/,
    'レンダー中に別のコンポーネントの state を更新しています (Day 6・7)。',
  ],
  [
    /cannot be a descendant of|cannot contain a nested|validateDOMNesting|In HTML, <\w+> cannot/,
    'HTML の入れ子のルールに反しています (例: <p> の中に <div>)。hydration エラーの原因になります (Day 10)。',
  ],
  [/not wrapped in act/, 'テストの外で state が更新されました。多くの場合 findBy / waitFor で待てば解消します。'],
  [
    /Maximum update depth exceeded/,
    '再レンダーが止まりません。useEffect の依存配列や、レンダー中の setState を確認しましょう (Day 7)。',
  ],
  [/Invalid DOM property|non-boolean attribute/, 'JSX の属性名が HTML と違います (例: class ではなく className)。'],
  [
    /Functions are not valid as a React child/,
    '関数をそのまま JSX に書いています。呼び出し忘れ (fn()) か、<Component /> の書き忘れかもしれません。',
  ],
];

const PHASE_LABEL: Record<RunError['phase'], string> = {
  compile: '構文エラー',
  load: 'コードの読み込み中にエラー',
  sandbox: '実行環境のエラー',
};

export function ResultPanel({
  result,
  typecheck,
  typecheckEnabled,
  previewError,
}: {
  result: RunResult | null;
  typecheck: TypecheckState;
  typecheckEnabled: boolean;
  previewError: RunError | null;
}) {
  if (!result) {
    return (
      <p className="rounded-lg border border-dashed border-line p-4 text-sm text-ink-3">
        「▶ 実行」(Ctrl / ⌘ + Enter) でテストを実行すると、ここに結果が表示されます。
      </p>
    );
  }
  const passedCount = result.tests.filter((t) => t.status === 'passed').length;
  const typeOk = !typecheckEnabled || (typecheck.status === 'done' && typecheck.diagnostics.length === 0);
  const allPassed = result.status === 'passed' && typeOk;
  const warnings = result.logs.filter((l) => l.level === 'error' || l.level === 'warn');
  const logs = result.logs.filter((l) => l.level === 'log' || l.level === 'info');

  return (
    <div className="space-y-3" aria-live="polite">
      <div
        className={`flex items-center gap-2 rounded-lg p-3 text-sm font-semibold ${
          allPassed
            ? 'bg-good-soft text-good'
            : result.status === 'error'
              ? 'bg-warn-soft text-warn'
              : 'bg-bad-soft text-bad'
        }`}
      >
        {allPassed ? <CheckIcon /> : <XIcon />}
        {result.status === 'error'
          ? PHASE_LABEL[result.error!.phase]
          : allPassed
            ? `すべてのテストに合格しました (${passedCount}/${result.tests.length})`
            : result.status === 'passed'
              ? `テストは合格 (${passedCount}/${result.tests.length})・型エラーを直しましょう`
              : `${result.tests.length - passedCount} 件のテストが失敗 (${passedCount}/${result.tests.length} 合格)`}
      </div>

      {result.error && (
        <pre className="overflow-x-auto rounded-lg border border-line bg-code p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
          {result.error.message}
        </pre>
      )}

      {typecheckEnabled && (
        <div className="rounded-lg border border-line p-3 text-sm">
          <p className="font-semibold">
            型チェック:{' '}
            {typecheck.status === 'loading' ? (
              <span className="font-normal text-ink-3">TypeScript を読み込み中… (初回のみ数秒かかります)</span>
            ) : typecheck.status === 'error' ? (
              <span className="text-warn">実行できませんでした ({typecheck.message})</span>
            ) : typecheck.status === 'done' && typecheck.diagnostics.length === 0 ? (
              <span className="text-good">エラーなし</span>
            ) : typecheck.status === 'done' ? (
              <span className="text-bad">{typecheck.diagnostics.length} 件のエラー</span>
            ) : null}
          </p>
          {typecheck.status === 'done' && typecheck.diagnostics.length > 0 && (
            <ul className="mt-2 space-y-2">
              {typecheck.diagnostics.map((d, i) => (
                <li key={i} className="rounded-md bg-bad-soft p-2 font-mono text-xs whitespace-pre-wrap">
                  {d.file && (
                    <span className="font-semibold">
                      {d.file} {d.line}行目:{' '}
                    </span>
                  )}
                  {d.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {result.tests.length > 0 && (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {result.tests.map((t, i) => (
            <li key={i} className="p-3 text-sm">
              <p className={`flex items-start gap-2 ${t.status === 'passed' ? 'text-good' : 'text-bad'}`}>
                <span className="mt-0.5 shrink-0">{t.status === 'passed' ? <CheckIcon /> : <XIcon />}</span>
                <span className="text-ink">{t.name}</span>
              </p>
              {t.error && (
                <pre className="mt-2 ml-6 overflow-x-auto rounded-md bg-code p-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink">
                  {t.error}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}

      {previewError && (
        <pre className="overflow-x-auto rounded-lg border border-line bg-warn-soft p-3 font-mono text-xs whitespace-pre-wrap">
          プレビューを表示できませんでした: {previewError.message}
        </pre>
      )}

      {logs.length > 0 && (
        <details className="rounded-lg border border-line p-3 text-sm" open>
          <summary className="cursor-pointer font-semibold">console.log の出力 ({logs.length})</summary>
          <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {logs.map((l) => l.text).join('\n')}
          </pre>
        </details>
      )}
      {warnings.length > 0 && (
        <details className="rounded-lg border border-line p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-warn">
            React などからの警告 ({warnings.length})
            <span className="ml-2 text-xs font-normal text-ink-3">合格判定には影響しません</span>
          </summary>
          <ul className="mt-2 space-y-3">
            {warnings.map((l, i) => {
              const hint = WARNING_HINTS.find(([re]) => re.test(l.text))?.[1];
              return (
                <li key={i}>
                  {hint && <p className="mb-1 text-xs font-semibold">{hint}</p>}
                  <p className="font-mono text-xs whitespace-pre-wrap text-ink-2">{l.text}</p>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </div>
  );
}
