'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Exercise } from '@/content/types';
import { SandboxController, SANDBOX_URL } from '@/runner/sandbox-client';
import { typecheck as runTypecheck, warmUpTypecheck } from '@/runner/typecheck-client';
import type { RunError, RunResult } from '@/runner/types';
import { clearDraft, loadDraft, progressActions, saveDraft, useProgress } from '@/lib/progress/store';
import { Badge, CheckIcon } from '@/components/ui';
import { ResultPanel, type TypecheckState } from './result-panel';

const CodeEditor = dynamic(() => import('./code-editor'), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse bg-muted" aria-label="エディタを読み込み中" />,
});

export type WorkbenchNav = {
  back: { href: string; label: string };
  next?: { href: string; label: string };
};

type Tab = { name: string; kind: 'main' | 'test' | 'support' | 'solution' };

export function Workbench({ exercise, nav }: { exercise: Exercise; nav: WorkbenchNav }) {
  const progress = useProgress();
  const record = progress.exercises[exercise.id];
  const passed = !!record?.passedAt;
  const revealed = !!record?.revealed;

  const [code, setCode] = useState(exercise.starter);
  const [tab, setTab] = useState<string>(exercise.mainFile);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [previewError, setPreviewError] = useState<RunError | null>(null);
  const [typecheckState, setTypecheckState] = useState<TypecheckState>({ status: 'idle' });
  const [hintsShown, setHintsShown] = useState(0);
  const [previewHeight, setPreviewHeight] = useState(160);
  const [justPassed, setJustPassed] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controllerRef = useRef<SandboxController | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // 書きかけのコードを復元する (localStorage はブラウザでしか読めないので effect の中で)
  useEffect(() => {
    const draft = loadDraft(exercise.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 外部ストレージからの初期化
    if (draft !== null) setCode(draft);
  }, [exercise.id]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const controller = new SandboxController(iframeRef.current, (h) =>
      setPreviewHeight(Math.min(Math.max(h, 120), 640)),
    );
    controllerRef.current = controller;
    return () => controller.dispose();
  }, []);

  useEffect(() => {
    if (exercise.typecheck) warmUpTypecheck();
  }, [exercise.typecheck]);

  const onChange = useCallback(
    (value: string) => {
      setCode(value);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveDraft(exercise.id, value), 400);
    },
    [exercise.id],
  );

  const run = useCallback(async () => {
    const controller = controllerRef.current;
    if (!controller || running) return;
    setRunning(true);
    setJustPassed(false);
    saveDraft(exercise.id, code);
    const files: Record<string, string> = { [exercise.mainFile]: code };
    for (const f of exercise.files) files[f.name] = f.code;

    const typePromise = exercise.typecheck
      ? (setTypecheckState({ status: 'loading' }), runTypecheck(files))
      : Promise.resolve(null);
    const [{ result: runResult, previewError: pErr }, types] = await Promise.all([
      controller.run({ files, entry: exercise.testFile, preview: exercise.preview }),
      typePromise,
    ]);

    let typeOk = true;
    if (types) {
      if (types.error) {
        setTypecheckState({ status: 'error', message: types.error });
        typeOk = false;
      } else {
        const diagnostics = (types.diagnostics ?? []).filter((d) => !d.file?.endsWith('.d.ts'));
        setTypecheckState({ status: 'done', diagnostics });
        typeOk = diagnostics.length === 0;
      }
    }
    setResult(runResult);
    setPreviewError(pErr);
    const ok = runResult.status === 'passed' && typeOk;
    if (runResult.error?.phase !== 'sandbox') progressActions.recordRun(exercise.id, ok);
    setJustPassed(ok);
    setRunning(false);
    // スマホでは結果がエディタの下 (画面外) になるので、結果までスクロールする
    if (window.innerWidth < 1024) {
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [code, exercise, running]);

  const reveal = () => {
    const message = exercise.exam
      ? '試験中の演習です。解答を表示すると、この問題は 0 点になります。表示しますか?'
      : '解答を表示しますか? (自分で考える時間も大切です。ヒントは見ましたか?)';
    if (passed || window.confirm(message)) {
      progressActions.revealSolution(exercise.id);
      setTab('solution');
    }
  };

  const reset = () => {
    if (window.confirm('コードを最初の状態に戻しますか? (書いた内容は消えます)')) {
      setCode(exercise.starter);
      clearDraft(exercise.id);
      setResult(null);
      setTypecheckState({ status: 'idle' });
    }
  };

  const tsx = exercise.mainFile.endsWith('.tsx');
  const tabs: Tab[] = [
    { name: exercise.mainFile, kind: 'main' },
    ...exercise.files.map((f) => ({ name: f.name, kind: f.role })),
    ...(revealed || passed ? [{ name: 'solution', kind: 'solution' as const }] : []),
  ];
  const current = tabs.find((t) => t.name === tab) ?? tabs[0];
  const readOnlyCode =
    current.kind === 'solution' ? exercise.solution : (exercise.files.find((f) => f.name === current.name)?.code ?? '');

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="min-w-0 space-y-4">
        <nav className="text-sm text-ink-3" aria-label="パンくず">
          <Link href={nav.back.href} className="hover:underline">
            ← {nav.back.label}
          </Link>
        </nav>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {exercise.exam ? (
              <Badge tone="warn">試験</Badge>
            ) : exercise.optional ? (
              <Badge>任意</Badge>
            ) : (
              <Badge tone="accent">必須</Badge>
            )}
            {exercise.typecheck && <Badge>型チェックあり</Badge>}
            {passed && (
              <Badge tone="good">
                <CheckIcon className="size-3" /> クリア済み
              </Badge>
            )}
          </div>
          <h1 className="text-xl leading-snug font-bold sm:text-2xl">{exercise.title}</h1>
        </div>
        <div className="prose" dangerouslySetInnerHTML={{ __html: exercise.promptHtml }} />

        {exercise.hintsHtml.length > 0 && (
          <div className="space-y-2">
            {exercise.hintsHtml.slice(0, hintsShown).map((h, i) => (
              <div key={i} className="rounded-lg border border-line bg-muted p-3 text-sm">
                <p className="mb-1 text-xs font-bold text-ink-2">ヒント {i + 1}</p>
                <div className="prose prose-compact" dangerouslySetInnerHTML={{ __html: h }} />
              </div>
            ))}
            {hintsShown < exercise.hintsHtml.length && (
              <button
                type="button"
                onClick={() => setHintsShown((n) => n + 1)}
                className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-muted"
              >
                ヒント {hintsShown + 1} を見る ({hintsShown + 1}/{exercise.hintsHtml.length})
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          {!(revealed || passed) && (
            <button
              type="button"
              onClick={reveal}
              className="rounded-md px-3 py-1.5 text-sm text-ink-2 underline underline-offset-2 hover:text-ink"
            >
              解答を見る
            </button>
          )}
          {(revealed || passed) && (
            <button
              type="button"
              onClick={() => setTab('solution')}
              className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-muted"
            >
              模範解答と比べる
            </button>
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-4">
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-muted px-2 py-1.5">
            <div role="tablist" aria-label="ファイル" className="flex flex-wrap gap-1">
              {tabs.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  role="tab"
                  aria-selected={current.name === t.name}
                  onClick={() => setTab(t.name)}
                  className={`rounded-md px-2.5 py-1 font-mono text-xs ${
                    current.name === t.name ? 'bg-card font-semibold text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {t.kind === 'solution' ? '模範解答' : t.name}
                  {t.kind === 'test' && <span className="ml-1 font-sans text-[10px] text-ink-3">テスト</span>}
                  {t.kind !== 'main' && t.kind !== 'solution' && t.kind !== 'test' && (
                    <span className="ml-1 font-sans text-[10px] text-ink-3">読み取り専用</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reset}
                className="rounded-md px-2 py-1 text-xs text-ink-2 hover:bg-card hover:text-ink"
              >
                リセット
              </button>
              <button
                type="button"
                onClick={run}
                disabled={running}
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
              >
                {running ? '実行中…' : '▶ 実行'}
              </button>
            </div>
          </div>
          {current.kind === 'main' ? (
            <CodeEditor
              value={code}
              onChange={onChange}
              tsx={tsx}
              onRun={run}
              label={`${exercise.mainFile} (編集できます)`}
            />
          ) : (
            <CodeEditor
              value={readOnlyCode}
              readOnly
              tsx={/\.tsx$/.test(current.name) || (current.kind === 'solution' && tsx)}
              label={`${current.name} (読み取り専用)`}
            />
          )}
          {current.kind === 'test' && (
            <p className="border-t border-line px-3 py-2 text-xs text-ink-3">
              テストも「読むべきコード」です。何を確認しているかを読むと、問題の意図がわかります。
            </p>
          )}
        </div>

        {justPassed && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-good bg-good-soft p-4">
            <p className="font-semibold text-good">正解です! 🎉 模範解答とも見比べてみましょう。</p>
            {nav.next ? (
              <Link href={nav.next.href} className="rounded-lg bg-good px-4 py-2 text-sm font-semibold text-white">
                {nav.next.label} →
              </Link>
            ) : (
              <Link href={nav.back.href} className="rounded-lg bg-good px-4 py-2 text-sm font-semibold text-white">
                {nav.back.label} へ戻る
              </Link>
            )}
          </div>
        )}

        <div className={exercise.preview ? 'space-y-2' : 'hidden'}>
          <h2 className="text-sm font-bold">プレビュー</h2>
          <p className="text-xs text-ink-3">
            実行すると、あなたのコードで作った画面がここに表示されます。操作してみましょう。
          </p>
          <iframe
            ref={iframeRef}
            title="プレビュー (実行環境)"
            src={SANDBOX_URL}
            className="w-full rounded-lg border border-line bg-card"
            style={{ height: previewHeight }}
          />
        </div>

        <div ref={resultRef} className="scroll-mt-20">
          <ResultPanel
            result={result}
            typecheck={typecheckState}
            typecheckEnabled={exercise.typecheck}
            previewError={previewError}
          />
        </div>
      </div>
    </div>
  );
}
