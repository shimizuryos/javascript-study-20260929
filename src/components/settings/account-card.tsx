'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { login, logout, syncNow, useSyncState } from '@/lib/sync/sync';
import { Avatar, GitHubMark, SYNC_LABEL } from '@/components/account-menu';
import { Card } from '@/components/ui';

const LOGIN_MESSAGES: Record<string, string> = {
  denied: 'この GitHub アカウントはログインを許可されていません。',
  failed: 'ログインに失敗しました。もう一度お試しください。',
};

/** 設定画面の「アカウントと同期」 */
export function AccountCard() {
  const sync = useSyncState();
  const loginResult = useSearchParams().get('login');
  const [busy, setBusy] = useState(false);

  return (
    <Card>
      <h2 id="account" className="scroll-mt-24 font-bold">
        アカウントと同期
      </h2>
      {loginResult && LOGIN_MESSAGES[loginResult] && (
        <p role="alert" className="mt-2 rounded-md bg-warn-soft p-2 text-sm text-warn">
          {LOGIN_MESSAGES[loginResult]}
        </p>
      )}

      {sync.auth === 'checking' && <p className="mt-2 text-sm text-ink-3">確認中…</p>}

      {sync.auth === 'unavailable' && (
        <p className="mt-2 text-sm text-ink-2">
          この URL ではログイン機能を使えません (サーバーの無い環境です)。進捗はこのブラウザにだけ保存されます。
        </p>
      )}

      {sync.auth === 'guest' && (
        <>
          <p className="mt-2 text-sm text-ink-2">
            ログインすると、進捗がサーバーにも保存され、PC
            やスマホなど別の端末と自動で同期されます。今このブラウザにある進捗も、ログイン後にそのまま引き継がれます。
          </p>
          <button
            type="button"
            onClick={login}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-bg hover:opacity-90"
          >
            <GitHubMark />
            GitHub でログイン
          </button>
        </>
      )}

      {sync.auth === 'user' && sync.user && (
        <>
          <div className="mt-3 flex items-center gap-3">
            <Avatar src={sync.user.avatarUrl} login={sync.user.login} size={40} />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{sync.user.name ?? sync.user.login}</p>
              <p className="text-ink-3">@{sync.user.login}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-ink-2" aria-live="polite">
            同期の状態: <strong className="text-ink">{SYNC_LABEL[sync.status]}</strong>
            {sync.lastSyncedAt && `（最終 ${new Date(sync.lastSyncedAt).toLocaleTimeString('ja-JP')}）`}
            {sync.message && sync.status !== 'synced' && (
              <span className="mt-1 block text-xs text-warn">{sync.message}</span>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || sync.status === 'syncing'}
              onClick={async () => {
                setBusy(true);
                await syncNow();
                setBusy(false);
              }}
              className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
            >
              今すぐ同期
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-line px-4 py-2 text-sm text-ink-2 hover:bg-muted"
            >
              ログアウト
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-3">ログアウトしても、このブラウザにある進捗は消えません。</p>
        </>
      )}
    </Card>
  );
}
