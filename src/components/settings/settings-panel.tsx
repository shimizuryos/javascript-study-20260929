'use client';

import { useEffect, useRef, useState } from 'react';
import { listDrafts, progressActions, restoreDrafts, useProgress, useProgressReady } from '@/lib/progress/store';
import type { Progress } from '@/lib/progress/types';
import { todayKey } from '@/lib/dates';
import { Card } from '@/components/ui';

type Theme = 'system' | 'light' | 'dark';
const THEME_KEY = 'js-study:theme';

/** 選んだテーマを保存して <html data-theme> に反映する */
function applyTheme(t: Theme) {
  try {
    if (t === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, t);
  } catch {
    // 保存できなくても表示は切り替える
  }
  const root = document.documentElement;
  if (t === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t);
}

function ThemeSetting() {
  const [theme, setTheme] = useState<Theme>('system');
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM に反映済みのテーマを読み込む
    if (t === 'light' || t === 'dark') setTheme(t);
  }, []);
  const change = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
  };
  const labels: Record<Theme, string> = { system: '端末に合わせる', light: 'ライト', dark: 'ダーク' };
  return (
    <div role="radiogroup" aria-label="テーマ" className="mt-3 inline-flex rounded-lg border border-line p-0.5">
      {(Object.keys(labels) as Theme[]).map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={theme === t}
          onClick={() => change(t)}
          className={`rounded-md px-3 py-1.5 text-sm ${theme === t ? 'bg-accent text-white' : 'text-ink-2 hover:bg-muted'}`}
        >
          {labels[t]}
        </button>
      ))}
    </div>
  );
}

type ExportFile = { app: 'js-study'; exportedAt: string; progress: Progress; drafts: Record<string, string> };

export function SettingsPanel() {
  const progress = useProgress();
  const ready = useProgressReady();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const exportProgress = () => {
    const data: ExportFile = { app: 'js-study', exportedAt: new Date().toISOString(), progress, drafts: listDrafts() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `js-study-progress-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('進捗をファイルに書き出しました。');
  };

  const importProgress = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as ExportFile;
      if (data.app !== 'js-study' || data.progress?.version !== 1) throw new Error('形式が違います');
      if (!window.confirm('今の進捗を、ファイルの内容で置き換えます。よろしいですか?')) return;
      progressActions.replaceAll(data.progress);
      restoreDrafts(data.drafts ?? {});
      setMessage('進捗を読み込みました。');
    } catch (e) {
      setMessage(`読み込めませんでした: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  if (!ready) return null;

  return (
    <div className="space-y-4">
      {message && (
        <p role="status" className="rounded-lg bg-accent-soft p-3 text-sm">
          {message}
        </p>
      )}
      <Card>
        <h2 className="font-bold">表示テーマ</h2>
        <ThemeSetting />
      </Card>

      <Card>
        <h2 className="font-bold">学習開始日</h2>
        <p className="mt-1 text-sm text-ink-2">
          開始日から数えて「Day N は何日の予定か」をホーム画面に表示します。最初に学習した日が自動で入ります。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={progress.startDate ?? ''}
            onChange={(e) => progressActions.setStartDate(e.target.value || null)}
            className="rounded-md border border-line bg-card px-2 py-1.5 text-sm"
            aria-label="学習開始日"
          />
          <button
            type="button"
            onClick={() => progressActions.setStartDate(todayKey())}
            className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-muted"
          >
            今日にする
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold">進捗のエクスポート / インポート</h2>
        <p className="mt-1 text-sm text-ink-2">
          進捗と書きかけのコードは、このブラウザの localStorage にだけ保存されています。別の端末・ブラウザで続けるときや、ブラウザのデータを消す前に書き出しておきましょう。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportProgress}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
          >
            ファイルに書き出す
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-muted">
            ファイルから読み込む
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importProgress(f);
              e.target.value = '';
            }}
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-bad">進捗をリセット</h2>
        <p className="mt-1 text-sm text-ink-2">すべての進捗 (クイズ・演習・試験・復習・学習記録) を消します。元に戻せません。</p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('本当にすべての進捗を消しますか? (書きかけのコードは残ります)')) {
              progressActions.resetAll();
              setMessage('進捗をリセットしました。');
            }
          }}
          className="mt-3 rounded-lg border border-bad px-4 py-2 text-sm text-bad hover:bg-bad-soft"
        >
          リセットする
        </button>
      </Card>
    </div>
  );
}
