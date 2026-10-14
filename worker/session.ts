import type { Env } from './env';
import { clearCookie, readCookie, randomToken, setCookie, sha256Hex } from './http';

export const SESSION_COOKIE = '__Host-sid';
const SESSION_DAYS = 30;

export type SessionUser = { id: number; login: string; name: string | null; avatarUrl: string | null };

type UserRow = { id: number; login: string; name: string | null; avatar_url: string | null };

export async function createSession(env: Env, userId: number, now: number): Promise<string> {
  const token = randomToken();
  const expires = now + SESSION_DAYS * 86_400_000;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND expires_at < ?').bind(userId, now),
    env.DB.prepare('INSERT INTO sessions (id_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(
      await sha256Hex(token),
      userId,
      now,
      expires,
    ),
  ]);
  return setCookie(SESSION_COOKIE, token, { maxAge: SESSION_DAYS * 86_400 });
}

export async function getSessionUser(env: Env, request: Request, now: number): Promise<SessionUser | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT users.id, users.login, users.name, users.avatar_url
       FROM sessions JOIN users ON users.id = sessions.user_id
      WHERE sessions.id_hash = ? AND sessions.expires_at > ?`,
  )
    .bind(await sha256Hex(token), now)
    .first<UserRow>();
  if (!row) return null;
  return { id: row.id, login: row.login, name: row.name, avatarUrl: row.avatar_url };
}

export async function destroySession(env: Env, request: Request): Promise<string> {
  const token = readCookie(request, SESSION_COOKIE);
  if (token)
    await env.DB.prepare('DELETE FROM sessions WHERE id_hash = ?')
      .bind(await sha256Hex(token))
      .run();
  return clearCookie(SESSION_COOKIE);
}

export async function upsertUser(
  env: Env,
  profile: { githubId: number; login: string; name: string | null; avatarUrl: string | null },
  now: number,
): Promise<number> {
  const row = await env.DB.prepare(
    `INSERT INTO users (github_id, login, name, avatar_url, created_at, last_login_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (github_id) DO UPDATE SET
       login = excluded.login, name = excluded.name, avatar_url = excluded.avatar_url, last_login_at = excluded.last_login_at
     RETURNING id`,
  )
    .bind(profile.githubId, profile.login, profile.name, profile.avatarUrl, now, now)
    .first<{ id: number }>();
  if (!row) throw new Error('failed to upsert user');
  return row.id;
}
