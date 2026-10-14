/**
 * GitHub OAuth でのログイン。
 * 1. /api/auth/login    → GitHub の認可画面へリダイレクト (state を Cookie に保存)
 * 2. /api/auth/callback → code をアクセストークンに交換し、GitHub のユーザー情報を取得
 *                          → 許可リストを確認してセッションを作る
 * GitHub のアクセストークンはユーザー情報の取得にだけ使い、保存しない。
 */
import type { Deps, Env } from './env';
import { clearCookie, error, readCookie, redirect, safeReturnTo, setCookie } from './http';
import { createSession, upsertUser } from './session';

const STATE_COOKIE = '__Host-oauth_state';
const RETURN_COOKIE = '__Host-oauth_return';

function allowedLogins(env: Env): string[] {
  return (env.ALLOWED_GITHUB_LOGINS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowed(env: Env, login: string): boolean {
  const list = allowedLogins(env);
  return list.length === 0 || list.includes(login.toLowerCase());
}

function callbackUrl(request: Request): string {
  return `${new URL(request.url).origin}/api/auth/callback`;
}

export function login(request: Request, env: Env, state: string): Response {
  if (!env.OAUTH_GITHUB_CLIENT_ID || !env.OAUTH_GITHUB_CLIENT_SECRET) {
    return error(503, 'oauth_not_configured', 'GitHub ログインの設定 (Client ID / Secret) がまだありません。');
  }
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', env.OAUTH_GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', callbackUrl(request));
  url.searchParams.set('state', state);
  url.searchParams.set('allow_signup', 'false');
  const returnTo = safeReturnTo(new URL(request.url).searchParams.get('returnTo'));
  return redirect(url.toString(), [
    setCookie(STATE_COOKIE, state, { maxAge: 600 }),
    setCookie(RETURN_COOKIE, returnTo, { maxAge: 600 }),
  ]);
}

type GitHubUser = { id: number; login: string; name: string | null; avatar_url: string | null };

export async function callback(request: Request, env: Env, deps: Deps): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = readCookie(request, STATE_COOKIE);
  const returnTo = safeReturnTo(readCookie(request, RETURN_COOKIE));
  const cleanup = [clearCookie(STATE_COOKIE), clearCookie(RETURN_COOKIE)];

  if (!code || !state || !expected || state !== expected) {
    return redirect('/settings/?login=failed', cleanup);
  }
  if (!env.OAUTH_GITHUB_CLIENT_ID || !env.OAUTH_GITHUB_CLIENT_SECRET) {
    return error(503, 'oauth_not_configured');
  }

  const tokenRes = await deps.fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: env.OAUTH_GITHUB_CLIENT_ID,
      client_secret: env.OAUTH_GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: callbackUrl(request),
    }),
  });
  const token = (await tokenRes.json().catch(() => ({}))) as { access_token?: string };
  if (!tokenRes.ok || !token.access_token) return redirect('/settings/?login=failed', cleanup);

  const userRes = await deps.fetch('https://api.github.com/user', {
    headers: {
      authorization: `Bearer ${token.access_token}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'javascript-study',
    },
  });
  if (!userRes.ok) return redirect('/settings/?login=failed', cleanup);
  const user = (await userRes.json()) as GitHubUser;

  if (!isAllowed(env, user.login)) return redirect('/settings/?login=denied', cleanup);

  const now = deps.now();
  const userId = await upsertUser(
    env,
    { githubId: user.id, login: user.login, name: user.name, avatarUrl: user.avatar_url },
    now,
  );
  return redirect(returnTo, [...cleanup, await createSession(env, userId, now)]);
}

/** ローカル開発と E2E テスト専用のログイン。DEV_LOGIN=1 かつ localhost のときだけ有効 */
export async function devLogin(request: Request, env: Env, deps: Deps): Promise<Response | null> {
  const { hostname, searchParams } = new URL(request.url);
  if (env.DEV_LOGIN !== '1' || (hostname !== 'localhost' && hostname !== '127.0.0.1')) return null;
  const login = searchParams.get('login') || 'dev-user';
  const now = deps.now();
  const userId = await upsertUser(env, { githubId: -1 - login.length, login, name: login, avatarUrl: null }, now);
  return redirect(safeReturnTo(searchParams.get('returnTo')), [await createSession(env, userId, now)]);
}
