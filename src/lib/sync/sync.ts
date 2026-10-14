'use client';

/**
 * 進捗をサーバー (Cloudflare Workers + D1) と同期する。
 *
 * - 起動時に /api/me でログイン状態を確認する。API が無い環境 (GitHub Pages 版や next dev) では何もしない
 * - ログイン中は「サーバーの進捗を取得 → 手元の進捗と統合 (mergeProgress) → 保存」を行う
 * - 保存は version 付き。他の端末が先に書き込んでいたら 409 が返るので、取り直して統合し直す
 * - 手元で進捗が変わったら少し待ってから保存し、タブを閉じる・隠すときにも保存する
 * - リセットとファイルからの読み込みだけは統合せず、サーバーの内容を丸ごと置き換える
 */
import { useSyncExternalStore } from 'react';
import { applyRemoteProgress, getProgressSnapshot, onProgressChange } from '../progress/store';
import { mergeProgress, sameProgress } from '../progress/merge';
import { EMPTY_PROGRESS, type Progress } from '../progress/types';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const api = (path: string) => `${BASE}/api${path}`;
const PUSH_DELAY_MS = 2000;
const MAX_ATTEMPTS = 4;

export type SyncUser = { login: string; name: string | null; avatarUrl: string | null };

export type SyncState = {
  /** checking: 確認中 / unavailable: この環境にはサーバーが無い / guest: 未ログイン / user: ログイン中 */
  auth: 'checking' | 'unavailable' | 'guest' | 'user';
  user: SyncUser | null;
  status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  lastSyncedAt: number | null;
  message: string | null;
};

const INITIAL: SyncState = { auth: 'checking', user: null, status: 'idle', lastSyncedAt: null, message: null };

let state: SyncState = INITIAL;
const listeners = new Set<() => void>();

function setState(patch: Partial<SyncState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

let started = false;
let serverVersion = 0;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingReplace = false;
let dirty = false;
let inflight: Promise<void> | null = null;
let rerun = false;
let authFailedOffline = false;

class AuthLost extends Error {}

function normalize(raw: unknown): Progress {
  return { ...EMPTY_PROGRESS, ...(raw as Progress), version: 1 };
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(api(path), { credentials: 'same-origin', cache: 'no-store', ...init });
  if (res.status === 401) throw new AuthLost();
  return res;
}

async function checkAuth() {
  try {
    const res = await fetch(api('/me'), { credentials: 'same-origin', cache: 'no-store' });
    authFailedOffline = false;
    if (res.status === 401) return setState({ auth: 'guest', user: null });
    const isJson = (res.headers.get('content-type') ?? '').includes('application/json');
    if (!res.ok || !isJson) return setState({ auth: 'unavailable' });
    const body = (await res.json()) as { user: SyncUser };
    setState({ auth: 'user', user: body.user });
    await syncNow();
  } catch {
    // オフラインなど。オンラインに戻ったら確認し直す
    authFailedOffline = true;
    setState({ auth: 'unavailable' });
  }
}

/** サーバーと今すぐ同期する (取得 → 統合 → 必要なら保存) */
export function syncNow(): Promise<void> {
  if (state.auth !== 'user') return Promise.resolve();
  if (inflight) {
    rerun = true;
    return inflight;
  }
  inflight = (async () => {
    setState({ status: 'syncing' });
    try {
      let done = false;
      for (let attempt = 0; attempt < MAX_ATTEMPTS && !done; attempt++) {
        const res = await request('/progress');
        if (!res.ok) throw new Error(`進捗を取得できませんでした (${res.status})`);
        const remote = (await res.json()) as { progress: unknown; version: number };
        serverVersion = remote.version;

        const local = getProgressSnapshot();
        const replace = pendingReplace;
        const next = replace || !remote.progress ? local : mergeProgress(local, normalize(remote.progress));
        if (!sameProgress(next, local)) applyRemoteProgress(next);
        if (!replace && remote.progress && sameProgress(next, normalize(remote.progress))) {
          dirty = false;
          done = true;
          break;
        }

        const put = await request('/progress', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ progress: next, version: serverVersion }),
        });
        if (put.status === 409) continue; // 他の端末が先に保存した → 取り直して統合し直す
        if (!put.ok) throw new Error(`進捗を保存できませんでした (${put.status})`);
        serverVersion = ((await put.json()) as { version: number }).version;
        if (replace) pendingReplace = false;
        dirty = false;
        done = true;
      }
      if (!done) throw new Error('他の端末との保存が重なり続けたため、同期できませんでした。');
      setState({ status: 'synced', lastSyncedAt: Date.now(), message: null });
    } catch (e) {
      if (e instanceof AuthLost) {
        setState({ auth: 'guest', user: null, status: 'idle' });
      } else {
        const offline = typeof navigator !== 'undefined' && !navigator.onLine;
        setState({ status: offline ? 'offline' : 'error', message: e instanceof Error ? e.message : String(e) });
      }
    } finally {
      inflight = null;
      if (rerun) {
        rerun = false;
        void syncNow();
      }
    }
  })();
  return inflight;
}

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void syncNow();
  }, PUSH_DELAY_MS);
}

/** タブを閉じる・隠すときに、まだ送っていない変更をすぐ送る */
function flush() {
  if (state.auth !== 'user' || !dirty) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
  void fetch(api('/progress'), {
    method: 'PUT',
    credentials: 'same-origin',
    keepalive: true,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ progress: getProgressSnapshot(), version: serverVersion }),
  }).catch(() => {
    // 失敗しても、次に開いたときの同期で統合される
  });
}

/** アプリの起動時に 1 回だけ呼ぶ */
export function startSync() {
  if (started || typeof window === 'undefined') return;
  started = true;
  onProgressChange((change) => {
    if (change.origin !== 'local' || state.auth !== 'user') return;
    if (change.replace) pendingReplace = true;
    dirty = true;
    schedulePush();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
    else void syncNow();
  });
  window.addEventListener('pagehide', flush);
  window.addEventListener('online', () => {
    if (authFailedOffline) void checkAuth();
    else void syncNow();
  });
  void checkAuth();
}

export function login() {
  const returnTo = window.location.pathname.slice(BASE.length) + window.location.search;
  // ログインはページではなく Worker の API (GitHub へのリダイレクト) なので、通常のページ遷移で開く
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${api('/auth/login')}?returnTo=${encodeURIComponent(returnTo || '/')}`;
}

export async function logout() {
  flush();
  await fetch(api('/auth/logout'), { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  serverVersion = 0;
  dirty = false;
  setState({ auth: 'guest', user: null, status: 'idle', lastSyncedAt: null, message: null });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useSyncState(): SyncState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL,
  );
}
