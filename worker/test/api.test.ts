// @vitest-environment node
/**
 * Worker の API テスト。wrangler の getPlatformProxy で本物の D1 (ローカルの SQLite) を使い、
 * GitHub との通信だけを差し替えて、ログイン → 進捗の保存・競合検出までを確かめる。
 */
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getPlatformProxy, unstable_splitSqlQuery } from 'wrangler';
import { handle } from '../index';
import type { Deps, Env } from '../env';

const ORIGIN = 'https://study.example.workers.dev';

let proxy: Awaited<ReturnType<typeof getPlatformProxy<Env>>>;
let env: Env;
let clock = Date.UTC(2026, 9, 14);
let githubUser = { id: 101, login: 'shimizuryos', name: 'Ryo', avatar_url: 'https://avatars.example/1' };

const fakeGitHub: typeof fetch = async (input) => {
  const url = String(input instanceof Request ? input.url : input);
  if (url.startsWith('https://github.com/login/oauth/access_token')) {
    return Response.json({ access_token: 'gho_test' });
  }
  if (url.startsWith('https://api.github.com/user')) return Response.json(githubUser);
  throw new Error(`unexpected fetch: ${url}`);
};

const deps: Deps = { fetch: fakeGitHub, now: () => clock };

function req(pathname: string, init: RequestInit & { cookie?: string } = {}) {
  const headers = new Headers(init.headers);
  if (init.cookie) headers.set('cookie', init.cookie);
  if (init.method && init.method !== 'GET') headers.set('origin', ORIGIN);
  return new Request(ORIGIN + pathname, { ...init, headers });
}

function cookiesOf(res: Response): Record<string, string> {
  const out: Record<string, string> = {};
  for (const c of res.headers.getSetCookie()) {
    const [pair] = c.split(';');
    const [k, ...v] = pair.split('=');
    out[k] = decodeURIComponent(v.join('='));
  }
  return out;
}

/** GitHub ログインを最後まで通して、セッション Cookie を返す */
async function loginAs(): Promise<string> {
  const start = await handle(req('/api/auth/login?returnTo=/days/3/'), env, deps);
  expect(start.status).toBe(302);
  const authorize = new URL(start.headers.get('location')!);
  const state = authorize.searchParams.get('state')!;
  const c = cookiesOf(start);
  const cb = await handle(
    req(`/api/auth/callback?code=abc&state=${state}`, {
      cookie: `__Host-oauth_state=${c['__Host-oauth_state']}; __Host-oauth_return=${encodeURIComponent(c['__Host-oauth_return'])}`,
    }),
    env,
    deps,
  );
  expect(cb.status).toBe(302);
  expect(cb.headers.get('location')).toBe('/days/3/');
  const sid = cookiesOf(cb)['__Host-sid'];
  expect(sid).toBeTruthy();
  return `__Host-sid=${encodeURIComponent(sid)}`;
}

const progress = (lessons: Record<string, string>) => ({
  version: 1,
  startDate: null,
  lessons,
  quiz: {},
  exercises: {},
  exams: {},
  review: {},
  activity: {},
});

beforeAll(async () => {
  proxy = await getPlatformProxy<Env>({ configPath: path.resolve('wrangler.jsonc'), persist: false });
  env = {
    ...proxy.env,
    OAUTH_GITHUB_CLIENT_ID: 'client-id',
    OAUTH_GITHUB_CLIENT_SECRET: 'client-secret',
    ALLOWED_GITHUB_LOGINS: 'shimizuryos',
  };
  for (const file of fs.readdirSync('worker/migrations').sort()) {
    const sql = fs.readFileSync(path.join('worker/migrations', file), 'utf8');
    for (const statement of unstable_splitSqlQuery(sql)) await env.DB.prepare(statement).run();
  }
}, 60_000);

afterAll(async () => {
  await proxy?.dispose();
});

describe('auth', () => {
  it('redirects to GitHub with state and callback URL', async () => {
    const res = await handle(req('/api/auth/login'), env, deps);
    const location = new URL(res.headers.get('location')!);
    expect(location.origin + location.pathname).toBe('https://github.com/login/oauth/authorize');
    expect(location.searchParams.get('client_id')).toBe('client-id');
    expect(location.searchParams.get('redirect_uri')).toBe(`${ORIGIN}/api/auth/callback`);
    expect(res.headers.getSetCookie().join()).toContain('HttpOnly');
  });

  it('rejects a callback whose state does not match', async () => {
    const res = await handle(
      req('/api/auth/callback?code=abc&state=evil', { cookie: '__Host-oauth_state=good' }),
      env,
      deps,
    );
    expect(res.headers.get('location')).toBe('/settings/?login=failed');
    expect(cookiesOf(res)['__Host-sid']).toBeUndefined();
  });

  it('never redirects to another site after login', async () => {
    const res = await handle(req('/api/auth/login?returnTo=//evil.example'), env, deps);
    expect(cookiesOf(res)['__Host-oauth_return']).toBe('/');
  });

  it('logs in an allowed user and reports /api/me', async () => {
    const cookie = await loginAs();
    const me = await handle(req('/api/me', { cookie }), env, deps);
    expect(me.status).toBe(200);
    expect(await me.json()).toEqual({
      user: { login: 'shimizuryos', name: 'Ryo', avatarUrl: 'https://avatars.example/1' },
    });
  });

  it('denies users that are not on the allow list', async () => {
    githubUser = { ...githubUser, id: 202, login: 'stranger' };
    try {
      const start = await handle(req('/api/auth/login'), env, deps);
      const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
      const res = await handle(
        req(`/api/auth/callback?code=x&state=${state}`, { cookie: `__Host-oauth_state=${state}` }),
        env,
        deps,
      );
      expect(res.headers.get('location')).toBe('/settings/?login=denied');
      expect(cookiesOf(res)['__Host-sid']).toBeUndefined();
    } finally {
      githubUser = { ...githubUser, id: 101, login: 'shimizuryos' };
    }
  });

  it('logout invalidates the session', async () => {
    const cookie = await loginAs();
    const out = await handle(req('/api/auth/logout', { method: 'POST', cookie }), env, deps);
    expect(out.status).toBe(204);
    expect((await handle(req('/api/me', { cookie }), env, deps)).status).toBe(401);
  });

  it('expired sessions are rejected', async () => {
    const cookie = await loginAs();
    clock += 31 * 86_400_000;
    try {
      expect((await handle(req('/api/me', { cookie }), env, deps)).status).toBe(401);
    } finally {
      clock -= 31 * 86_400_000;
    }
  });

  it('dev login is disabled unless DEV_LOGIN=1 on localhost', async () => {
    expect((await handle(req('/api/auth/dev-login'), { ...env, DEV_LOGIN: '1' }, deps)).status).toBe(404);
    const local = new Request('http://localhost:8787/api/auth/dev-login');
    expect((await handle(local, env, deps)).status).toBe(404);
    expect((await handle(local, { ...env, DEV_LOGIN: '1' }, deps)).status).toBe(302);
  });
});

describe('progress', () => {
  it('requires login', async () => {
    expect((await handle(req('/api/progress'), env, deps)).status).toBe(401);
  });

  it('saves with optimistic locking and reports conflicts', async () => {
    const cookie = await loginAs();
    const empty = await (await handle(req('/api/progress', { cookie }), env, deps)).json();
    expect(empty).toMatchObject({ progress: null, version: 0 });

    const put = (body: unknown) =>
      handle(req('/api/progress', { method: 'PUT', cookie, body: JSON.stringify(body) }), env, deps);

    const first = await put({ progress: progress({ '1': 'a' }), version: 0 });
    expect(first.status).toBe(200);
    expect(await first.json()).toMatchObject({ version: 1 });

    // 古い version のまま書き込もうとすると 409 と最新の内容が返る
    const stale = await put({ progress: progress({ '2': 'b' }), version: 0 });
    expect(stale.status).toBe(409);
    expect(await stale.json()).toMatchObject({ version: 1, progress: { lessons: { '1': 'a' } } });

    const second = await put({ progress: progress({ '1': 'a', '2': 'b' }), version: 1 });
    expect(await second.json()).toMatchObject({ version: 2 });
    const saved = await (await handle(req('/api/progress', { cookie }), env, deps)).json();
    expect(saved).toMatchObject({ version: 2, progress: { lessons: { '1': 'a', '2': 'b' } } });
  });

  it('rejects invalid bodies and cross-site writes', async () => {
    const cookie = await loginAs();
    const bad = await handle(req('/api/progress', { method: 'PUT', cookie, body: '{"progress":{}}' }), env, deps);
    expect(bad.status).toBe(400);
    const crossSite = new Request(`${ORIGIN}/api/progress`, {
      method: 'PUT',
      headers: { cookie, origin: 'https://evil.example' },
      body: JSON.stringify({ progress: progress({}), version: 2 }),
    });
    expect((await handle(crossSite, env, deps)).status).toBe(403);
  });
});
