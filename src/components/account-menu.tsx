'use client';

import Link from 'next/link';
import { login, useSyncState, type SyncState } from '@/lib/sync/sync';

export function GitHubMark({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export const SYNC_LABEL: Record<SyncState['status'], string> = {
  idle: '未同期',
  syncing: '同期中…',
  synced: '同期済み',
  error: '同期に失敗',
  offline: 'オフライン',
};

const DOT: Record<SyncState['status'], string> = {
  idle: 'bg-line-strong',
  syncing: 'bg-accent animate-pulse',
  synced: 'bg-good',
  error: 'bg-warn',
  offline: 'bg-warn',
};

export function Avatar({ src, login: name, size = 24 }: { src: string | null; login: string; size?: number }) {
  if (!src) {
    return (
      <span
        className="grid place-items-center rounded-full bg-muted text-xs font-bold"
        style={{ width: size, height: size }}
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- 静的書き出しでは next/image の最適化を使わない
  return <img src={src} alt="" width={size} height={size} className="rounded-full" />;
}

/** ヘッダー右端: 未ログインなら「ログイン」、ログイン中ならアイコンと同期状態 */
export function AccountMenu() {
  const sync = useSyncState();
  if (sync.auth === 'guest') {
    return (
      <button
        type="button"
        onClick={login}
        className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-sm text-ink-2 hover:bg-muted hover:text-ink"
      >
        <GitHubMark />
        ログイン
      </button>
    );
  }
  if (sync.auth !== 'user' || !sync.user) return null;
  return (
    <Link
      href="/settings/#account"
      className="relative inline-flex items-center rounded-full"
      aria-label={`${sync.user.login} でログイン中・${SYNC_LABEL[sync.status]}`}
      title={`${sync.user.login}・${SYNC_LABEL[sync.status]}`}
    >
      <Avatar src={sync.user.avatarUrl} login={sync.user.login} size={28} />
      <span className={`absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-bg ${DOT[sync.status]}`} />
    </Link>
  );
}
