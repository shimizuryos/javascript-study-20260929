/**
 * Cloudflare Worker のエントリ。/api/* だけがここに来る (それ以外は静的ファイルが直接返る)。
 *
 *   GET  /api/me              ログイン中のユーザー
 *   GET  /api/auth/login      GitHub ログイン開始
 *   GET  /api/auth/callback   GitHub からの戻り先
 *   POST /api/auth/logout     ログアウト
 *   GET  /api/progress        進捗を取得
 *   PUT  /api/progress        進捗を保存 ({ progress, version })
 */
import type { Deps, Env } from './env';
import { error, isSameOrigin, json, randomToken } from './http';
import { callback, devLogin, login } from './auth';
import { destroySession, getSessionUser } from './session';
import { getProgress, putProgress } from './progress';

export async function handle(request: Request, env: Env, deps: Deps): Promise<Response> {
  const url = new URL(request.url);
  const route = `${request.method} ${url.pathname.replace(/\/+$/, '')}`;

  if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
  if (request.method !== 'GET' && request.method !== 'HEAD' && !isSameOrigin(request)) {
    return error(403, 'forbidden_origin');
  }

  switch (route) {
    case 'GET /api/auth/login':
      return login(request, env, randomToken(24));
    case 'GET /api/auth/callback':
      return callback(request, env, deps);
    case 'GET /api/auth/dev-login':
      return (await devLogin(request, env, deps)) ?? error(404, 'not_found');
    case 'POST /api/auth/logout':
      return new Response(null, { status: 204, headers: { 'set-cookie': await destroySession(env, request) } });
  }

  const user = await getSessionUser(env, request, deps.now());
  switch (route) {
    case 'GET /api/me':
      return user
        ? json({ user: { login: user.login, name: user.name, avatarUrl: user.avatarUrl } })
        : json({ user: null }, { status: 401 });
    case 'GET /api/progress':
      return user ? getProgress(env, user.id) : error(401, 'unauthorized');
    case 'PUT /api/progress':
      return user ? putProgress(request, env, user.id, deps.now()) : error(401, 'unauthorized');
  }
  return error(404, 'not_found');
}

export default {
  fetch(request, env) {
    return handle(request, env, { fetch: (input, init) => fetch(input, init), now: () => Date.now() });
  },
} satisfies ExportedHandler<Env>;
